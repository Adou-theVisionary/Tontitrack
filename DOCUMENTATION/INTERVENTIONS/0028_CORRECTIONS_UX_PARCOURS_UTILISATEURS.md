# Intervention 0028 — Corrections UX et parcours utilisateurs

Date : 12/10/2026

## Objectif, contexte et diagnostic

J'ai traité cinq anomalies : perte du lien d'invitation après authentification, absence de redirection après acceptation, absence de synchronisation visible, formulaire de déclaration intégré à la page et absence de preuve de paiement privée. Le suivi résumé utilisait encore des données non adaptées aux API réelles.

## Modifications

- J'ai ajouté middleware et validation stricte du retour interne, puis propagation connexion/inscription sans journaliser le jeton.
- J'ai fait retourner l'identifiant réel de tontine après acceptation serveur et redirige uniquement après confirmation.
- J'ai créé `useRafraichissementActif` : intervalle de 60 secondes uniquement document visible, anti-chevauchement et nettoyage démontage. Il rafraîchit détail, invitations, membres, cotisations et notifications sans réinitialiser formulaires.
- J'ai remplacé déclaration inline par dialogue Radix accessible et responsive avec prévisualisation d'image.
- J'ai réutilisé `Fichier` et `PreuveCotisation` : contrôle binaire JPG/PNG/WebP, limite 5 Mo, écriture hors `public/`, association transactionnelle et lecture autorisée seulement au déclarant/créateur.
- J'ai ajouté aperçu réel membre/créateur des cotisations actives et liens vers rubriques concernées.

## Fichiers et migration

J'ai modifié authentification, invitations, cotisations, service Tontine, client API, détails, notifications, `.gitignore`, `.env.example` et documentation. J'ai ajouté middleware, navigation de retour, stockage privé, rafraîchissement, aperçu et route de lecture des preuves. Je n'ai créé ni modifié migration : les modèles preuve existent, mais migration Phase 2.4 et Prisma Client généré restent requis.

## Commandes chronologiques

### Lecture exécutée par Codex

J'ai lu consignes, règles, architecture, dernier rapport, routes, composants, schéma et stockage existants. J'ai inspecté sources modifiées sans exécuter commande applicative.

### Exécutée manuellement par propriétaire

Le typecheck ayant signalé TS2802 avant intervention précédente reste consigné dans rapport 0027. Aucune nouvelle sortie n'a été communiquée pour cette intervention.

### Proposée au propriétaire

Non déterminé.

### Restante

Depuis `C:\Users\isasa\Desktop\tontitrack_prod`, exécuter `npx prisma generate`, `npm run typecheck`, `npm run lint`, puis `npm run build`. Objectif : aligner client Prisma après migration et contrôler code. Résultat attendu : absence d'erreur liée aux parcours corrigés. Risque : commandes peuvent révéler problèmes indépendants et ne valident pas stockage déployé.

## Dépendances, tests, risques et reprise

Je n'ai ajouté aucune dépendance ni exécuté test. Les scénarios manuels sont dans `08_TESTS_ET_VALIDATIONS.md`. Risques : migration Phase 2.4 non appliquée, répertoire local non persistant en production et erreurs distinctes révélées par contrôles. Je dois définir `TONTITRACK_STOCKAGE_PRIVE` vers volume privé persistant, analyser sorties manuelles et vérifier droits de lecture avec trois comptes avant déploiement.
