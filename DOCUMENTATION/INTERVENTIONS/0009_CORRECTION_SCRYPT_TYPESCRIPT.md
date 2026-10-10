# Intervention 0009 — Correction TypeScript scrypt

## Objectif

J'ai corrigé les deux erreurs TS2554 de hash et vérification des mots de passe, sans réduire paramètres scrypt ni garanties de comparaison sécurisée.

## Cause

`promisify(scryptNode)` a inféré surcharge TypeScript à trois arguments. Or appel devait conserver surcharge Node `scrypt(password, salt, keylen, options, callback)`. Les options `N`, `r`, `p` et `maxmem` devenaient donc incompatibles avec type inféré.

## Solution

J'ai remplacé `promisify` par enveloppe `Promise<Buffer>` explicite qui appelle signature Node à cinq arguments. Format persistant reste `scrypt$16384$8$1$<sel>$<dérivé>`. Sel aléatoire, scrypt, longueur 64 octets et `timingSafeEqual` restent présents.

Je refuse hash malformé, format inattendu, paramètres différents, dérivé de mauvaise taille et erreur de dérivation. Vérification retourne `false` sans exposer cause ni donnée sensible.

## Tests préparés

J'ai ajouté `tests/auth/mot-de-passe.test.ts` avec cas : format et paramètres, bon mot de passe, mauvais mot de passe, empreinte invalide et absence du mot de passe dans hash. Projet ne contient pas encore runner TypeScript validé ; tests ne sont pas exécutés.

## Fichiers

- `lib/auth/mot-de-passe.ts`
- `tests/auth/mot-de-passe.test.ts`
- `DOCUMENTATION/INTERVENTIONS/0008_AUTHENTIFICATION_REELLE.md`
- `DOCUMENTATION/06_JOURNAL_DE_DEVELOPPEMENT.md`
- `DOCUMENTATION/07_PROBLEMES_ET_SOLUTIONS.md`
- `DOCUMENTATION/08_TESTS_ET_VALIDATIONS.md`
- `DOCUMENTATION/INTERVENTIONS/0009_CORRECTION_SCRYPT_TYPESCRIPT.md`

## Commandes

- **Lecture exécutée par moi** : `AGENTS.md`, fichier scrypt, déclarations `@types/node`, rapports et registre tests.
- **Exécutée manuellement par propriétaire** : `npm run typecheck` avant correction ; échec TS2554 lignes 11 et 25 communiqué.
- **Proposées au propriétaire** : commandes ci-dessous.
- **Restantes** : réception et analyse résultats.

Exécuter depuis `C:\Users\isasa\Desktop\tontitrack_prod` :

```powershell
npm run typecheck
npm run lint
npm run build
```

Rôle : valider types, lint et build. Résultat attendu : TS2554 absent ; lint peut conserver avertissements historiques `<img>`. Risque : build crée artefacts locaux.

Pour exécuter test TypeScript, aucun runner compatible n'est encore configuré. Je dois d'abord recevoir choix explicite d'un outil ou inventaire d'un outil déjà installé ; aucune dépendance n'est ajoutée.

## Risques et suite

Validation manuelle reste nécessaire. Une stratégie de migration de hash devra être définie si paramètres scrypt évoluent ultérieurement.
