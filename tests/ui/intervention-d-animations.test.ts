/**
 * Matrice de recette manuelle préparée pour l'intervention 0040.
 * Aucun runner de test n'est configuré et ce fichier n'a pas été exécuté.
 */
const composantsAnimes = [
  {
    composant: "Boutons et actions",
    controles: [
      "survol, focus visible et pression tactile restent courts et lisibles",
      "un bouton désactivé ne semble pas actionnable",
      "une action financière n'annonce aucun succès avant la réponse serveur",
      "une double activation ne déclenche pas de seconde soumission",
    ],
  },
  {
    composant: "Champs et validation",
    controles: [
      "focus et erreur de champ restent visibles sans déplacement de la mise en page",
      "les erreurs de création de tontine restent annoncées et associées au champ",
      "les libellés, valeurs et erreurs sont utilisables au clavier",
    ],
  },
  {
    composant: "Menus, panneaux et onglets",
    controles: [
      "les menus déroulants, sélecteurs et onglets apparaissent sans flash",
      "les tiroirs utilisateur et administratif s'ouvrent sans décaler le contenu",
      "Échap, voile et bouton ferment toujours le panneau et restituent le focus",
    ],
  },
  {
    composant: "Dialogues et notifications",
    controles: [
      "l'arrière-plan, le dialogue et la fermeture restent fluides sans gêner la saisie",
      "le focus Radix reste confiné dans la modale puis revient au déclencheur",
      "les toasts multiples restent lisibles, fermables et adaptés aux zones sûres mobiles",
    ],
  },
  {
    composant: "Cartes, indicateurs et chargements",
    controles: [
      "seules les cartes explicitement interactives reçoivent un survol léger",
      "les montants et graphiques ne s'animent pas comme des données fictives",
      "chargements, états vides, erreurs et synchronisation conservent une hauteur stable",
    ],
  },
] as const;

const parcoursAnimation = [
  { route: "/connexion", controles: ["erreurs d'authentification", "boutons", "thème"] },
  { route: "/tableau-de-bord", controles: ["cartes interactives", "actions rapides", "états de synchronisation"] },
  { route: "/finances", controles: ["formulaires", "modale transaction", "retours serveur"] },
  { route: "/tontines/nouvelle", controles: ["changement d'étapes", "erreurs", "confirmation"] },
  { route: "/tontines/:id/cotisations", controles: ["déclaration", "chargement", "erreur"] },
  { route: "/tontines/:id/reversements", controles: ["déclaration", "confirmation", "contestation"] },
  { route: "/tontines/:id/cloture", controles: ["conditions", "dialogue", "lecture seule"] },
  { route: "/notifications", controles: ["liste", "navigation", "retours temporaires"] },
  { route: "/administration-plateforme", controles: ["menu", "cartes", "navigation latérale"] },
  { route: "/administration-plateforme/utilisateurs", controles: ["filtres", "tableau", "dialogues"] },
] as const;

const controlesAccessibiliteEtPerformance = [
  "contrôler Clair, Sombre et Système à 320, 375, 768 et 1440 px",
  "contrôler Tab, Maj+Tab, Entrée, Espace et Échap sur chaque contrôle modifié",
  "activer prefers-reduced-motion et vérifier l'absence de mouvement non essentiel",
  "vérifier lecteur d'écran pour les statuts, erreurs et notifications",
  "vérifier sur appareil mobile que les interactions restent réactives sans défilement ou saut inattendu",
  "vérifier que les chargements réseau lents n'affichent ni faux pourcentage ni faux succès",
] as const;

export { composantsAnimes, controlesAccessibiliteEtPerformance, parcoursAnimation };
