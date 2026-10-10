# TontiTrack V1 — État de projet et continuité

## Session du 15/09/2026 — pause

| Élément | État |
| --- | --- |
| PostgreSQL local / base `tontitrack` / rôle `tontitrack` / `CREATEDB` | OK |
| Prisma | OK |
| Migration initiale | Appliquée |
| `schema.prisma` | Alignement métier préparé, non migré |
| Migration `alignement_modele_metier` | Non créée |
| Seed | Non créé |
| Frontend | Fonctionnel visuellement, logique mock partielle |
| Backend | Architecture cible définie, non connecté |
| Production | Non prête |

## Produit et périmètre V1

TontiTrack gère finances personnelles, activités et tontines. Application française, mobile-first, utilisable sur desktop, future PWA. Architecture cible : frontend Next.js, API serveur sécurisée, services métier, repositories, Prisma, PostgreSQL. Frontend ne doit jamais accéder directement à Prisma ou PostgreSQL.

V1 exclut wallet, transfert d'argent, paiement bancaire interne, intégration bancaire, IA, OCR, vérification d'identité automatique, comptabilité professionnelle complète, sanctions avancées, absences avancées, WhatsApp/SMS généralisé et assistant créateur avancé. Versements de tontine sont externes à l'application.

## Identité et UX

- Logo officiel : `public/images/logo.png`.
- Préserver palette, proportions et transparence. Ne jamais appliquer `brightness-0 invert`.
- Référence visuelle : `docs/IDENTITE_VISUELLE.md`.
- Desktop : sidebar. Mobile : navigation basse Accueil, Finances, Tontines, Notifications, Profil.
- Cibles responsive : 360, 375, 390 et 430 px.
- Chaque écran doit fournir actions contextuelles, états loading/error/empty, statuts lisibles, accessibilité et actions réelles ; aucun TODO ou bouton fictif en production.

## Frontend actuel

Stack présente : Next.js App Router, TypeScript, Tailwind CSS, React Hook Form, Zod. Structure réelle à la racine : `app/`, `components/`, `services/`, `lib/`, `types/`. Architecture future souhaitée : domaines de services/API, hooks, schémas, cache Dexie, PWA/service worker. TanStack Query, Dexie et PWA ne sont pas encore intégrés comme système réel.

Routes applicatives créées :

```text
/tableau-de-bord
/finances
/finances/espaces
/finances/categories
/finances/transactions
/finances/historique
/tontines
/tontines/nouvelle
/tontines/rejoindre
/tontines/[tontineId]
/notifications
/profil
/profil/identite
/parametres
```

Navigation desktop/mobile est basée sur URLs. Détails et onglets tontines sont synchronisés avec URL. Notifications ciblent membres, cotisations, rotations, invitations et résumé. Création tontine redirige correctement. `TontiTrackApp.tsx` reste legacy : ne pas supprimer sans confirmer qu'il est inutilisé.

Services réellement présents : `services/mock-api.ts` et `services/tontitrack-service.ts`. Aucun repository Prisma n'existe actuellement dans `services/` ; ne pas prétendre que backend est prêt.

## Travaux terminés

### Lot 1 — stabilisation frontend

- Dépendances installées via `npm ci`.
- Compatibilité TypeScript/Next et erreurs JSX ESLint corrigées.
- `tontiTrackService` isole progressivement composants de `mockApi`.
- Mutations mock persistent pendant session, avec reset démo.
- Bug versement corrigé : confirmation/litige utilisent `versementId`; déclaration utilise `rotationId`.
- Logo original conservé sur connexion.
- Labels/accessibilité ajoutés au modal versement.

### Lot 2 — logique tontines mock

- Approbation/refus/retrait pré-démarrage d'un membre.
- Ordre bénéficiaire persistant et verrouillé après démarrage.
- Déclaration, validation, rejet motivé et resoumission de cotisation.
- Déclaration, confirmation et litige/non-réception de versement.
- Rafraîchissement ciblé, conservation des données de démonstration, blocage métier des actions interdites.

