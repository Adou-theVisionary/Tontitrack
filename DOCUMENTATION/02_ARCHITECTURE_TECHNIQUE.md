# Architecture technique

## Actuelle — Confirmé

Next.js App Router, React, TypeScript, Tailwind, Radix UI. `app/` porte routes ; `components/` interface ; `contexts/AppContext.tsx` état client ; `services/mock-api.ts` données/règles simulées ; `services/tontitrack-service.ts` est alias mock.

Prisma/PostgreSQL : `prisma/schema.prisma`, `lib/prisma.ts`, `repositories/`. Aucun endpoint API ni service métier serveur ne relie UI à repositories.

Flux actuel : composant → service mock → tableaux `lib/donnees-mock.ts` → snapshot `sessionStorage`.

Flux auth actuel : interface → routes `/api/auth` → service métier → repositories → Prisma → PostgreSQL. Interface ne doit jamais appeler Prisma/DB. Les domaines finances et tontines restent sur mock jusqu'à leurs API dédiées.

## Authentification serveur

Inscription crée transactionnellement `Utilisateur`, `Profil` et `VerificationEmail`. Connexion vérifie hash scrypt, statut compte et crée session aléatoire. Base conserve seulement empreinte SHA-256 du jeton. Cookie session est `HttpOnly`, `SameSite=Lax` et `Secure` en production. Layout `(application)` vérifie session côté serveur ; état React ne décide jamais accès.

## État migration

Migrations appliquées selon résultat manuel communiqué : initiale et `20261010135535_alignement_modele_metier`. Le statut Prisma doit être reconfirmé manuellement avant toute nouvelle évolution.

## Conventions

Nouveaux noms métier/commentaires en français si compatible. Ne pas coupler composants à Prisma. Ne pas supprimer `TontiTrackApp.tsx` legacy sans preuve d'inutilisation.
