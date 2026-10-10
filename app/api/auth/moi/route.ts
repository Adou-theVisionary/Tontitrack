import { NextResponse } from "next/server";
import { obtenirUtilisateurAuthentifie } from "@/lib/auth/session";
import { presenterUtilisateur } from "@/services/authentification.service";

export async function GET() {
  const utilisateur = await obtenirUtilisateurAuthentifie();
  if (!utilisateur) return NextResponse.json({ erreur: { code: "NON_AUTHENTIFIE", message: "Connexion requise." } }, { status: 401 });
  return NextResponse.json({ donnees: { utilisateur: presenterUtilisateur(utilisateur) } });
}
