import { NextResponse } from "next/server";
import { StatutLitigeAdministration } from "@prisma/client";
import { z } from "zod";
import { autoriserAdministration, erreurAdministration } from "@/app/api/administration/outils";
import { administrationService } from "@/services/administration.service";
const schema = z.object({ action: z.enum(["PRISE_EN_CHARGE", "NOTE", "DECISION", "CLOTURE"]), statut: z.nativeEnum(StatutLitigeAdministration).optional(), note: z.string().trim().min(3).max(2_000), fichierId: z.string().trim().min(1).optional() });
export async function PATCH(requete: Request, { params }: { params: { litigeId: string } }) { try { const contexte = await autoriserAdministration("tontines.litiges.gerer", requete); return NextResponse.json({ donnees: await administrationService.traiterLitige(params.litigeId, contexte.utilisateur.id, schema.parse(await requete.json())) }); } catch (cause) { return erreurAdministration(cause); } }
