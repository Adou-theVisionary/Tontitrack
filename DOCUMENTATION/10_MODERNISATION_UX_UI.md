# Modernisation UX/UI — intervention A

## Périmètre audité

J'ai réalisé un audit statique des routes et composants réellement présents. L'espace public comprend l'accueil, la connexion, l'inscription, les parcours d'invitation et les pages d'authentification associées. L'espace utilisateur regroupe le tableau de bord, finances, tontines, notifications, profil et paramètres ; les écrans Tontine couvrent création, détail, membres, invitations, rotations, cotisations, reversements, clôture et archives selon les composants appelés par les routes existantes. L'administration globale comprend la vue d'ensemble, utilisateurs, rôles, modules, supervision des tontines, litiges, audit, incidents et paramètres.

Je n'ai pas démarré l'application, conformément aux consignes projet. Cet audit est donc fondé sur le code et non sur des captures d'écran ou un parcours navigateur. Les défauts de rendu, de contraste réel, de focus et de comportement tactile restent à confirmer manuellement.

## Diagnostic priorisé

| Priorité | Constats confirmés | Décision de l'intervention A |
|---|---|---|
| P0 | Aucun blocage fonctionnel visuel confirmé par lecture seule. | Je ne modifie ni parcours métier ni API. |
| P1 | Les coques utilisateur et administrative reposaient largement sur des couleurs hexadécimales claires ; le thème sombre ne pouvait pas les adapter. Les menus mobiles n'avaient pas de sémantique de dialogue explicite. | Je centralise les couleurs principales dans des jetons, ajoute le thème sombre et améliore les menus mobiles partagés. |
| P2 | Les états de chargement, erreur et vide, les panneaux de connexion et les contrôles partagés mélangeaient jetons et couleurs rigides. Les modales n'étaient pas bornées à la hauteur visible sur petit écran. | Je bascule les composants partagés concernés vers les jetons et rends les modales défilables dans la fenêtre disponible. |
| P3 | Les composants métier gardent encore de nombreuses valeurs locales ; une harmonisation exhaustive demanderait une revue écran par écran. | Je réserve cette migration progressive à l'intervention B, sans effacer les repères visuels utiles. |

## Fondations du design system

Je conserve l'identité TontiTrack : vert principal, accent chaud, fonds sobres, logo, rayons généreux et densité d'information existante. `app/globals.css` porte désormais les jetons d'arrière-plan, premier plan, carte, popover, primaire, secondaire, atténué, accent, succès, avertissement, erreur, information, bordure, champ, focus et graphiques. Les valeurs existent pour les modes clair et sombre. `tailwind.config.ts` expose les statuts supplémentaires afin que les composants évitent les couleurs littérales. Les pages publiques d'authentification utilisent désormais ces jetons ; le panneau de marque vert de la connexion reste volontairement identitaire.

Je conserve la hiérarchie typographique Tailwind déjà présente : titres `font-semibold`, texte standard `text-sm`, descriptions `text-muted-foreground` et chiffres portés par les composants métiers. Les espacements, contrôles d'au moins 40 px, rayon `--radius`, cartes, tables défilables localement et largeur de contenu `max-w-[1320px]` restent cohérents avec l'interface actuelle.

Les composants réemployés et consolidés sont `Button`, `Card`, `Input`, `Textarea`, `Table`, `Dialog`, `Toaster`, `EtatsUI`, `BadgeStatut`, `IndicateurSync`, `ModalConfirmation`, `AppShell` et `AppShellAdministration`. Je n'ai pas créé de système concurrent : Radix, Tailwind et les composants UI existants restent la base commune.

## Architecture des thèmes

`components/theme/ThemeProvider.tsx` installe `next-themes`, déjà présent dans les dépendances. Il applique la classe de thème au document, mémorise le choix localement, utilise le mode système par défaut et suit ses changements. `suppressHydrationWarning` sur l'élément HTML et le rendu différé du sélecteur évitent une divergence d'hydratation ; `disableTransitionOnChange` limite le flash au changement de thème.

