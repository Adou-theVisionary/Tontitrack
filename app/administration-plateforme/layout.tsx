import { redirect } from "next/navigation";
import { AppShellAdministration } from "@/components/administration/AppShellAdministration";
import { obtenirContexteAdministration } from "@/lib/administration/autorisation";

export default async function LayoutAdministration({ children }: { children: React.ReactNode }) {
  const contexte = await obtenirContexteAdministration();
  if (!contexte?.permissions.length) redirect("/connexion?retour=%2Fadministration-plateforme");
  const profil = contexte.utilisateur.profil;
  return <AppShellAdministration nom={profil ? `${profil.prenom} ${profil.nom}` : contexte.utilisateur.email} roles={contexte.roles} permissions={contexte.permissions}>{children}</AppShellAdministration>;
}
