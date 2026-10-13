import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { obtenirUtilisateurAuthentifie, origineAutorisee } from "@/lib/auth/session";
import { declarationReversementSchema } from "@/lib/tontines/contrats";
import { enregistrerPreuvePreparee, ErreurJustificatif, preparerPreuveImage, supprimerPreuvePrivee } from "@/lib/stockage/preuves-privees";
import { ErreurTontine, tontinesService } from "@/services/tontines.service";

export const runtime = "nodejs";

function erreur(cause: unknown) {
  if (cause instanceof ZodError) return NextResponse.json({ erreur: { code: "DONNEES_INVALIDES", message: "Données de reversement invalides.", details: cause.issues.map((issue) => ({ champ: issue.path.join("."), message: issue.message })) } }, { status: 400 });
  if (cause instanceof ErreurJustificatif) return NextResponse.json({ erreur: { code: "JUSTIFICATIF_INVALIDE", message: cause.message } }, { status: 400 });
  if (cause instanceof ErreurTontine) return NextResponse.json({ erreur: { code: cause.code, message: cause.message } }, { status: cause.statut });
  return NextResponse.json({ erreur: { code: "ERREUR_INTERNE", message: "Impossible d'enregistrer le reversement." } }, { status: 500 });
}

function cleIdempotence(requete: Request) {
  const cle = requete.headers.get("Idempotency-Key")?.trim();
  if (!cle) throw new ErreurTontine("CLE_IDEMPOTENCE_REQUISE", "Une clé d'idempotence est requise pour déclarer un reversement.", 400);
  if (cle && (cle.length < 8 || cle.length > 128)) throw new ErreurTontine("CLE_IDEMPOTENCE_INVALIDE", "La clé d'idempotence est invalide.", 400);
  return cle;
}

export async function POST(requete: Request, { params }: { params: { tontineId: string; rotationId: string } }) {
  const utilisateur = await obtenirUtilisateurAuthentifie();
  if (!utilisateur) return NextResponse.json({ erreur: { code: "NON_AUTHENTIFIE", message: "Connexion requise." } }, { status: 401 });
  if (!origineAutorisee(requete)) return NextResponse.json({ erreur: { code: "ORIGINE_REFUSEE", message: "Origine de la requête refusée." } }, { status: 403 });
  try {
    const idempotence = cleIdempotence(requete);
    if (!requete.headers.get("content-type")?.includes("multipart/form-data")) {
      const donnees = declarationReversementSchema.parse(await requete.json());
      return NextResponse.json({ donnees: await tontinesService.declarerReversement(params.tontineId, params.rotationId, utilisateur.id, donnees, undefined, idempotence) }, { status: 201 });
    }
    const formulaire = await requete.formData();
    const donnees = declarationReversementSchema.parse({ montant: formulaire.get("montant"), verseLe: formulaire.get("verseLe"), referenceVersement: formulaire.get("referenceVersement") || undefined, moyenVersement: formulaire.get("moyenVersement") || undefined, observation: formulaire.get("observation") || undefined });
    const fichier = formulaire.get("preuve");
    if (!(fichier instanceof File) || fichier.size === 0) return NextResponse.json({ donnees: await tontinesService.declarerReversement(params.tontineId, params.rotationId, utilisateur.id, donnees, undefined, idempotence) }, { status: 201 });
    const preuve = await preparerPreuveImage(fichier, "preuves-reversements");
    await enregistrerPreuvePreparee(preuve);
    try {
      const resultat = await tontinesService.declarerReversement(params.tontineId, params.rotationId, utilisateur.id, donnees, preuve, idempotence);
      if (resultat.rejouee) await supprimerPreuvePrivee(preuve.cleStockage);
      return NextResponse.json({ donnees: resultat }, { status: 201 });
    } catch (cause) {
      await supprimerPreuvePrivee(preuve.cleStockage);
      throw cause;
    }
  } catch (cause) {
    return erreur(cause);
  }
}
