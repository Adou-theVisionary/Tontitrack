# Vision et contexte

## Identité — Confirmé

Projet NPM nommé `nextjs`, mais marque produit **TontiTrack**. Métadonnées : « Vos finances, en confiance » (`app/layout.tsx:5-9`). Produit français de gestion de finances personnelles, activités et tontines. Sources métier : `docs/ETAT_PROJET_TONTITRACK.md`, `types/index.ts`, `lib/donnees-mock.ts`.

Utilisateurs visibles : particulier, propriétaire d'activité et créateur/membre de tontine. Valeur : suivre revenus/dépenses/épargne/investissement et organiser cotisations, rotations et versements externes.

## Dépôt — Confirmé

- Application unique Next.js App Router, sans API route présente (`app/`).
- UI : `components/`; état client : `contexts/AppContext.tsx`; mocks : `lib/donnees-mock.ts`, `services/mock-api.ts`.
- Prisma/PostgreSQL préparés : `prisma/schema.prisma`, migration initiale.
- Repositories Prisma présents mais non appelés par routes/API : `repositories/`.
- Documents existants : `docs/IDENTITE_VISUELLE.md`, `docs/ETAT_PROJET_TONTITRACK.md`.

Git : aucun répertoire `.git` détecté lors audit. Historique, branches et état Git : **inconnus**.

## Environnement — Confirmé / non vérifié

`package.json` : Next 13.5.1, React 18, TypeScript, Tailwind, Radix UI, React Hook Form, Zod, Prisma 5, Netlify plugin. PostgreSQL local est documenté dans `docs/ETAT_PROJET_TONTITRACK.md`; connexion et contenu DB non vérifiés pendant audit.

## Limites

Pas de README, tests, CI, Docker, PWA manifest réel ni service worker détectés. Présence de `@supabase/supabase-js` dans dépendances, mais aucune importation applicative trouvée : utilisation **inconnue**.
