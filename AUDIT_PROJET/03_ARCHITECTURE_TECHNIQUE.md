# Architecture technique

## Architecture réelle — Confirmé

Next.js App Router. `app/layout.tsx` monte `AppProvider`; layout `(application)` force `connecter()` quand état client non connecté (`app/(application)/layout.tsx:7-9`). `AppShell` assure sidebar/navigation basse. Pages délèguent à composants métier.

Flux actuel : composant React → `tontiTrackService` → alias direct `mockApi` → tableaux mutables de `lib/donnees-mock.ts`; `AppContext` copie une partie état et sauvegarde snapshot dans `sessionStorage` (`contexts/AppContext.tsx:61-76`). Aucun appel DB/API dans parcours UI.

Flux cible préparé : UI → `lib/api-client.ts` → `NEXT_PUBLIC_API_URL` → API absente → services métier absents → repositories Prisma → PostgreSQL. `lib/api-client.ts` n'est pas utilisé par `tontiTrackService`.

## Couches

- `app/` : routes et layouts.
- `components/` : UI, pages et modales ; détail tontine 649 lignes, couplé aux règles mock.
- `contexts/` : session démo, transactions, notifications, tontines, réseau visuel.
- `types/` : contrats frontend, distincts du schéma Prisma.
- `services/mock-api.ts` : 442 lignes ; simulation et mutation mémoire.
- `repositories/` : requêtes Prisma minimales ; pas de services/API/autorisation.
- `prisma/` : schéma métier préparé, DB migrée seulement au modèle initial.

## Qualité

Points solides : routes App Router, contrat frontend centralisé, règles mock explicites, composant service pivot, Prisma singleton (`lib/prisma.ts`).

Risques : service est alias mock (`services/tontitrack-service.ts:1-5`), deux sources état pouvant diverger, application connecte tout visiteur, contrats Prisma/frontend divergent, repositories ne protègent aucun accès, `TontiTrackApp.tsx` legacy duplique interface.
