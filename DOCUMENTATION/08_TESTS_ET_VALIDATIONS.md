# Tests et validations

## Intervention 0034 — Redirection post-authentification

J'ai préparé `tests/auth/redirection-authentification.test.ts` sans l'exécuter. Je dois vérifier manuellement : connexion d'un Super Admin actif vers administration, connexion standard vers tableau utilisateur, compte suspendu refusé, retrait/attribution de rôle visible à la connexion suivante et à chaque lecture de session, session invalidée ou expirée redirigée vers connexion, retour Tontine interne conservé, retour administratif seulement si autorisé, retour externe refusé, déconnexion puis reconnexion, et absence de boucle entre connexion, espace utilisateur et administration.

## Intervention 0033 — Administration globale Super Admin

J'ai préparé `tests/administration/phase-3-1-super-admin.test.ts` comme inventaire de scénarios, sans l'exécuter. Je dois vérifier avec des comptes et une base de test fictifs : absence de session, refus par défaut, matrice complète des trois rôles, amorçage unique, suspension/réactivation, invalidation immédiate de session, attribution/retrait, protection concurrente du dernier Super Admin, audit append-only, pagination, module Tontines en lecture seule, absence de preuve privée et responsive mobile/bureau.

Je dois aussi vérifier l'accessibilité clavier des liens et dialogues, les libellés des champs, les focus visibles, les erreurs de chargement et les états vides. Je ne considère aucun de ces tests réussi avant exécution manuelle et transmission du résultat.

## Intervention 0032 — Clôture et archivage des tontines

Je n'ai exécuté aucune commande ni test. Je dois d'abord relire la migration `20261013120000_cloture_archivage`, sauvegarder la base, puis exécuter manuellement depuis `C:\Users\isasa\Desktop\tontitrack_prod` :

```powershell
npx prisma validate
npx prisma migrate status
npx prisma migrate deploy
npx prisma generate
npm run typecheck
npm run lint
npm run build
```

Objectif pédagogique : vérifier schéma, état des migrations, application contrôlée de la nouvelle table de rapport, Prisma Client, types, règles et build. Résultat attendu : seule la table de rapport est ajoutée ; aucune tontine, rotation, cotisation ni écriture financière existante n'est modifiée. Risque : `migrate deploy` modifie la base cible ; ne pas l'exécuter sans sauvegarde et relecture du SQL.

Je dois préparer et exécuter avec comptes distincts :

1. clôture d'une tontine entièrement réglée, avec rapport et notification ;
2. refus si une cotisation exigible est impayée ;
3. refus si un reversement reste non confirmé ;
4. refus si une contestation est ouverte ;
5. refus si une rotation reste inachevée ;
6. refus d'une clôture par un membre non créateur ;
7. deux demandes simultanées de clôture, avec un seul rapport créé ;
8. consultation du rapport et de la section Archives par membre autorisé ;
9. refus serveur de déclaration ou décision financière après clôture ;
10. parcours complet pour `FIXE_CREATEUR`, `TOURNANT_EXCLU` et `TOURNANT_INCLUS`, sans rotation inventée pour le premier modèle.

## Intervention 0031 — Correction TypeScript des tests de reversements

Le propriétaire m'a communiqué les résultats manuels suivants : la migration PostgreSQL `20261012190000_reversements` a été appliquée avec succès, le schéma Prisma est valide et Prisma Client a été généré. Il m'a aussi communiqué l'échec antérieur de `npm run typecheck` sur TS2339 : le test lisait `montantConfirme` sans avoir réduit l'union discriminée par `decision`.

Je n'ai exécuté aucune commande. J'ai préparé la correction du test : chaque branche vérifie désormais explicitement sa décision avant de lire sa propriété propre. Je dois encore exécuter manuellement depuis `C:\Users\isasa\Desktop\tontitrack_prod` :

```powershell
npm run typecheck
npm run lint
npm run build
```

Objectif pédagogique : confirmer la suppression de TS2339, puis vérifier les règles ESLint et la compilation de production. Résultat attendu : aucune erreur liée au rétrécissement de type des décisions de reversement. Risque : une autre erreur indépendante peut interrompre une commande ; je dois alors conserver sa sortie complète pour diagnostic.

## Intervention 0030 — Reversements aux bénéficiaires