Règles déjà contrôlées côté mock : `NON_CONCERNE` ne déclare pas ; montant déclaré plafonné au reste ; déclarations en attente prises en compte ; seul montant validé modifie cotisation ; tontines actives/fermées protègent mutations ; ordre modifiable seulement avant démarrage.

### Lot 3 — routage

Routes ci-dessus créées. Deep links, retour et onglets tontine synchronisés. Au dernier build, 23 routes.

### Lot 4 — PostgreSQL et Prisma

PostgreSQL 18 local sous Windows, service `postgresql-x64-18`. Base locale : `tontitrack`. Rôle applicatif local : `tontitrack`, avec `CREATEDB` pour shadow database de Prisma. Chemin usuel outils PostgreSQL : `C:\Program Files\PostgreSQL\18\bin\`.

`DATABASE_URL` est documentée dans `.env.example`. Ne jamais committer `.env`, exposer `DATABASE_URL` au navigateur, ni réutiliser credentials locaux en production.

Migration historique appliquée : `prisma/migrations/20260915154109_initial/migration.sql`. Elle a créé 19 tables. Ne jamais modifier ce SQL manuellement, utiliser `prisma db push` pour remplacer Prisma Migrate, ni réinitialiser une base contenant des données.

`npx prisma validate`, `npx prisma generate` et `npx prisma migrate status` étaient OK. La migration initiale est seule migration appliquée.

### Lot 5A — alignement préparé, non migré

Onze écarts métier ont été relevés. `prisma/schema.prisma` prépare : profils, statut et vérifications utilisateur, sessions, fichiers, catégories, statuts espaces, transactions/historique, rôles membres, participants requis, statuts/échéances rotations, déclarations/preuves, confirmation réception, notifications enrichies, audit et synchronisation.

Écart actuel prioritaire : `schema.prisma` ne correspond plus à schéma PostgreSQL appliqué. Prisma a refusé migration non interactive après signalement de retraits possibles des valeurs d'enum `EN_ATTENTE`, `NON_RECU`, `LITIGE`, `CONFIRMEE_AUTOMATIQUEMENT`, et de nouvelles contraintes uniques. Aucune migration `alignement_modele_metier` n'a été créée ou appliquée.

Prochain lot obligatoire : générer puis inspecter SQL de migration dans environnement interactif sûr, analyser les transitions d'enums et contraintes, vérifier absence de perte, appliquer seulement si sûr. Ne pas créer seed avant cette étape. Ne jamais utiliser `prisma migrate reset` ou `prisma db push` comme contournement.

## Règles métier verrouillées

### Modes tontine

- `FIXE_CREATEUR` : créateur toujours bénéficiaire, ne contribue jamais ; autres membres contribuent ; nombre de tours = membres hors créateur ; créateur jamais en retard de cotisation.
- `TOURNANT_EXCLU` : bénéficiaire tourne, est `NON_CONCERNE` sur son tour, sans obligation artificielle à 0 XOF ; contribue aux autres tours.
- `TOURNANT_INCLUS` : bénéficiaire tourne et contribue aussi ; tout membre peut être en retard.

### Cycle tontine

- Démarrage lorsque participants requis atteints et date arrivée ; approbation finale après date déclenche démarrage immédiat.
- Avant démarrage : remplacement possible, ordre bénéficiaire modifiable. Après démarrage : pas de départ libre, ordre verrouillé sauf mécanisme exceptionnel audité.
- Déclaration cotisation : montant et preuve, plafond obligation applicable, partiel admis, validation seule compte, rejet motivé, resoumission et historique de versions/décisions.
- Versement : bénéficiaire confirme ou déclare non-réception ; confirmation automatique après 48 h glissantes selon conditions.
- Clôture après dernière rotation et conditions de réception ; historique reste accessible.

## Données de démonstration à créer après migration

Seed Prisma idempotent, sans suppression totale de base, devra créer Moussa Traoré (`demo@tontitrack.local`), pays Côte d'Ivoire, activité Boutique Moussa et résultats globaux : revenus 1 500 000 XOF, dépenses 650 000 XOF, épargne 250 000 XOF, investissements 150 000 XOF, disponible 450 000 XOF.

Tontines : Tontine Solidarité (`TOURNANT_EXCLU`, `ACTIVE`, 100 000 XOF mensuel, 8 participants), Épargne Famille (`TOURNANT_INCLUS`, `PRETE_A_DEMARRER`) et Projet Entrepreneur (`FIXE_CREATEUR`, `EN_PREPARATION`). Prévoir membres fictifs, demandes d'adhésion, notifications lues/non lues, rotations/cotisations compatibles avec chaque mode.

## Backend, sécurité et opérations à construire

Backend V1 : API serveur, services métier, repositories Prisma, authentification email/téléphone/mot de passe, OTP, sessions sécurisées, récupération/reset mot de passe, validation serveur, rate limiting, audit et autorisations objet.

Identité avant création/rejoint tontine : recto/verso stockés de façon sécurisée, jamais visibles aux membres ordinaires, sans vérification automatique. Fichiers futurs : stockage objet privé, URLs signées, contrôle MIME/taille, politique de suppression.

Autorisations : utilisateur sur ses seules finances ; créateur sur actions autorisées de sa tontine ; membre sur ses propres données/actions ; documents privés ; créateur sans accès aux finances privées intégrales des membres.

Prévoir notifications internes, e-mails auth/événements importants, jobs idempotents pour retards, rotations, démarrage, auto-confirmation 48 h, fermeture et notifications. Offline futur : IndexedDB/Dexie, file différée, idempotency keys, conflits, audit `OFFLINE_SYNC`. Import/export V1 : CSV ; valider fichier entier avant insertion et fournir erreurs claires.

## Tests et dette technique

Tests à ajouter : auth, finances (dont solde et isolation utilisateur), trois modes tontine, sécurité inter-utilisateur, offline/synchronisation/doublons/conflits. Cas tontine : création, invitation/demande, approbation/refus, ordre/verrouillage, démarrage, cotisations partielles, validation/rejet/resoumission, versement, réception, non-réception, auto-confirmation et clôture.

Dette connue uniquement : trois warnings ESLint `<img>` ; `TontiTrackApp.tsx` legacy à vérifier ; mocks encore présents ; frontend non branché backend réel ; API/auth/stocker fichiers/jobs/offline réels absents ; seed absent ; migration d'alignement non appliquée ; tests automatisés à compléter.

## Plan de continuation

1. Lot 5B : génération et inspection sûre de migration d'alignement.
2. Lot 5C : seed Prisma idempotent après migration validée.
3. Lot 6 : infrastructure backend/API et repositories.
4. Lot 7 : authentification et sessions réelles.
5. Lot 8 : finances API/Prisma.
6. Lot 9 : tontines API/Prisma.
7. Lot 10 : fichiers, preuves et documents sécurisés.
8. Lot 11 : notifications.
9. Lot 12 : jobs planifiés.
10. Lot 13 : offline/Dexie/synchronisation.
11. Lot 14 : import/export CSV.
12. Lot 15 : autorisation, audit, sécurité complète.
13. Lot 16 : suppression mock restant et nettoyage legacy.
14. Lot 17 : tests unitaires/intégration/E2E.
15. Lot 18 : PWA, accessibilité, responsive final.
16. Lots 19–22 : préparation production, déploiement staging, tests staging, production.

## Production

Avant production : PostgreSQL séparé, credentials/secrets hors Git et rotation, migrations contrôlées, sauvegardes/restauration testée, monitoring, HTTPS, cookies/CSRF selon architecture, rate limiting, protection brute force, headers sécurité, logs/alertes/audit, stockage privé, fournisseur e-mail avec SPF/DKIM/DMARC, staging, rollback et contrôle de déploiement.
