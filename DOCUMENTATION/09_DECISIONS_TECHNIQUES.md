# Décisions techniques

## Thèmes globaux fondés sur jetons — 14/10/2026

Décideur : propriétaire, par demande de modernisation UX/UI. J'utilise `next-themes`, déjà présent, plutôt qu'un stockage PostgreSQL ou une dépendance nouvelle. Cette solution garde la préférence dans le navigateur, suit le système lorsque demandé et applique une seule classe de thème à l'ensemble de la plateforme. Je conserve les tokens sémantiques dans les styles globaux et les expose à Tailwind ; les composants ne doivent pas créer leur propre gestionnaire de thème.

Je privilégie un contrôle natif accessible pour Clair, Sombre et Système. J'écarte une palette nouvelle ou un thème indépendant pour l'administration afin de préserver l'identité TontiTrack et la cohérence entre espaces. Impact : les composants futurs doivent employer les jetons, tandis que la migration des couleurs littérales existantes reste progressive et vérifiable. Voir `INTERVENTIONS/0037_MODERNISATION_UX_UI_FONDATIONS.md`.

## Contrats administratifs attendus avant rendu — 14/10/2026

Décideur : propriétaire, par demande d'audit. Je traite toute réponse administrative comme non fiable côté interface, même lorsqu'elle provient d'une route interne. Une route asynchrone attend son service avant sérialisation ; le composant vérifie ensuite l'enveloppe et les collections indispensables avant de les parcourir. Cette double protection évite une erreur de rendu sans masquer une erreur serveur.

Je conserve l'autorisation comme responsabilité serveur. Masquer une action sans permission améliore le parcours, mais ne remplace jamais la session, le contrôle de permission, les transactions ni la protection du dernier Super Admin. Voir `INTERVENTIONS/0036_AUDIT_CORRECTION_SUPER_ADMIN.md`.

## Gouvernance Super Admin additive et sans mutation financière — 14/10/2026

Décideur : propriétaire, par demande Phase 3.1.1. Je sépare les rôles personnalisés des rôles système et conserve `SUPER_ADMIN` comme rôle critique non constructible indirectement. Chaque permission est déclarée avec identifiant stable, module et description ; une permission inconnue reste refusée. Les modifications sensibles exigent un motif et sont auditées.

Je représente la suspension administrative d'une tontine hors de son statut financier afin de ne pas réécrire les rotations, montants, confirmations ou historiques. Elle bloque les opérations compatibles au niveau service et ne constitue pas une clôture ni une régularisation. Les litiges administratifs conservent leurs notes et transitions ; ils ne modifient aucune écriture financière. Voir `INTERVENTIONS/0035_GOUVERNANCE_SUPER_ADMIN.md`.

## Destination post-authentification calculée côté serveur — 13/10/2026

Décideur : propriétaire, par demande de correction. Je décide la destination après authentification dans la route serveur à partir des rôles persistés et du registre de permissions, plutôt que dans le composant de connexion. Cette décision évite que l'interface doive connaître ou interpréter les rôles, tout en préservant une extension future vers d'autres espaces et permissions.

Je conserve un retour interne demandé lorsqu'il est autorisé ; je refuse les URL externes et tout retour administratif sans permission de tableau de bord plateforme. Les layouts et API réappliquent leurs protections : la redirection améliore seulement le parcours et n'octroie aucun droit. Voir `INTERVENTIONS/0034_CORRECTION_REDIRECTION_AUTHENTIFICATION.md`.

## Administration globale par rôles persistés et refus par défaut — 13/10/2026

Décideur : propriétaire, par demande Phase 3.1. Je sépare strictement rôles de plateforme et rôles de tontine. Une attribution active persistée porte uniquement `SUPER_ADMIN`, `ADMIN_SUPPORT` ou `ADMIN_AUDIT`; les permissions sont déclarées explicitement dans un registre serveur. L'absence de permission vaut refus, afin qu'un nouveau module ne devienne jamais accessible par défaut.

Je garde le premier Super Admin hors de l'inscription publique : il est amorcé manuellement sur un compte actif explicitement identifié, sans secret ou identifiant codé en dur. La transaction sérialisable refuse un second amorçage et protège le dernier Super Admin actif d'une suspension ou d'un retrait concurrent. Toute modification de rôle ou de statut est auditée et la suspension invalide les sessions.

Je limite la première spécialisation au module réellement disponible, Tontines, en lecture de supervision. Je n'accorde aucune mutation financière ni accès aux preuves privées depuis le Super Admin. Critère avant production : migration revue et appliquée sur environnement approprié, amorçage tracé, contrôle de permissions et concurrence validés, limite distribuée choisie pour le déploiement multi-instance et parcours manuels réussis. Voir `INTERVENTIONS/0033_ADMINISTRATION_GLOBALE_SUPER_ADMIN.md`.