Je n'ai exécuté aucune commande ni test. J'ai préparé `tests/tontines/phase-2-5-reversements.test.ts` pour les contrats de montants et décisions. Aucun runner TypeScript n'est défini dans les scripts actuels ; je ne présente donc pas ce fichier comme exécuté.

Je dois vérifier manuellement :

1. reversement complet par créateur ;
2. confirmation de réception par bénéficiaire ;
3. reversements partiels successifs lorsque configuration les autorise ;
4. refus de reversement partiel lorsque configuration les interdit ;
5. réception partielle signalée, avec solde restant affiché ;
6. contestation, conservation de l'historique et déclaration de régularisation ;
7. tentative de confirmation par autre membre ;
8. tentative de déclaration par non-créateur ;
9. déclaration supérieure aux cotisations confirmées disponibles ;
10. deux déclarations concurrentes et répétition avec même `Idempotency-Key` ;
11. double confirmation de même déclaration ;
12. droits sur justificatif : créateur déclarant/bénéficiaire autorisés, autre membre/non-authentifié refusés ;
13. `FIXE_CREATEUR`, `TOURNANT_EXCLU` et `TOURNANT_INCLUS`, calculs décimaux, clôture et rotation suivante ;
14. notifications déclaration, confirmation, réception partielle, contestation et régularisation, puis rafraîchissement sans fermeture de modale ni perte de saisie.

Commandes manuelles restantes, depuis `C:\Users\isasa\Desktop\tontitrack_prod` après sauvegarde et revue SQL des migrations Phase 2.4 et 2.5 :

```powershell
npx prisma validate
npx prisma migrate dev
npx prisma generate
npm run typecheck
npm run lint
npm run build
```

Objectif pédagogique : valider schéma, appliquer migration contrôlée, régénérer client puis contrôler types, règles et build. Résultat attendu : migrations sans donnée ambiguë, client aligné et absence d'erreur liée aux reversements. Risque : `migrate dev` modifie base locale ; ne pas l'exécuter sans sauvegarde, revue complète et résolution de toute confirmation historique sans déclaration unique.

## Intervention 0029 — Correction JSX aperçu des cotisations

Résultats exécutés manuellement par le propriétaire et communiqués : `npx prisma generate` a réussi. `npm run typecheck` a échoué avant correction avec `TS1109`, `TS2657` et `TS1005` dans `components/tontines/ApercuCotisationsTontine.tsx`, à la ligne 30. ESLint et le build n'ont pas été exécutés.

Je n'ai exécuté aucune commande après correction. Je dois lancer manuellement, depuis `C:\Users\isasa\Desktop\tontitrack_prod` :

```powershell
npm run typecheck
npm run lint
npm run build
```

Objectif pédagogique : vérifier la syntaxe et les types JSX, puis les règles de qualité et la compilation de production. Résultat attendu : disparition des trois erreurs de parsing ; toute nouvelle erreur doit être transmise séparément. Risque : ces commandes ne vérifient pas à elles seules les données de cotisations ni les permissions.

## Intervention 0028 — Corrections UX et parcours utilisateurs

Je n'ai exécuté aucun test ni commande après ces corrections. Je dois vérifier manuellement :

1. invitation ouverte sans session, puis connexion et inscription, conserve chemin interne et jeton ;
2. destination externe, double barre oblique et antislash sont refusés ;
3. acceptation confirmée redirige seulement vers tontine effectivement rejointe ; invitation invalide, expirée ou refusée ne redirige pas ;
4. rafraîchissement visible synchronise invitations, membres, demandes, cotisations et notifications sans effacer formulaire ;
5. modale cotisation est accessible clavier, bloque défilement arrière-plan et reste responsive ;
6. JPG, PNG et WebP valides inférieurs à 5 Mo sont joints ; extension usurpée, signature invalide et taille excessive sont refusées ;
7. déclarant/créateur peuvent consulter preuve, autre membre et non-authentifié reçoivent refus ;
8. aperçu membre/créateur reflète montants, retards, pénalités et déclarations réels.

Commandes manuelles restantes depuis `C:\Users\isasa\Desktop\tontitrack_prod` : `npx prisma generate`, `npm run typecheck`, `npm run lint`, puis `npm run build`. Objectif : générer client après migration Phase 2.4 et contrôler types, règles et compilation. Risque : ces commandes peuvent révéler causes distinctes et ne prouvent pas parcours utilisateur.

