import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { sessionsRepository } from "@/repositories/sessions.repository";

export const NOM_COOKIE_SESSION = "tontitrack_session";
const DUREE_SESSION_MS = 1000 * 60 * 60 * 24 * 14;

function empreinteJeton(jeton: string) {
  return createHash("sha256").update(jeton).digest("base64url");
}

export async function creerSession(utilisateurId: string) {
  const jeton = randomBytes(32).toString("base64url");
  const expireLe = new Date(Date.now() + DUREE_SESSION_MS);
  await sessionsRepository.creer(utilisateurId, empreinteJeton(jeton), expireLe);
  return { jeton, expireLe };
}

export function optionsCookieSession(expireLe: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: expireLe,
  };
}

export async function obtenirUtilisateurAuthentifie() {
  const jeton = cookies().get(NOM_COOKIE_SESSION)?.value;
  if (!jeton) return null;

  const session = await sessionsRepository.trouverValide(empreinteJeton(jeton));
  if (!session || session.invalideLe || session.expireLe <= new Date() || session.utilisateur.statut !== "ACTIF") return null;
  return session.utilisateur;
}

export async function invaliderSessionCourante() {
  const jeton = cookies().get(NOM_COOKIE_SESSION)?.value;
  if (jeton) await sessionsRepository.invalider(empreinteJeton(jeton));
}

/** Les mutations avec cookie refusent une origine externe, même si SameSite est contourné. */
export function origineAutorisee(requete: Request) {
  const origine = requete.headers.get("origin");
  const hote = requete.headers.get("host");
  return !origine || !hote || origine === `http://${hote}` || origine === `https://${hote}`;
}
