import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AppShell } from "@/components/AppShell";
import { InitialiserSession } from "@/components/auth/InitialiserSession";
import { obtenirUtilisateurAuthentifie } from "@/lib/auth/session";
import { presenterUtilisateur } from "@/services/authentification.service";
import { destinationRetourAutorisee } from "@/lib/navigation/retour";

export default async function ApplicationLayout({ children }: { children: React.ReactNode }) {
  const utilisateur = await obtenirUtilisateurAuthentifie();
  if (!utilisateur) redirect(`/connexion?retour=${encodeURIComponent(destinationRetourAutorisee(headers().get("x-tontitrack-retour")))}`);
  const utilisateurPublic = presenterUtilisateur(utilisateur);
  return <InitialiserSession utilisateur={{ ...utilisateurPublic, dateInscription: "" }}><AppShell>{children}</AppShell></InitialiserSession>;
}
