# Rapport de préparation — migration d'alignement Prisma

## Objet

Je prépare l'alignement de la base PostgreSQL de développement avec `prisma/schema.prisma`, sans modifier la base ni créer de migration SQL approximative.

## État vérifié avant préparation

- Migration historique appliquée : `20260915154109_initial`.
- Les 18 tables applicatives contrôlées ne contiennent aucun enregistrement.
- La sauvegarde `tontitrack_avant_migration.backup` existe, mesure 39 797 octets et son inventaire `pg_restore --list` contient 107 entrées.
- Je n'ai pas testé une restauration complète.
- `prisma migrate diff`, exécuté manuellement auparavant, signale plusieurs écarts entre la base et le schéma actuel. Sa sortie SQL exacte n'est pas conservée dans le dépôt.

## Décision

Je ne crée pas encore de dossier sous `prisma/migrations/` ni de `migration.sql`.

Je ne peux pas produire un SQL fiable sans sortie exacte de Prisma. Écrire manuellement une migration à partir du seul schéma risquerait de transformer différemment enums, contraintes ou clés étrangères. La migration devra être créée par Prisma avec le nom proposé `alignement_modele_metier`, puis revue avant toute application.

Nom attendu après génération manuelle : `<horodatage>_alignement_modele_metier`.

## Changements structurels à examiner dans SQL généré

- Création des domaines présents dans schéma et absents de migration initiale : profils, sessions, vérifications, fichiers, catégories et relations.
- Alignement des colonnes, index, unicités et relations des domaines finances, tontines, notifications, audit et synchronisation.
- Évolution des enums, notamment `StatutDeclaration` et `StatutVersement`.
- Alignement de `Utilisateur`, `Rotation`, `ConfirmationReception` et `TransactionFinanciere` avec relations cibles.

## Risques à valider dans SQL généré

- Toute instruction `DROP`, notamment `DROP TABLE`, `DROP COLUMN`, `DROP TYPE` et `DROP CONSTRAINT`.
- Toute recréation d'enum : elle peut nécessiter conversion explicite des anciennes valeurs.
- Toute colonne obligatoire sans valeur par défaut, surtout clé étrangère de `TransactionFinanciere`.
- Toute réécriture de `ConfirmationReception` : relation historique vers versement contre relation cible vers rotation et bénéficiaire.
- Toute réécriture de `Rotation` : données de date et montant peuvent exiger transformation explicite si base reçoit données avant application.
- Toute contrainte unique ou clé étrangère nouvelle.

Tables vides au contrôle communiqué. Cela réduit risque immédiat de perte, mais ne dispense pas de lire chaque opération destructive proposée.

## Commandes manuelles proposées

Exécuter depuis `C:\Users\isasa\Desktop\tontitrack_prod`.

### 1. Générer une migration sans l'appliquer

```powershell
npx prisma migrate dev --name alignement_modele_metier --create-only
```

Rôle : demander à Prisma de calculer migration entre historique appliqué et `prisma/schema.prisma`, sans appliquer migration à base cible.

Résultat attendu : création dossier `prisma/migrations/<horodatage>_alignement_modele_metier/` contenant `migration.sql`.

Risque : Prisma utilise shadow database et peut demander confirmation. Ne pas confirmer action imprévue. Commande crée fichiers dans dépôt ; elle ne doit être lancée qu'après validation développeur.

### 2. Lire SQL généré

```powershell
Get-Content .\prisma\migrations\<horodatage>_alignement_modele_metier\migration.sql
```

Rôle : examiner chaque transformation avant application.

Résultat attendu : SQL correspondant exactement au schéma courant.

Risque : aucun effet sur base ; remplacer `<horodatage>` par dossier créé.

### 3. Rechercher opérations à risque

```powershell
Select-String -Path .\prisma\migrations\<horodatage>_alignement_modele_metier\migration.sql -Pattern 'DROP |DELETE |TRUNCATE |ALTER TYPE|SET NOT NULL|ADD CONSTRAINT|ADD COLUMN'
```

Rôle : isoler opérations nécessitant revue ligne par ligne.

Résultat attendu : liste opérations potentiellement destructives ou bloquantes.

Risque : aucun effet sur base ; résultat incomplet si SQL utilise autre forme, donc lire aussi fichier entier.

### 4. Appliquer seulement après revue et validation explicite

```powershell
npx prisma migrate dev
```

Rôle : appliquer migration validée à base locale de développement.

Résultat attendu : migration marquée appliquée dans `_prisma_migrations`.

Risque : modifie structure PostgreSQL. Cette commande n'est pas autorisée à ce stade. Lancer seulement après revue SQL, confirmation sauvegarde utilisable et validation explicite.

### 5. Contrôler après application autorisée

```powershell
npx prisma migrate status
npx prisma generate
```

Rôle : vérifier historique migrations, puis régénérer Prisma Client.

Résultat attendu : état Prisma à jour et client généré sans erreur.

Risque : `prisma generate` modifie artefacts générés locaux ; succès ne valide pas fonctionnement produit.

## Validations requises avant application

1. Conserver sauvegarde et confirmer procédure de restauration utilisable.
2. Générer SQL avec Prisma, sans l'appliquer.
3. Revoir intégralement SQL, particulièrement enums, suppressions, colonnes obligatoires, clés étrangères et contraintes uniques.
4. Vérifier que SQL n'introduit aucune fonctionnalité métier future.
5. Valider explicitement SQL final avant `npx prisma migrate dev`.

## Traçabilité

- Commandes exécutées par moi : lectures de fichiers uniquement.
- Commandes proposées : toutes commandes PowerShell ci-dessus.
- Commandes exécutées manuellement et résultats communiqués : contrôle des 18 tables vides, sauvegarde créée, `pg_restore --list` valide, migration initiale appliquée et `prisma migrate diff` signalant écarts.
- Commandes restantes : génération, revue, application autorisée, contrôle et génération Prisma Client.
