# Règles métier Tontine

## Décisions validées par propriétaire

- Tout utilisateur inscrit peut créer tontine ; créateur administre ses propres tontines.
- Tontine publique ou privée. Adhésion par invitation ou demande selon paramètres.
- Lancement manuel ou automatique.
- Ordre bénéficiaires tournants manuel ou aléatoire.
- Retards : rappels, grâce et pénalités configurables.
- Départ libre avant démarrage ; encadré après lancement.
- Exclusion décidée administrateur avant démarrage ; procédure spéciale après.
- Remplacement encadré, avec accords appropriés.
- Règles financières verrouillées au démarrage.
- Membre verse cotisation créateur ; créateur collecte puis reverse bénéficiaire.
- Créateur confirme réception cotisations ; bénéficiaire confirme réception reversements.
- Reversement partiel autorisé/interdit selon configuration définie avant lancement.
- Visibilité collective sur cotisations, collecte et reversements ; données privées/justificatifs confidentiels protégés.
- Paiements réels prévus version ultérieure, non implémentés.

## Identité — exigence finale et exception de développement

- Avant production, j'exige qu'un utilisateur ait déposé une pièce d'identité avant de créer une tontine, envoyer une demande d'adhésion, accepter une invitation ou devenir membre d'une tontine.
- Le dépôt d'une pièce est distinct de sa vérification effective : la présente exigence finale porte sur dépôt disponible ; statut et procédure de vérification restent à définir et à implémenter avant production si exigés par règles applicables.
- Pendant phase actuelle de tests fonctionnels multi-comptes, je suspends volontairement contrôle de dépôt pour ces quatre actions. Cette exception facilite tests et ne constitue pas une règle produit finale.
- Je n'autorise jamais maintien de cette exception en production. Levée exige contrôle serveur effectif, couvrant chaque action concernée, et tests réussis des refus sans pièce puis des parcours autorisés avec pièce déposée.

## Modèles existants à préserver — Confirmé code/audit

- `FIXE_CREATEUR` : créateur toujours bénéficiaire et ne cotise pas ; autres cotisent ; tours = membres hors créateur.
- `TOURNANT_EXCLU` : bénéficiaire de son tour est `NON_CONCERNE`, jamais cotisation artificielle à 0 ; il cotise autres tours.
- `TOURNANT_INCLUS` : bénéficiaire cotise aussi pendant son tour.

## Règles déjà présentes dans mock

Ordre modifiable avant démarrage ; retrait restreint ; déclaration cotisation plafonnée au reste ; validation seule majore montant validé. Sources : `services/mock-api.ts:279-354`, `lib/format.ts:190-199`.

## Démarrage et rotations — Phase 2.3

- Je n'autorise le démarrage que si créateur, nombre exact de membres approuvés actifs, créateur actif, paramètres financiers/fréquence cohérents et bénéficiaires valides sont présents.
- Je verrouille règles financières et adhésions ordinaires à la même transaction que statut `ACTIVE`, date effective et rotations. Aucun paiement, cotisation ou reversement n'est créé par ce lancement.
- Pour `TOURNANT_EXCLU` et `TOURNANT_INCLUS`, chaque membre actif apparaît une seule fois dans ordre. Ordre manuel est configuré avant lancement. Ordre aléatoire utilise source cryptographique serveur, jamais `Math.random()`.
- Pour `FIXE_CREATEUR`, créateur reste bénéficiaire de chaque tour ; nombre tours reste membres actifs moins un. Pour deux modèles tournants, nombre tours reste nombre membres actifs.
- Première rotation est `EN_COURS`, suivantes `A_VENIR`. Ses montants sont théoriques : `TOURNANT_INCLUS` compte tous membres ; autres modèles excluent bénéficiaire cotisant conformément règles validées.
- Dates rotations partent date effective de lancement. Fréquence quotidienne/hebdomadaire ajoute jour/semaine ; fréquence mensuelle conserve jour quand possible et borne au dernier jour du mois.
- Mode automatique attend au moins date prévue et même contrôle métier. Son déclencheur externe reste requis avant toute promesse de fonctionnement automatique.

## Cotisations, retards et pénalités — Phase 2.4

- Je crée obligations de cotisation seulement lors démarrage réel, dans même transaction que rotations. Chaque obligation est liée à tontine, rotation, membre, échéance, montant attendu, montant déclaré et montant confirmé.
- `FIXE_CREATEUR` : créateur ne cotise jamais ; autres membres cotisent. `TOURNANT_EXCLU` : bénéficiaire du tour est non concerné. `TOURNANT_INCLUS` : tous membres, bénéficiaire inclus, cotisent. Les non-concernés sont tracés explicitement avec statut `NON_CONCERNE`, sans obligation ni montant principal à payer.
- Membre déclare seulement son versement externe, pour rotation en cours. Déclaration ne prouve pas réception. Créateur authentifié confirme ou rejette avec motif, observation et décision traçables. Déclaration rejetée ne compte pas dans montant déclaré courant ni montant confirmé ; membre peut en soumettre une nouvelle.
- Je limite déclarations et confirmations au reste dû. Versements partiels sont admis. Aucun trop-perçu n'est accepté sans procédure métier explicite. Les montants déclarés transitent comme décimales textuelles validées, puis sont calculés avec `Decimal` côté serveur.
- Membres autorisés voient montants attendus, déclarés, confirmés, restants, échéance et statut collectif. Référence et moyen de versement restent limités au déclarant et créateur ; justificatif est absent tant qu'un stockage privé sécurisé n'est pas disponible.
- Un déclarant peut joindre une image JPG, PNG ou WebP de cinq mégaoctets maximum. Le serveur contrôle signature binaire et type déclaré, conserve fichier hors `public/` et limite consultation au déclarant ou créateur. Justificatif reste une preuve déclarative : il ne confirme jamais réception des fonds.
- Échéance d'une cotisation est échéance verrouillée de sa rotation. Délai de grâce ajoute `delaiGraceJours` en UTC. Après expiration seulement, statut devient retard.
- Si pénalité active et montant configuré, je l'enregistre une seule fois par cotisation en retard, distincte principal. Règle ne définit pas mode de recouvrement de pénalité ; elle ne majore donc pas montant principal ni total reçu.
- Si rappels actifs, tâche sécurisée prépare une notification unique avant échéance lors de son premier passage sur la cotisation, puis une notification unique de retard après grâce. Horodatage précis et cadence ne sont pas définis : leur effectivité dépend de l'ordonnanceur externe, sans fréquence inventée.

