/** Empêche tout renvoi externe tout en conservant les paramètres d'invitation internes. */
export function destinationRetourAutorisee(valeur: string | null | undefined, defaut = "/tableau-de-bord") {
  if (!valeur || !valeur.startsWith("/") || valeur.startsWith("//") || valeur.includes("\\")) return defaut;
  try {
    const url = new URL(valeur, "https://tontitrack.local");
    if (url.origin !== "https://tontitrack.local") return defaut;
    if (!url.pathname.startsWith("/tontines") && url.pathname !== "/tableau-de-bord") return defaut;
    return `${url.pathname}${url.search}`;
  } catch {
    return defaut;
  }
}
