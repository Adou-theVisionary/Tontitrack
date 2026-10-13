import { NextResponse, type NextRequest } from "next/server";

/** Les liens d'invitation doivent revenir au même chemin après authentification. */
export function middleware(requete: NextRequest) {
  const retour = `${requete.nextUrl.pathname}${requete.nextUrl.search}`;
  if (requete.cookies.has("tontitrack_session")) {
    const entetes = new Headers(requete.headers);
    entetes.set("x-tontitrack-retour", retour);
    return NextResponse.next({ request: { headers: entetes } });
  }
  const connexion = new URL("/connexion", requete.url);
  connexion.searchParams.set("retour", retour);
  return NextResponse.redirect(connexion);
}

export const config = { matcher: ["/tontines/:path*"] };