## Clôture normale, rapport immuable et archivage — 13/10/2026

Décideur : propriétaire, par demande Phase 2.6. Je distingue clôture et archivage : la clôture vérifie toutes les données financières réelles puis produit un unique rapport ; l'archivage intervient seulement après cette clôture et ne supprime rien. Je conserve les statuts `TERMINEE` et `ARCHIVEE` déjà présents au lieu d'ajouter un état financier parallèle.

Je réalise la clôture dans une transaction `Serializable` et verrouille la transition `ACTIVE` vers `TERMINEE` par mise à jour conditionnelle. Le rapport persiste les agrégats `Decimal` et un instantané de rotations. Les déclarations et décisions financières relisent le statut de la tontine et refusent toute opération après clôture. Cela empêche une modification tardive sans altérer l'historique antérieur.

Je ne crée aucune clôture forcée. Une contestation `CONTESTE` ou confirmation `NON_RECUE` bloque la clôture : le modèle ne fournit ni état de règlement ni lien fiable entre contestation et régularisation. Déduire une résolution depuis un nouveau reversement masquerait potentiellement un litige. Une procédure de règlement explicite devra être validée avant de lever ce blocage. Voir `INTERVENTIONS/0032_CLOTURE_ARCHIVAGE_TONTINES.md`.

## Reversements déclaratifs, confirmation par déclaration et idempotence — 12/10/2026

Décideur : propriétaire, par demande Phase 2.5. Je conserve le transfert hors application : le créateur déclare montant, date, moyen, référence facultative, observation et preuve privée. Seul bénéficiaire de rotation décide chaque déclaration ; confirmation partielle stocke montant réellement reçu, contestation reste distincte et ne crée jamais réception. Cette granularité remplace confirmation unique par rotation, qui ne permettait ni reversements successifs ni désaccord non destructif.

Je calcule disponibilité par `Decimal` Prisma : cotisations confirmées moins reversements non contestés. Je conserve configuration verrouillée des reversements partiels. Les transactions `Serializable`, mises à jour conditionnelles et `OperationSynchronisation` liée à `Idempotency-Key` protègent concurrence et répétition. Une contestation libère une nouvelle déclaration de régularisation mais reste dans historique ; ce choix évite blocage sans effacer désaccord.

La migration Phase 2.5 s'arrête si une ancienne confirmation ne peut pas être rattachée sûrement à un reversement. Je préfère ce blocage à une association financière inventée. Critère d'application : sauvegarde vérifiée, migrations 2.4/2.5 relues, ambiguïtés résolues, Prisma Client généré et tests de permissions/monnaie réussis. Voir `INTERVENTIONS/0030_REVERSEMENTS_BENEFICIAIRES.md`.

## Parcours invitation, preuves privées et Super Admin futur — 12/10/2026

Décideur : propriétaire, par demande intervention 0028. Je conserve uniquement destinations internes autorisées après authentification, afin de préserver invitation sans redirection ouverte. Je stocke preuves dans répertoire privé contrôlé par API et signature binaire, plutôt que `public/` ou Git. Le chemin local exige un volume persistant en production.

Je réserve un espace Super Admin TontiTrack distinct des créateurs et membres. Je ne l'implémente pas maintenant : périmètre, rôles, audit, accès aux données sensibles et règles d'exploitation doivent être validés avant toute route ou interface.

## Cotisations transactionnelles et pénalité unique — 12/10/2026

Décideur : propriétaire, par règles Phase 2.4. Je crée une cotisation pour chaque obligation au démarrage transactionnel, jamais avant. Je conserve trois montants distincts : attendu, déclaré et confirmé. Déclaration reste preuve déclarative ; seule confirmation créateur augmente collecte de rotation. Je protège décisions par transaction `Serializable` et mise à jour conditionnelle de statut.

J'applique pénalité fixe configurée une seule fois après échéance et délai de grâce UTC. Elle est historiquement séparée du principal et ne modifie pas montant reçu : règle de recouvrement reste non définie. Alternative écartée : calculer pénalité répétée ou l'ajouter au principal sans règle validée. Impact : suivi fiable du retard et un rappel unique au premier passage avant échéance ; une cadence métier reste à définir.

Route tâche cotisations exige secret d'ordonnanceur externe. Critère opérationnel : migration appliquée, Prisma Client généré, ordonnanceur configuré et tests concurrence/notifications réussis. Voir `INTERVENTIONS/0026_COTISATIONS_RETARDS.md`.