## Reversements externes — Phase 2.5

- Je ne réalise aucun transfert dans TontiTrack. Le créateur déclare seulement un reversement externe ; cette déclaration ne vaut jamais réception.
- Une rotation conserve son bénéficiaire issu du démarrage : créateur pour `FIXE_CREATEUR`, bénéficiaire ordonné pour `TOURNANT_EXCLU` et `TOURNANT_INCLUS`. Aucun bénéficiaire n'est inventé au moment du reversement.
- Seul créateur peut déclarer un reversement d'une rotation active. Son montant positif, décimal à deux chiffres au plus, ne dépasse jamais les cotisations confirmées de cette rotation, après déduction des reversements déclarés non contestés.
- La configuration verrouillée `reversementsPartielsAutorises` décide si un créateur peut déclarer moins que le solde disponible. Les reversements successifs restent traçables quand ils sont autorisés.
- Seul bénéficiaire de rotation peut confirmer ou contester une déclaration. Il confirme montant réellement reçu, inférieur ou égal au montant déclaré ; réception partielle reste explicite. Une déclaration ne reçoit jamais deux décisions.
- Contestation ne crée jamais de confirmation. Elle conserve motif, date et événement ; une nouvelle déclaration externe peut ensuite régulariser la situation sans modifier silencieusement l'historique contesté.
- Je termine une rotation seulement si sa collecte théorique est confirmée et si bénéficiaire a confirmé le même total. Je passe alors la rotation suivante à `EN_COURS` dans même transaction.
- Créateur et bénéficiaire voient référence, moyen, observation, preuve privée et historique. Les autres membres voient seulement bénéficiaire, montants agrégés et état collectif.
- Les justificatifs suivent mêmes contrôles binaires JPG, PNG ou WebP et limite de 5 Mo que les cotisations ; accès serveur limité au créateur déclarant et au bénéficiaire.

## Clôture et archivage — Phase 2.6

- Je n'autorise une clôture normale que pour une tontine effectivement démarrée et encore `ACTIVE`. Seul son créateur authentifié peut la confirmer ; aucune clôture forcée n'existe.
- Je relis dans une transaction toutes les données réelles avant de clôturer : chaque rotation applicable doit être `TERMINEE`, chaque cotisation exigible doit être `PAYEE`, les non-concernés restent `NON_CONCERNE`, et chaque reversement attendu doit être confirmé à hauteur du montant théorique de sa rotation.
- `FIXE_CREATEUR` conserve seulement rotations créées au démarrage, sans en inventer une nouvelle ; `TOURNANT_EXCLU` et `TOURNANT_INCLUS` suivent les rotations et obligations déjà persistées. Les distinctions de cotisants restent celles de la phase 2.4.
- Une pénalité reste historique et distincte du principal. Les règles actuelles ne définissent aucun recouvrement distinct de pénalité : je bloque donc toute clôture tant qu'une cotisation exigible n'est pas régularisée, sans ajouter pénalité au montant principal.
- Toute déclaration de cotisation ou de reversement en attente bloque la clôture. Toute contestation `CONTESTE` ou confirmation `NON_RECUE` bloque aussi la clôture. Le modèle actuel ne contient pas de statut de règlement de contestation ; je ne déduis pas qu'une contestation historique est réglée par un montant ultérieur.
- À la clôture, je crée un rapport unique avec montants attendus et confirmés, pénalités historiques, reversements confirmés et instantané des rotations. Je passe seulement la tontine à `TERMINEE`, sans recalcul rétroactif ni modification de confirmation, contestation, montant ou justificatif.
- Après clôture, aucune opération financière ne peut être déclarée ou décidée côté serveur. Les membres approuvés conservent la consultation autorisée de leurs opérations et du rapport.
- L'archivage est possible seulement après clôture et rapport. Il passe la tontine à `ARCHIVEE` sans effacer les données ni réduire les droits privés sur justificatifs.

## À préciser avant implémentation

Définition publique/privée, droits exacts créateur/admin, audit persistant de l'ordre aléatoire, délais/pénalités, procédure exclusion/remplacement, accords requis, visibilité détaillée, seuil reversement partiel, litige, clôture et confirmation automatique. Ne pas inventer ces règles.