## Intervention 0027 — Compatibilité TypeScript des rotations

Résultat exécuté manuellement et communiqué : `npm run typecheck` a échoué avec `TS2802` dans `services/tontines.service.ts:194:45`, sur l'itération de `beneficiaires.entries()`.

Je n'ai exécuté aucune commande après correction. Je dois relancer manuellement, depuis `C:\Users\isasa\Desktop\tontitrack_prod` :

```powershell
npm run typecheck
```

Objectif pédagogique : vérifier compatibilité de la boucle de génération des rotations avec configuration TypeScript actuelle. Résultat attendu : disparition de TS2802 ; toute autre erreur éventuelle doit être transmise séparément. Risque : cette commande ne vérifie pas les parcours fonctionnels ni migration Prisma.

## Intervention 0026 — Cotisations et retards

Je n'ai exécuté aucun test ni commande. Je dois vérifier manuellement après migration et génération Prisma :

1. démarrage crée cotisations seulement pour rotations et cotisants attendus dans `FIXE_CREATEUR`, `TOURNANT_EXCLU` et `TOURNANT_INCLUS` ;
2. membre déclare sa propre cotisation active ; membre non concerné, non-membre, autre membre et rotation future sont refusés ;
3. montant partiel est déclaré puis confirmé ; déclaré et confirmé restent distincts ;
4. dépassement du reste, double décision et confirmations concurrentes sont refusés ;
5. créateur confirme ou rejette ; rejet n'augmente jamais collecte et nouvelle déclaration reste possible ;
6. suivi collectif masque référence et moyen de versement d'autrui, mais affiche montants/statuts réels ;
7. montants décimaux à deux chiffres, séparateur virgule et valeurs à plus de deux décimales refusées sans erreur d'arrondi ;
8. avant échéance, à échéance, pendant grâce et après grâce ; calcul UTC aux changements de mois ;
9. pénalité unique après grâce, distincte principal, sans modification rétroactive ;
10. tâche authentifiée refuse secret absent/invalide, crée au plus un rappel avant échéance et un rappel de retard, et ne duplique ni pénalité ni notification ;
11. notifications de déclaration confirmée/rejetée/retard apparaissent uniquement au destinataire.

Commandes manuelles restantes, depuis `C:\Users\isasa\Desktop\tontitrack_prod` :

```powershell
npx prisma migrate dev --name cotisations_retards --create-only
npx prisma generate
npm run typecheck
npm run lint
npm run build
```

Je dois lire intégralement migration générée avant application. Si base contient cotisations, migration doit renseigner `Cotisation.tontineId` depuis rotation avant colonne obligatoire. Voir `INTERVENTIONS/0026_COTISATIONS_RETARDS.md`.

## Intervention 0025 — Exception temporaire identité

Je n'ai exécuté aucun test ni commande. Avant production, je dois vérifier avec comptes distincts :

1. refus serveur de création de tontine sans pièce déposée ;
2. refus serveur de demande d'adhésion sans pièce déposée ;
3. refus serveur d'acceptation d'invitation sans pièce déposée ;
4. refus serveur de toute création ou approbation de membre sans pièce déposée ;
5. autorisation des quatre parcours après dépôt de pièce ;
6. absence d'exposition de pièce, de statut privé ou de justification dans réponses non autorisées.

### Checklist préparation production — identité

- [ ] contrôle serveur effectif sur création, demande, acceptation et adhésion ;
- [ ] distinction dépôt / vérification documentée et statuts métier validés ;
- [ ] tests de refus et d'autorisation réussis ;
- [ ] contrôle des permissions et confidentialité des pièces réussi ;
- [ ] exception de développement supprimée avant déploiement production.

## Intervention 0024 — Création Tontine et validation

Test manuel communiqué : après les cinq étapes de création, l'application affichait « Données invalides » et aucune tontine ne semblait créée.

J'ai préparé ce parcours manuel navigateur, sans l'exécuter :

