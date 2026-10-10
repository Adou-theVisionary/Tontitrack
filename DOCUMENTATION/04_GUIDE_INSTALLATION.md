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
