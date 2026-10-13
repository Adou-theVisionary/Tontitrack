import { NextResponse } from "next/server";
import { autoriserAdministration, erreurAdministration } from "@/app/api/administration/outils";
import { administrationService } from "@/services/administration.service";

export async function GET() {
  try {
    await autoriserAdministration("plateforme.tableau_de_bord.lire");
    return NextResponse.json({ donnees: await administrationService.tableauDeBord() });
  } catch (cause) { return erreurAdministration(cause); }
}
