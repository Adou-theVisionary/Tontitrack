import { NextResponse } from "next/server";
import { z } from "zod";
import { obtenirUtilisateurAuthentifie } from "@/lib/auth/session";
import { lirePreuvePrivee } from "@/lib/stockage/preuves-privees";
import { ErreurTontine, tontinesService } from "@/services/tontines.service";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: { tontineId: string; cotisationId: string; declarationId: string; preuveId: string } }) {
  const utilisateur = await obtenirUtilisateurAuthentifie();
  if (!utilisateur) return NextResponse.json({ erreur: { code: "NON_AUTHENTIFIE", message: "Connexion requise." } }, { status: 401 });
  try {
    const [tontineId, cotisationId, declarationId, preuveId] = [params.tontineId, params.cotisationId, params.declarationId, params.preuveId].map((id) => z.string().cuid().parse(id));
    const preuve = await tontinesService.obtenirPreuveCotisation(tontineId, cotisationId, declarationId, preuveId, utilisateur.id);
    const contenu = await lirePreuvePrivee(preuve.cleStockage);
    return new NextResponse(contenu, { headers: { "Content-Type": preuve.typeMime, "Content-Disposition": "inline; filename=justificatif" as string, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (cause) {
    const erreur = cause as ErreurTontine;
    return NextResponse.json({ erreur: { code: erreur.code ?? "PREUVE_INTROUVABLE", message: erreur.message ?? "Justificatif introuvable." } }, { status: erreur.statut ?? 404 });
  }
}
