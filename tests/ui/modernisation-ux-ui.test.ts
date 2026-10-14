/**
 * Scénarios préparatoires de l'intervention 0037.
 * Aucun runner de test n'est configuré et ce fichier n'a pas été exécuté.
 */
const scenariosModernisationUxUi = [
  "applique le thème clair, sombre ou système sans erreur d'hydratation ni flash visible",
  "conserve le thème choisi après rechargement et suit le système lorsque l'option système est choisie",
  "propose le sélecteur de thème au clavier dans les espaces public, utilisateur et administratif",
  "maintient un contraste lisible des textes, cartes, bordures, états d'erreur et focus dans les deux thèmes",
  "affiche une navigation latérale au bureau, une barre basse et un menu accessible sur mobile",
  "ferme chaque menu mobile par son bouton, son voile et navigation sans empêcher le focus clavier",
  "évite le défilement horizontal global entre 320 px et les largeurs bureau, sauf tables défilables localement",
  "affiche les modales dans la hauteur disponible et conserve leurs contrôles accessibles sur mobile",
  "réduit animations et transitions lorsque prefers-reduced-motion est actif",
  "conserve les appels API, autorisations, calculs financiers et contrats métier inchangés",
] as const;

export { scenariosModernisationUxUi };
