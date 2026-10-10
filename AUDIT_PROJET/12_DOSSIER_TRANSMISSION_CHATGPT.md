# Dossier transmission ChatGPT

## 1. Identité

TontiTrack V1, Next.js/TypeScript/Tailwind/Prisma/PostgreSQL. Interface française de finances et tontines.

## 2. Vision métier

Permettre à un utilisateur de suivre finances personnelles/activité et gérer tontines sans transfert d'argent interne.

## 3. Fonctionnement actuel

UI App Router complète en apparence. Connexion, transactions, tontines, cotisations, versements, notifications utilisent données mock en mémoire/sessionStorage. Application force mode démo dans layout applicatif.

## 4. Architecture

`app` route, `components` UI, `AppContext` état, `mockApi` simulation. Prisma/schema/repositories sont préparés mais aucune API métier ne relie UI à PostgreSQL. `tontiTrackService` est actuellement alias mock.

## 5. Structure essentielle

`app/` routes ; `components/tontines` logique UI ; `services/mock-api.ts` règles mock ; `types/index.ts` DTO frontend ; `prisma/schema.prisma` modèle cible ; `repositories/` accès Prisma minimal ; `docs/ETAT_PROJET_TONTITRACK.md` continuité antérieure.

## 6. Modules

Auth, profil/identité, finances, tontines, cotisations/versements, notifications, paramètres. Tous sont UI/mock sauf Prisma/repositories non connectés.

## 7. Base de données

Migration initiale appliquée. Schéma actuel ajoute profils, sessions, fichiers, catégories et détails tontines, mais n'est pas migré. Ne pas seed avant alignement.

## 8. Auth et sécurité

Pas auth réelle. Pas session/cookie/API/autorisation. Identifiants démo visibles. Repositories sans isolation utilisateur. Fichiers non implémentés. Cela bloque toute exposition réelle.

## 9. État développement

Typecheck audit OK. UI non testée visuellement. Lint non exécuté entièrement le 10/10/2026 (Next tente install réseau). Build historique OK, non relancé audit. Tests absents.

## 10. Problèmes connus

Migration DB bloquée, mocks, contrats frontend/Prisma incompatibles, auth/permissions absentes, fichiers/jobs/PWA absents, legacy `TontiTrackApp.tsx`.

## 11. Décisions à préserver

Trois modes tontine : `FIXE_CREATEUR` créateur non contributeur/toujours bénéficiaire ; `TOURNANT_EXCLU` bénéficiaire `NON_CONCERNE` sans cotisation 0 ; `TOURNANT_INCLUS` bénéficiaire contribue. XOF initial, fuseau IANA, versements externes, frontend jamais Prisma/DB. Préserver logo `public/images/logo.png` sans recoloration.

## 12. Prochaines étapes

Commencer lot 5B : produire et inspecter migration `alignement_modele_metier` en sécurité. Puis seed idempotent, API/services, auth/permissions, finances/tontines réelles, fichiers/jobs/tests.

## 13. Questions propriétaire

- Quel hébergeur/API et stratégie déploiement ?
- Quel fournisseur e-mail/OTP ?
- Quel mécanisme exceptionnel peut modifier ordre après démarrage ?
- Quelles règles exactes litige, clôture et contrôle identité ?
- Faut-il conserver Supabase ou supprimer dépendance ?

## 14. Consignes futur assistant

Lire `docs/ETAT_PROJET_TONTITRACK.md`, schéma/migrations, `types/index.ts`, mocks avant modifier. Ne jamais reset/db push. Ne jamais connecter UI à Prisma. Vérifier migrations, règles trois modes, types, lint/build après lot. Ne pas supprimer legacy sans usages prouvés.

## 15. Reprise immédiate

Construisons gestion finances/tontines pour utilisateur francophone. Aujourd'hui interface mock fonctionne partiellement. DB cible existe seulement dans fichier. Blocage : migration sûre et sécurité serveur. Décision : valider transition enums/contraintes. Première action : inspection SQL migration, pas seed.
