# Intervention 0012 — Correction schéma Prisma Phase 2.2

## Cause

La commande manuelle `npx prisma migrate dev --name configuration_tontines_adhesions --create-only` a échoué avec P1012. Les six enums ajoutés en Phase 2.2 plaçaient plusieurs valeurs sur une même ligne. Prisma exige une valeur par ligne dans corps d'un enum.

## Correction

J'ai réécrit `VisibiliteTontine`, `ModeDemarrageTontine`, `StrategieAdhesion`, `MethodeOrdreBeneficiaires`, `StatutInvitationTontine` et `StatutDemandeAdhesion` avec une valeur distincte par ligne. Je n'ai changé aucun nom ni aucune valeur métier.

J'ai inspecté autres enums : ils utilisent déjà format valide, une valeur par ligne. J'ai aussi comparé contrats TypeScript et service : valeurs `PUBLIQUE`, `PRIVEE`, `MANUEL`, `AUTOMATIQUE`, stratégies et statuts correspondent aux noms du schéma.

## Fichiers

- `prisma/schema.prisma`
- `DOCUMENTATION/INTERVENTIONS/0011_IMPLEMENTATION_PHASE_2_2.md`
- `DOCUMENTATION/INTERVENTIONS/0012_CORRECTION_SCHEMA_PRISMA_PHASE_2_2.md`
- `DOCUMENTATION/06_JOURNAL_DE_DEVELOPPEMENT.md`
- `DOCUMENTATION/08_TESTS_ET_VALIDATIONS.md`

## Commandes

- **Lecture exécutée par moi** : `AGENTS.md`, schéma, contrats, service et rapport 0011.
- **Exécutée manuellement par propriétaire** : génération `--create-only`, échec P1012 communiqué.
- **Proposée au propriétaire** : commande ci-dessous.
- **Restante** : lecture SQL, application validée, génération Prisma Client et validations.

Depuis `C:\Users\isasa\Desktop\tontitrack_prod` :

```powershell
npx prisma migrate dev --name configuration_tontines_adhesions --create-only
```

Rôle : valider schéma et générer SQL sans appliquer migration. Résultat attendu : dossier migration et `migration.sql`, sans P1012. Risque : crée fichiers et utilise shadow database ; ne pas appliquer SQL sans revue.

Après revue explicite du SQL :

```powershell
npx prisma migrate dev
npx prisma generate
npm run typecheck
npm run lint
npm run build
```

Ces commandes restent non exécutées. Migration modifie base PostgreSQL ; build crée artefacts locaux.
