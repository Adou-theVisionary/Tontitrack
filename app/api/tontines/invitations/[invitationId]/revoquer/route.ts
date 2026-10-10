import { NextResponse } from "next/server";
import { z } from "zod";
import { obtenirUtilisateurAuthentifie } from "@/lib/auth/session";
import { ErreurTontine, tontinesService } from "@/services/tontines.service";

export async function POST(_: Request, { params }: { params: { invitationId: string } }) {
  const utilisateur = await obtenirUtilisateurAuthentifie();
  if (!utilisateur) return NextResponse.json({ erreur: { code: "NON_AUTHENTIFIE", message: "Connexion requise." } }, { status: 401 });
  try {
    const invitationId = z.string().cuid().parse(params.invitationId);
    return NextResponse.json({ donnees: await tontinesService.revoquerInvitation(invitationId, utilisateur.id) });
  } catch (erreur) {
    const cause = erreur as ErreurTontine;
    return NextResponse.json({ erreur: { code: cause.code ?? "DONNEES_INVALIDES", message: cause.message ?? "Données invalides." } }, { status: cause.statut ?? 400 });
  }
}
