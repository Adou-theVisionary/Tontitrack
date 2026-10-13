# Intervention 0023 — Correction ESLint Phase 2.3

Date : 12/10/2026

## Objectif

J'ai corrigé quatre erreurs JSX `react/no-unescaped-entities` et trois avertissements images `@next/next/no-img-element`, sans désactiver règles ESLint.

## Contexte et état initial

Résultats manuels communiqués : validation Prisma et `npm run typecheck` ont réussi. ESLint signalait quatre apostrophes non échappées dans composants Tontine. Il signalait aussi trois balises `<img>` locales dans connexion, logo partagé et interface historique. Build n'a pas été exécuté après erreurs ESLint.

## Modifications

J'ai remplacé apostrophes JSX par `&apos;` dans `DemarrageTontine`, `DetailTontine` et deux textes `OrdreBeneficiaires`. Texte affiché reste identique.

J'ai remplacé les trois balises `<img>` par `Image` de `next/image`. Images restent locales sous `/images/logo.png`. J'ai conservé classes Tailwind, dimensions visuelles et comportement responsive ; dimensions intrinsèques sont déclarées pour optimiser chargement sans modifier rendu.

## Fichiers modifiés

- `components/tontines/DemarrageTontine.tsx`
- `components/tontines/DetailTontine.tsx`
- `components/tontines/OrdreBeneficiaires.tsx`
- `components/auth/PageConnexion.tsx`
- `components/Logo.tsx`
- `components/TontiTrackApp.tsx`
- `DOCUMENTATION/06_JOURNAL_DE_DEVELOPPEMENT.md`
- `DOCUMENTATION/07_PROBLEMES_ET_SOLUTIONS.md`
- `DOCUMENTATION/08_TESTS_ET_VALIDATIONS.md`

## Commandes chronologiques

### Lecture exécutée par Codex

J'ai lu `AGENTS.md`, documentation obligatoire, rapport 0022 et composants concernés. J'ai recherché balises `<img>`, imports `next/image` et apostrophes JSX. J'ai inspecté diff final. Ces lectures n'ont modifié aucun état applicatif.

### Exécutée manuellement par propriétaire

Validation Prisma et `npm run typecheck` ont réussi, selon résultat communiqué. Objectif : vérifier schéma et types. ESLint a signalé quatre erreurs `react/no-unescaped-entities` et trois avertissements `@next/next/no-img-element`, selon résultat communiqué.

### Proposée au propriétaire

Depuis `C:\Users\isasa\Desktop\tontitrack_prod` :

```powershell
npm run lint
npm run build
```

Objectif pédagogique : vérifier disparition des quatre erreurs JSX et trois avertissements images, puis compilation intégrale avec `Image`. Résultat attendu : aucune erreur ESLint liée aux fichiers corrigés et build réussi. Risque : ces commandes peuvent signaler problèmes existants ; elles ne modifient aucune donnée ni migration.

### Restante

Transmettre sorties lint et build. Si lint relève autre règle, corriger seulement cause pertinente avant nouvelle exécution manuelle.

## Dépendances, schéma et risques

Je n'ai ajouté aucune dépendance. `next/image` provient déjà de Next.js. Je n'ai modifié ni Prisma ni migration. Je n'affirme aucune validation après correction.
