import { NextResponse } from "next/server";
import { obtenirUtilisateurAuthentifie, origineAutorisee } from "@/lib/auth/session";
import { ErreurTontine, tontinesService } from "@/services/tontines.service";

function reponseErreur(erreur: unknown) {
  const detail = erreur as ErreurTontine;
  return NextResponse.json({ erreur: { code: detail.code ?? "DONNEES_INVALIDES", message: detail.message ?? "Données invalides." } }, { status: detail.statut ?? 400 });
}

export async function GET(_: Request, { params }: { params: { tontineId: string } }) {
  const utilisateur = await obtenirUtilisateurAuthentifie();
  if (!utilisateur) return NextResponse.json({ erreur: { code: "NON_AUTHENTIFIE", message: "Connexion requise." } }, { status: 401 });
  try { return NextResponse.json({ donnees: await tontinesService.etatDemarrage(params.tontineId, utilisateur.id) }); }
  catch (erreur) { return reponseErreur(erreur); }
}

export async function POST(requete: Request, { params }: { params: { tontineId: string } }) {
  if (!origineAutorisee(requete)) return NextResponse.json({ erreur: { code: "ORIGINE_REFUSEE", message: "Origine de requête refusée." } }, { status: 403 });
  const utilisateur = await obtenirUtilisateurAuthentifie();
  if (!utilisateur) return NextResponse.json({ erreur: { code: "NON_AUTHENTIFIE", message: "Connexion requise." } }, { status: 401 });
  try { return NextResponse.json({ donnees: await tontinesService.demarrer(params.tontineId, utilisateur.id, "MANUEL") }); }
  catch (erreur) { return reponseErreur(erreur); }
}
