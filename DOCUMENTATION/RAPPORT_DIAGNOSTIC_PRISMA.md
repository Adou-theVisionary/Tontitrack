# Rapport diagnostic Prisma et PostgreSQL

Date : 10/10/2026. Périmètre : lecture seule ; aucune migration, seed, écriture SQL, schéma ou code modifié.

## Diagnostic

Cause **confirmée** du `Schema engine error` initial : sandbox Windows bloque connexions TCP vers `localhost:5432` avec `Permission denied (10013)`. Preuve : `psql` lecture seule échoue dans sandbox avec même code ; il réussit hors sandbox. `npx prisma migrate status` réussit hors sandbox. Ce n'est donc pas une incompatibilité démontrée Prisma/PostgreSQL ni une corruption migration.

## PostgreSQL

État : **installé et accessible hors sandbox**. Client `psql.exe` existe dans `C:\Program Files\PostgreSQL\18\bin\`, mais ce dossier n'est pas dans PATH. Client/serveur vérifié : PostgreSQL 18.6. Base développement configurée répond. Service Windows : **non vérifié**, interrogation Service Control Manager refusée par permissions sandbox.

## Prisma

- CLI et client : 5.22.0, versions cohérentes.
- Datasource PostgreSQL lit `DATABASE_URL`; présence confirmée sans reproduire valeur.
- Schéma : `prisma/schema.prisma`, validé par `npx prisma validate`.
- Aucun `prisma.config.ts` détecté.
- `npx prisma migrate status` hors sandbox : 1 migration trouvée, base à jour par rapport aux migrations présentes.

Important : `migrate status` compare historique de migrations et DB, pas datamodel actuel contre migration manquante. Il ne réfute donc pas décalage `schema.prisma` / migration initiale.

## Migrations et schéma

Migration appliquée : `20260915154109_initial`. Elle contient ancien `StatutDeclaration.EN_ATTENTE`, ancien `StatutVersement` et tables initiales. Schéma actuel ajoute notamment profil, session, vérifications, fichier, catégorie, rôles membres, états/horodatages rotations, confirmation réception par rotation, audit/synchronisation enrichis. Une migration d'alignement reste nécessaire ; ne pas la créer ou appliquer dans ce diagnostic.

## Modèle Tontine

| Capacité | État | Preuve / écart |
|---|---|---|
| Création/admin, membres, trois modes | Déjà prise en charge conceptuellement | `Tontine.createur`, `MembreTontine.role`, enums modes |
| Tours, bénéficiaires, cotisations, déclarations, preuves, confirmation | Déjà prise en charge conceptuellement | `Rotation`, `Cotisation`, déclarations/preuves, `ConfirmationReception` |
| Traçabilité | Partiellement prise en charge | audit, historique transaction, synchronisation présents ; services absents |
| Public/privé, invitation/demande configurable | Absente | aucun champ visibilité/stratégie adhésion |
| Lancement manuel/auto | Partiellement prise en charge | dates/statuts existent ; aucun mode/traitement planifié |
| Ordre manuel/aléatoire et verrouillage règles | Partiellement prise en charge | positions/versions existent ; aucun mode ordre, snapshot règles ou verrou explicite |
| Retards, rappels, grâce, pénalités | Partiellement prise en charge | `EN_RETARD` existe ; règles/config/jobs absents |
| Départ, exclusion, remplacement post-lancement | Partiellement prise en charge | statuts membre existent ; procédures/accords absents |
| Reversement partiel configurable | Partiellement prise en charge | versements multiples possibles ; aucun booléen/règle/plafond |
| Collecte créateur et visibilité collective | Partiellement prise en charge | entités permettent données ; autorisation/services/UI réelle absents |

## Solution recommandée

1. Sauvegarder DB développement si données existent et confirmer environnement hors sandbox.
2. Générer migration d'alignement dans lot dédié contrôlé, sans reset/db push.
3. Inspecter SQL : conversions enums, colonnes non null, contraintes uniques/FK, changements `ConfirmationReception`.
4. Appliquer seulement après validation absence de perte ou plan de migration de données.
5. Générer client Prisma, vérifier `migrate status`, puis créer seed idempotent.
6. Avant auth : définir API/DTO, services métier et autorisation objet ; seulement ensuite implémenter sessions.

Risques : transition enum, données existantes futures, contrat frontend/mock incompatible, absence règles de configuration Tontine. PostgreSQL et Prisma peuvent être alignés en sécurité, mais pas sans migration inspectée et décisions métier manquantes.
