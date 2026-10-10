import { NextResponse } from "next/server";
import { z } from "zod";
import { obtenirUtilisateurAuthentifie } from "@/lib/auth/session";
import { acceptationInvitationSchema } from "@/lib/tontines/contrats";
import { ErreurTontine, tontinesService } from "@/services/tontines.service";

export async function POST(requete: Request, { params }: { params: { invitationId: string } }) {
  const utilisateur = await obtenirUtilisateurAuthentifie();
  if (!utilisateur) return NextResponse.json({ erreur: { code: "NON_AUTHENTIFIE", message: "Connexion requise." } }, { status: 401 });
  try {
    const invitationId = z.string().cuid().parse(params.invitationId);
    const donnees = acceptationInvitationSchema.parse(await requete.json());
    return NextResponse.json({ donnees: await tontinesService.traiterInvitation(invitationId, utilisateur.id, true, donnees) });
  } catch (erreur) {
    const cause = erreur as ErreurTontine;
    return NextResponse.json({ erreur: { code: cause.code ?? "DONNEES_INVALIDES", message: cause.message ?? "Données invalides." } }, { status: cause.statut ?? 400 });
  }
}
