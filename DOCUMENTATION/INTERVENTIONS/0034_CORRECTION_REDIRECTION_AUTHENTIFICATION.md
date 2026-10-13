# Intervention 0034 — Correction de la redirection après authentification

**Date :** 13/10/2026  
**Objectif :** Diriger une session nouvellement authentifiée vers un espace interne autorisé selon ses rôles et permissions persistés.

## Contexte et diagnostic

Le propriétaire a confirmé que la migration Phase 3.1 et l'amorçage du premier Super Admin ont réussi. Ce compte accédait directement à `/administration-plateforme`, mais une connexion normale le redirigeait vers `/tableau-de-bord`.

J'ai identifié deux causes complémentaires : `PageConnexion` utilisait systématiquement le défaut client `/tableau-de-bord` et la réponse de `/api/auth/connexion` ne contenait ni destination calculée ni information de rôle utilisable. Le validateur des retours excluait aussi l'administration. Les rôles existaient pourtant dans les lectures de session ; ils n'étaient simplement pas consultés au moment de choisir la destination.

## Lecture exécutée par Codex

- J'ai lu `AGENTS.md`, la documentation de cadrage, les règles métier, l'architecture et le rapport 0033.
- J'ai lu les routes et composants de connexion/déconnexion, la session, le repository d'authentification, le registre de permissions, les layouts utilisateur et administration, les tests et documents concernés.
- Je n'ai exécuté aucune commande technique, migration, génération Prisma, test, lint, typecheck ni build.

## Fichiers modifiés ou ajoutés

- `lib/navigation/retour.ts`
- `lib/navigation/destination-authentification.ts`
- `lib/auth/contrats.ts`
- `repositories/authentification.repository.ts`
- `services/authentification.service.ts`
- `app/api/auth/connexion/route.ts`
- `components/auth/PageConnexion.tsx`
- `tests/auth/redirection-authentification.test.ts`
- `DOCUMENTATION/02_ARCHITECTURE_TECHNIQUE.md`
- `DOCUMENTATION/06_JOURNAL_DE_DEVELOPPEMENT.md`
- `DOCUMENTATION/07_PROBLEMES_ET_SOLUTIONS.md`
- `DOCUMENTATION/08_TESTS_ET_VALIDATIONS.md`
- `DOCUMENTATION/09_DECISIONS_TECHNIQUES.md`
- Ce rapport.

## Correction apportée

J'ai ajouté une fonction de destination post-authentification centralisée. La route de connexion relit les rôles actifs depuis PostgreSQL, calcule les permissions via le registre existant et produit la destination côté serveur. Un utilisateur avec `plateforme.tableau_de_bord.lire`, notamment `SUPER_ADMIN`, rejoint `/administration-plateforme` par défaut. Un compte standard rejoint `/tableau-de-bord`.

Je conserve un retour demandé uniquement s'il est interne et autorisé : un Super Admin peut conserver un retour administratif ou Tontine ; un utilisateur standard peut conserver un retour Tontine mais ne peut pas être envoyé vers l'administration. Les URL externes, doubles slashs et barres obliques inverses restent refusés. Les protections des layouts et des routes API ne changent pas, ce qui évite qu'une redirection devienne une autorisation.

Les rôles sont relus lors de l'authentification et par `obtenirUtilisateurAuthentifie` à chaque session lue. Le projet ne possède pas de renouvellement explicite de session : chaque demande protégée recharge donc les rôles persistés au lieu de conserver un rôle dans le cookie. Une attribution ou un retrait est appliqué aux demandes suivantes et à la prochaine connexion ; la suspension continue d'invalider les sessions côté serveur. La déconnexion conserve son retour vers `/connexion` et ne crée pas de boucle.

## Tests préparés

J'ai ajouté des cas déterministes de destination dans `tests/auth/redirection-authentification.test.ts`. J'ai également consigné les parcours manuels Super Admin, standard, suspendu, changement de rôle, session invalide, retours autorisés/refusés, déconnexion et boucles potentielles. Aucun test n'a été exécuté.

## Commandes restantes

Depuis PowerShell dans `C:\Users\isasa\Desktop\tontitrack_prod` :

```powershell
npm run typecheck
npm run lint
npm run build
```

**Catégorie : Restante.** Objectif pédagogique : vérifier les contrats TypeScript, les règles JSX/qualité et le routage compilé. Résultat attendu : aucune erreur liée au contrat de connexion, à la destination centralisée ou aux imports. Risque : ces commandes peuvent révéler des écarts préexistants ; elles ne modifient pas les données métier mais le build peut écrire des artefacts locaux.

## Risques et consignes de reprise

Je dois effectuer le parcours navigateur avec au moins un compte Super Admin actif, un compte standard et un compte suspendu de test. Je dois aussi tester un retrait puis une réattribution de rôle entre deux requêtes authentifiées, sans modifier de compte de production. Les futurs espaces doivent s'ajouter dans le registre de permissions et dans la règle centralisée de destination, jamais par une redirection client non contrôlée.
