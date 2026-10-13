import { NextResponse } from "next/server";
import { z } from "zod";
import { autoriserAdministration, erreurAdministration } from "@/app/api/administration/outils";
import { administrationService } from "@/services/administration.service";
const schema = z.object({ motif: z.string().trim().min(3).max(500) });

export async function PATCH(requete: Request, { params }: { params: { utilisateurId: string } }) {
  try {
    const contexte = await autoriserAdministration("plateforme.utilisateurs.suspendre", requete);
    const { motif } = schema.parse(await requete.json());
    return NextResponse.json({ donnees: await administrationService.suspendreUtilisateur(params.utilisateurId, contexte.utilisateur.id, motif) });
  } catch (cause) { return erreurAdministration(cause); }
}
