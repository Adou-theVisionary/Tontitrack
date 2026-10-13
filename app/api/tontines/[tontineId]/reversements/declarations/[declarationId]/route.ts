import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { obtenirUtilisateurAuthentifie, origineAutorisee } from "@/lib/auth/session";
import { decisionReceptionReversementSchema } from "@/lib/tontines/contrats";
import { ErreurTontine, tontinesService } from "@/services/tontines.service";

function erreur(cause: unknown) {
  if (cause instanceof ZodError) return NextResponse.json({ erreur: { code: "DONNEES_INVALIDES", message: "Décision de réception invalide.", details: cause.issues.map((issue) => ({ champ: issue.path.join("."), message: issue.message })) } }, { status: 400 });
  if (cause instanceof ErreurTontine) return NextResponse.json({ erreur: { code: cause.code, message: cause.message } }, { status: cause.statut });
  return NextResponse.json({ erreur: { code: "ERREUR_INTERNE", message: "Impossible de traiter le reversement." } }, { status: 500 });
}

export async function PATCH(requete: Request, { params }: { params: { tontineId: string; declarationId: string } }) {
  const utilisateur = await obtenirUtilisateurAuthentifie();
  if (!utilisateur) return NextResponse.json({ erreur: { code: "NON_AUTHENTIFIE", message: "Connexion requise." } }, { status: 401 });
  if (!origineAutorisee(requete)) return NextResponse.json({ erreur: { code: "ORIGINE_REFUSEE", message: "Origine de la requête refusée." } }, { status: 403 });
  try {
    const cle = requete.headers.get("Idempotency-Key")?.trim();
    if (!cle) throw new ErreurTontine("CLE_IDEMPOTENCE_REQUISE", "Une clé d'idempotence est requise pour décider la réception.", 400);
    if (cle && (cle.length < 8 || cle.length > 128)) throw new ErreurTontine("CLE_IDEMPOTENCE_INVALIDE", "La clé d'idempotence est invalide.", 400);
    const donnees = decisionReceptionReversementSchema.parse(await requete.json());
    return NextResponse.json({ donnees: await tontinesService.deciderReceptionReversement(params.tontineId, params.declarationId, utilisateur.id, donnees, cle) });
  } catch (cause) {
    return erreur(cause);
  }
}