## Exception temporaire de dépôt identité — 12/10/2026

Décideur : propriétaire. Contexte : les tests fonctionnels exigent plusieurs comptes et le dépôt de pièce freinerait création, demande, acceptation et adhésion. Je maintiens donc ces quatre actions accessibles sans pièce pendant développement uniquement.

Cette décision ne signifie pas que vérification d'identité est implémentée ni qu'elle est levée comme exigence produit. Dépôt d'une pièce signifie document disponible ; vérification effective signifie validation distincte de document et reste à préciser. Alternative retenue : suspension temporaire documentée plutôt que suppression de l'exigence finale. Impact : risque d'accès non vérifié, acceptable seulement hors production.

Avant production, je mets en place contrôle serveur pour les quatre actions, protège confidentialité des documents, fixe statuts dépôt/vérification puis réussis tests de refus sans pièce et d'autorisation après dépôt. Critère de levée : contrôle serveur effectif et tests réussis. Voir `INTERVENTIONS/0025_EXCEPTION_TEMPORAIRE_IDENTITE.md`.

## Démarrage et rotations transactionnels — 12/10/2026

Je réalise démarrage, verrouillage et création rotations dans transaction Prisma `Serializable`. Contraintes uniques existantes sur rotation et mise à jour conditionnelle du statut protègent double lancement. Je conserve montants théoriques seulement : aucune cotisation, déclaration ou réception n'est fabriquée au démarrage. Ordre aléatoire utilise `crypto.randomInt` avec Fisher-Yates côté serveur. Voir `INTERVENTIONS/0021_DEMARRAGE_ROTATIONS_TONTINE.md`.

## Démarrage automatique déclenché hors Next.js — 12/10/2026

Je fournis route interne protégée par secret d'environnement pour ordonnanceur externe. Je ne planifie pas tâche dans processus Next.js, car durée de vie serveur n'est pas garantie. Secret n'est jamais inscrit dans dépôt. L'automatisation ne devient opérationnelle qu'après configuration déploiement et contrôle manuel documenté.

## Interfaces Tontine reliées aux API — 10/10/2026

Je détermine rôle créateur depuis identifiant utilisateur de session comparé à `createurId` retourné par API. Je conserve API comme autorité : interface améliore parcours mais ne remplace jamais permission, capacité, consentement ou verrouillage serveur. Jeton lien est conservé seulement dans état navigateur après création et transmis uniquement à action d'invitation. Voir `INTERVENTIONS/0019_INTERFACES_INVITATIONS_MEMBRES_ADMINISTRATION.md`.

## Schémas Tontine composables — 10/10/2026

Je construis variantes Zod depuis `tontineBaseSchema` avant application de `refine`. Les effets de création ne sont pas réutilisables pour composer un objet partiel. Je revalide côté service configuration complète fusionnée avec données PostgreSQL afin de préserver invariants des modifications partielles. Voir `INTERVENTIONS/0018_CORRECTION_ZOD_MODIFICATION_TONTINE.md`.

## Invitations Tontine — 10/10/2026

Je garde jeton brut uniquement dans réponse de création au créateur afin qu'il le partage par canal choisi. PostgreSQL conserve seulement empreinte SHA-256. Les actions d'une invitation par lien exigent jeton et utilisent comparaison constante. Les mutations d'acceptation utilisent transaction `Serializable` afin de protéger capacité contre concurrence. Voir `INTERVENTIONS/0017_BACKEND_INVITATIONS.md`.

## Authentification Phase 2.1

Je conserve Prisma côté serveur. Les routes auth appellent service métier puis repositories. Les mots de passe utilisent scrypt natif avec sel aléatoire ; les sessions utilisent jeton aléatoire dont seule empreinte est persistée. Cookie ne contient aucune donnée personnelle.

Je n'ajoute pas bcrypt : dépendance nouvelle non nécessaire, `crypto.scrypt` étant disponible. Je limite tentatives en mémoire pour environnement local ; solution partagée reste obligatoire avant déploiement multi-instance.

## Migration d'alignement Prisma : SQL généré, jamais déduit

Je décide de ne pas écrire manuellement migration d'alignement lorsque sortie exacte de `prisma migrate diff` n'est pas archivée. Écarts combinent enums, relations, contraintes et colonnes obligatoires. SQL sera généré avec `prisma migrate dev --create-only`, revu puis appliqué seulement après validation explicite.

Base de développement est vide au contrôle communiqué et sauvegardée. Cette situation réduit risque de données, mais ne dispense pas revue opérations `DROP`, conversions d'enums et nouvelles contraintes.

