import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { InitialiserSession } from "@/components/auth/InitialiserSession";
import { obtenirUtilisateurAuthentifie } from "@/lib/auth/session";
import { presenterUtilisateur } from "@/services/authentification.service";

export default async function ApplicationLayout({ children }: { children: React.ReactNode }) {
  const utilisateur = await obtenirUtilisateurAuthentifie();
  if (!utilisateur) redirect("/connexion");
  const utilisateurPublic = presenterUtilisateur(utilisateur);
  return <InitialiserSession utilisateur={{ ...utilisateurPublic, dateInscription: "" }}><AppShell>{children}</AppShell></InitialiserSession>;
}
