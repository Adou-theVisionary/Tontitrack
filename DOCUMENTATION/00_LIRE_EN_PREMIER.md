# Lire en premier

TontiTrack est une application française de tontines. Interface existante inclut aussi finances personnelles/activité, mais cette partie est **reportée** : priorité présente = finaliser module Tontine. Paiements réels restent futurs ; aucun transfert interne n'existe.

## Démarrer

1. Lire `01_PRESENTATION_PROJET.md` puis `03_REGLES_METIER_TONTINE.md`.
2. Lire `02_ARCHITECTURE_TECHNIQUE.md`, `07_PROBLEMES_ET_SOLUTIONS.md` et dernière intervention.
3. Respecter `AGENTS.md` avant modifier.
4. J'exécute moi-même toute commande technique. La procédure prépare commande, répertoire, objectif, résultat attendu et risques ; seules lectures sans effet de bord sont réalisées pendant l'analyse.

## Authentification actuelle

Je protège groupe `(application)` par session serveur. Les comptes réels passent par `/api/auth`; accès démo automatique est supprimé. Finances et tontines affichent encore mocks après connexion : ne pas les confondre avec données personnelles persistées. Voir `INTERVENTIONS/0008_AUTHENTIFICATION_REELLE.md`.

## Installation locale — Confirmé

Prérequis : Node.js et PostgreSQL pour travaux Prisma. Je copie valeurs adaptées depuis `.env.example` vers `.env` local, sans le committer. J'exécute installation, lancement et contrôles manuellement : `npm ci`, `npm run dev`, `npm run typecheck`, `npm run lint`, `npm run build`, `npx prisma validate`, `npx prisma migrate status`, après explication de chaque commande.

Tests automatisés : aucun script de test détecté. Les commandes ci-dessus ne prouvent pas parcours métier.

## Organisation

- `DOCUMENTATION/INTERVENTIONS/` : journal détaillé de chaque intervention.
- `06_JOURNAL_DE_DEVELOPPEMENT.md` : chronologie synthétique.
- `07_PROBLEMES_ET_SOLUTIONS.md` : blocages connus.
- `08_TESTS_ET_VALIDATIONS.md` : commandes réellement exécutées et résultats.
- Les rapports distinguent lectures d'analyse, commandes proposées, commandes manuelles confirmées et commandes restantes.
- `AUDIT_PROJET/` : audit détaillé antérieur.

## Première reprise recommandée

Avant développer Tontine, réaliser lot migration sûr : schéma Prisma actuel diffère migration DB initiale. Inspecter SQL et transitions enum/contraintes ; ne pas seed ni utiliser reset/db push sans validation explicite.
