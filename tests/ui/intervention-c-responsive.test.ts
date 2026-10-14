/**
 * Matrice de recette manuelle préparée pour l'intervention 0039.
 * Aucun runner de test n'est configuré et ce fichier n'a pas été exécuté.
 */
const largeursResponsive = [320, 375, 390, 430, 768, 1024, 1280, 1440] as const;

const routesResponsive = [
  { route: "/", zone: "Accueil et accès public", controles: ["aucune coupure", "CTA atteignables", "pas de défilement horizontal"] },
  { route: "/connexion", zone: "Connexion", controles: ["formulaire complet", "clavier mobile", "logo et retours d'erreur"] },
  { route: "/inscription", zone: "Inscription", controles: ["champs et conditions lisibles", "boutons visibles", "erreurs accessibles"] },
  { route: "/mot-de-passe-oublie", zone: "Récupération de compte", controles: ["champ, action et retour lisibles"] },
  { route: "/tableau-de-bord", zone: "Tableau de bord", controles: ["cartes, montants, graphique, actions rapides et activité"] },
  { route: "/finances", zone: "Finances", controles: ["filtres, cartes, historique, modale d'opération et preuve"] },
  { route: "/notifications", zone: "Notifications", controles: ["onglets défilables localement", "liste, bouton global et navigation"] },
  { route: "/profil", zone: "Profil et identité", controles: ["cartes, document d'identité, modale et actions"] },
  { route: "/parametres", zone: "Paramètres", controles: ["interrupteurs, thème, actions et retour d'état"] },
  { route: "/tontines", zone: "Liste Tontines", controles: ["cartes, filtres, création et rejoindre"] },
  { route: "/tontines/nouvelle", zone: "Création", controles: ["cinq étapes, erreurs, résumé et boutons précédent/suivant"] },
  { route: "/tontines/:id/resume", zone: "Détail", controles: ["en-tête long, statut, onglets et actions créateur"] },
  { route: "/tontines/:id/cotisations", zone: "Cotisations", controles: ["montants, déclarations, justification et modales"] },
  { route: "/tontines/:id/reversements", zone: "Reversements", controles: ["suivi, déclaration, confirmation et contestation"] },
  { route: "/tontines/:id/cloture", zone: "Clôture et archives", controles: ["conditions, rapport et confirmation"] },
  { route: "/administration-plateforme", zone: "Super Admin", controles: ["menu, cartes, retours et thème"] },
  { route: "/administration-plateforme/utilisateurs", zone: "Utilisateurs", controles: ["recherche, tableau localement défilable, pagination et modales"] },
  { route: "/administration-plateforme/roles", zone: "Rôles", controles: ["cartes, permissions et actions autorisées"] },
  { route: "/administration-plateforme/tontines", zone: "Supervision", controles: ["recherche, tableau localement défilable et détail"] },
  { route: "/administration-plateforme/audit", zone: "Journal", controles: ["tableau, pagination et contenu long"] },
] as const;

const controlesTransverses = [
  "contrôler chaque route avec thème clair, sombre et système",
  "contrôler portrait, paysage et faible hauteur sur les quatre largeurs téléphone",
  "vérifier que seul un tableau large défile horizontalement, jamais le document",
  "vérifier les actions financières et administratives sans modifier les données de test",
  "vérifier fermeture par voile, bouton et touche Échap des menus mobiles",
  "vérifier focus clavier, libellés, contraste et cibles tactiles",
  "vérifier que les animations restent courtes et sont réduites avec prefers-reduced-motion",
] as const;

export { controlesTransverses, largeursResponsive, routesResponsive };
