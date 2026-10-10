# Rapport de stabilisation — Phase 1

Date : 10/10/2026. Périmètre : diagnostic technique sans modification applicative, migration, seed ou dépendance.

| Question | Statut | Justification |
|---|---|---|
| Projet lançable localement ? | VALIDÉ partiellement | Scripts `dev` et `start` présents ; build production validé. Serveur interactif non lancé pendant phase. |
| Typage fonctionne ? | VALIDÉ | `npm run typecheck` termine sans erreur. |
| Lint fonctionne ? | VALIDÉ avec avertissements | ESLint direct : 0 erreur, 3 avertissements `<img>`. `npm run lint` reste à corriger car Next tente installation réseau. |
| Tests existants passent ? | NON TESTÉ | Aucun script ou fichier test détecté. |
| Build fonctionne ? | VALIDÉ | `npm run build` compile et génère 23 routes. |
| Prisma configuré ? | VALIDÉ partiellement | `npx prisma validate` valide fichier ; `migrate status` passe hors sandbox. |
| Schéma/migrations cohérents ? | ÉCHEC | Migration initiale contient anciens enums/modèles ; `schema.prisma` actuel ajoute/modifie modèles et enums sans migration correspondante. |
| DB accessible ? | VALIDÉ hors sandbox | PostgreSQL 18.6 répond avec client situé hors PATH ; sandbox bloque TCP local. |
| Anomalies corrigées ? | VALIDÉ | Aucune. Aucun correctif sans risque démontré. |
| Architecture prête DB Tontine ? | À CORRIGER | Repositories Prisma existent, mais API/services/auth/permissions et migration alignée manquent. |
| Avant authentification ? | À CORRIGER | Résoudre migration sûre, définir API/DTO et autorisation objet, puis implémenter session sécurisée. |

## Environnement confirmé

- Node.js `v24.18.0`; npm `11.16.0`.
- Next.js `13.5.1`; TypeScript `5.2.2`; Prisma et client `5.22.0`.
- PostgreSQL 18 est documenté dans continuité antérieure ; version exécutable non vérifiée car `psql` est absent du PATH.
- `DATABASE_URL` est requise par Prisma ; valeur non reproduite ici.
- Gestionnaire : npm, avec `package-lock.json`; dépendances installées listées via `npm ls --depth=0`.

## Vérifications

1. `npm run typecheck` : succès.
2. ESLint local direct : succès avec avertissements `@next/next/no-img-element` dans `components/Logo.tsx`, `components/TontiTrackApp.tsx`, `components/auth/PageConnexion.tsx`.
3. `npx prisma validate` : succès.
4. `npx prisma migrate status` : échec sandbox initial ; succès hors sandbox, 1 migration trouvée.
5. `npm run build` : succès. Avertissement non bloquant : base Browserslist/caniuse-lite ancienne.

## Architecture Tontine réutilisable

- Routes et composants : `app/(application)/tontines/`, `components/tontines/`.
- Contrats frontend : `types/index.ts`.
- Règles mock : `services/mock-api.ts`; adaptateur actuel : `services/tontitrack-service.ts`.
- Repositories : `repositories/tontines.repository.ts`, `repositories/notifications.repository.ts`, `repositories/audit.repository.ts`.

À remplacer ou compléter : alias mock, état `AppContext`, authentification forcée démo, endpoints API, services métier transactionnels, mappings DTO, permissions et persistance fichiers.

## Décalage Prisma documenté

Migration `20260915154109_initial` contient notamment `StatutDeclaration.EN_ATTENTE` et valeurs historiques de `StatutVersement`. Schéma actuel utilise `EN_ATTENTE_VALIDATION`, un modèle de confirmation réception différent et plusieurs modèles/enums supplémentaires. Ce constat explique nécessité d'une migration d'alignement inspectée, non appliquée.

## Prochaine action

Nouvelle étape de stabilisation nécessaire : diagnostiquer `migrate status` et générer/inspecter, dans environnement contrôlé, SQL migration `alignement_modele_metier`. Confirmer absence de perte avant application. Ne pas démarrer auth ni Tontine réel avant cette étape.
