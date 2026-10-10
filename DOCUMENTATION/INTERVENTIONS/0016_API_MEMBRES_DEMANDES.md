# Intervention 0016 — API membres et demandes

J'ai ajouté `listerMembres` et `listerDemandes` au service Tontine, avec permissions PostgreSQL. Membres nécessitent création ou appartenance approuvée. Demandes nécessitent création de la tontine. Les réponses limitent identité à prénom et nom ; elles n'exposent ni jeton ni empreinte de consentement.

Routes ajoutées : `GET /api/tontines/[tontineId]/membres` et `GET /api/tontines/[tontineId]/demandes`. Chaque route exige session serveur et propage erreur métier avec statut HTTP.

Tests préparés : utilisateur extérieur refusé, membre autorisé, créateur autorisé, ordre décroissant demandes, absence secrets. Tests non exécutés : aucun runner TypeScript configuré.

Commandes proposées depuis racine : `npm run typecheck`, `npm run lint`, `npm run build`. Je n'ai exécuté aucune commande technique.
