# 0003 — Diagnostic Prisma et PostgreSQL

Date : 10/10/2026. Statut : terminé, lecture seule.

## Contexte initial

Phase 1 avait `Schema engine error` sur `npx prisma migrate status`; schéma valide mais migration initiale seule. Objectif : distinguer panne Prisma, PostgreSQL ou sandbox, et évaluer persistance Tontine.

## Fichiers consultés

`AGENTS.md`; rapports Phase 1/audit ; `package.json`; `.env.example` et présence configuration locale sans afficher secret ; `prisma/schema.prisma`; migration SQL initiale ; repositories et services nécessaires.

## Commandes exécutées

1. Lecture consignes/configuration. Raison : respecter traçabilité et identifier datasource. Résultat : aucune configuration Prisma additionnelle, schéma présent.
2. `node --version`, `npm --version`, `npx prisma --version`, `npm ls --depth=0`, recherche `psql`. Raison : versions/outils. Résultat : Prisma/client 5.22.0 cohérents ; `psql` 18.6 trouvé hors PATH.
3. Contrôle services Windows/presence variables sans révéler valeur. Raison : identifier environnement. Résultat : accès SCM refusé sandbox ; configuration datasource disponible à Prisma.
4. `psql --version`, puis requêtes `SELECT version(), current_database()` et lecture `_prisma_migrations`. Raison : vérifier serveur/historique en lecture seule. Résultat : sandbox bloque port 5432 ; hors sandbox PostgreSQL 18.6 accessible, migration initiale appliquée.
5. `npx prisma migrate status` hors sandbox. Raison : reproduire sans restriction TCP. Résultat : succès ; 1 migration, DB à jour par rapport dossier.
6. Recherche `rg` schema/migration/services/repositories. Raison : comparer hors ligne schéma et historique, évaluer modèle Tontine. Résultat : décalage structurel confirmé, UI encore mock.
7. Vérification bornée des rapports créés/mis à jour. Raison : confirmer lisibilité documentaire. Résultat : 3 rapports lisibles.

## Causes confirmées / hypothèses

Confirmé : erreur moteur initiale causée par sandbox TCP, pas par serveur Prisma démontré. Confirmé : migration historique ne couvre pas tous changements datamodel. Non déterminé : comportement de migration d'alignement avec données réelles, car aucune migration/diff DB n'a été créée.

## Fichiers modifiés

Créés : `DOCUMENTATION/RAPPORT_DIAGNOSTIC_PRISMA.md`, présent rapport. Mis à jour : journal, problèmes, validations, rapport Phase 1. Aucun code, schéma, migration, DB ou dépendance modifié.

## Dépendances / validations

Dependencies : aucune. PostgreSQL accessible hors sandbox ; validate/migrate status validés. Aucune migration appliquée ni test applicatif exécuté.

## Reprise

Exécuter lot migration contrôlé hors sandbox : sauvegarde si données, création SQL à inspecter, analyse conversions contraintes/enums, application seulement après approbation. Ne pas développer auth ni Tontine réel avant alignement et clarification règles manquantes.
