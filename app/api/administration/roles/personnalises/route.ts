import { NextResponse } from "next/server";
import { z } from "zod";
import { autoriserAdministration, erreurAdministration } from "@/app/api/administration/outils";
import { administrationService } from "@/services/administration.service";
const schema = z.object({ code: z.string().trim().min(3).max(40).regex(/^[A-Z0-9_]+$/i), nom: z.string().trim().min(3).max(100), description: z.string().trim().max(500).optional(), permissions: z.array(z.string()).max(30), motif: z.string().trim().min(3).max(500) });
export async function POST(requete: Request) { try { const contexte = await autoriserAdministration("plateforme.roles.gerer", requete); const { motif, ...donnees } = schema.parse(await requete.json()); return NextResponse.json({ donnees: await administrationService.creerRolePersonnalise(donnees, contexte.utilisateur.id, motif) }, { status: 201 }); } catch (cause) { return erreurAdministration(cause); } }
