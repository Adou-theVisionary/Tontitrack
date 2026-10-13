import { VueAdministration } from "@/components/administration/VueAdministration";
import { obtenirContexteAdministration } from "@/lib/administration/autorisation";

export default async function PageUtilisateursAdministration() {
  const contexte = await obtenirContexteAdministration();
  return <VueAdministration section="utilisateurs" peutGererRoles={contexte?.permissions.includes("plateforme.roles.gerer") ?? false} />;
}
