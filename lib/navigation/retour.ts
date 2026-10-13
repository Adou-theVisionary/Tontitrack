/** Empêche tout renvoi externe tout en conservant les paramètres d'invitation internes. */
export function destinationRetourAutorisee(valeur: string | null | undefined, defaut = "/tableau-de-bord") {
  if (!valeur || !valeur.startsWith("/") || valeur.startsWith("//") || valeur.includes("\\")) return defaut;
  try {
    const url = new URL(valeur, "https://tontitrack.local");
    if (url.origin !== "https://tontitrack.local") return defaut;
    const retourTontine = url.pathname === "/tontines" || url.pathname.startsWith("/tontines/");
    const retourAdministration = url.pathname === "/administration-plateforme" || url.pathname.startsWith("/administration-plateforme/");
    if (!retourTontine && url.pathname !== "/tableau-de-bord" && !retourAdministration) return defaut;
    return `${url.pathname}${url.search}`;
  } catch {
    return defaut;
  }
}
