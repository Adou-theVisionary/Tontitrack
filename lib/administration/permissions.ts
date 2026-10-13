import { RolePlateforme } from "@prisma/client";

export const permissionsPlateforme = [
  "plateforme.tableau_de_bord.lire",
  "plateforme.utilisateurs.lire",
  "plateforme.utilisateurs.suspendre",
  "plateforme.utilisateurs.reactiver",
  "plateforme.roles.gerer",
  "plateforme.audit.lire",
  "plateforme.modules.lire",
  "tontines.supervision.lire",
  "tontines.alertes.lire",
  "tontines.statistiques.lire",
  "plateforme.parametres.lire",
] as const;

export type PermissionPlateforme = (typeof permissionsPlateforme)[number];

const toutesLesPermissions = [...permissionsPlateforme];

export const permissionsParRole: Record<RolePlateforme, PermissionPlateforme[]> = {
  SUPER_ADMIN: toutesLesPermissions,
  ADMIN_SUPPORT: [
    "plateforme.tableau_de_bord.lire",
    "plateforme.utilisateurs.lire",
    "plateforme.utilisateurs.suspendre",
    "plateforme.utilisateurs.reactiver",
    "plateforme.modules.lire",
    "tontines.supervision.lire",
    "tontines.alertes.lire",
    "tontines.statistiques.lire",
  ],
  ADMIN_AUDIT: [
    "plateforme.tableau_de_bord.lire",
    "plateforme.audit.lire",
    "plateforme.modules.lire",
    "tontines.supervision.lire",
    "tontines.alertes.lire",
    "tontines.statistiques.lire",
    "plateforme.parametres.lire",
  ],
};

export function permissionsEffectives(roles: RolePlateforme[]) {
  return Array.from(new Set(roles.flatMap((role) => permissionsParRole[role] ?? [])));
}

export function permissionAccordee(roles: RolePlateforme[], permission: PermissionPlateforme) {
  return permissionsEffectives(roles).includes(permission);
}

export const modulesPlateforme = [
  {
    id: "tontines",
    nom: "Tontines",
    description: "Supervision des tontines, rotations et alertes financières.",
    etat: "DISPONIBLE",
    chemin: "/administration-plateforme/tontines",
    permissions: ["tontines.supervision.lire", "tontines.alertes.lire", "tontines.statistiques.lire"],
  },
] as const;
