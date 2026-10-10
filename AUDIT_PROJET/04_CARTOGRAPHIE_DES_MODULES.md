# Cartographie des modules

| Module | Fichiers / responsabilités | État |
|---|---|---|
| Auth | `components/auth/*`, `services/mock-api.ts:63-111` | Écrans et validations HTML/Zod ; mock seulement. |
| Session/app | `contexts/AppContext.tsx`, `app/(application)/layout.tsx` | État mémoire/sessionStorage ; aucune protection serveur. |
| Finances | `PageFinances`, `ModalTransaction`, `donnees-mock` | Ajout/annulation/filtre client ; sous-routes affichent même vue. |
| Tontines | `components/tontines/*`, `DetailTontine.tsx` | Interface riche ; règles métier partielles mock ; pas persistance. |
| Notifications | `PageNotifications.tsx` | Lecture/filtre/deep-links mock. |
| Profil/identité | `PageProfil.tsx` | Dépôt photo simulé par noms fixes, aucun fichier envoyé. |
| Paramètres | `PageParametres.tsx` | Toggles état local ; pas persistance ni effet système. |
| Données | `prisma`, `repositories` | Schéma/requêtes préparés ; API absente, schéma non aligné DB. |

Pages tontine : liste, création, rejoindre, détail avec onglets résumé/rotations/cotisations/membres/invitations/historique. Detail route recharge via service mock (`DetailTontineRoute.tsx:20`).

Permissions : UI utilise `estCreateur` mock ; aucune permission serveur. Données notifications dépendent `tontineId` pour navigation (`PageNotifications.tsx:50-59`).
