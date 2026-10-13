import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { obtenirUtilisateurAuthentifie, origineAutorisee } from "@/lib/auth/session";
import { declarationCotisationSchema } from "@/lib/tontines/contrats";
import { ErreurTontine, tontinesService } from "@/services/tontines.service";
import { enregistrerPreuvePreparee, ErreurJustificatif, preparerPreuveImage, supprimerPreuvePrivee } from "@/lib/stockage/preuves-privees";

export const runtime = "nodejs";

function erreur(cause: unknown) {
  if (cause instanceof ZodError) return NextResponse.json({ erreur: { code: "DONNEES_INVALIDES", message: "Données de déclaration invalides.", details: cause.issues.map((issue) => ({ champ: issue.path.join("."), message: issue.message })) } }, { status: 400 });
  if (cause instanceof ErreurJustificatif) return NextResponse.json({ erreur: { code: "JUSTIFICATIF_INVALIDE", message: cause.message } }, { status: 400 });
  if (cause instanceof ErreurTontine) return NextResponse.json({ erreur: { code: cause.code, message: cause.message } }, { status: cause.statut });
  return NextResponse.json({ erreur: { code: "ERREUR_INTERNE", message: "Impossible d'enregistrer la déclaration." } }, { status: 500 });
}

export async function POST(requete: Request, { params }: { params: { tontineId: string; cotisationId: string } }) {
  const utilisateur = await obtenirUtilisateurAuthentifie();
  if (!utilisateur) return NextResponse.json({ erreur: { code: "NON_AUTHENTIFIE", message: "Connexion requise." } }, { status: 401 });
  if (!origineAutorisee(requete)) return NextResponse.json({ erreur: { code: "ORIGINE_REFUSEE", message: "Origine de la requête refusée." } }, { status: 403 });
  try {
    if (!requete.headers.get("content-type")?.includes("multipart/form-data")) {
      const donnees = declarationCotisationSchema.parse(await requete.json());
      return NextResponse.json({ donnees: await tontinesService.declarerCotisation(params.tontineId, params.cotisationId, utilisateur.id, donnees) }, { status: 201 });
    }
    const formulaire = await requete.formData();
    const donnees = declarationCotisationSchema.parse({ montant: formulaire.get("montant"), verseLe: formulaire.get("verseLe"), referenceVersement: formulaire.get("referenceVersement") || undefined, moyenVersement: formulaire.get("moyenVersement") || undefined });
    const fichier = formulaire.get("preuve");
    if (!(fichier instanceof File)) throw new ErreurJustificatif("Le justificatif transmis est invalide.");
    const preuve = await preparerPreuveImage(fichier);
    await enregistrerPreuvePreparee(preuve);
    try {
      return NextResponse.json({ donnees: await tontinesService.declarerCotisation(params.tontineId, params.cotisationId, utilisateur.id, donnees, preuve) }, { status: 201 });
    } catch (cause) {
      await supprimerPreuvePrivee(preuve.cleStockage);
      throw cause;
    }
  } catch (cause) { return erreur(cause); }
}
