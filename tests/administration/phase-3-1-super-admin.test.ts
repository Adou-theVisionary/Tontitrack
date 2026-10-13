/**
 * Plan de tests Phase 3.1. À brancher sur le runner TypeScript retenu avant exécution.
 * Aucune base réelle ni donnée utilisateur n'est utilisée par ce fichier de préparation.
 */
const scenariosSuperAdmin = [
  "refuse une route administrative sans session",
  "refuse une permission absente avec refus par défaut",
  "autorise les droits déclarés de SUPER_ADMIN, ADMIN_SUPPORT et ADMIN_AUDIT",
  "refuse l'amorçage sans identifiant explicite ou confirmation OUI",
  "amorce une seule fois le premier Super Admin actif et inscrit l'audit",
  "refuse un second amorçage et reste idempotent au rejouage",
  "suspend un compte avec motif, invalide ses sessions et écrit l'audit",
  "refuse la suspension ou le retrait du dernier Super Admin actif",
  "résiste à deux demandes simultanées de retrait du dernier Super Admin",
  "réactive seulement un compte non supprimé et inscrit l'audit",
  "attribue et retire les rôles uniquement avec plateforme.roles.gerer",
  "borne la pagination et ne retourne ni hash, ni preuve, ni donnée financière privée",
  "liste la supervision Tontine sans mutation financière ni accès aux justificatifs",
  "consulte le journal d'audit sans modifier ni supprimer un événement",
  "vérifie les parcours mobile et bureau ainsi que les états de chargement, erreur et vide",
] as const;

export { scenariosSuperAdmin };
