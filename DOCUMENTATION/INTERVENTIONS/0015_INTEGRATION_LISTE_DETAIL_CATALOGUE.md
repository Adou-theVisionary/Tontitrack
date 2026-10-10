# Intervention 0015 — Intégration liste, détail et catalogue

J'ai remplacé sources mock de `PageTontines` et `DetailTontineRoute` par API réelle avec `appelApi` et adaptateur UI. Liste charge `GET /api/tontines`; détail charge `GET /api/tontines/[tontineId]`; chargement et erreur utilisent états existants.

J'ai remplacé recherche mock de `RejoindreTontine` par catalogue réel et demande par `POST /api/tontines/[tontineId]/demandes`. Aucun succès n'est affiché avant réponse API.

Je n'ai exécuté aucune commande technique. La recherche catalogue utilise actuellement identifiant public renvoyé par API, pas code invitation ; acceptation conditions, invitations et onglets membres restent à terminer.

Commandes proposées depuis racine : `npm run typecheck`, `npm run lint`, `npm run build`.
