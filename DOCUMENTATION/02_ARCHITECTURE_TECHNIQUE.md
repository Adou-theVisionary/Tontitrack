# Architecture technique

## Modernisation UX/UI — thèmes et fondations

J'ai centralisé les thèmes dans `components/theme/ThemeProvider.tsx`, basé sur `next-themes` déjà installé. Le fournisseur applique la classe clair ou sombre sur le document, conserve la préférence côté navigateur et suit le système lorsque choisi. `app/layout.tsx` englobe l'application, le sélecteur public et les notifications dans ce fournisseur ; `suppressHydrationWarning` et le montage différé du sélecteur préviennent un désaccord d'hydratation.

Les jetons sémantiques de `app/globals.css` alimentent Tailwind dans les modes clair et sombre. Les coques utilisateur et administrative portent leur sélecteur dans l'en-tête et le menu mobile, tandis que le contrôle public évite les doublons sur les espaces authentifiés. Le frontend reste sans accès Prisma ou PostgreSQL. Voir `10_MODERNISATION_UX_UI.md` et l'intervention 0037.

## Gouvernance plateforme Phase 3.1.1

J'ai conservé la frontière serveur : les écrans d'administration passent exclusivement par les routes `/api/administration`, lesquelles vérifient session, origine, limite locale, permission et validation Zod. Les services portent les transactions sérialisables, l'audit et les protections métier. Le schéma ajoute les rôles personnalisés, la configuration de module, le paramètre global, les litiges, les incidents et l'état administratif distinct d'une tontine ; ils nécessitent la migration préparée avant toute utilisation.

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

## Thèmes et surfaces — Intervention 0038

Le thème applicatif est porté par `ThemeProvider` et `next-themes` sur l'élément HTML. `app/globals.css` définit les jetons clair/sombre d'arrière-plan, contenu, cartes, popovers, statuts et trois niveaux de surfaces ; `tailwind.config.ts` les expose aux composants. Les portails Radix utilisent `bg-popover`/`text-popover-foreground`, ce qui les rattache au même thème que leur page.

Les composants historiques qui gardent une valeur hexadécimale sont couverts en thème sombre par une compatibilité CSS ciblée, limitée à `.dark`. Cette couche est transitoire et ne remplace pas une migration source vers les jetons. Le défilement horizontal global ne doit pas être masqué : chaque tableau large l'encapsule localement dans `Table`, tandis que les dialogues limitent leur hauteur à la fenêtre.

## Responsive et interactions — Intervention 0039

`AppShell` et `AppShellAdministration` concentrent la navigation responsive : barre latérale à partir de `lg`, en-tête compact avant ce seuil, tiroir mobile à largeur bornée, fermeture par voile, bouton et touche Échap. La navigation utilisateur fixe tient compte de la zone de sécurité inférieure et le contenu garde une marge basse correspondante.

`Table` impose une zone de défilement horizontale locale, tactile et focalisable, avec une largeur minimale lisible. Les dialogues et modales utilisent `100dvh`, un défilement interne et des actions empilées avant `sm`. Les animations de l'interface sont limitées à l'opacité et au transform, et la règle globale `prefers-reduced-motion` les réduit ; aucun comportement métier ne dépend d'une animation.

## Mouvement et retours UI — Intervention 0040

`app/globals.css` porte les durées `--duree-micro-interaction`, `--duree-transition`, `--duree-panneau` et la courbe `--easing-naturel`. Les composants partagés les consomment par classes Tailwind et restent sans bibliothèque d'animation. `surface-interactive` est volontairement opt-in : seules les surfaces qui mènent à une action peuvent se soulever légèrement au survol, sans modifier les montants ou les historiques financiers.

Les primitives Radix conservent leur gestion du focus, des portails et des états ouverts/fermés. Dialogues, panneaux, listes déroulantes, sélecteurs, onglets et toasts ajoutent seulement des entrées/sorties courtes. Les états de chargement, erreur, vide et synchronisation utilisent des rôles de statut ou d'alerte et des apparitions non bloquantes. La règle globale de réduction de mouvement demeure prioritaire : aucun contrôle, état, succès ou erreur ne dépend d'une animation.

## Conventions

Nouveaux noms métier/commentaires en français si compatible. Ne pas coupler composants à Prisma. Ne pas supprimer `TontiTrackApp.tsx` legacy sans preuve d'inutilisation.
