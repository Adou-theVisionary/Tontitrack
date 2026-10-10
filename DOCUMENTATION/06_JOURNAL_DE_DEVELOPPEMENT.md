# Journal développement

## Intervention 0020 — Deux erreurs TypeScript Tontine

J'ai encapsulé adaptateur dans fonction `map` et importé icône `Copy` manquante. Typecheck manuel reste à relancer.

## Intervention 0019 — Interfaces Tontine réelles

J'ai connecté invitations, membres, demandes et paramètres d'adhésion aux API Tontine. Le consentement est explicite et non précoché. Rotations, cotisations et versements restent hors périmètre. Validations techniques et navigateur restent manuelles.

## Intervention 0018 — Correction Zod modification Tontine

J'ai séparé objet Zod de base des effets de validation. Création conserve invariants; modification est partielle et résultat fusionné est revalidé côté serveur avant écriture. Typecheck manuel reste à relancer.

## Intervention 0017 — Backend invitations

J'ai ajouté acceptation, refus, révocation, expiration et cinq routes API d'invitation. Sessions, destinataires, jetons de lien, consentement, capacité et secrets sont contrôlés côté serveur. Validations TypeScript, lint, build et scénarios API restent manuels.

## Phase 2.2.1 — Correction P1012

J'ai corrigé format des six enums ajoutés pour Phase 2.2. Aucune migration n'a été créée ni appliquée. Génération manuelle et revue SQL restent nécessaires.

## Phase 2.2 — Modèles et API Tontine

J'ai préparé extension Prisma et premières routes sécurisées de création, consultation, catalogue, invitation et demande. Migration et génération Prisma Client restent prérequis de validation.

## Phase 2.2 — Prérequis schéma

J'ai constaté que schéma Tontine actuel ne permet pas création configurée, invitations ciblées ni demandes d'adhésion réelles. Je n'ai pas contourné absence par mocks, `any` ou SQL brut. Une migration Prisma contrôlée est prérequis avant implémentation complète.

## Phase 2.1.1 — Correction scrypt TypeScript

J'ai remplacé promesse inférée de manière incomplète par enveloppe explicite de signature asynchrone Node. Paramètres `N=16384`, `r=8`, `p=1`, `maxmem=64 MiB`, format de hash et comparaison constante sont préservés. Contrôles TypeScript, lint et build restent à exécuter manuellement.

## Phase 2.1 — Authentification réelle

J'ai remplacé accès démo automatique par sessions serveur Prisma. Inscription, connexion, session, déconnexion et protection serveur des routes applicatives sont préparées. Les interfaces finances et tontines restent mocks après authentification ; vérifications e-mail/téléphone et récupération mot de passe restent hors phase.

## Phase 1.4 — Préparation migration d'alignement Prisma

J'ai préparé revue contrôlée de migration d'alignement sans modifier PostgreSQL. Contrôle manuel communiqué confirme que 18 tables applicatives sont vides. Une sauvegarde existe et son inventaire est valide, mais restauration complète reste à tester.

Je n'ai pas créé SQL approximatif. SQL devra être généré par Prisma avec `--create-only`, lu intégralement et validé avant application. Risques prioritaires concernent enums, suppressions, colonnes obligatoires, contraintes uniques et clés étrangères de `Utilisateur`, `Rotation`, `ConfirmationReception` et `TransactionFinanciere`.

| Date | Intervention | État |
|---|---|---|
| 15/09/2026 | Lots frontend, routage, Prisma initial selon documentation existante | Historique documenté, voir `docs/ETAT_PROJET_TONTITRACK.md` |
| 10/10/2026 | Audit intégral statique | Terminé : `AUDIT_PROJET/` |
| 10/10/2026 | Documentation et traçabilité permanente | Terminé : `INTERVENTIONS/0001_DOCUMENTATION_TRACABILITE.md` |
| 10/10/2026 | Phase 1 — diagnostic et stabilisation technique | Terminé, sans correction code : `INTERVENTIONS/0002_DIAGNOSTIC_STABILISATION_PHASE_1.md` |
| 10/10/2026 | Phase 1.1 — diagnostic Prisma/PostgreSQL | Terminé : `INTERVENTIONS/0003_DIAGNOSTIC_PRISMA_POSTGRESQL.md` |
| 10/10/2026 | Règle permanente : exécution manuelle commandes techniques | Terminé : `INTERVENTIONS/0004_EXECUTION_MANUELLE_COMMANDES.md` |
| 10/10/2026 | Phase 1.2 — préparation alignement Prisma | Terminé, aucune migration créée : `INTERVENTIONS/0005_PREPARATION_ALIGNEMENT_PRISMA.md` |
| 10/10/2026 | Phase 1.3 — harmonisation documentaire et stratégie migration | Terminé, aucune migration créée : `INTERVENTIONS/0006_HARMONISATION_DOCUMENTAIRE_MIGRATION.md` |

Ne pas ajouter entrée sans rapport intervention associé.
