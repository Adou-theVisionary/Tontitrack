# Feuille de route

## A. Stabilisation — priorité 1

1. **Migration sûre Prisma.** Objectif : aligner DB/schéma. Fichiers : `prisma/schema.prisma`, nouvelle migration seulement. Prérequis : inspecter SQL, vérifier DB vide/sauvegardée. Acceptation : `migrate status` OK sans perte inattendue.
2. **Corriger exécution lint sans installation implicite.** Fichiers : `package.json`, lockfile si nécessaire. Acceptation : lint reproductible, aucune installation automatique.

## B. Fiabilisation — priorité 2

1. Seed idempotent après migration. `prisma/seed.ts`, config Prisma. Données démo cohérentes trois modes. 
2. API serveur, services et DTO. Fichiers futurs `app/api`, `services`, `repositories`. Critère : UI ne connaît pas Prisma.
3. Auth/sessions/autorisation. Critère : aucun accès sans session valide ou hors périmètre utilisateur.

## C. Finalisation — priorité 3

Finances, tontines, cotisations, versements, notifications via API transactionnelle. Ajouter fichiers privés et jobs idempotents 48 h/retards/démarrage/clôture.

## D/E — priorité 4

Tests unitaires/intégration/E2E, PWA/Dexie, CSV, a11y/responsive, monitoring/secrets/backups/staging. Chaque lot : migration/test ciblé, typecheck, lint, build, puis arrêt.
