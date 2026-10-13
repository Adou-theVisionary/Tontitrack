import { NextResponse } from "next/server";
import { RolePlateforme, StatutUtilisateur } from "@prisma/client";
import { autoriserAdministration, entierParametre, erreurAdministration } from "@/app/api/administration/outils";
import { administrationService } from "@/services/administration.service";

export async function GET(requete: Request) {
  try {
    await autoriserAdministration("plateforme.utilisateurs.lire");
    const url = new URL(requete.url);
    const statut = url.searchParams.get("statut");
    const role = url.searchParams.get("role");
    return NextResponse.json({ donnees: await administrationService.listerUtilisateurs({
      page: entierParametre(url.searchParams.get("page"), 1), taille: entierParametre(url.searchParams.get("taille"), 20), recherche: url.searchParams.get("recherche") ?? undefined,
      statut: statut && Object.values(StatutUtilisateur).includes(statut as StatutUtilisateur) ? statut as StatutUtilisateur : undefined,
      role: role && Object.values(RolePlateforme).includes(role as RolePlateforme) ? role as RolePlateforme : undefined,
    }) });
  } catch (cause) { return erreurAdministration(cause); }
}
