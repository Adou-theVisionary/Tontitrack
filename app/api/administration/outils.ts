import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { origineAutorisee } from "@/lib/auth/session";
import { exigerAdministrateur, ErreurAdministration } from "@/lib/administration/autorisation";
import { autoriserRequeteAdministration } from "@/lib/administration/limite-administration";
import type { PermissionPlateforme } from "@/lib/administration/permissions";
import { ErreurServiceAdministration } from "@/services/administration.service";

export function erreurAdministration(cause: unknown) {
  if (cause instanceof ZodError) {
    return NextResponse.json({ erreur: { code: "DONNEES_INVALIDES", message: "Les données administratives sont invalides." } }, { status: 400 });
  }
  if (cause instanceof ErreurAdministration || cause instanceof ErreurServiceAdministration) {
    return NextResponse.json({ erreur: { code: cause.code, message: cause.message } }, { status: cause.statut });
  }
  if (cause instanceof Prisma.PrismaClientKnownRequestError && cause.code === "P2034") {
    return NextResponse.json({ erreur: { code: "OPERATION_CONCURRENTE", message: "Une opération concurrente a été détectée. Actualisez puis réessayez." } }, { status: 409 });
  }
  return NextResponse.json({ erreur: { code: "ERREUR_INTERNE", message: "L'opération administrative a échoué. Réessayez plus tard." } }, { status: 500 });
}

export async function autoriserAdministration(permission: PermissionPlateforme, requete?: Request) {
  if (requete && !origineAutorisee(requete)) throw new ErreurAdministration("ORIGINE_REFUSEE", "Origine de la requête refusée.", 403);
  const contexte = await exigerAdministrateur(permission);
  if (!autoriserRequeteAdministration(`${contexte.utilisateur.id}:${permission}`)) {
    throw new ErreurAdministration("TROP_DE_REQUETES", "Trop de requêtes administratives. Réessayez dans un instant.", 429);
  }
  return contexte;
}

export function entierParametre(valeur: string | null, defaut: number) {
  const nombre = Number(valeur);
  return Number.isFinite(nombre) ? nombre : defaut;
}
