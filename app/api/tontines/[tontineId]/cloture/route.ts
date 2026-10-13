import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { obtenirUtilisateurAuthentifie, origineAutorisee } from "@/lib/auth/session";
import { confirmationClotureTontineSchema } from "@/lib/tontines/contrats";
import { ErreurTontine, tontinesService } from "@/services/tontines.service";

function erreur(cause: unknown) {
  if (cause instanceof ZodError) return NextResponse.json({ erreur: { code: "DONNEES_INVALIDES", message: "La confirmation de clôture est invalide." } }, { status: 400 });
  if (cause instanceof ErreurTontine) return NextResponse.json({ erreur: { code: cause.code, message: cause.message } }, { status: cause.statut });
  return NextResponse.json({ erreur: { code: "ERREUR_INTERNE", message: "Impossible de traiter la clôture." } }, { status: 500 });
}

export async function GET(_: Request, { params }: { params: { tontineId: string } }) {
  const utilisateur = await obtenirUtilisateurAuthentifie();
  if (!utilisateur) return NextResponse.json({ erreur: { code: "NON_AUTHENTIFIE", message: "Connexion requise." } }, { status: 401 });
  try {
    return NextResponse.json({ donnees: await tontinesService.etatCloture(params.tontineId, utilisateur.id) });
  } catch (cause) {
    return erreur(cause);
  }
}

export async function POST(requete: Request, { params }: { params: { tontineId: string } }) {
  const utilisateur = await obtenirUtilisateurAuthentifie();
  if (!utilisateur) return NextResponse.json({ erreur: { code: "NON_AUTHENTIFIE", message: "Connexion requise." } }, { status: 401 });
  if (!origineAutorisee(requete)) return NextResponse.json({ erreur: { code: "ORIGINE_REFUSEE", message: "Origine de la requête refusée." } }, { status: 403 });
  try {
    const donnees = confirmationClotureTontineSchema.parse(await requete.json());
    return NextResponse.json({ donnees: await tontinesService.cloturer(params.tontineId, utilisateur.id, donnees) });
  } catch (cause) {
    return erreur(cause);
  }
}
