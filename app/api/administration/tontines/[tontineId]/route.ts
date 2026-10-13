import { NextResponse } from "next/server";
import { autoriserAdministration, erreurAdministration } from "@/app/api/administration/outils";
import { administrationService } from "@/services/administration.service";
export async function GET(_: Request, { params }: { params: { tontineId: string } }) { try { await autoriserAdministration("tontines.supervision.lire"); return NextResponse.json({ donnees: await administrationService.detailTontine(params.tontineId) }); } catch (cause) { return erreurAdministration(cause); } }
