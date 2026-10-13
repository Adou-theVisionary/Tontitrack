# Intervention 0032 — Clôture et archivage des tontines

**Date :** 13/10/2026  
**Objectif :** Mettre en place une clôture normale sécurisée, un rapport persistant et l'archivage sans modifier les règles financières validées.

## Contexte et état initial

Les statuts `TERMINEE` et `ARCHIVEE` existaient déjà dans Prisma, mais aucune règle serveur ne vérifiait les conditions de clôture, aucun rapport immuable n'était conservé et aucune interface ne présentait l'état financier final. Les déclarations de cotisation ne vérifiaient pas directement le statut de la tontine ; elles dépendaient seulement de l'état de rotation.

## Fichiers concernés

- `prisma/schema.prisma`
- `prisma/migrations/20261013120000_cloture_archivage/migration.sql`
- `lib/tontines/contrats.ts`
- `services/tontines.service.ts`
- `app/api/tontines/[tontineId]/cloture/route.ts`
- `app/api/tontines/[tontineId]/archiver/route.ts`
- `components/tontines/ClotureTontine.tsx`
- `components/tontines/DetailTontine.tsx`
- `app/(application)/tontines/[tontineId]/[onglet]/page.tsx`
- `components/tontines/ListeTontines.tsx`
- `tests/tontines/phase-2-6-cloture.test.ts`
- `DOCUMENTATION/02_ARCHITECTURE_TECHNIQUE.md`
- `DOCUMENTATION/03_REGLES_METIER_TONTINE.md`
- `DOCUMENTATION/06_JOURNAL_DE_DEVELOPPEMENT.md`
- `DOCUMENTATION/07_PROBLEMES_ET_SOLUTIONS.md`
- `DOCUMENTATION/08_TESTS_ET_VALIDATIONS.md`
- `DOCUMENTATION/09_DECISIONS_TECHNIQUES.md`
- `DOCUMENTATION/INTERVENTIONS/0032_CLOTURE_ARCHIVAGE_TONTINES.md`

## Modifications apportées

J'ai ajouté le modèle `RapportClotureTontine`, relié une seule fois à chaque tontine. Il conserve le créateur de l'action, la date, les totaux `Decimal` calculés depuis les données réelles et un instantané des rotations. La migration `20261013120000_cloture_archivage` crée uniquement cette table, ses index et sa clé étrangère ; elle ne modifie aucune tontine, rotation, cotisation, confirmation ni écriture historique.

J'ai ajouté les méthodes `etatCloture`, `cloturer` et `archiver`. Elles vérifient côté serveur démarrage réel, rotations terminées, cotisations exigibles réglées, pénalités suivant leur règle existante, reversements confirmés, absence de déclaration en attente, absence de contestation et absence d'opération synchronisée en attente. La clôture utilise une transaction `Serializable` puis une mise à jour conditionnelle de `ACTIVE` vers `TERMINEE`, ce qui empêche deux rapports lors de demandes concurrentes. Elle notifie les membres approuvés.

J'ai ajouté les routes sécurisées de consultation et confirmation de clôture, ainsi que l'archivage post-clôture. Les déclarations et décisions de cotisation ou reversement refusent désormais une tontine non `ACTIVE`, afin de rendre les opérations financières non modifiables après clôture.

J'ai ajouté l'onglet Clôture, le récapitulatif avant confirmation, les conditions remplies ou bloquantes, les totaux collectifs autorisés, le résultat individuel, le rapport consultable et les liens vers les historiques privés existants. La liste sépare les tontines terminées ou archivées dans Archives.

Je n'ai pas créé de clôture forcée. Une contestation reste bloquante : le modèle actuel ne porte aucun statut de règlement ni lien sûr vers une régularisation. Je préfère ce blocage à une déduction financière qui pourrait masquer un litige.

## Commandes chronologiques et raisons

### Lecture exécutée par Codex

