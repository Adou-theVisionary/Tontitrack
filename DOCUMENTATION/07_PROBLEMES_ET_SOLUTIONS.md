# Problèmes et solutions

## Intervention 0040 — Fluidité à confirmer sur navigateur réel

J'ai appliqué les nouvelles conventions de mouvement par lecture statique, sans démarrer l'application ni disposer d'une page de prévisualisation ouverte. Je ne peux donc pas mesurer fluidité, fréquence d'image, comportement tactile ou restitution exacte du focus. Le risque restant concerne un navigateur, un appareil modeste ou un portail Radix donné. Je dois suivre la matrice `tests/ui/intervention-d-animations.test.ts`, avec mouvement réduit, clavier, thèmes et parcours financiers, avant de qualifier ces finitions de validées.

## Intervention 0039 — Responsive non validé par le retour utilisateur

Le retour utilisateur confirme que les changements précédents ne rendaient pas l'interface suffisamment confortable sur petit écran. La cause ne peut pas être isolée visuellement sans navigateur, mais la lecture statique a confirmé des en-têtes trop chargés, tableaux comprimés, actions de modale horizontales, listes à contenu long et absence de gestion explicite des zones de sécurité.

J'ai corrigé ces structures au niveau partagé et métier, sans cacher le débordement global. Le risque résiduel reste élevé tant que le testeur externe n'a pas vérifié les routes réelles à chaque largeur demandée, dans les orientations portrait/paysage et avec clavier mobile. La matrice `tests/ui/intervention-c-responsive.test.ts` fixe cette validation obligatoire.

## Intervention 0038 — Surfaces claires résiduelles en thème sombre

Le changement de thème était actif, mais 367 occurrences de classes de palette fixe restaient dans les composants et pages. Elles pouvaient conserver une carte, un champ ou un panneau clair, en particulier dans les modules Tontine, financier et Super Admin. La préférence sombre des Paramètres était aussi isolée dans un état local et n'appliquait pas le thème global.

J'ai converti les parcours prioritaires vers les jetons et ajouté une compatibilité explicite, limitée à `.dark`, pour les couleurs historiques restantes. Je n'ai pas appliqué de filtre global. La bascule Paramètres utilise maintenant le fournisseur de thème partagé. Le risque restant est un cas visuel non couvert par lecture statique ; je dois le rechercher manuellement dans les trois thèmes et à toutes les largeurs prévues avant validation.

## Intervention 0037 — Couleurs rigides et vérification visuelle à compléter

J'ai constaté que les coques principales et plusieurs composants partagés employaient des couleurs littérales adaptées seulement au thème clair. Je les ai raccordés aux jetons sémantiques et j'ai ajouté le thème sombre global. Des couleurs littérales restent dans des écrans métier détaillés : ce n'est pas un contournement, mais une migration progressive à vérifier composant par composant pendant l'intervention B.

Le démarrage de serveur étant interdit pendant cette intervention, je n'ai pas de capture ni de mesure navigateur. Je dois contrôler manuellement contraste, absence de flash, focus, lecteur d'écran, modales et largeurs mobiles avant de considérer le rendu validé.

## Intervention 0036 — Page Rôles en erreur

J'ai établi que `GET /api/administration/roles` renvoyait la promesse de `administrationService.roles()` sans l'attendre. Le client recevait donc un contrat incomplet et appelait `map` sur une valeur absente. J'ai attendu le service et ajouté une validation défensive de l'enveloppe et des tableaux côté interface. Si une régression renvoie encore un contrat incorrect, l'écran affiche désormais une erreur récupérable au lieu de planter.

## Intervention 0035 — Gouvernance administrative limitée

J'ai constaté que l'administration Phase 3.1 disposait uniquement de rôles système, d'une lecture de module statique, de paramètres volontairement vides et d'aucun modèle de litige, incident ou suspension administrative de tontine. J'ai ajouté un socle persistant et contrôlé sans contourner les règles financières. Le risque restant est l'absence de validation technique et d'application de migration : aucune fonctionnalité dépendante du nouveau Prisma Client ne doit être considérée opérationnelle avant les commandes manuelles et les parcours de test.

## Intervention 0034 — Destination de connexion indépendante des rôles

La page de connexion validait uniquement un retour client avec `/tableau-de-bord` comme défaut. Elle ne recevait ni rôle ni permission, même si la session relisait correctement les rôles depuis PostgreSQL. Ce décalage envoyait un Super Admin vers l'espace utilisateur après connexion. J'ai déplacé la décision vers la route serveur, où les rôles sont lus depuis la source persistée et où les permissions déterminent la destination autorisée. Les layouts restent l'autorité finale.

