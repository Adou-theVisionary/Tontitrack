import { NextResponse } from "next/server";
import { autoriserAdministration, erreurAdministration } from "@/app/api/administration/outils";
import { z } from "zod";
import { administrationService } from "@/services/administration.service";
export async function GET() { try { await autoriserAdministration("plateforme.parametres.lire"); return NextResponse.json({ donnees: await administrationService.parametres() }); } catch (cause) { return erreurAdministration(cause); } }
const schema = z.object({ cle: z.string().trim().min(1).max(120), valeur: z.boolean(), motif: z.string().trim().min(3).max(500) });
export async function PATCH(requete: Request) { try { const contexte = await autoriserAdministration("plateforme.parametres.gerer", requete); const donnees = schema.parse(await requete.json()); return NextResponse.json({ donnees: await administrationService.modifierParametre(donnees.cle, donnees.valeur, contexte.utilisateur.id, donnees.motif) }); } catch (cause) { return erreurAdministration(cause); } }