| Décision | État | Justification / source |
|---|---|---|
| Priorité Tontine | Validée propriétaire | Finances reportées ; voir présentation |
| Paiements futurs, non présents | Validée propriétaire | Ne pas introduire transfert interne maintenant |
| Interface jamais Prisma/DB | À préserver | Architecture cible/audit |
| Prisma Migrate seulement | À préserver | Pas `db push`/reset pour contourner migration |
| XOF et fuseaux IANA | À préserver | Schéma et audit antérieur |
| Mock temporaire | À remplacer plus tard | Service actuel alias `mockApi` |
| Documentation intervention obligatoire | Validée propriétaire | `AGENTS.md` et ce dossier |
| Exécution manuelle commandes techniques | Validée propriétaire | Je lance moi-même npm, Prisma, SQL, tests, builds, serveurs et toute commande à effet potentiel ; les analyses ne réalisent que lectures sans effet de bord |
| Alignement Prisma séparé des évolutions Tontine | Validée phase préparation | Corriger d'abord décalage schéma/migration ; config publique, retards, permissions et règles financières dans lots futurs distincts |

Nouvelles décisions doivent indiquer date, décideur, contexte, alternatives, impact et rapport associé.

## Thème sombre par jetons et compatibilité transitoire ciblée — 14/10/2026

Décideur : propriétaire, par demande d'intervention B. Je conserve l'identité visuelle actuelle de TontiTrack et j'étends le système de jetons avec trois niveaux de surfaces : fond, carte rehaussée et panneau discret. Les nouveaux composants doivent employer ces jetons, les statuts sémantiques et les couleurs `popover` afin que les portails Radix suivent le thème actif.

De nombreux composants métier précédents contiennent toutefois des couleurs hexadécimales locales. Les convertir tous immédiatement multiplierait le risque de régression visuelle et fonctionnelle. J'ajoute donc une compatibilité explicitement limitée à `.dark` qui associe ces anciennes valeurs aux jetons correspondants. Ce n'est ni une inversion CSS ni un filtre global : les couleurs de statut restent sémantiques et le thème clair demeure inchangé. Cette décision est transitoire ; toute retouche de composant concerné doit remplacer ses valeurs locales par les jetons.

Je ne masque pas le débordement horizontal globalement, car ce choix cache les défauts de responsive. Les tables conservent un défilement local et les modales sont limitées à la fenêtre disponible. La préférence de thème appartient exclusivement à `next-themes`, y compris depuis Paramètres, afin que Clair, Sombre et Système restent cohérents. Critère de maintien : revue visuelle manuelle complète, contraste suffisant et absence de surface claire non intentionnelle en mode sombre. Voir `INTERVENTIONS/0038_RESPONSIVE_THEME_SOMBRE_UX.md`.

## Tables lisibles, actions empilées et mouvement réduit — 14/10/2026

Décideur : propriétaire, par demande d'intervention C. Je privilégie une table à largeur minimale avec défilement horizontal local plutôt que des colonnes comprimées ou supprimées. Les données, recherches, pagination et actions restent donc accessibles, même à 320 px. Les formulaires et dialogues gardent une colonne avant `sm`, une hauteur dynamique et des actions empilées ; cette composition prévaut sur une disposition horizontale fragile.

Je limite les mouvements à 200 ms, `opacity`, `transform` et transitions de couleur. Toute animation respecte `prefers-reduced-motion` et aucun statut fonctionnel ne dépend de sa lecture. Les en-têtes mobiles n'affichent que les contrôles essentiels, tandis que le tiroir conserve les destinations complètes et se ferme aussi avec Échap. La validation reste visuelle et manuelle selon la matrice 0039 ; voir `INTERVENTIONS/0039_RESPONSIVE_APPROFONDI_ANIMATIONS.md`.

## Mouvement réutilisable, opt-in et non financier — 14/10/2026

Décideur : propriétaire, par demande d'intervention D. Je fixe trois durées partagées : 150 ms pour une micro-interaction, 200 ms pour une transition ordinaire et 280 ms pour un panneau. J'emploie une même courbe naturelle et je privilégie opacité, transformation, couleur, bordure et ombre. Je n'ajoute pas de bibliothèque : Tailwind, CSS et les primitives Radix existantes suffisent, sans coût de chargement supplémentaire.

Je réserve l'élévation de carte à `surface-interactive`, donc aux surfaces qui sont effectivement cliquables. Les montants, graphiques, confirmations et résultats financiers ne sont jamais interpolés ni annoncés avant réponse du serveur. Les erreurs et les statuts gardent toujours texte, rôle et focus accessibles ; `prefers-reduced-motion` les rend immédiatement stables. Voir `INTERVENTIONS/0040_ANIMATIONS_MICRO_INTERACTIONS.md`.