1. Étape 1 : vérifier blocage du nom de moins de 3 caractères, de 1/201 participants, d'un nombre décimal de participants, d'un montant nul/négatif et d'une date du jour ou passée ; créer ensuite avec nom valide, 5 participants, montant positif et date future.
2. Étape 2 : répéter création valide pour `FIXE_CREATEUR`, `TOURNANT_EXCLU` et `TOURNANT_INCLUS` ; vérifier nombre de tours affiché et création réussie.
3. Étape 3 : vérifier créateur affiché et information invitation ; après création, vérifier membre créateur approuvé côté écran Tontine.
4. Étape 4 : vérifier absence d'ordre requis pour `FIXE_CREATEUR` et information d'ordre à compléter avant démarrage pour deux modèles tournants.
5. Étape 5 : vérifier retour automatique à étape 1 pour une donnée invalide, message près du champ, puis création avec toutes données valides.
6. Réseau : vérifier `POST /api/tontines` avec valeurs typées : montant et participants numériques, date `YYYY-MM-DD`, enums `FIXE_CREATEUR`/`TOURNANT_EXCLU`/`TOURNANT_INCLUS`, fréquence et paramètres booléens. Vérifier réponse 400 structurée `{ erreur: { code, message, details: [{ champ, message }] } }` pour requête invalide, sans donnée sensible.

Je dois exécuter manuellement `npm run typecheck`, `npm run lint`, puis `npm run build` depuis racine. Voir `INTERVENTIONS/0024_CORRECTION_CREATION_TONTINE.md`.

## Intervention 0023 — ESLint Phase 2.3

Résultats manuels communiqués : validation Prisma et `npm run typecheck` ont réussi. ESLint a signalé quatre erreurs `react/no-unescaped-entities` dans composants Tontine et trois avertissements `@next/next/no-img-element` dans pages/logo. J'ai corrigé source sans relancer commande. Build n'a pas été exécuté après erreurs ESLint.

Je dois lancer manuellement `npm run lint`, puis `npm run build` depuis racine. Voir `INTERVENTIONS/0023_CORRECTION_ESLINT_PHASE_2_3.md`.

## Intervention 0022 — Correction syntaxe Phase 2.3

Résultats manuels communiqués : `npx prisma validate` a réussi. `npm run typecheck` a échoué avant correction avec `services/tontines.service.ts:274:328 - TS1005: ',' expected.` Je n'ai exécuté aucune commande après correction. ESLint et build n'ont pas été exécutés, car TypeScript avait échoué.

Je dois relancer manuellement `npm run typecheck`, puis `npm run lint` et `npm run build` depuis racine. Voir `INTERVENTIONS/0022_CORRECTION_SYNTAXE_TYPESCRIPT_PHASE_2_3.md`.

## Intervention 0021 — Démarrage et rotations

Je n'ai exécuté aucune commande technique ni test. Je dois lancer manuellement depuis `C:\Users\isasa\Desktop\tontitrack_prod` : `npm run typecheck`, `npm run lint`, `npm run build` et `npx prisma validate`.

Je dois vérifier : démarrage manuel autorisé ; capacité insuffisante ; créateur absent/non autorisé ; deux demandes simultanées ; verrouillage règles/adhésions ; ordre manuel incomplet ou dupliqué ; ordre aléatoire sans doublon ; modèles `FIXE_CREATEUR`, `TOURNANT_EXCLU`, `TOURNANT_INCLUS` ; fréquences/calendrier ; absence rotations dupliquées ; accès rotations/ordre refusé ; tâche automatique avant/après date avec secret valide/invalide.

## Intervention 0020 — Corrections interfaces

Résultat manuel communiqué : `npm run typecheck` a signalé TS2345 dans `PageTontines.tsx` et TS2304 dans `DetailTontine.tsx`. J'ai corrigé source sans exécuter commande. Je dois relancer manuellement `npm run typecheck`; voir `INTERVENTIONS/0020_CORRECTION_TYPESCRIPT_INTERFACE_TONTINES.md`.

## Intervention 0019 — Interfaces Tontine

Je n'ai exécuté aucune commande technique. Je dois lancer manuellement `npm run typecheck`, `npm run lint` et `npm run build` depuis racine. Je dois ensuite vérifier invitations ciblées/lien, consentement, décisions demandes, actualisation membres, permissions administratives et persistance rechargement. Voir `INTERVENTIONS/0019_INTERFACES_INVITATIONS_MEMBRES_ADMINISTRATION.md`.

## Intervention 0018 — Correction Zod

