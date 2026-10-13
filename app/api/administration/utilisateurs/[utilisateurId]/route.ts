import { NextResponse } from "next/server";
import { autoriserAdministration, erreurAdministration } from "@/app/api/administration/outils";
import { administrationService } from "@/services/administration.service";

export async function GET(_: Request, { params }: { params: { utilisateurId: string } }) {
  try {
    await autoriserAdministration("plateforme.utilisateurs.lire");
    return NextResponse.json({ donnees: await administrationService.detailUtilisateur(params.utilisateurId) });
  } catch (cause) { return erreurAdministration(cause); }
}
