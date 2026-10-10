# Intervention 0007 — Préparation migration d'alignement Prisma

## Objet

Je prépare migration d'alignement contrôlable entre migration Prisma initiale et schéma Prisma actuel. Je ne modifie ni PostgreSQL ni données.

## Constat

Migration initiale appliquée. Les 18 tables applicatives sont vides selon contrôle manuel communiqué. Une sauvegarde `tontitrack_avant_migration.backup` de 39 797 octets existe. Son inventaire `pg_restore --list` contient 107 entrées. Restauration complète reste à tester.

Diff Prisma manuel révèle écarts structurels importants. Son SQL exact n'est pas archivé dans dépôt. Je ne peux donc pas écrire migration fiable par déduction.

## Décision

Je ne crée aucun dossier de migration ni fichier SQL à ce stade. Je prépare procédure permettant de générer `alignement_modele_metier` avec Prisma, relire SQL généré, puis demander validation avant application.

## Risques identifiés

- Évolution d'enums et conversions de valeurs.
- Ajout de clés étrangères, colonnes obligatoires et contraintes uniques.
- Réécriture relations de `ConfirmationReception`.
- Alignement colonnes de `Rotation` et `TransactionFinanciere`.
- Toute instruction de suppression révélée par SQL Prisma.

## Fichiers créés ou modifiés

- `DOCUMENTATION/RAPPORT_MIGRATION_ALIGNEMENT.md`
- `DOCUMENTATION/06_JOURNAL_DE_DEVELOPPEMENT.md`
- `DOCUMENTATION/08_TESTS_ET_VALIDATIONS.md`
- `DOCUMENTATION/09_DECISIONS_TECHNIQUES.md`
- `DOCUMENTATION/RAPPORT_PREPARATION_MIGRATION.md`
- `DOCUMENTATION/INTERVENTIONS/0007_PREPARATION_MIGRATION_ALIGNEMENT.md`

## Commandes

- Exécutées par moi : lectures de fichiers seulement.
- Proposées au développeur : génération `--create-only`, lecture SQL, recherche opérations à risque, application après validation, `migrate status`, `generate`.
- Exécutées manuellement avec résultats communiqués : contrôle tables, sauvegarde, inventaire sauvegarde, migration initiale et diff Prisma.
- Restantes : génération puis revue SQL, validation explicite, application et contrôles.
