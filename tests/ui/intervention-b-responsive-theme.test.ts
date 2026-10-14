/**
 * Matrice préparatoire de l'intervention 0038.
 * Aucun runner de test n'est configuré et ce fichier n'a pas été exécuté.
 */
const matriceInterventionB = [
  {
    parcours: "Public et authentification",
    routes: ["/", "/connexion", "/inscription", "/mot-de-passe-oublie"],
    controles: ["clair", "sombre", "système", "320 px", "768 px", "1440 px"],
  },
  {
    parcours: "Espace utilisateur",
    routes: ["/tableau-de-bord", "/finances", "/notifications", "/profil", "/parametres"],
    controles: ["navigation mobile", "cartes", "formulaires", "toast", "retour au thème système"],
  },
  {
    parcours: "Création et gestion des tontines",
    routes: ["/tontines", "/tontines/nouvelle", "/tontines/:id"],
    controles: ["cinq étapes", "membres", "invitations", "rotations", "modales", "menus"],
  },
  {
    parcours: "Cotisations, reversements et clôture",
    routes: ["/tontines/:id/cotisations", "/tontines/:id/reversements", "/tontines/:id/cloture"],
    controles: ["montants", "statuts", "justificatifs", "alertes", "dialogues à hauteur limitée"],
  },
  {
    parcours: "Administration globale",
    routes: ["/administration-plateforme", "/administration-plateforme/utilisateurs", "/administration-plateforme/tontines", "/administration-plateforme/roles"],
    controles: ["tableaux défilables localement", "filtres", "pagination", "modales", "contrastes des statuts"],
  },
] as const;

const scenariosInterventionB = [
  "n'affiche aucune surface blanche ou texte sombre illisible en mode sombre",
  "préserve les couleurs sémantiques des succès, alertes, erreurs et informations",
  "conserve les fonds des portails Radix dans le thème actif",
  "ne crée aucun défilement horizontal global de 320 px à 1440 px",
  "maintient les tables larges dans un conteneur défilable localement",
  "garde les actions principales atteignables sur mobile et au clavier",
  "ne modifie ni contrats API, ni permissions, ni calculs financiers",
] as const;

export { matriceInterventionB, scenariosInterventionB };