`SelecteurTheme` expose les choix Clair, Sombre et Système par un contrôle natif, utilisable au clavier et annoncé au lecteur d'écran. Il est placé dans les en-têtes et menus mobiles des coques utilisateur et administrative. `SelecteurThemePublic` couvre les routes publiques sans doubler le contrôle dans les espaces authentifiés. Les notifications Sonner sont désormais dans le même fournisseur de thème.

## Responsive et accessibilité

Je bloque le débordement horizontal global, sans empêcher le défilement local nécessaire aux tables. Les deux coques gardent barre latérale au bureau, barre basse ou menu au mobile et tiroir avec rôle de dialogue, intitulé et fermeture accessible. Les modales utilisent la hauteur visible dynamique, une largeur adaptée et un défilement interne. Les focus visibles, les libellés accessibles, les cibles tactiles des boutons, `color-scheme` et `prefers-reduced-motion` sont centralisés.

Un statut ne doit pas être interprété par sa seule couleur : les écrans métier conservent leurs libellés, montants et messages. Je dois toutefois contrôler ce principe dans chaque tableau et badge lors de l'intervention B.

## Limites et suites

L'intervention B couvrira les écrans métier un à un : cartes, tableaux, formulaires, badges, graphiques et valeurs hexadécimales restantes dans les composants Tontine, finances et administration détaillée. Elle devra vérifier les largeurs 320, 375, 768, 1024 et 1440 px dans le navigateur.

L'intervention C sera réservée aux micro-interactions et finitions avancées après confirmation des parcours : animation contextuelle légère, états de transition, polissage de densité et contrôle visuel final. Je ne dois pas ajouter d'animation lourde ni modifier le comportement financier à cette étape.

## Intervention B — responsive, thème sombre et cohérence métier — 14/10/2026

J'ai poursuivi l'audit statique exigé pour les écrans publics, authentifiés, Tontine, financiers et administratifs. Je n'ai pas démarré l'application ni produit de capture : les constats de rendu restent donc à confirmer dans le navigateur. L'audit a identifié deux risques immédiats : de nombreuses surfaces métier utilisaient encore une palette hexadécimale claire et la préférence sombre de la page Paramètres était locale, donc sans effet sur le thème partagé.

J'ai ajouté trois niveaux sémantiques de surface (`surface`, `surface-raised`, `surface-subtle`) dans les deux thèmes, exposés dans Tailwind. Ils distinguent arrière-plan, carte et panneau sans changer le vert identitaire, l'accent chaud, les rayons, le logo ni la densité visuelle de TontiTrack. Les composants directement révisés comprennent les coques, boutons, tableaux et dialogues partagés, le tableau de bord, finances, notifications, profil, paramètres, création et détail de tontine, cotisations, reversements, invitations, déclarations, rejet de cotisation et l'espace Super Admin.

Pour sécuriser les composants métier restants qui emploient la palette historique, j'ai ajouté une couche de compatibilité limitée au sélecteur `.dark`. Elle associe explicitement les anciennes couleurs de surface, texte et statut aux jetons sémantiques sombres ; elle n'applique ni filtre global ni inversion de l'interface, et elle ne touche pas au thème clair. La migration directe vers les jetons reste la règle pour toute modification ultérieure. Cette couche couvre notamment les contenus montés dans les portails Radix, car la classe `dark` est portée par l'élément HTML.

J'ai retiré le masquage global de débordement horizontal : il pouvait dissimuler un défaut responsive au lieu de le corriger. Les tables gardent leur défilement local via le composant `Table`. Les coques restent à largeur minimale nulle, les actions d'en-tête se replient, les filtres et onglets peuvent défiler localement, les dialogues sont bornés à `100dvh` et les actions principales partagées atteignent 44 px. La bascule de Paramètres appelle maintenant le même fournisseur `next-themes` que les sélecteurs Clair, Sombre et Système ; elle ne maintient plus un état local divergent.

La matrice de vérification préparée dans `tests/ui/intervention-b-responsive-theme.test.ts` recense les routes réelles et les contrôles à effectuer à 320, 768 et 1440 px, dans les trois thèmes. Je dois compléter le contrôle visuel manuel des contrastes, états focus, portails, tables, menus et parcours financier avant d'annoncer une validation.

