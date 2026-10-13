import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { tontinesService } from "@/services/tontines.service";

export const runtime = "nodejs";

function secretValide(requete: Request) {
  const secret = process.env.TONTITRACK_TACHE_SECRET;
  const jeton = requete.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!secret || !jeton) return false;
  const attendu = Buffer.from(secret);
  const fourni = Buffer.from(jeton);
  return attendu.length === fourni.length && timingSafeEqual(attendu, fourni);
}

/** Point d'entrée pour ordonnanceur externe. Aucun lancement automatique sans appel authentifié. */
export async function POST(requete: Request) {
  if (!process.env.TONTITRACK_TACHE_SECRET) return NextResponse.json({ erreur: { code: "TACHE_NON_CONFIGUREE", message: "Secret d'automatisation absent." } }, { status: 503 });
  if (!secretValide(requete)) return NextResponse.json({ erreur: { code: "NON_AUTORISE", message: "Accès à la tâche refusé." } }, { status: 401 });
  return NextResponse.json({ donnees: await tontinesService.demarrerAutomatiques() });
}
