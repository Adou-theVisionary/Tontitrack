# Index et preuves

1. `01_VISION_ET_CONTEXTE.md` — produit, dépôt, environnement.
2. `02_ANALYSE_FONCTIONNELLE.md` — parcours et règles.
3. `03_ARCHITECTURE_TECHNIQUE.md` — couches/flux.
4. `04_CARTOGRAPHIE_DES_MODULES.md` — modules.
5. `05_MODELE_DE_DONNEES.md` — Prisma, migrations, cohérence.
6. `06_AUDIT_SECURITE.md` — constats statiques et risques.
7. `07_QUALITE_TESTS_ET_EXECUTION.md` — commandes audit.
8. `08_INTERFACES_ET_EXPERIENCE.md` — UX depuis code.
9. `09_ETAT_AVANCEMENT.md` — état vérifié.
10. `10_PROBLEMES_ET_PRIORITES.md` — risques/actions.
11. `11_FEUILLE_DE_ROUTE.md` — séquence recommandée.
12. `12_DOSSIER_TRANSMISSION_CHATGPT.md` — reprise autonome.

## Sources principales inspectées

`package.json`, `tsconfig.json`, `next.config.js`, `netlify.toml`, `.gitignore`; toutes routes `app/`; `contexts/AppContext.tsx`; `types/*.ts`; `lib/{api-client,donnees-mock,format,prisma}.ts`; `services/*.ts`; `repositories/*.ts`; `prisma/schema.prisma` et migration initiale ; composants auth/finances/tontines/profil/notifications/navigation ; documentation existante.

## Vérifications

Typecheck : OK. Prisma validate : OK. Lint : non finalisé, tentative installation réseau Next échouée. Prisma migrate status : erreur moteur sans détail. npm audit : DNS indisponible. Build, DB contenu, UI navigateur, a11y, responsive, historique Git : non vérifiés audit.

## Limites

Audit statique, sans secrets, écriture DB, migration, seed, installation ni correction. Les constats « Confirmé » renvoient sources citées ; « non vérifié » signifie absence de preuve d'exécution.