## Intervention C — responsive structurel et mouvements utiles — 14/10/2026

Le retour utilisateur confirme que le thème sombre fonctionne, mais ne prouve pas la correction du responsive. J'ai donc arrêté les corrections de couleur et réalisé un audit statique approfondi centré sur les contraintes de largeur. Le démarrage de serveur et les captures restent interdits : je ne peux pas présenter cet audit comme une preuve visuelle. Le script de contexte Product Design n'a pas été exécuté pour la même raison.

Les causes structurelles relevées sont les en-têtes chargés à 320 px, l'absence de largeur minimale pour les tables, les pieds de modale horizontaux, les retours d'état fixes trop larges, les libellés longs dans les listes de membres et invitations, et l'absence de prise en compte explicite des zones de sécurité mobiles. J'ai corrigé ces contraintes dans les coques utilisateur et administrative, la table partagée, les dialogues, les confirmations, les modales de transaction, paiement et versement, les détails/création de tontine, les invitations, membres, cotisations, pagination Super Admin et les retours visuels.

Les tableaux choisissent maintenant explicitement le défilement horizontal local : `Table` impose une largeur de lecture de 640 px, réduit ses espacements sur téléphone, permet le défilement tactile et expose une région clavier annoncée. Je ne compresse ni ne supprime de colonne ni de donnée. Les boutons d'action des modales et décisions s'empilent sur téléphone, les champs catégorie/date passent en une colonne, les menus se ferment avec Échap et la navigation fixe tient compte de `safe-area-inset-bottom`.

J'ai ajouté seulement des mouvements courts basés sur `opacity` et `transform` : apparition discrète des blocs principaux et notifications, glissement du tiroir mobile, transitions de boutons et animations Radix existantes renforcées. Tous restent neutralisés par `prefers-reduced-motion`; aucune dépendance ni animation lourde n'est ajoutée. La recette exploitable est dans `tests/ui/intervention-c-responsive.test.ts` et couvre toutes les largeurs demandées, les thèmes, le paysage et les écrans bas.

## Intervention D — fluidité et micro-interactions — 14/10/2026

Le retour utilisateur confirme que le thème sombre et le responsive sont désormais satisfaisants. J'ai donc limité cette intervention au mouvement utile, sans modifier la charte, les mises en page métier ni les parcours existants. J'ai ajouté quatre jetons CSS : micro-interaction à 150 ms, transition à 200 ms, panneau à 280 ms et une courbe naturelle commune. Les animations s'appuient sur l'opacité et `transform`; les couleurs, bordures, ombres et focus utilisent des transitions courtes.

Les composants partagés `Button`, `Card`, `Input`, `Textarea`, `Select`, `Switch`, `Progress`, `Tabs`, `DropdownMenu`, `Dialog`, `Sheet` et `Toast` appliquent ces conventions. Les cartes ne bougent qu'avec la classe explicite `surface-interactive`, utilisée sur les actions et cartes réellement actionnables du tableau de bord. Les montants et graphes ne reçoivent aucun compteur, interpolation de valeur ou animation financière.

J'ai harmonisé les menus mobile utilisateur et Super Admin, les panneaux Radix, les onglets, sélecteurs, toasts, états de chargement/erreur/vide, indicateurs de synchronisation et retours de validation du formulaire de création. La création protège aussi sa requête contre une double activation locale ; les reversements ignorent une seconde déclaration ou décision pendant un envoi, en complément de leur idempotence serveur existante. Les boîtes de dialogue conservent focus Radix, défilement interne et hauteur mobile ; leur arrière-plan est légèrement flouté sans animation de filtre. Les notifications tiennent compte des zones sûres mobiles et leur fermeture atteint 44 px.

`prefers-reduced-motion` continue de réduire les animations et transitions ; les focus, libellés, rôles de statut et messages d'erreur restent présents sans dépendre du mouvement. Je n'ai ajouté aucune dépendance, aucune simulation, ni aucune modification de données, API, permission, règle financière, Prisma ou migration. La recette préparée `tests/ui/intervention-d-animations.test.ts` définit les vérifications navigateur, clavier, mouvement réduit et performances restantes.
