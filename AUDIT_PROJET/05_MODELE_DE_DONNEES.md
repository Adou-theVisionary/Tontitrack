# Modèle de données

## Stockages

- Actif UI : tableaux TypeScript mutables et snapshot `sessionStorage` (`lib/donnees-mock.ts`, `contexts/AppContext.tsx:61-76`).
- Préparé : PostgreSQL via Prisma (`prisma/schema.prisma`).

## Prisma — Confirmé dans fichier, non migré

Utilisateurs : `Utilisateur`, `Profil`, `Session`, vérifications email/téléphone, `Fichier`. Finances : `EspaceFinancier`, `Categorie`, `TransactionFinanciere`, `HistoriqueTransaction`. Tontines : `Tontine`, `MembreTontine`, `InvitationTontine`, `OrdreBeneficiaire`, `Rotation`, `Cotisation`, déclarations/preuves, versement et confirmation. Transversal : `Notification`, `EvenementAudit`, `OperationSynchronisation`.

Contraintes notables : email/téléphone uniques ; membre unique par tontine/utilisateur ; position et membre uniques par version d'ordre ; rotation unique par numéro/tontine ; cotisation unique rotation/membre ; idempotency key unique utilisateur (`prisma/schema.prisma`, modèles concernés).

Suppressions : espaces/transactions et relations principales utilisent `Cascade`; catégorie et annulateur transaction utilisent `SetNull`.

## État DB — Confirmé par migrations présentes

Migration initiale seule : `prisma/migrations/20260915154109_initial/migration.sql`. Elle crée ancien modèle de 19 tables. `schema.prisma` actuel ajoute/modifie modèles/enums mais migration `alignement_modele_metier` absente. Donc client généré et DB peuvent diverger. Ne pas seed avant migration sûre.

## Cohérence

Contrats frontend gardent `EN_ATTENTE`, `LITIGE`, `NON_RECU` (`types/index.ts`), alors schéma préparé utilise autres enums. Adaptateurs API explicites seront nécessaires, pas import Prisma côté client.
