import { NextResponse } from "next/server";
import { z } from "zod";
import { autoriserAdministration, erreurAdministration } from "@/app/api/administration/outils";
import { administrationService } from "@/services/administration.service";
const schema = z.object({ nom: z.string().trim().min(3).max(100), description: z.string().trim().max(500).optional(), permissions: z.array(z.string()).max(30), motif: z.string().trim().min(3).max(500) });
export async function PATCH(requete: Request, { params }: { params: { roleId: string } }) { try { const contexte = await autoriserAdministration("plateforme.roles.gerer", requete); const { motif, ...donnees } = schema.parse(await requete.json()); return NextResponse.json({ donnees: await administrationService.modifierRolePersonnalise(params.roleId, donnees, contexte.utilisateur.id, motif) }); } catch (cause) { return erreurAdministration(cause); } }
