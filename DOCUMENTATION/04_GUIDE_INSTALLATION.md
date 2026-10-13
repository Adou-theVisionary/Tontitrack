# Guide installation

## Procédure manuelle obligatoire

Les commandes ci-dessous sont documentées depuis `package.json`. Je les lance moi-même dans PowerShell depuis `C:\Users\isasa\Desktop\tontitrack_prod`, puis je conserve la sortie utile pour l'analyse et le journal.

## Commandes disponibles dans dépôt

```bash
npm ci
npm run dev
```

Scripts disponibles : `npm run typecheck`, `npm run lint`, `npm run build`, `npm start` (`package.json`).

Prisma utilise PostgreSQL et `DATABASE_URL` dans `.env`. Modèle : `.env.example`. Ne jamais committer `.env` ni afficher sa valeur.

Contrôles Prisma disponibles :

```bash
npx prisma validate
npx prisma migrate status
```

Avant chaque commande, je vérifie objectif pédagogique, résultat attendu et risque. Une commande proposée n'est jamais considérée réussie avant sortie réellement obtenue.

## Attention

Schéma Prisma actuel n'est pas aligné DB par migration. Ne pas lancer seed, reset ou `db push` sans lot migration validé. Tests automatisés : non déterminé/absents des scripts.

## Phase 3.1 — Préparation d'un test externe Super Admin

Je prépare un environnement isolé avec une base PostgreSQL de test, des comptes fictifs et une `DATABASE_URL` propre à cet environnement. Après revue et application manuelle de la migration, je génère le client Prisma puis j'amorce une seule fois un compte déjà créé et actif :

```powershell
$env:TONTITRACK_AMORCAGE_UTILISATEUR_ID = "<identifiant-cuid-du-compte-de-test>"
$env:TONTITRACK_AMORCAGE_CONFIRME = "OUI"
node scripts/amorcer-super-admin.mjs
Remove-Item Env:TONTITRACK_AMORCAGE_UTILISATEUR_ID
Remove-Item Env:TONTITRACK_AMORCAGE_CONFIRME
```

Cette procédure ne contient aucun identifiant, e-mail, mot de passe ou rôle caché dans le code. Elle est idempotente pour le même compte et refuse l'amorçage lorsqu'un Super Admin actif existe déjà.
