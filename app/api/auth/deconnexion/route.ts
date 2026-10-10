import { NextResponse } from "next/server";
import { NOM_COOKIE_SESSION, invaliderSessionCourante, origineAutorisee } from "@/lib/auth/session";

export async function POST(requete: Request) {
  if (!origineAutorisee(requete)) return NextResponse.json({ erreur: { code: "ORIGINE_NON_AUTORISEE", message: "Requête refusée." } }, { status: 403 });
  await invaliderSessionCourante();
  const reponse = NextResponse.json({ donnees: { deconnecte: true } });
  reponse.cookies.set(NOM_COOKIE_SESSION, "", { httpOnly: true, path: "/", maxAge: 0, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  return reponse;
}
