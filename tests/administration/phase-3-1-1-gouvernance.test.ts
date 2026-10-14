/**
 * Cas de préparation Phase 3.1.1. Ils ne sont pas exécutés : aucun runner n'est encore configuré.
 */
const scenariosGouvernanceSuperAdmin = [
  "attend la résolution du service des rôles avant de sérialiser la réponse API",
  "affiche une erreur récupérable quand la réponse des rôles ne contient pas roles et permissions",
  "affiche les rôles système et personnalisés, y compris un rôle sans permission",
  "retourne l’historique administratif d’un compte ciblé plutôt que les seules actions dont il est acteur",
  "liste, recherche et pagine les utilisateurs sans exposer de secret",
  "suspend un compte avec motif, invalide toutes ses sessions et refuse sa connexion suivante",
  "révoque les sessions d’un autre compte et protège le dernier Super Admin actif",
  "crée, modifie, attribue et retire un rôle personnalisé avec permissions connues seulement",
  "refuse plateforme.roles.gerer dans un rôle personnalisé et toute permission inconnue",
  "lit le registre de modules réels et refuse la désactivation du module Tontines actif",
  "modifie uniquement un paramètre global relié au serveur et audite la valeur non sensible",
  "liste les tontines, leurs alertes et leurs agrégats sans accéder aux preuves privées",
  "suspend puis réactive une tontine sans modifier montant, rotation ou confirmation",
  "refuse les cotisations et reversements pendant une suspension administrative",
  "ouvre, prend en charge, documente, décide et clôture un litige selon les transitions autorisées",
  "refuse une transition de litige invalide et ne crée aucune correction financière administrative",
  "filtre, pagine et exporte l’audit sans injection CSV ni suppression d’événement",
  "enregistre et affiche les incidents issus d’un refus ou échec administratif réel",
  "refuse toutes les API sans session, permission, origine autorisée ou données valides",
  "vérifie concurrence des suspensions, du dernier Super Admin et des transitions de litige",
] as const;
export { scenariosGouvernanceSuperAdmin };
