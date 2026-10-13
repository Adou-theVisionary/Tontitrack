# Architecture technique

## Phase 3.1 — Administration globale

J'ai ajouté une frontière serveur distincte pour `/administration-plateforme`. Le layout vérifie la session puis les rôles globaux persistés ; chaque route `/api/administration/*` revérifie session, permission, origine des mutations et limite locale de requêtes. Le frontend n'accède jamais à Prisma.

Le registre `lib/administration/permissions.ts` centralise droits, rôles et modules. L'absence de droit est un refus. Les rôles `SUPER_ADMIN`, `ADMIN_SUPPORT` et `ADMIN_AUDIT` sont indépendants des rôles `CREATEUR`/`MEMBRE` d'une tontine. J'ai conservé `EvenementAudit` comme journal append-only, enrichi avec module, autorisation, résultat et motif. La suspension invalide les sessions et le dernier Super Admin actif est protégé dans une transaction sérialisable.

L'interface réemploie `Logo`, Tailwind, composants Radix, `Button`, `Table`, `Dialog` et les états UI existants. Je conserve palette verte, fonds chauds, rayons et grille responsive de l'application utilisateur plutôt que de créer une charte administrative séparée.

## Correction redirection après authentification — 13/10/2026

J'ai centralisé le choix de destination dans `lib/navigation/destination-authentification.ts`. La route de connexion relit les rôles persistés au moment de l'authentification, les convertit en permissions via le registre puis retourne une destination interne autorisée. Un rôle disposant de `plateforme.tableau_de_bord.lire`, dont `SUPER_ADMIN`, arrive dans `/administration-plateforme` lorsqu'aucun retour autorisé n'est demandé. Un utilisateur standard arrive dans `/tableau-de-bord`.

Une destination demandée est conservée seulement si elle est interne, autorisée pour les permissions relues et compatible avec les chemins prévus. `/administration-plateforme` est donc conservé pour un administrateur autorisé mais ignoré pour un utilisateur standard. Les layouts et routes API continuent de contrôler session et permissions : la destination ne constitue pas une preuve d'accès.

## Actuelle — Confirmé

Next.js App Router, React, TypeScript, Tailwind, Radix UI. `app/` porte routes ; `components/` interface ; `contexts/AppContext.tsx` état client ; `services/mock-api.ts` données/règles simulées ; `services/tontitrack-service.ts` est alias mock.

Prisma/PostgreSQL : `prisma/schema.prisma`, `lib/prisma.ts`, `repositories/`. Les domaines authentification, Tontines et administration passent par routes API, services métier et repositories côté serveur ; l'interface ne contacte jamais ces couches directement.

Flux encore temporaire pour Finances : composant → service mock → tableaux `lib/donnees-mock.ts` → snapshot `sessionStorage`. Les flux authentification, Tontines et administration utilisent les API sécurisées.

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
