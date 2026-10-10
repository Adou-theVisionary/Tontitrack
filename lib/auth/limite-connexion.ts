type Tentative = { echeance: number; nombre: number };
const tentatives = new Map<string, Tentative>();
const FENETRE_MS = 15 * 60 * 1000;
const LIMITE = 10;

/** Garde-fou mémoire. Une limite partagée doit compléter ce mécanisme au déploiement multi-instance. */
export function autoriserTentativeConnexion(cle: string) {
  const maintenant = Date.now();
  const tentative = tentatives.get(cle);
  if (!tentative || tentative.echeance <= maintenant) {
    tentatives.set(cle, { nombre: 1, echeance: maintenant + FENETRE_MS });
    return true;
  }
  tentative.nombre += 1;
  return tentative.nombre <= LIMITE;
}

export function reinitialiserTentativesConnexion(cle: string) { tentatives.delete(cle); }
