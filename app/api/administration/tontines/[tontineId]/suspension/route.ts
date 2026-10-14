import { NextResponse } from "next/server";
import { z } from "zod";
import { autoriserAdministration, erreurAdministration } from "@/app/api/administration/outils";
import { administrationService } from "@/services/administration.service";
const schema = z.object({ motif: z.string().trim().min(3).max(500) });
export async function PATCH(requete: Request, { params }: { params: { tontineId: string } }) { try { const contexte = await autoriserAdministration("tontines.suspension.gerer", requete); return NextResponse.json({ donnees: await administrationService.suspendreTontine(params.tontineId, contexte.utilisateur.id, schema.parse(await requete.json()).motif) }); } catch (cause) { return erreurAdministration(cause); } }
export async function DELETE(requete: Request, { params }: { params: { tontineId: string } }) { try { const contexte = await autoriserAdministration("tontines.suspension.gerer", requete); return NextResponse.json({ donnees: await administrationService.reactiverTontine(params.tontineId, contexte.utilisateur.id, schema.parse(await requete.json()).motif) }); } catch (cause) { return erreurAdministration(cause); } }
