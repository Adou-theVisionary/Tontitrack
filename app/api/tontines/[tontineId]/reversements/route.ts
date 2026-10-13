import { NextResponse } from "next/server";
import { obtenirUtilisateurAuthentifie } from "@/lib/auth/session";
import { ErreurTontine, tontinesService } from "@/services/tontines.service";

function erreur(cause: unknown) {
  if (cause instanceof ErreurTontine) return NextResponse.json({ erreur: { code: cause.code, message: cause.message } }, { status: cause.statut });
  return NextResponse.json({ erreur: { code: "ERREUR_INTERNE", message: "Impossible de charger les reversements." } }, { status: 500 });
}

export async function GET(_: Request, { params }: { params: { tontineId: string } }) {
  const utilisateur = await obtenirUtilisateurAuthentifie();
  if (!utilisateur) return NextResponse.json({ erreur: { code: "NON_AUTHENTIFIE", message: "Connexion requise." } }, { status: 401 });
  try {
    return NextResponse.json({ donnees: await tontinesService.listerReversements(params.tontineId, utilisateur.id) });
  } catch (cause) {
    return erreur(cause);
  }
}
