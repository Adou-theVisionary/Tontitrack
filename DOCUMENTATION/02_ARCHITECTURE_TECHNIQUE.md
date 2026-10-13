# Architecture technique

## Actuelle — Confirmé

Next.js App Router, React, TypeScript, Tailwind, Radix UI. `app/` porte routes ; `components/` interface ; `contexts/AppContext.tsx` état client ; `services/mock-api.ts` données/règles simulées ; `services/tontitrack-service.ts` est alias mock.

Prisma/PostgreSQL : `prisma/schema.prisma`, `lib/prisma.ts`, `repositories/`. Aucun endpoint API ni service métier serveur ne relie UI à repositories.

Flux actuel : composant → service mock → tableaux `lib/donnees-mock.ts` → snapshot `sessionStorage`.

Flux auth actuel : interface → routes `/api/auth` → service métier → repositories → Prisma → PostgreSQL. Interface ne doit jamais appeler Prisma/DB. Les domaines finances et tontines restent sur mock jusqu'à leurs API dédiées.

## Démarrage et rotations — Phase 2.3

Les routes Tontine sécurisées couvrent désormais vérification/démarrage, ordre bénéficiaires et consultation rotations. Le service exécute démarrage, verrouillage et création rotations dans transaction Prisma `Serializable`. Les mutations exigent session serveur, créateur lorsque nécessaire et origine même site.

Un lancement automatique n'est jamais spontané dans Next.js. Route serveur `POST /api/taches/demarrage-automatique` attend ordonnanceur externe et secret `TONTITRACK_TACHE_SECRET` dans en-tête `Authorization: Bearer`. Sans secret ou appel planifié configuré, lancement automatique reste non opérationnel.

## Cotisations et retards — Phase 2.4

Au démarrage transactionnel, service crée rotations puis cotisations PostgreSQL associées à tontine, rotation et membre. Il marque créateur non concerné pour `FIXE_CREATEUR`, bénéficiaire non concerné pour `TOURNANT_EXCLU` et personne non concernée pour `TOURNANT_INCLUS`, sans créer de dette pour ces états. Déclarations externes, décisions créateur et agrégats déclaré/confirmé passent par routes API authentifiées et transactions Prisma `Serializable`.

Tâche `POST /api/taches/cotisations` utilise même secret d'ordonnanceur que démarrage automatique. Elle crée au plus un rappel avant échéance par cotisation lors de son premier passage avant échéance, puis marque retards après échéance et délai de grâce UTC, applique une seule pénalité configurée et crée au plus une notification de retard. Son moment exact dépend de l'ordonnanceur externe : aucune cadence métier plus fine n'est inventée.

## Parcours invitations et preuves — Intervention 0028

Le middleware garde le chemin interne d'une invitation dans `retour` avant connexion, puis les formulaires connexion/inscription le valident avant redirection. Les preuves sont écrites dans un répertoire privé ignoré de Git, référencées par `Fichier` et `PreuveCotisation`, puis lues seulement par route authentifiée pour déclarant ou créateur. Un rafraîchissement client partagé s'exécute au plus toutes les 60 secondes lorsque l'onglet est visible ; il est nettoyé au démontage.

## Reversements — Phase 2.5

Les routes `/api/tontines/[tontineId]/reversements` exposent suivi collectif, déclaration créateur, décision bénéficiaire et lecture de preuve privée. Le service utilise `Decimal` Prisma, transactions `Serializable`, mise à jour conditionnelle de statut et clé `Idempotency-Key` persistée dans `OperationSynchronisation`. `DeclarationVersement`, `ConfirmationReception` par déclaration et `EvenementReversement` conservent montant, décision et historique sans paiement interne.

Le composant `ReversementsTontine` consomme uniquement ces API. Son rafraîchissement ne modifie pas formulaire de modale ouvert. Les références, moyens, observations, preuves et historique sont exclus des réponses aux membres non concernés.

## Clôture et archivage — Phase 2.6

La clôture normale passe par `POST /api/tontines/[tontineId]/cloture`, protégé par session, origine même site, confirmation explicite et contrôle créateur côté serveur. Le service relit rotations, cotisations, pénalités, déclarations, confirmations et opérations synchronisées dans une transaction Prisma `Serializable`. Une mise à jour conditionnelle de `Tontine.statut` protège les doubles demandes. La clôture crée un unique `RapportClotureTontine` contenant les totaux `Decimal` réels et l'instantané des rotations, puis verrouille la tontine en `TERMINEE` sans modifier les historiques financiers.

`POST /api/tontines/[tontineId]/archiver` est réservé au créateur et accepte seulement une tontine terminée avec rapport. Il passe le statut à `ARCHIVEE`, sans supprimer rapport, cotisations, reversements ni justificatifs privés. Les membres approuvés gardent consultation via les routes existantes. L'interface consomme seulement ces API, affiche l'onglet Clôture et distingue les archives dans la liste.

## Authentification serveur

Inscription crée transactionnellement `Utilisateur`, `Profil` et `VerificationEmail`. Connexion vérifie hash scrypt, statut compte et crée session aléatoire. Base conserve seulement empreinte SHA-256 du jeton. Cookie session est `HttpOnly`, `SameSite=Lax` et `Secure` en production. Layout `(application)` vérifie session côté serveur ; état React ne décide jamais accès.

## État migration

Migrations appliquées selon résultat manuel communiqué : initiale et `20261010135535_alignement_modele_metier`. Le statut Prisma doit être reconfirmé manuellement avant toute nouvelle évolution.

Phase 2.4 ajoute champs `Cotisation` et `DeclarationCotisation`, dont `Cotisation.tontineId` requis. Migration générée doit impérativement traiter cotisations existantes : renseigner `tontineId` depuis rotation avant contrainte non nulle. Aucune migration n'est créée ou appliquée par cette intervention.

## Conventions

Nouveaux noms métier/commentaires en français si compatible. Ne pas coupler composants à Prisma. Ne pas supprimer `TontiTrackApp.tsx` legacy sans preuve d'inutilisation.
