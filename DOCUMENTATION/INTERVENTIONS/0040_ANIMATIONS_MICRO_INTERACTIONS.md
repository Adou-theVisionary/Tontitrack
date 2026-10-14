# Intervention 0040 — Animations fluides et micro-interactions

Date : 14/10/2026  
Objectif : ajouter des retours d'interaction sobres et réutilisables, sans modifier la charte TontiTrack, les données ni les règles métier.

## Contexte et état initial

Le retour utilisateur confirme que les thèmes et le responsive sont désormais satisfaisants. Les fondations précédentes contenaient déjà des apparitions discrètes, des transitions de boutons et les animations Radix usuelles, mais les durées, courbes, champs, panneaux, notifications et cartes interactives n'étaient pas uniformisés.

J'ai suivi les instructions Product Design pour examiner les flux et composants existants. Aucun serveur ne peut être démarré selon `AGENTS.md` et aucune page de prévisualisation n'était ouverte ; je n'ai donc ni capturé l'interface ni présenté cet examen statique comme une validation visuelle.

## Diagnostic

J'ai identifié l'absence de conventions de durée centralisées, des retours de validation peu homogènes, des cibles de fermeture insuffisantes sur certains dialogues/toasts, des panneaux avec des courbes hétérogènes et des cartes de tableau de bord actionnables sans convention partagée. Les parcours financiers ne doivent pas être animés comme des données fictives, ni annoncer une réussite avant confirmation serveur.

## Modifications

J'ai ajouté dans `app/globals.css` les jetons `--duree-micro-interaction` à 150 ms, `--duree-transition` à 200 ms, `--duree-panneau` à 280 ms et `--easing-naturel`. Les utilitaires `surface-interactive` et `retour-validation` permettent respectivement un survol de carte strictement opt-in et une apparition courte d'information de validation. Les transitions générales portent sur couleur, bordure, ombre ou focus ; aucun mouvement permanent n'est ajouté.

J'ai harmonisé `Button`, `Card`, `Input`, `Textarea`, `Select`, `Switch`, `Progress`, `Tabs`, `DropdownMenu`, `Dialog`, `Sheet` et `Toast`. Les dialogues et panneaux gardent le focus, le portail et le défilement Radix ; le flou de fond n'est pas animé. Les fermetures de dialogue et toast atteignent 44 px. Les toasts tiennent compte des zones sûres de téléphone et les menus/sélecteurs/onglets emploient des entrées très courtes.

J'ai amélioré les deux coques de navigation : états actifs plus souples, voile de tiroir discret, ouverture à courbe commune et boutons de fermeture accessibles. Le tableau de bord utilise `surface-interactive` uniquement pour les actions rapides, les cartes statistiques et les cartes de tontine cliquables. Les montants, histogrammes et données financières ne sont pas interpolés.

J'ai appliqué une apparition accessible aux états de chargement, erreur et vide, ainsi qu'aux indicateurs de synchronisation. Les erreurs de création de tontine apparaissent avec un retour court près du champ concerné, sans supprimer leurs associations `aria-describedby` existantes ni changer la validation client/serveur. La création utilise aussi un verrou client synchrone pendant sa requête ; la déclaration et la décision de reversement ignorent toute seconde action locale pendant leur envoi, en complément de leur clé d'idempotence serveur existante.

## Fichiers modifiés ou ajoutés

