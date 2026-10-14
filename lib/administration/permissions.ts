import { RolePlateforme } from "@prisma/client";

export type DefinitionPermission = { id: string; module: string; description: string; sensible?: boolean };
/** Source unique des droits : toute permission absente de ce registre est refusée. */
export const registrePermissions = [
  { id: "plateforme.tableau_de_bord.lire", module: "plateforme", description: "Consulter les indicateurs globaux." },
  { id: "plateforme.utilisateurs.lire", module: "plateforme", description: "Consulter les comptes administrativement." },
  { id: "plateforme.utilisateurs.suspendre", module: "plateforme", description: "Suspendre un compte et invalider ses sessions.", sensible: true },
  { id: "plateforme.utilisateurs.reactiver", module: "plateforme", description: "Réactiver un compte suspendu.", sensible: true },
  { id: "plateforme.utilisateurs.sessions.revoquer", module: "plateforme", description: "Révoquer les sessions actives.", sensible: true },
  { id: "plateforme.roles.gerer", module: "plateforme", description: "Gérer les rôles système et personnalisés.", sensible: true },
  { id: "plateforme.modules.lire", module: "plateforme", description: "Consulter les modules enregistrés." },
  { id: "plateforme.modules.gerer", module: "plateforme", description: "Modifier un module compatible.", sensible: true },
  { id: "plateforme.parametres.lire", module: "plateforme", description: "Consulter les paramètres globaux autorisés." },
  { id: "plateforme.parametres.gerer", module: "plateforme", description: "Modifier un paramètre global autorisé.", sensible: true },
  { id: "plateforme.audit.lire", module: "plateforme", description: "Consulter et exporter le journal d’audit." },
  { id: "plateforme.incidents.lire", module: "plateforme", description: "Consulter les incidents de sécurité et d’exploitation." },
  { id: "plateforme.incidents.gerer", module: "plateforme", description: "Traiter un incident administratif.", sensible: true },
  { id: "tontines.supervision.lire", module: "tontines", description: "Consulter les tontines et leurs agrégats." },
  { id: "tontines.alertes.lire", module: "tontines", description: "Consulter les alertes de tontines." },
  { id: "tontines.statistiques.lire", module: "tontines", description: "Consulter les statistiques de tontines." },
  { id: "tontines.suspension.gerer", module: "tontines", description: "Suspendre ou réactiver une tontine.", sensible: true },
  { id: "tontines.litiges.lire", module: "tontines", description: "Consulter les litiges de tontines." },
  { id: "tontines.litiges.gerer", module: "tontines", description: "Instruire les litiges sans modifier les écritures financières.", sensible: true },
] as const satisfies readonly DefinitionPermission[];
export type PermissionPlateforme = (typeof registrePermissions)[number]["id"];
export const permissionsPlateforme: readonly PermissionPlateforme[] = registrePermissions.map((permission) => permission.id) as PermissionPlateforme[];
const toutesLesPermissions = [...permissionsPlateforme];
export const permissionsParRole: Record<RolePlateforme, PermissionPlateforme[]> = {
  SUPER_ADMIN: toutesLesPermissions,
  ADMIN_SUPPORT: ["plateforme.tableau_de_bord.lire", "plateforme.utilisateurs.lire", "plateforme.utilisateurs.suspendre", "plateforme.utilisateurs.reactiver", "plateforme.utilisateurs.sessions.revoquer", "plateforme.modules.lire", "tontines.supervision.lire", "tontines.alertes.lire", "tontines.statistiques.lire", "tontines.litiges.lire"],
  ADMIN_AUDIT: ["plateforme.tableau_de_bord.lire", "plateforme.audit.lire", "plateforme.incidents.lire", "plateforme.modules.lire", "tontines.supervision.lire", "tontines.alertes.lire", "tontines.statistiques.lire", "tontines.litiges.lire", "plateforme.parametres.lire"],
};
export function estPermissionConnue(permission: string): permission is PermissionPlateforme { return (permissionsPlateforme as readonly string[]).includes(permission); }
export function permissionsEffectives(roles: RolePlateforme[], permissionsPersonnalisees: string[] = []) { return Array.from(new Set([...roles.flatMap((role) => permissionsParRole[role] ?? []), ...permissionsPersonnalisees.filter(estPermissionConnue)])) as PermissionPlateforme[]; }
export function permissionAccordee(roles: RolePlateforme[], permission: PermissionPlateforme, permissionsPersonnalisees: string[] = []) { return permissionsEffectives(roles, permissionsPersonnalisees).includes(permission); }
export const modulesPlateforme = [{ id: "tontines", nom: "Tontines", description: "Supervision des tontines, rotations, litiges et alertes financières.", version: "2.6", chemin: "/administration-plateforme/tontines", dependances: [], desactivationAutorisee: false, permissions: registrePermissions.filter((permission) => permission.module === "tontines").map((permission) => permission.id) }] as const;
