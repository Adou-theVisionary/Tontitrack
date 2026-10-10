# Rapport préparation alignement Prisma

Date : 10/10/2026. J'ai limité cette préparation à une comparaison hors ligne. Aucune commande Prisma, npm, SQL, migration ou seed n'a été lancée durant cette préparation.

> Mise à jour Phase 1.4 — J'ai reçu contrôle manuel complet : 18 tables applicatives contiennent exactement zéro enregistrement. Sauvegarde `tontitrack_avant_migration.backup` existe, mesure 39 797 octets et `pg_restore --list` a répertorié 107 entrées. Restauration complète n'a pas été testée. Ces résultats remplacent estimation antérieure limitée au comptage de `Utilisateur`.

## Écart global

Migration `20260915154109_initial` est appliquée et reste seule migration historique. `prisma/schema.prisma` décrit cible plus large. `prisma migrate status` peut confirmer historique appliqué, mais ne compare pas automatiquement datamodel actuel à DB ; une migration d'alignement est nécessaire.

## Comparaison démontrée hors ligne

| Élément | Migrations historiques | `schema.prisma` actuel | Action nécessaire | Risque |
|---|---|---|---|---|
| Utilisateur | nom/prénom et dates minimales | statut, hash mot de passe, vérifications, suppression logique, relations | ajouter colonnes/modèles liés | colonnes nouvelles sans valeur selon migration générée |
| Profil, session, vérifications, fichier | absents | nouveaux modèles et FKs | créer tables/FKs | faible si DB vide, données existantes à vérifier |
| Espaces/catégories/transactions | espace et transaction minimaux ; catégorie absente | statut espace, catégorie, propriétaire transaction, annulation/historique enrichi | créer catégorie, ajouter colonnes/FKs | champs requis transaction/utilisateur |
| Membre tontine | statut, position, membre unique | rôle, dates, statut `TERMINE`, relations ordre/bénéficiaire | ajouter colonnes/relations/enum | valeurs historiques enum et membre existant |
| Invitation | `tontineId`, code simple | créateur, hash token, expiration, actif, unicités | ajouter colonnes/index uniques/FK | colonnes requises et doublons code/token |
| Ordre bénéficiaire | scalaires, unique position/version | FKs, date, unique membre/version | ajouter FKs/contrainte | ordres orphelins/doublons |
| Rotation | date prévue/montant attendu | statut, début/échéance, montants, dates, bénéficiaire FK, confirmation | remplacer/ajouter colonnes et FK | colonnes obligatoires et mapping date |
| Cotisation/déclaration/preuve | modèle minimal, `EN_ATTENTE` | déclarant/décideur/version/preuve fichier, `EN_ATTENTE_VALIDATION`, annulation | ajouter colonnes/FKs et remplacer enum | retrait valeur enum existante ; données déclarations |
| Versement/réception | versement minimal, réception liée versement | déclarant, contestation, preuve fichier ; réception liée rotation/bénéficiaire | modifier relations/enum/contraintes | changement FK, conservation confirmations existantes |
| Notification/audit/synchronisation | champs minimaux | données, source audit, requête/résultat/erreur/dates | ajouter colonnes/enums | JSON requis synchronisation et migrations données |
| Enums | valeurs initiales | nouveaux enums et retraits : déclaration/versement notamment | migration enum explicite | élevé si anciennes valeurs sont utilisées |

Les différences ci-dessus sont **confirmées** entre fichier SQL et datamodel. J'ai reçu depuis le résultat manuel de `prisma migrate diff` confirmant nombreux écarts ; PostgreSQL contient 18 tables applicatives, toutes avec estimation à zéro ligne, et `Utilisateur` contient exactement zéro ligne. Je n'ai pas encore prouvé absence de données dans les 17 autres tables. Doublons, valeurs enum utilisées, FKs orphelines et contraintes réelles DB restent à vérifier.

## Risques migration

- Élevé : retrait/renommage `StatutDeclaration.EN_ATTENTE`, retrait de valeurs historiques `StatutVersement`; transformation requiert mapping de données.
- Élevé : `ConfirmationReception` passe relation versement vers rotation/bénéficiaire ; une migration automatique peut ne pas préserver relation métier.
- Moyen : nouvelles colonnes obligatoires (`declarantId`, créateurs, dates, montants) exigent valeurs pour lignes existantes.
- Moyen : nouvelles uniques/FKs échouent si codes, positions, membres ou références existantes sont incohérents.
- Moyen : aucune preuve que DB développement est vide. Ne pas le présumer.

## Alignement actuel distinct des futures évolutions Tontine

### A. Alignement à traiter d'abord

Uniquement rendre PostgreSQL conforme au `schema.prisma` actuel, avec migration inspectée et plan de reprise des données. Ne pas ajouter règles métier nouvelles durant cette migration.

### B. Évolutions futures à concevoir séparément

`schema.prisma` ne modélise pas encore explicitement : visibilité publique/privée, stratégie invitation/demande, mode lancement manuel/automatique, mode ordre manuel/aléatoire, configuration/snapshot règles financières, grâce/rappels/pénalités, procédure départ/exclusion/remplacement/accords, politique reversement partiel, permissions par tontine et visibilité collective fine. Ces ajouts exigent décisions documentées avant migration distincte.

## Plan sécurisé recommandé

1. Identifier DB et confirmer environnement développement.
2. Vérifier contenu, migrations appliquées, valeurs enum et dépendances en lecture seule.
3. Sauvegarder DB si elle contient données utiles.
4. Générer migration **non appliquée** dans copie/branche dédiée, puis lire SQL.
5. Examiner chaque `DROP`, remplacement enum, `NOT NULL`, FK et unique ; préparer SQL de reprise si nécessaire.
6. Obtenir validation propriétaire.
7. Appliquer manuellement seulement migration approuvée.
8. Contrôler migrations, schéma, données et client Prisma ; ensuite seed idempotent.

## Commandes manuelles proposées, non exécutées

### Première commande uniquement — à exécuter maintenant

- Répertoire : `C:\Users\isasa\Desktop\tontitrack_prod`
- Commande :

```powershell
$ttUrl = ((Get-Content .env | Where-Object { $_ -match '^DATABASE_URL=' }) -replace '^DATABASE_URL="?', '' -replace '"$','') -replace '\?schema=.*$',''
@"
SELECT format('SELECT %L AS table_name, count(*) AS row_count FROM public.%I;', tablename, tablename)
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
\gexec
"@ | & 'C:\Program Files\PostgreSQL\18\bin\psql.exe' --no-password --set ON_ERROR_STOP=1 --dbname=$ttUrl
```

- Rôle pédagogique : compter exactement les lignes de chaque table applicative avant toute migration.
- Données/fichiers : lecture `.env` en mémoire et `SELECT count(*)` PostgreSQL ; aucune écriture attendue.
- Résultat attendu : liste table/compteur. Ce résultat permet de distinguer base réellement vide et base seulement estimée vide.
- Risque : lecture DB seulement. La commande ne doit pas afficher URL ; ne partagez jamais `.env` ni son contenu.
- Si échec : transmettre erreur en masquant toute URL/identifiant. Ne lancez migration, reset ou `db push`.

Après résultat reçu, je choisirai la prochaine vérification lecture seule. Je ne lancerai aucune étape suivante automatiquement.
