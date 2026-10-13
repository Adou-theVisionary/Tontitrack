# Journal développement

## Intervention 0032 — Clôture et archivage des tontines

J'ai ajouté une clôture normale transactionnelle, un rapport immuable des montants et rotations réels, puis un archivage distinct sans suppression. Je bloque les opérations financières après clôture et j'affiche les conditions, blocages, rapport, résultat membre et archives. La migration du rapport est préparée, mais ni appliquée ni validée techniquement. Une contestation reste bloquante car aucun statut de règlement sûr n'existe dans le modèle actuel.

## Intervention 0031 — Correction TypeScript des tests de reversements

J'ai restreint explicitement l'union discriminée des décisions de réception avant de lire le montant confirmé. J'ai aussi fait vérifier séparément la branche de contestation et son motif. Le propriétaire m'a communiqué que la migration des reversements a été appliquée, que le schéma Prisma est valide et que Prisma Client a été généré ; le typecheck avait toutefois échoué avant cette correction. Je dois relancer manuellement les validations techniques.

## Intervention 0030 — Reversements aux bénéficiaires

J'ai complété le suivi déclaratif des reversements externes : montants décimaux, déclaration créateur, confirmation ou contestation bénéficiaire, preuves privées, historique, notifications et interface réelle. J'ai préparé migration dédiée sans l'appliquer. Revue SQL, Prisma Client et validations manuelles restent nécessaires.

## Intervention 0029 — Correction JSX aperçu des cotisations

J'ai corrigé une accolade surnuméraire qui interrompait la branche membre de l'aperçu et empêchait TypeScript de lire le JSX. J'ai restructuré les états de chargement, erreur, créateur et membre, puis vérifié que l'API alimente les montants et déclarations réels. La relance manuelle du typecheck, du lint et du build reste nécessaire.

## Intervention 0028 — Corrections UX et parcours utilisateurs

J'ai conservé les liens d'invitation après connexion ou inscription, redirigé une acceptation confirmée vers la tontine, ajouté rafraîchissement visible, une modale de déclaration et justificatifs images privés. J'ai aussi ajouté un aperçu réel de suivi. Migration Phase 2.4, stockage persistant et validations manuelles restent nécessaires.

## Intervention 0027 — Compatibilité TypeScript des rotations

J'ai remplacé l'itération `beneficiaires.entries()` incompatible avec la cible TypeScript par un index numérique. J'ai vérifié les nouvelles itérations rotations/cotisations : aucune autre boucle `.entries()` n'est présente. Le typecheck manuel avait signalé TS2802 ; sa relance reste nécessaire.

## Intervention 0026 — Cotisations et gestion des retards

J'ai créé cotisations lors démarrage, déclarations externes, confirmation/rejet créateur, suivi collectif réel, rappel unique avant échéance, retards après grâce, pénalité unique et tâche sécurisée de notifications. Migration Prisma manuelle, ordonnanceur externe et validations restent nécessaires. Aucun paiement réel ni reversement n'est créé.

## Intervention 0025 — Exception temporaire identité

J'ai documenté obligation finale de dépôt d'une pièce d'identité pour création, demande, acceptation et adhésion à une tontine. Je suspends volontairement ce contrôle pendant tests multi-comptes. Cette exception ne peut pas partir en production : contrôle serveur et tests réussis restent prérequis.

## Intervention 0024 — Création Tontine et validation

J'ai aligné validation du formulaire de création sur contrat Zod. Le formulaire bloque désormais nom trop court, participants hors plage ou non entiers, montant non positif, date non future et fuseau absent. Route retourne détails Zod par champ, puis interface ouvre étape concernée et affiche erreurs près des champs. Validation technique et parcours navigateur restent manuels.

## Intervention 0023 — ESLint Phase 2.3

J'ai échappé quatre apostrophes JSX signalées et remplacé trois images locales par `next/image`. Dimensions et classes existantes sont conservées. Nouvelle exécution ESLint et build restent manuelles.

## Intervention 0022 — Correction syntaxe TypeScript Phase 2.3

J'ai reformatté requête Prisma `detail` et corrigé accolades manquantes autour de `include`. Filtres membres, utilisateurs actifs, invitations et comptage sont préservés. Nouvelle validation manuelle reste nécessaire.

## Intervention 0021 — Démarrage et rotations Tontine

J'ai ajouté démarrage transactionnel, ordre manuel/aléatoire sécurisé, rotations PostgreSQL, routes protégées et écran réel. Je n'ai créé aucune opération financière ni migration. Lancement automatique exige ordonnanceur externe configuré ; validations techniques restent manuelles.

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