Résultat manuel communiqué : `npm run typecheck` échoue avec TS2339, `partial` absent de `ZodEffects` dans `lib/tontines/contrats.ts`. J'ai corrigé source sans exécuter commande. Je dois relancer manuellement `npm run typecheck`, `npm run lint` et `npm run build`, puis tester modification partielle, date passée, pénalité incomplète et verrouillage après démarrage. Voir `INTERVENTIONS/0018_CORRECTION_ZOD_MODIFICATION_TONTINE.md`.

## Intervention 0017 — Invitations

Je n'ai exécuté aucune commande technique. Je dois lancer manuellement depuis la racine `npm run typecheck`, `npm run lint` puis `npm run build`. Je dois ensuite tester invitations ciblées et par lien, expiration, refus, révocation, consentement, capacité, concurrence, autorisations et absence de `jetonHash` dans réponses. Voir `INTERVENTIONS/0017_BACKEND_INVITATIONS.md`.

## Phase 2.2.1 — Schéma Prisma

Résultat manuel communiqué : `npx prisma migrate dev --name configuration_tontines_adhesions --create-only` échoue avec P1012 sur six enums déclarés sur une ligne. Correction source préparée. Je n'ai pas exécuté commande Prisma après correction.

## Phase 2.1.1 — Correction scrypt

Résultat manuel communiqué avant correction : `npm run typecheck` échoue avec deux TS2554 dans `lib/auth/mot-de-passe.ts`, lignes 11 et 25. Je n'ai exécuté aucune commande technique après correction.

Restent : `npm run typecheck`, `npm run lint`, `npm run build`. Tests unitaires scrypt sont préparés dans `tests/auth/mot-de-passe.test.ts`, mais aucun runner TypeScript n'est configuré ; ne pas les déclarer exécutés.

## Phase 2.1 — À exécuter manuellement

Je n'ai exécuté aucune commande technique. Exécuter `npm run typecheck`, `npm run lint`, puis `npm run build` depuis racine. Vérifier ensuite inscription, doublon, hash non exposé, connexion valide/invalide, compte suspendu, cookie `HttpOnly`, déconnexion et redirection `/tableau-de-bord` sans session.

Tests automatisés à préparer lorsque outil compatible sera validé : inscription valide/invalide/doublon, hash, connexion, session expirée, déconnexion, route privée sans session et isolation utilisateurs.

## Phase 1.4 — Résultats manuels communiqués

- Les 18 tables applicatives contrôlées contiennent exactement zéro enregistrement.
- Sauvegarde `tontitrack_avant_migration.backup` existe et mesure 39 797 octets.
- `pg_restore --list` a réussi et a répertorié 107 entrées.
- Restauration complète sauvegarde n'a pas été testée.

Ces validations ne confirment pas encore migration d'alignement. Restent : génération SQL Prisma, revue humaine, application explicitement autorisée puis `prisma migrate status` et `prisma generate`.

## Exécuté

| Date | Commande | Résultat |
|---|---|---|
| 10/10/2026 | `npm run typecheck` | OK |
| 10/10/2026 | `npx prisma validate` | OK |
| 10/10/2026 | `npm run lint` | Non finalisé : tentative installation réseau Next échouée |
| 10/10/2026 | `npx prisma migrate status` | Erreur moteur sans détail |
| 10/10/2026 | `npm audit --omit=dev --json` | Non exécuté : DNS registre indisponible |
| 10/10/2026 | `node --version`, `npm --version`, `npx prisma --version`, `npm ls --depth=0` | VALIDÉ : Node 24.18.0, npm 11.16.0, Prisma 5.22.0, dépendances installées |
| 10/10/2026 | `node_modules/.bin/eslint.cmd app components contexts hooks lib repositories services types --ext .ts,.tsx,.js` | VALIDÉ avec 3 avertissements `<img>`, 0 erreur |
| 10/10/2026 | `npm run build` | VALIDÉ : compilation et génération 23 routes réussies ; Browserslist signale données `caniuse-lite` anciennes |
| 10/10/2026 | `psql` lecture seule hors sandbox | VALIDÉ : PostgreSQL 18.6 accessible ; migration initiale appliquée |
| 10/10/2026 | `npx prisma migrate status` hors sandbox | VALIDÉ : 1 migration trouvée ; base à jour par rapport au dossier migrations |

## Recommandé, non exécuté cette intervention

`npm run build`; parcours UI navigateur ; tests unitaires/intégration/E2E inexistants. Toute nouvelle validation doit indiquer commande, date, résultat, limites et rapport intervention.