- `Get-Content -LiteralPath 'C:\Users\isasa\.agents\skills\caveman\SKILL.md'` : j'ai appliqué le mode de communication demandé.
- `Get-Content -LiteralPath 'AGENTS.md'` et lecture des documents de cadrage, d'architecture, de règles métier et du rapport 0031 : j'ai relevé les contraintes, règles existantes et validations précédentes.
- `rg --files app components lib services repositories prisma tests DOCUMENTATION` et recherches `rg` ciblées : j'ai identifié schéma, service, contrats, routes, composants, migrations et tests concernés.
- `Get-Content` ciblé sur `prisma/schema.prisma`, `services/tontines.service.ts`, routes, composants, adaptateur et documentation : j'ai vérifié les relations Prisma, les trois modèles, les contrôles financiers existants et le raccordement interface/API.
- `Get-ChildItem -LiteralPath 'prisma/migrations' -Directory` et lecture de la migration Phase 2.5 : j'ai déterminé le prochain emplacement de migration et conservé le style SQL existant.
- `git diff --check` : j'ai contrôlé l'absence d'erreur d'espacement dans le diff. Git a signalé seulement des avertissements LF/CRLF sur des fichiers déjà présents dans l'arbre de travail ; je n'ai pas modifié ces fichiers hors périmètre.

### Exécutée manuellement par propriétaire

Non déterminé pour cette intervention.

### Proposée au propriétaire

Non déterminé.

### Restante

Après sauvegarde de la base et relecture de `prisma/migrations/20261013120000_cloture_archivage/migration.sql`, exécuter manuellement depuis `C:\Users\isasa\Desktop\tontitrack_prod` :

```powershell
npx prisma validate
npx prisma migrate status
npx prisma migrate deploy
npx prisma generate
npm run typecheck
npm run lint
npm run build
```

Objectif pédagogique : contrôler le schéma, l'ordre des migrations, l'application de la table de rapport, le Prisma Client et la compilation complète. Résultat attendu : migration limitée à `RapportClotureTontine`, client aligné et aucune erreur TypeScript, ESLint ou build liée à la phase. Risque : `migrate deploy` écrit dans la base ciblée ; il faut sauvegarde vérifiée, revue SQL et arrêt immédiat si le statut Prisma est inattendu.

## Résultats et diagnostic

La clôture ne recalcule jamais les montants à partir de valeurs d'interface : elle agrège les `Decimal` persistés de cotisations, rotations et confirmations de reversement. `FIXE_CREATEUR` ne reçoit aucune rotation nouvelle : le rapport reprend seulement celles créées au démarrage. `TOURNANT_EXCLU` et `TOURNANT_INCLUS` conservent leurs obligations et rotations existantes.

Les pénalités restent séparées du principal. Faute de règle de recouvrement distincte validée, elles sont affichées et archivées, sans gonfler une dette ni créer un paiement fictif.

## Dépendances

Aucune dépendance n'a été ajoutée, supprimée ou modifiée.

## Tests et validations

J'ai préparé `tests/tontines/phase-2-6-cloture.test.ts` : il vérifie le contrat de confirmation explicite et liste les scénarios d'intégration PostgreSQL requis. Les dix parcours demandés sont aussi consignés dans `08_TESTS_ET_VALIDATIONS.md`.

Je n'ai exécuté ni migration, ni génération Prisma, ni typecheck, ni lint, ni build, ni test. Je ne déclare donc aucune validation technique ou fonctionnelle réussie.

## Risques, travail restant et consignes de reprise

La migration et la génération Prisma Client sont indispensables avant compilation, car le service emploie `RapportClotureTontine`. Tester ensuite permissions, concurrence, archives, lecture des justificatifs privés et les trois modèles. Si le produit doit permettre clôture après régularisation d'une contestation historique, le propriétaire doit d'abord valider une procédure explicite, son statut persistant, son lien vers le reversement de régularisation et ses tests ; aucune déduction automatique ne doit être ajoutée.
