# Présentation projet

## Finalité

TontiTrack aide utilisateurs à créer, administrer et suivre tontines. UI actuelle couvre aussi finances, profil et notifications. Sources : `AUDIT_PROJET/01_VISION_ET_CONTEXTE.md`, `types/index.ts`.

## Priorités validées

1. Finaliser entièrement module Tontine.
2. Reporter finances personnelles/activité ; conserver code sans élargir fonctionnellement module.
3. Prévoir intégration future moyens de paiement, sans implémentation présente.
4. Documenter chaque intervention.

## État réel

UI Tontine est riche mais fonctionne avec données mock/sessionStorage. Backend/API/auth et paiements réels ne sont pas implémentés. Prisma/PostgreSQL sont préparés mais schéma actuel n'est pas migré entièrement. Sources : `services/mock-api.ts`, `contexts/AppContext.tsx`, `prisma/`.

## Hors périmètre actuel

Finances nouvelles, paiement réel, banque/mobile money, migration non validée, seed, refonte générale.
