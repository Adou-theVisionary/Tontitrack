import { NextResponse } from "next/server";
import { obtenirUtilisateurAuthentifie } from "@/lib/auth/session";
import { ErreurTontine, tontinesService } from "@/services/tontines.service";

export async function GET(_: Request, { params }: { params: { tontineId: string } }) {
  const utilisateur = await obtenirUtilisateurAuthentifie();
  if (!utilisateur) return NextResponse.json({ erreur: { code: "NON_AUTHENTIFIE", message: "Connexion requise." } }, { status: 401 });
  try { return NextResponse.json({ donnees: await tontinesService.listerRotations(params.tontineId, utilisateur.id) }); }
  catch (erreur) { const detail = erreur as ErreurTontine; return NextResponse.json({ erreur: { code: detail.code, message: detail.message } }, { status: detail.statut }); }
}
