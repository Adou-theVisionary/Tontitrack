import { NextResponse } from "next/server";
import { connexionSchema } from "@/lib/auth/contrats";
import { NOM_COOKIE_SESSION, creerSession, optionsCookieSession } from "@/lib/auth/session";
import { ErreurAuthentification, authentifierUtilisateur } from "@/services/authentification.service";
import { autoriserTentativeConnexion, reinitialiserTentativesConnexion } from "@/lib/auth/limite-connexion";

export async function POST(requete: Request) {
  try {
    const donnees = connexionSchema.parse(await requete.json());
    const adresseClient = requete.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "inconnue";
    const cleLimite = `${adresseClient}:${donnees.email}`;
    if (!autoriserTentativeConnexion(cleLimite)) {
      return NextResponse.json({ erreur: { code: "TROP_DE_TENTATIVES", message: "Trop de tentatives. Réessayez plus tard." } }, { status: 429 });
    }
    const utilisateur = await authentifierUtilisateur(donnees.email, donnees.motDePasse);
    reinitialiserTentativesConnexion(cleLimite);
    const session = await creerSession(utilisateur.id);
    const reponse = NextResponse.json({ donnees: { utilisateur } });
    reponse.cookies.set(NOM_COOKIE_SESSION, session.jeton, optionsCookieSession(session.expireLe));
    return reponse;
  } catch (erreur) {
    if (erreur instanceof ErreurAuthentification) return NextResponse.json({ erreur: { code: erreur.code, message: erreur.message } }, { status: erreur.statutHttp });
    return NextResponse.json({ erreur: { code: "IDENTIFIANTS_INVALIDES", message: "Email ou mot de passe incorrect." } }, { status: 400 });
  }
}
