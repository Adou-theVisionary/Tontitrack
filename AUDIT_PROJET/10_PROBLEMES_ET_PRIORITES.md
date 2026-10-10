# Problèmes et priorités

## Bloquants

1. Schéma Prisma préparé non migré. Risque transitions enum/contraintes ; migration status échoue. Action : générer migration dans environnement interactif, inspecter SQL et backups, puis appliquer sans reset/db push.
2. Aucune authentification/autorisation serveur. Action : ne jamais connecter frontend à PostgreSQL avant API, session et contrôles objet.

## Importants

1. Frontend dépend entièrement mocks et connexion automatique. Isoler adaptateurs puis API.
2. Mismatch contrats frontend / Prisma, notamment statuts déclaration/versement. Définir DTO et mapping explicites.
3. Fichiers identité/preuve fictifs. Implémenter stockage privé avant traiter données réelles.
4. Règles tontines seulement mémoire et non transactionnelles. Centraliser serveur et tester trois modes.
5. Aucun test/CI. Ajouter tests de règles puis intégration.

## Secondaires

- `TontiTrackApp.tsx` legacy à inventorier avant suppression.
- Lint Next tente installation à cause placement de TypeScript/types dans `dependencies`; correction package à planifier.
- Lint ignoré durant build (`next.config.js`).
- Trois avertissements `<img>` historiques.

## Facultatif après socle

PWA réelle, CSV, optimisation images, thème sombre réel, recherche globale.
