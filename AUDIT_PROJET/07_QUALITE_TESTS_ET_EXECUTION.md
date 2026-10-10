# Qualité, tests et exécution

## Scripts

`package.json` : `dev`, `build`, `start`, `lint`, `typecheck`. Aucun test, test E2E, CI, Docker ou pipeline détecté.

## Vérifications audit du 10/10/2026

| Commande | Résultat | Note |
|---|---|---|
| `npm run typecheck` | OK | `tsc --noEmit`, aucune erreur. |
| `npm run lint` | Non exécutée complètement | Next tente installer TypeScript/types comme devDependencies puis échoue réseau. Dépendances sont pourtant installées (`npm ls`). Aucun fichier modifié volontairement. |
| `npx prisma validate` | OK | Schéma Prisma syntaxiquement valide. |
| `npx prisma migrate status` | Erreur | `Schema engine error`, sans détail fourni ; aucune migration appliquée. |
| `npm audit --omit=dev --json` | Non exécutée | DNS `registry.npmjs.org` indisponible. |
| Build | Non exécuté ce lot | Aucun code modifié ; historique projet indique build antérieur OK, non revalidé ici. |

Qualité : TypeScript strict (`tsconfig.json`), ESLint Next core-web-vitals. Validation Zod existe dans `types/modeles-formulaires.ts` mais formulaires principaux emploient surtout validations manuelles/HTML. `next.config.js` ignore ESLint pendant build : risque build vert malgré lint.
