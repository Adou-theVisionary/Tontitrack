# Tests et validations

## Intervention 0020 — Corrections interfaces

Résultat manuel communiqué : `npm run typecheck` a signalé TS2345 dans `PageTontines.tsx` et TS2304 dans `DetailTontine.tsx`. J'ai corrigé source sans exécuter commande. Je dois relancer manuellement `npm run typecheck`; voir `INTERVENTIONS/0020_CORRECTION_TYPESCRIPT_INTERFACE_TONTINES.md`.

## Intervention 0019 — Interfaces Tontine

Je n'ai exécuté aucune commande technique. Je dois lancer manuellement `npm run typecheck`, `npm run lint` et `npm run build` depuis racine. Je dois ensuite vérifier invitations ciblées/lien, consentement, décisions demandes, actualisation membres, permissions administratives et persistance rechargement. Voir `INTERVENTIONS/0019_INTERFACES_INVITATIONS_MEMBRES_ADMINISTRATION.md`.

## Intervention 0018 — Correction Zod

Résultat manuel communiqué : `npm run typecheck` échoue avec TS2339, `partial` absent de `ZodEffects` dans `lib/tontines/contrats.ts`. J'ai corrigé source sans exécuter commande. Je dois relancer manuellement `npm run typecheck`, `npm run lint` et `npm run build`, puis tester modification partielle, date passée, pénalité incomplète et verrouillage après démarrage. Voir `INTERVENTIONS/0018_CORRECTION_ZOD_MODIFICATION_TONTINE.md`.

## Intervention 0017 — Invitations

Je n'ai exécuté aucune commande technique. Je dois lancer manuellement depuis la racine `npm run typecheck`, `npm run lint` puis `npm run build`. Je dois ensuite tester invitations ciblées et par lien, expiration, refus, révocation, consentement, capacité, concurrence, autorisations et absence de `jetonHash` dans réponses. Voir `INTERVENTIONS/0017_BACKEND_INVITATIONS.md`.

## Phase 2.2.1 — Schéma Prisma

Résultat manuel communiqué : `npx prisma migrate dev --name configuration_tontines_adhesions --create-only` échoue avec P1012 sur six enums déclarés sur une ligne. Correction source préparée. Je n'ai pas exécuté commande Prisma après correction.

## Phase 2.1.1 — Correction scrypt

Résultat manuel communiqué avant correction : `npm run typecheck` échoue avec deux TS2554 dans `lib/auth/mot-de-passe.ts`, lignes 11 et 25. Je n'ai exécuté aucune commande technique après correction.

Restent : `npm run typecheck`, `npm run lint`, `npm run build`. Tests unitaires scrypt sont préparés dans `tests/auth/mot-de-passe.test.ts`, mais aucun runner TypeScript n'est configuré ; ne pas les déclarer exécutés.

## Phase 2.1 — À exécuter manuellement

Je n'ai exécuté aucune commande technique. Exécuter `npm run typecheck`, `npm run lint`, puis `npm run build` depuis racine. Vérifier ensuite inscription, doublon, hash non exposé, connexion valide/invalide, compte suspendu, cookie `HttpOnly`, déconnexion et redirection `/tableau-de-bord` sans session.

Tests automatisés à préparer lorsque outil compatible sera validé : inscription valide/invalide/doublon, hash, connexion, session expirée, déconnexion, route privée sans session et isolation utilisateurs.

## Phase 1.4 — Résultats manuels communiqués

- Les 18 tables applicatives contrôlées contiennent exactement zéro enregistrement.
- Sauvegarde `tontitrack_avant_migration.backup` existe et mesure 39 797 octets.
- `pg_restore --list` a réussi et a répertorié 107 entrées.
- Restauration complète sauvegarde n'a pas été testée.

Ces validations ne confirment pas encore migration d'alignement. Restent : génération SQL Prisma, revue humaine, application explicitement autorisée puis `prisma migrate status` et `prisma generate`.

## Exécuté

| Date | Commande | Résultat |
|---|---|---|
| 10/10/2026 | `npm run typecheck` | OK |
| 10/10/2026 | `npx prisma validate` | OK |
| 10/10/2026 | `npm run lint` | Non finalisé : tentative installation réseau Next échouée |
| 10/10/2026 | `npx prisma migrate status` | Erreur moteur sans détail |
| 10/10/2026 | `npm audit --omit=dev --json` | Non exécuté : DNS registre indisponible |
| 10/10/2026 | `node --version`, `npm --version`, `npx prisma --version`, `npm ls --depth=0` | VALIDÉ : Node 24.18.0, npm 11.16.0, Prisma 5.22.0, dépendances installées |
| 10/10/2026 | `node_modules/.bin/eslint.cmd app components contexts hooks lib repositories services types --ext .ts,.tsx,.js` | VALIDÉ avec 3 avertissements `<img>`, 0 erreur |
| 10/10/2026 | `npm run build` | VALIDÉ : compilation et génération 23 routes réussies ; Browserslist signale données `caniuse-lite` anciennes |
| 10/10/2026 | `psql` lecture seule hors sandbox | VALIDÉ : PostgreSQL 18.6 accessible ; migration initiale appliquée |
| 10/10/2026 | `npx prisma migrate status` hors sandbox | VALIDÉ : 1 migration trouvée ; base à jour par rapport au dossier migrations |

## Recommandé, non exécuté cette intervention

`npm run build`; parcours UI navigateur ; tests unitaires/intégration/E2E inexistants. Toute nouvelle validation doit indiquer commande, date, résultat, limites et rapport intervention.