## Phase 3.1 — Aucun Super Admin implicite

Le produit ne possédait ni rôle global, ni premier administrateur sûr. J'ai écarté l'attribution automatique par e-mail, domaine, inscription ou identifiant codé en dur : ces approches ouvriraient une élévation de privilège difficile à auditer. Je prépare donc uniquement un script manuel qui exige un utilisateur existant, actif, une confirmation explicite et une base déjà migrée. Il reste à l'exécuter manuellement sur l'environnement de test choisi.

La limite de requêtes administrative est volontairement en mémoire, comme celle déjà utilisée par l'authentification. Elle protège une instance mais doit être complétée par une limite partagée avant tout déploiement multi-instance.

| Statut | Problème | Diagnostic | Action requise |
|---|---|---|---|
| Bloquant Phase 2.2 | Modèle Tontine insuffisant | Configuration, demandes et invitations ciblées absentes du schéma Prisma actuel | Valider extension, générer migration contrôlée et Prisma Client ; voir intervention 0010 |

| Statut | Problème | Diagnostic | Action requise |
|---|---|---|---|
| À vérifier | TS2554 scrypt | `promisify` perdait surcharge TypeScript avec options | Exécuter typecheck après enveloppe Promise explicite ; voir intervention 0009 |

| Statut | Problème | Diagnostic | Action requise |
|---|---|---|---|
| Bloquant | Schéma Prisma non migré | Schema actuel diffère migration initiale | Générer/inspecter SQL migration sûre avant seed/API |
| Important production | Vérification e-mail et téléphone incomplète | Jeton e-mail créé mais aucun fournisseur d'envoi ; SMS hors phase | Ajouter envoi e-mail, route validation jeton et OTP fournisseur avant production |
| Important production | Limitation connexion locale | Limiteur mémoire disparaît au redémarrage et n'est pas partagé | Utiliser stockage partagé avant multi-instance |
| Important | Données applicatives mock après connexion réelle | Auth serveur ne relie pas encore finances/tontines aux comptes PostgreSQL | Construire API métier et contrôles objet par lot |
| Important | Tontines mock | `tontiTrackService` alias `mockApi` | Services métier transactionnels après migration |
| Important | Règles Tontine nouvelles incomplètes | Configuration/public/retards/remplacement non modélisés | Clarifier propriétaire avant code |
| Important | Fichiers fictifs | Preuves/identité simulées | Stockage privé, MIME/taille/permissions |
| Moyen | Lint non reproductible | Next tente installation réseau | Corriger déclaration outils, puis vérifier |
| Moyen | Tests absents | Aucun script/fichier détecté | Tests règles, intégration et E2E |
| Bloquant futur seed/API | Schéma Prisma non représenté par migration | `schema.prisma` contient modèles/champs/enums absents migration initiale | Préparer migration d'alignement, inspecter SQL et données avant application |
| Résolu environnement | `prisma migrate status` échoue sandbox | Sandbox Windows bloque TCP localhost ; hors sandbox PostgreSQL répond et status est valide | Utiliser contrôle lecture seule hors sandbox autorisé ; ne pas traiter comme erreur Prisma |
| Faible | ESLint Next indirect non reproductible | `npm run lint` tente installer des outils ; ESLint binaire direct passe avec 3 avertissements image | Corriger configuration dépendances/Next dans lot dédié, après reproduction contrôlée |
| Important déploiement | Déclencheur démarrage automatique absent | Route sécurisée existe mais Next.js ne planifie aucune tâche seul | Configurer ordonnanceur externe et secret `TONTITRACK_TACHE_SECRET`, puis tester appel authentifié |
| À préciser | Audit ordre aléatoire | Mélange cryptographique serveur existe ; aucune trace d'audit dédiée ne conserve tirage | Définir exigence d'audit, rétention et visibilité avant schéma dédié |
| À valider Phase 2.3 | TS1005 dans requête détail Tontine | Accolade fermante `include` manquante avant fermeture `findUnique` | Syntaxe corrigée intervention 0022 ; relancer typecheck manuel |
| À valider Phase 2.3 | ESLint : quatre apostrophes JSX et trois images HTML | Règle `react/no-unescaped-entities` bloquait lint ; `@next/next/no-img-element` émettait avertissements | Apostrophes échappées et images migrées vers `next/image` intervention 0023 ; relancer lint/build manuel |
| À valider Phase 2.3 | Création Tontine rejetée par « Données invalides » | Le formulaire vérifiait seulement champs vides ; contrat Zod imposait aussi nom de 3 caractères, entier participants 2–200, montant positif et date strictement future. Route masquait erreurs Zod. | Validation client et réponse structurée ajoutées intervention 0024 ; exécuter contrôles manuels et parcours des cinq étapes. |
| À valider Phase 2.4 | TS2802 lors de la génération des rotations | La cible TypeScript ne prend pas en charge l'itération directe de `Array.entries()` par `for...of` | Boucle remplacée par index numérique intervention 0027 ; relancer typecheck manuel. |
| À valider Phase 2.4 | TS1109, TS2657 et TS1005 dans l'aperçu cotisations | Une accolade surnuméraire fermait prématurément la valeur JSX de « Montant confirmé » dans la branche membre | JSX reformatté et corrigé intervention 0029 ; relancer typecheck, lint et build manuels. |
| À valider Phase 2.5 | TS2339 dans le test des décisions de reversement | Le test lisait `montantConfirme` sur l'union retournée par le contrat sans avoir vérifié sa branche discriminante | J'ai ajouté le rétrécissement explicite de la branche `CONFIRMER` et le contrôle distinct de `CONTESTER` lors de l'intervention 0031 ; relancer typecheck, lint et build manuels. |
| À valider Phase 2.6 | Migration de rapport de clôture préparée, non appliquée | `RapportClotureTontine` doit exister avant les routes de clôture et avant régénération de Prisma Client | Relire `20261013120000_cloture_archivage`, sauvegarder, appliquer manuellement, générer Prisma Client puis contrôler types et parcours. |
| À préciser Phase 2.6 | Une contestation historique ne possède pas de statut de règlement | Une régularisation ultérieure ne permet pas d'identifier sûrement une contestation résolue sans lien métier persistant | Toute contestation reste bloquante pour clôture. Définir procédure et traçabilité de règlement avant assouplissement ; aucune clôture forcée. |
| Résolu manuellement Phase 2.5 | Migration reversements à appliquer | Les relations historiques `ConfirmationReception` devaient être reliées à une déclaration sans ambiguïté | Le propriétaire a confirmé l'application réussie de `20261012190000_reversements`, la validité du schéma Prisma et la génération de Prisma Client le 12/10/2026. |
| À décider Phase 2.5 | Exécution des tests automatisés reversements | Des tests Node TypeScript de contrats sont préparés, mais aucun runner TypeScript n'est configuré dans les scripts du projet | Choisir et configurer un runner hors périmètre, puis exécuter tests contrat, intégration PostgreSQL et E2E. |
| Bloquant déploiement | Stockage local des justificatifs non persistant sur hébergement sans volume | Répertoire privé fonctionne localement mais un système serverless peut supprimer fichiers entre requêtes | Configurer `TONTITRACK_STOCKAGE_PRIVE` sur volume privé persistant ou adapter fournisseur privé, puis tester droits et restauration. |
| Bloquant production | Contrôle de dépôt pièce d'identité temporairement suspendu | Tests multi-comptes exigent accès aux actions Tontine sans pièce ; aucune vérification d'identité n'est actuellement garantie par ce choix de développement | Implémenter contrôle serveur avant création, demande, acceptation et adhésion, puis réussir tests refus/autorisation avant production ; voir intervention 0025. |
| Bloquant Phase 2.4 | Schéma cotisations modifié, migration et Prisma Client non appliqués | Nouvelles colonnes échéance, montants, pénalité et métadonnées sont nécessaires aux API ; client généré ne les contient pas encore | Générer migration contrôlée, vérifier backfill `Cotisation.tontineId`, appliquer seulement après revue puis générer Prisma Client ; voir intervention 0026. |
| À préciser Phase 2.4 | Horaire rappel avant échéance absent | `rappelsActifs` ne définit ni avance ni fréquence ; tâche prépare un seul rappel au premier passage avant échéance, mais son moment dépend ordonnanceur | Valider délai et cadence, puis ajuster tâche sécurisée et tests. |
| Important déploiement | Ordonnanceur retards/rappels absent | Route sécurisée existe mais aucune exécution Next.js autonome n'est garantie | Configurer ordonnanceur externe avec secret et vérifier absence de doublon avant promesse d'automatisation. |

Ne marquer problème résolu qu'avec rapport, commandes et preuves.
