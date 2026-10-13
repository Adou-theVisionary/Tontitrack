import { obtenirUtilisateurAuthentifie } from "@/lib/auth/session";
import { permissionAccordee, permissionsEffectives, type PermissionPlateforme } from "@/lib/administration/permissions";

export class ErreurAdministration extends Error {
  constructor(public code: string, message: string, public statut = 400) {
    super(message);
  }
}

export async function exigerAdministrateur(permission: PermissionPlateforme) {
  const utilisateur = await obtenirUtilisateurAuthentifie();
  if (!utilisateur) throw new ErreurAdministration("NON_AUTHENTIFIE", "Connexion requise.", 401);
  const roles = utilisateur.rolesPlateforme.map((attribution) => attribution.role);
  if (!permissionAccordee(roles, permission)) {
    throw new ErreurAdministration("ACCES_REFUSE", "Cette autorisation administrative est requise.", 403);
  }
  return { utilisateur, roles, permissions: permissionsEffectives(roles) };
}

export async function obtenirContexteAdministration() {
  const utilisateur = await obtenirUtilisateurAuthentifie();
  if (!utilisateur) return null;
  const roles = utilisateur.rolesPlateforme.map((attribution) => attribution.role);
  const permissions = permissionsEffectives(roles);
  return { utilisateur, roles, permissions };
}
