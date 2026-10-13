import { NextResponse } from "next/server";
import { autoriserAdministration, erreurAdministration } from "@/app/api/administration/outils";
import { administrationService } from "@/services/administration.service";
export async function GET() { try { await autoriserAdministration("plateforme.roles.gerer"); return NextResponse.json({ donnees: administrationService.roles() }); } catch (cause) { return erreurAdministration(cause); } }
