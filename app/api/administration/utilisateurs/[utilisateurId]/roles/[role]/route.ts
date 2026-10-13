import { NextResponse } from "next/server";
import { RolePlateforme } from "@prisma/client";
import { z } from "zod";
import { autoriserAdministration, erreurAdministration } from "@/app/api/administration/outils";
import { administrationService, ErreurServiceAdministration } from "@/services/administration.service";
const schema = z.object({ motif: z.string().trim().min(3).max(500) });

function roleValide(role: string): RolePlateforme {
  if (!Object.values(RolePlateforme).includes(role as RolePlateforme)) throw new ErreurServiceAdministration("ROLE_INVALIDE", "Rôle plateforme invalide.", 400);
  return role as RolePlateforme;
}
export async function POST(requete: Request, { params }: { params: { utilisateurId: string; role: string } }) {
  try {
    const contexte = await autoriserAdministration("plateforme.roles.gerer", requete);
    return NextResponse.json({ donnees: await administrationService.attribuerRole(params.utilisateurId, roleValide(params.role), contexte.utilisateur.id, schema.parse(await requete.json()).motif) });
  } catch (cause) { return erreurAdministration(cause); }
}
export async function DELETE(requete: Request, { params }: { params: { utilisateurId: string; role: string } }) {
  try {
    const contexte = await autoriserAdministration("plateforme.roles.gerer", requete);
    return NextResponse.json({ donnees: await administrationService.retirerRole(params.utilisateurId, roleValide(params.role), contexte.utilisateur.id, schema.parse(await requete.json()).motif) });
  } catch (cause) { return erreurAdministration(cause); }
}
