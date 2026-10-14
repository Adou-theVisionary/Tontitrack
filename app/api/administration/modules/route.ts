import { NextResponse } from "next/server";
import { autoriserAdministration, erreurAdministration } from "@/app/api/administration/outils";
import { administrationService } from "@/services/administration.service";
import { z } from "zod";
export async function GET() { try { await autoriserAdministration("plateforme.modules.lire"); return NextResponse.json({ donnees: await administrationService.modules() }); } catch (cause) { return erreurAdministration(cause); } }
const schema = z.object({ moduleId: z.string().trim().min(1).max(80), estActive: z.boolean(), motif: z.string().trim().min(3).max(500) });
export async function PATCH(requete: Request) { try { const contexte = await autoriserAdministration("plateforme.modules.gerer", requete); const donnees = schema.parse(await requete.json()); return NextResponse.json({ donnees: await administrationService.modifierModule(donnees.moduleId, donnees.estActive, contexte.utilisateur.id, donnees.motif) }); } catch (cause) { return erreurAdministration(cause); } }
