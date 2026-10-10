# Intervention 0008 — Authentification réelle et sécurisée

## Objectif

J'ai remplacé connexion simulée par base d'authentification serveur : inscription, connexion, session HTTP sécurisée, déconnexion et protection serveur des routes applicatives.

## Architecture initiale

Pages d'authentification appelaient `tontiTrackService`, alias de `mockApi`. Layout applicatif appelait `connecter()` automatiquement et accordait donc accès démo sans session serveur. Prisma contenait déjà `Utilisateur`, `Profil`, `Session` et vérifications.

## Fichiers inspectés

`AGENTS.md`, documentation métier/architecture/décisions et rapports migration, `prisma/schema.prisma`, pages et composants auth, `AppContext`, layout applicatif, services, repositories, `package.json`.

## Modifications

- Ajout contrats Zod serveur, normalisation e-mail/téléphone et erreurs API françaises.
- Ajout hash scrypt natif Node.js ; mot de passe clair n'est jamais stocké.
- Ajout service métier et repositories auth/session avec transaction Prisma pour création `Utilisateur`, `Profil`, `VerificationEmail`.
- Ajout routes `inscription`, `connexion`, `moi`, `deconnexion`.
- Ajout session aléatoire, empreinte SHA-256 stockée, cookie `HttpOnly`, `Secure` en production, `SameSite=Lax`, expiration 14 jours, révocation serveur.
- Ajout limite mémoire de tentatives connexion par adresse et e-mail. Un limiteur partagé reste nécessaire en multi-instance.
- Ajout contrôle d'origine sur déconnexion.
- Protection serveur du groupe `(application)` : absence session redirige vers `/connexion`.
- Suppression connexion démo de page connexion. Compte démo ne donne plus accès aux routes privées sans session réelle.
- Formulaires connexion et inscription appellent API locale. Déconnexion révoque session puis redirige connexion. Données finances/tontines restent mocks et ne sont pas liées à compte réel.

## Dépendances

Aucune dépendance ajoutée. J'utilise `crypto`, `util` Node.js et Zod déjà présents.

## Commandes

- **Lecture exécutée par moi** : lecture fichiers et configurations listés ci-dessus.
- **Proposées au propriétaire** : validations TypeScript, lint, build et parcours auth ci-dessous.
- **Exécutées manuellement avec résultat communiqué** : migration `20261010135535_alignement_modele_metier`, génération Prisma Client et restauration de sauvegarde dans base distincte, selon contexte communiqué.
- **Restantes** : toutes validations de cette intervention.

## Limites et risques

- Aucun e-mail ni SMS n'est envoyé. `VerificationEmail` est créé mais son jeton n'est pas distribué ; vérification complète est volontairement différée.
- Récupération/changement mot de passe restent interfaces mock.
- Limitation tentatives est locale au processus ; remplacer par stockage partagé avant déploiement multi-instance.
- Aucune donnée finance/tontine réelle n'est encore chargée après connexion.
- Tests automatisés ne sont pas installés dans projet. Je n'ai créé aucun test exécutable sans outil de test validé.

## Validations manuelles proposées

Exécuter depuis `C:\Users\isasa\Desktop\tontitrack_prod`.

```powershell
npm run typecheck
npm run lint
npm run build
```

Rôle : vérifier types, règles lint et compilation. Résultat attendu : succès ; trois avertissements `<img>` historiques peuvent subsister. Risque : aucun changement métier, mais commandes écrivent artefacts locaux éventuels.

Puis démarrer application et vérifier manuellement : inscription valide, refus doublon, connexion valide/invalide, cookie absent de `document.cookie`, déconnexion, accès direct `/tableau-de-bord` sans cookie, compte suspendu et expiration session. Ne pas utiliser base contenant données non sauvegardées.

```powershell
npm run dev
```

Rôle : lancer environnement local pour parcours navigateur. Résultat attendu : application accessible localement. Risque : démarre serveur local ; arrêter manuellement après vérifications.

## Suite recommandée

Recevoir résultats des validations. Puis concevoir envoi réel e-mail, vérification jeton, réinitialisation mot de passe et limitation partagée avant production.

## Correction ultérieure TypeScript

Le contrôle manuel `npm run typecheck` a signalé TS2554 dans `lib/auth/mot-de-passe.ts`. Cette correction est décrite dans `INTERVENTIONS/0009_CORRECTION_SCRYPT_TYPESCRIPT.md`. Aucun résultat de validation après correction n'est encore communiqué.
