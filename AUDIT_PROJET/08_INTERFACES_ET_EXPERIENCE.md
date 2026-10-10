# Interfaces et expérience

Constats code, pas test visuel navigateur.

Interface cohérente : vert marque, fond crème, cartes blanches, sidebar desktop, navigation basse mobile, modales bottom-sheet (`docs/IDENTITE_VISUELLE.md`, `AppShell.tsx`). Logo officiel utilisé sans inversion (`PageConnexion.tsx:54`).

Forces : routes lisibles, deep-links tontine, états vides notifications (`PageNotifications.tsx:88-95`), messages d'erreur métier dans mutations, boutons d'action et confirmations. Champs financiers vérifient montant/description/catégorie (`ModalTransaction.tsx:22-45`).

Limites : recherche AppShell sans action ; paramètres visuels sans persistance/effet ; uploads d'identité/preuve fictifs ; sous-routes finances non spécialisées ; modales artisanales sans focus trap prouvé ; plusieurs boutons icône sans `aria-label` ; couleurs souvent hardcodées. Hors-ligne n'est qu'indicateur navigateur, sans cache ni file sync (`AppContext.tsx:48-58`).

Responsive : classes Tailwind `sm`/`lg` fréquentes, mais aucune vérification 360/375/390/430 px effectuée. Accessibilité clavier, lecteur écran, contrastes et performance : **non vérifiés**.
