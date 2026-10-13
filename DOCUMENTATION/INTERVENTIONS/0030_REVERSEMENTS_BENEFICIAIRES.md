# Intervention 0030 — Reversements aux bénéficiaires

Date : 12/10/2026

## Objectif et contexte

J'ai implémenté le suivi des reversements externes, depuis cotisations confirmées jusqu'à confirmation ou contestation par bénéficiaire. TontiTrack n'exécute aucun paiement et ne crée aucune réception automatique.

## État initial et diagnostic

Le schéma contenait un début de `DeclarationVersement`, `PreuveVersement` et `ConfirmationReception`, mais sans montant confirmé, date de transfert, référence, moyen, observation, lien par déclaration, historique, route sécurisée ni interface réelle. L'ancienne confirmation unique par rotation ne permettait pas reversements partiels successifs ou désaccord non destructif.

## Modèles et invariants

J'ai complété `DeclarationVersement` avec tontine, montant confirmé, date UTC, référence, moyen, observation et version. J'ai relié `ConfirmationReception` à une déclaration unique et ajouté son montant, motif et observation. `EvenementReversement` conserve déclaration, confirmation, contestation et régularisation sans écrasement.

Je calcule tout montant côté serveur avec `Prisma.Decimal`. Montant déclaré reste inférieur ou égal aux cotisations confirmées disponibles de rotation, après reversements non contestés. Une contestation ne confirme aucun fonds. La clôture d'une rotation exige collecte théorique confirmée et même total reçu confirmé ; rotation suivante est ouverte dans transaction seulement alors.

## Permissions, flux et preuves

Seul créateur déclare un reversement d'une rotation active. Seul bénéficiaire lié à cette rotation confirme montant reçu ou conteste. Créateur et bénéficiaire seulement voient moyen, référence, observation, preuve et historique ; autres membres reçoivent agrégats collectifs. JPG, PNG et WebP restent contrôlés par signature binaire, limités à 5 Mo et stockés hors `public/` sous `preuves-reversements/`.

Les mutations utilisent transaction Prisma `Serializable`, statut conditionnel et `Idempotency-Key` persistée dans `OperationSynchronisation`. Même clé rejoue résultat final sans créer nouvelle opération. Une déclaration suivant contestation est marquée comme régularisation dans historique et notification.

## Fichiers et modifications

- `prisma/schema.prisma` et `prisma/migrations/20261012190000_reversements/migration.sql` : modèle, enums, relations, index, clés étrangères et garde de migration historique.
- `lib/tontines/contrats.ts`, `lib/stockage/preuves-privees.ts`, `services/tontines.service.ts` : validation, stockage, moteur financier, accès, idempotence et notifications.
- `app/api/tontines/[tontineId]/reversements/` : lecture, déclaration, décision et preuve privée.
- `components/tontines/ReversementsTontine.tsx`, `components/tontines/DetailTontine.tsx` et page d'onglet : interface réelle et retrait des actions de reversement mock de détail.
- `types/index.ts`, `lib/format.ts`, `components/pages/PageNotifications.tsx` : nouveaux types, libellés et navigation de notification.
- `tests/tontines/phase-2-5-reversements.test.ts` : contrats automatisés préparés, non exécutés.

## Décisions à arbitrer

Je respecte `reversementsPartielsAutorises` verrouillé au démarrage. La règle produit ne fixe pas encore délai de traitement d'une contestation, clôture forcée, automatisme de confirmation ni procédure humaine de résolution. Je n'ai inventé aucun de ces comportements.

## Commandes chronologiques

### Lecture exécutée par Codex

J'ai lu consignes, règles métier, architecture, rapport 0029, schéma, migration Phase 2.4, contrats, stockage, service, routes, composants, types, notifications et scripts. J'ai inspecté diff sans effet de bord. Je n'ai exécuté aucune commande applicative.

### Exécutée manuellement par propriétaire

Non déterminé pour cette intervention. Le résultat antérieur communiqué reste : `npx prisma generate` réussi avant intervention 0029 ; typecheck avait échoué avant sa correction JSX.

### Proposée au propriétaire

Non déterminé.

### Restante

Depuis `C:\Users\isasa\Desktop\tontitrack_prod`, après sauvegarde et lecture intégrale de `20261012171431_cotisations_retards/migration.sql` puis `20261012190000_reversements/migration.sql` :

```powershell
npx prisma validate
npx prisma migrate dev
npx prisma generate
npm run typecheck
npm run lint
npm run build
```

Objectif pédagogique : vérifier schéma, appliquer migrations contrôlées, générer client et contrôler types, qualité et build. Résultat attendu : aucune confirmation historique ambiguë et aucun échec lié aux reversements. Risque : migration modifie base locale ; interrompre si sauvegarde, revue SQL ou traitement d'une confirmation historique est absent.

## Tests, validations, dépendances, risques et reprise

Je n'ai ajouté aucune dépendance. Tests de contrats sont préparés mais runner TypeScript n'est pas configuré. Les quatorze scénarios manuels couvrant complet, partiel, contestation, concurrence, permissions, preuves, trois modèles, décimales, notifications et rafraîchissement sont consignés dans `08_TESTS_ET_VALIDATIONS.md`.

Je n'ai exécuté aucune validation après modification. Je dois analyser sorties manuelles avant toute annonce de réussite, revoir migration sur base contenant données, configurer volume privé persistant en production et décider procédure de résolution de litige. Je ne dois pas modifier exception temporaire d'identité ni commencer Super Admin dans cette reprise.
