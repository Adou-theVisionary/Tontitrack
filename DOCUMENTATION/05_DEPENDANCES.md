# Registre dépendances

Source : `package.json` consulté 10/10/2026.

| Groupe | Dépendances principales | Rôle observé |
|---|---|---|
| Application | Next 13.5.1, React 18.2, TypeScript 5.2 | UI App Router |
| UI | Tailwind, Radix UI, Lucide, CVA, clsx | composants/styles |
| Formulaires | React Hook Form, Zod, resolvers | disponibles ; usage partiel |
| Données | Prisma 5.22, `@prisma/client` | schéma/repositories serveur préparés |
| Déploiement | `@netlify/plugin-nextjs` | config Netlify présente |
| Autres | `@supabase/supabase-js` | présente, usage applicatif non trouvé |

## Authentification Phase 2.1

Je n'ai ajouté aucune dépendance. Hash mot de passe utilise `crypto.scrypt` Node.js. Validation utilise Zod déjà déclaré. Ce choix évite installation pendant intervention et reste compatible architecture serveur Next.js.

`typescript` et `@types/*` sont déclarés dans `dependencies`, non `devDependencies`. Lors audit 10/10/2026, `next lint` a tenté installation réseau puis échoué. Correction reportée, aucune dépendance modifiée cette intervention.

Toute ajout/retrait/mise à jour futur doit être consigné dans ce fichier et rapport intervention.
