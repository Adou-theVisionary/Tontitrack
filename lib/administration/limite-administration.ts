type Fenetre = { echeance: number; nombre: number };
const tentatives = new Map<string, Fenetre>();
const FENETRE_MS = 60 * 1000;
const LIMITE = 60;

/** Garde-fou mémoire : une limite partagée devra la compléter en multi-instance. */
export function autoriserRequeteAdministration(cle: string) {
  const maintenant = Date.now();
  const fenetre = tentatives.get(cle);
  if (!fenetre || fenetre.echeance <= maintenant) {
    tentatives.set(cle, { nombre: 1, echeance: maintenant + FENETRE_MS });
    return true;
  }
  fenetre.nombre += 1;
  return fenetre.nombre <= LIMITE;
}
