import { NextResponse } from "next/server";
import { z } from "zod";
import { autoriserAdministration, erreurAdministration } from "@/app/api/administration/outils";
import { administrationService } from "@/services/administration.service";
const schema = z.object({ motif: z.string().trim().min(3).max(500) });
export async function POST(requete: Request, { params }: { params: { utilisateurId: string; roleId: string } }) { try { const contexte = await autoriserAdministration("plateforme.roles.gerer", requete); return NextResponse.json({ donnees: await administrationService.attribuerRolePersonnalise(params.utilisateurId, params.roleId, contexte.utilisateur.id, schema.parse(await requete.json()).motif) }); } catch (cause) { return erreurAdministration(cause); } }
export async function DELETE(requete: Request, { params }: { params: { utilisateurId: string; roleId: string } }) { try { const contexte = await autoriserAdministration("plateforme.roles.gerer", requete); return NextResponse.json({ donnees: await administrationService.retirerRolePersonnalise(params.utilisateurId, params.roleId, contexte.utilisateur.id, schema.parse(await requete.json()).motif) }); } catch (cause) { return erreurAdministration(cause); } }
