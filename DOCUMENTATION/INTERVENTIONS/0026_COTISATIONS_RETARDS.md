# Intervention 0026 — Cotisations et retards

Date : 12/10/2026

## Objectif

J'ai implémenté déclarations de cotisations externes, décisions du créateur, suivi collectif, retards, pénalité unique et notifications persistantes. Aucun paiement réel ni reversement bénéficiaire n'est implémenté.

## État initial et diagnostic

Les rotations existaient après démarrage mais ne créaient aucune cotisation PostgreSQL. Composants cotisation utilisaient `mockApi`. Modèles ne conservaient ni échéance par cotisation, ni montant déclaré agrégé, ni métadonnées de versement, ni trace de pénalité. Système notifications Prisma existait mais page utilisait encore données de contexte simulées.

## Modifications

- J'ai étendu `Cotisation` avec tontine, échéance, montant déclaré, pénalité unique et horodatages des rappels avant échéance et de retard. J'ai étendu `DeclarationCotisation` avec date de versement, référence, moyen et observation de décision.
- J'ai créé cotisations dans transaction de démarrage selon les trois modèles : créateur exclu en fixe, bénéficiaire exclu en tournant exclu, tous inclus en tournant inclus. Les membres exclus d'un tour restent tracés en `NON_CONCERNE`, sans dette ni montant principal.
- J'ai ajouté API sécurisées de liste collective, déclaration membre et décision créateur. Zod, sessions, autorisations objet, plafonds, décimales textuelles converties en `Decimal`, statuts et transactions `Serializable` restent côté serveur.
- J'ai connecté onglet cotisations aux API réelles : chargement, erreur, vide, actualisation, prévention doubles soumissions, déclaration, confirmation, rejet et historique. Référence/moyen restent visibles seulement au créateur et déclarant ; justificatifs sont volontairement absents sans stockage privé sécurisé.
- J'ai ajouté notifications PostgreSQL et tâche externe sécurisée : rappel unique au premier passage avant échéance, puis rappel de retard après grâce. Pénalité fixe est appliquée au plus une fois et reste séparée de cotisation principale.

## Limites confirmées

`rappelsActifs` ne définit aucun délai ni cadence avant échéance. J'ai donc préparé un seul rappel lors du premier passage de la tâche avant échéance, sans promettre son moment exact. La tâche reste non opérationnelle sans ordonnanceur externe. Règle de recouvrement de pénalité n'est pas définie : montant est tracé mais ne majore pas obligation principale.

## Migration Prisma requise

Je n'ai créé ni appliqué migration. Les routes et service Phase 2.4 nécessitent migration puis Prisma Client généré. La colonne obligatoire `Cotisation.tontineId` exige revue particulière : pour toute cotisation existante, migration générée doit renseigner valeur depuis `Rotation.tontineId` avant contrainte non nulle.

Depuis `C:\Users\isasa\Desktop\tontitrack_prod` :

```powershell
npx prisma migrate dev --name cotisations_retards --create-only
```

Objectif pédagogique : produire SQL Prisma sans appliquer. Résultat attendu : migration décrivant nouvelles colonnes, relation et index. Risque : si données existent, SQL direct d'ajout non nul peut échouer ou exiger backfill ; lire SQL intégralement avant toute application.

Après revue et autorisation explicite d'application :

```powershell
npx prisma migrate dev
npx prisma generate
npm run typecheck
npm run lint
npm run build
```

Objectif pédagogique : appliquer migration validée, générer client puis contrôler sources. Résultat attendu : migration et génération réussies, sans erreur TypeScript/lint/build liée Phase 2.4. Risque : migration modifie base ; ne jamais appliquer sans sauvegarde et revue propriétaire.

## Fichiers modifiés

- `prisma/schema.prisma`
- `lib/tontines/contrats.ts`
- `services/tontines.service.ts`
- `app/api/tontines/[tontineId]/cotisations/route.ts`
- `app/api/tontines/[tontineId]/cotisations/[cotisationId]/declarations/route.ts`
- `app/api/tontines/[tontineId]/cotisations/declarations/[declarationId]/route.ts`
- `app/api/taches/cotisations/route.ts`
- `app/api/notifications/route.ts`
- `app/api/notifications/[notificationId]/route.ts`
- `components/tontines/CotisationsTontine.tsx`
- `components/tontines/DetailTontine.tsx`
- `components/pages/PageNotifications.tsx`
- Documentation Phase 2.4.

## Commandes chronologiques

### Lecture exécutée par Codex

J'ai lu `AGENTS.md`, spécification Phase 2.4, documentation obligatoire, schéma Prisma, services, routes et interfaces concernées. J'ai inspecté sources modifiées. Ces lectures n'ont modifié aucun état applicatif.

### Proposée au propriétaire

Les commandes de migration, génération et validation sont préparées ci-dessus. Je ne les ai pas exécutées.

### Exécutée manuellement par propriétaire

Non déterminé : aucune sortie Phase 2.4 n'a été communiquée.

### Restante

Générer, examiner et appliquer migration seulement avec autorisation ; générer client ; exécuter validations et scénarios de `DOCUMENTATION/08_TESTS_ET_VALIDATIONS.md`. Configurer ordonnanceur externe authentifié avant toute promesse de rappels automatiques.

## Dépendances, risques et reprise

Je n'ai ajouté aucune dépendance. Risques principaux : migration non appliquée, concurrence, exposition de métadonnées privées, configuration erronée ordonnanceur et règle rappel/pénalité incomplète. Exception temporaire d'identité reste inchangée. Reprise : analyser sorties manuelles, corriger seulement causes prouvées, puis documenter résultats sans déclarer test réussi avant preuve.
