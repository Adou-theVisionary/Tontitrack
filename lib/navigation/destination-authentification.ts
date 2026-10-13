import type { PermissionPlateforme } from "@/lib/administration/permissions";
import { destinationRetourAutorisee } from "@/lib/navigation/retour";

type ContexteDestination = { permissions: PermissionPlateforme[]; retour?: string | null };

const DESTINATION_UTILISATEUR = "/tableau-de-bord";
const DESTINATION_ADMINISTRATION = "/administration-plateforme";

function accesAdministration(permissions: PermissionPlateforme[]) {
  return permissions.includes("plateforme.tableau_de_bord.lire");
}

function destinationAutorisee(destination: string, permissions: PermissionPlateforme[]) {
  const administration = destination === DESTINATION_ADMINISTRATION || destination.startsWith(`${DESTINATION_ADMINISTRATION}/`);
  const tontines = destination === "/tontines" || destination.startsWith("/tontines/");
  if (administration) return accesAdministration(permissions);
  return destination === DESTINATION_UTILISATEUR || tontines;
}

/**
 * Choisit une destination interne après authentification. Cette aide améliore le parcours ;
 * les layouts et routes API conservent toujours leur contrôle serveur indépendant.
 */
export function destinationApresAuthentification({ permissions, retour }: ContexteDestination) {
  const destinationDemandee = destinationRetourAutorisee(retour, "");
  if (destinationDemandee && destinationAutorisee(destinationDemandee, permissions)) return destinationDemandee;
  return accesAdministration(permissions) ? DESTINATION_ADMINISTRATION : DESTINATION_UTILISATEUR;
}
