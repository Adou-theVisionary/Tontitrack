import { NextResponse } from "next/server";
import { obtenirUtilisateurAuthentifie, origineAutorisee } from "@/lib/auth/session";
import { ErreurTontine, tontinesService } from "@/services/tontines.service";

function erreur(cause: unknown) {
  if (cause instanceof ErreurTontine) return NextResponse.json({ erreur: { code: cause.code, message: cause.message } }, { status: cause.statut });
  return NextResponse.json({ erreur: { code: "ERREUR_INTERNE", message: "Impossible d'archiver la tontine." } }, { status: 500 });
}

export async function POST(requete: Request, { params }: { params: { tontineId: string } }) {
  const utilisateur = await obtenirUtilisateurAuthentifie();
  if (!utilisateur) return NextResponse.json({ erreur: { code: "NON_AUTHENTIFIE", message: "Connexion requise." } }, { status: 401 });
  if (!origineAutorisee(requete)) return NextResponse.json({ erreur: { code: "ORIGINE_REFUSEE", message: "Origine de la requête refusée." } }, { status: 403 });
  try {
    return NextResponse.json({ donnees: await tontinesService.archiver(params.tontineId, utilisateur.id) });
  } catch (cause) {
    return erreur(cause);
  }
}
