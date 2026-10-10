import { NextResponse } from "next/server";
import { obtenirUtilisateurAuthentifie } from "@/lib/auth/session";
import { ErreurTontine, tontinesService } from "@/services/tontines.service";

export async function GET() {
  const utilisateur = await obtenirUtilisateurAuthentifie();
  if (!utilisateur) return NextResponse.json({ erreur: { code: "NON_AUTHENTIFIE", message: "Connexion requise." } }, { status: 401 });
  try {
    return NextResponse.json({ donnees: await tontinesService.listerInvitationsRecues(utilisateur.id) });
  } catch (erreur) {
    const cause = erreur as ErreurTontine;
    return NextResponse.json({ erreur: { code: cause.code ?? "ERREUR_SERVEUR", message: cause.message ?? "Erreur serveur." } }, { status: cause.statut ?? 500 });
  }
}