- `app/globals.css`
- `components/AppShell.tsx`
- `components/administration/AppShellAdministration.tsx`
- `components/EtatsUI.tsx`
- `components/IndicateurSync.tsx`
- `components/pages/Dashboard.tsx`
- `components/tontines/CreationTontine.tsx`
- `components/tontines/ReversementsTontine.tsx`
- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/dialog.tsx`
- `components/ui/dropdown-menu.tsx`
- `components/ui/input.tsx`
- `components/ui/progress.tsx`
- `components/ui/select.tsx`
- `components/ui/sheet.tsx`
- `components/ui/switch.tsx`
- `components/ui/tabs.tsx`
- `components/ui/textarea.tsx`
- `components/ui/toast.tsx`
- `tests/ui/intervention-d-animations.test.ts`
- `DOCUMENTATION/02_ARCHITECTURE_TECHNIQUE.md`
- `DOCUMENTATION/06_JOURNAL_DE_DEVELOPPEMENT.md`
- `DOCUMENTATION/07_PROBLEMES_ET_SOLUTIONS.md`
- `DOCUMENTATION/08_TESTS_ET_VALIDATIONS.md`
- `DOCUMENTATION/09_DECISIONS_TECHNIQUES.md`
- `DOCUMENTATION/10_MODERNISATION_UX_UI.md`
- Ce rapport.

## Accessibilité, performance et préservation

La règle globale `prefers-reduced-motion` réduit toujours transitions et animations. Les informations de succès, erreur, chargement et synchronisation restent textuelles et exposent leurs rôles adaptés ; elles ne dépendent jamais de l'animation. Les contrôles conservent focus visible, navigation clavier et cibles tactiles. Les mouvements emploient principalement `opacity` et `transform`, sans écouteur permanent, minuteur, animation de largeur/hauteur ni dépendance supplémentaire.

Je n'ai modifié ni Prisma, PostgreSQL, migration, API, permission serveur, session, montant, calcul financier, état de cotisation, reversement, contestation, clôture, archive, justification ou logique de notification. Je n'ai ajouté ni supprimé de dépendance.

## Tests préparés

J'ai ajouté `tests/ui/intervention-d-animations.test.ts`. Cette matrice non exécutée couvre boutons, champs, erreurs, menus, panneaux, onglets, dialogues, notifications, cartes, états UI et synchronisation. Elle couvre aussi connexion, tableau de bord, finances, création, cotisations, reversements, clôture, notifications et Super Admin, en thèmes clair/sombre/système, au clavier, en mouvement réduit et sur mobile.

## Commandes et inspections

| Catégorie | Commande ou action | Objectif pédagogique | Résultat |
|---|---|---|---|
| Lecture exécutée par Codex | `Get-Content` sur `AGENTS.md`, documentation, rapports 0037 à 0039, styles, coques, composants UI et parcours concernés | Identifier l'identité, les fondations existantes, les contraintes métier et les composants réutilisables. | Lecture statique réalisée. |
| Lecture exécutée par Codex | `rg --files` et `rg` ciblé sur composants, validations et classes | Repérer les routes existantes, surfaces interactives et retours de formulaire sans lancer l'application. | Périmètre ciblé sans ajout d'écran ni de donnée fictive. |
| Lecture exécutée par Codex | État de la surface de prévisualisation | Vérifier si une application ouverte permettait une capture conforme aux instructions Product Design. | Aucune page de prévisualisation ouverte ; aucune capture ni mesure visuelle déclarée. |
| Lecture exécutée par Codex | `git diff --check` | Détecter des erreurs d'espacement dans le diff. | Aucune erreur d'espacement signalée ; Git a seulement averti des conversions LF/CRLF futures. |
| Proposée au propriétaire | Script de pré-analyse Product Design | Charger un éventuel contexte visuel persistant. | Non exécuté : `AGENTS.md` interdit l'exécution de scripts par Codex. |
| Restante | `npm run typecheck` | Vérifier les types TSX et les classes modifiées. | Non exécutée. |
| Restante | `npm run lint` | Vérifier les règles JSX, accessibilité et qualité. | Non exécutée. |
| Restante | `npm run build` | Vérifier la compilation Next.js. | Non exécutée. |
| Restante | Recette navigateur selon `tests/ui/intervention-d-animations.test.ts` | Vérifier visuellement fluidité, thèmes, mobile, clavier, focus, mouvement réduit et non-régression métier. | Non exécutée. |

## Validations manuelles restantes

Depuis PowerShell, dans `C:\Users\isasa\Desktop\tontitrack_prod`, le propriétaire doit lancer :

```powershell
npm run typecheck
npm run lint
npm run build
```

Objectif pédagogique : confirmer le typage, les règles de qualité et la compilation après la mise à jour des composants partagés. Résultat attendu : aucune erreur liée aux classes d'animation ou aux composants modifiés. Risque : ces commandes peuvent révéler des anomalies antérieures, sans prouver les parcours visuels ou financiers.

Je dois ensuite contrôler manuellement les thèmes Clair, Sombre et Système à 320, 375, 768 et 1440 px, avec Tab, Maj+Tab, Entrée, Espace, Échap et `prefers-reduced-motion`. Je dois vérifier les notifications multiples, menus, sélecteurs, modales, retours d'erreur, actions financières, absence de double soumission, absence de faux succès et réactivité sur appareil mobile.

## Risques et reprise

Le risque résiduel est visuel et matériel : une combinaison navigateur, appareil peu puissant, clavier mobile ou portail peut modifier la perception de fluidité. Je n'affirme ni 60 FPS ni conformité WCAG complète sans mesures et parcours manuels. Si une anomalie apparaît, je dois corriger la primitive partagée concernée sans transformer l'animation en condition métier ni animer les valeurs financières.
