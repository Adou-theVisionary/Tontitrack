# Intervention 0025 — Exception temporaire identité

Date : 12/10/2026

## Objectif

J'ai documenté décision métier temporaire concernant dépôt de pièce d'identité pour fonctionnalités Tontine. Je n'ai modifié aucun fichier applicatif, API, modèle Prisma ou migration.

## Décision et contexte

Dans version finale, je dois exiger dépôt d'une pièce d'identité avant création de tontine, demande d'adhésion, acceptation d'invitation et devenir membre d'une tontine. Pendant développement, je suspends volontairement cette exigence afin de faciliter tests fonctionnels avec plusieurs comptes.

Le dépôt signifie qu'une pièce est fournie et disponible au contrôle. Il est distinct d'une vérification effective, qui consiste à valider identité à partir de cette pièce. Je ne prétends pas que vérification est actuellement implémentée.

## État actuel et risque

Fonctionnalités accessibles sans pièce pendant exception : création de tontine, envoi de demande d'adhésion, acceptation d'invitation et devenir membre selon parcours existant. Cette exception crée risque d'accès aux fonctionnalités Tontine par utilisateurs dont identité n'est pas établie. Elle est acceptable uniquement dans environnement de développement et de test contrôlé.

## Travaux obligatoires avant production

- Ajouter contrôle serveur effectif du dépôt pour les quatre actions concernées.
- Définir et implémenter statuts, permissions, confidentialité et, si retenue, procédure de vérification effective.
- Vérifier refus sans pièce, autorisation après dépôt, absence de contournement client et absence de divulgation documentaire.
- Supprimer exception temporaire avant tout déploiement production.

Critère de levée : contrôle serveur effectif sur chaque action concernée et tests réussis de refus/autorisation.

## Fichiers modifiés

- `DOCUMENTATION/03_REGLES_METIER_TONTINE.md`
- `DOCUMENTATION/06_JOURNAL_DE_DEVELOPPEMENT.md`
- `DOCUMENTATION/07_PROBLEMES_ET_SOLUTIONS.md`
- `DOCUMENTATION/08_TESTS_ET_VALIDATIONS.md`
- `DOCUMENTATION/09_DECISIONS_TECHNIQUES.md`

## Commandes chronologiques

### Lecture exécutée par Codex

J'ai lu `AGENTS.md`, documentation métier, journal, validations, décisions et rapport 0024. Ces lectures n'ont modifié aucun état applicatif.

### Proposée au propriétaire

Non déterminé : aucune commande technique n'est nécessaire pour cette intervention documentaire.

### Exécutée manuellement par propriétaire

Non déterminé : aucune commande ni sortie manuelle n'a été communiquée pour cette intervention.

### Restante

Avant production, exécuter scénarios de refus et d'autorisation listés dans `DOCUMENTATION/08_TESTS_ET_VALIDATIONS.md` après implémentation du contrôle serveur. Aucun résultat ne peut être déclaré avant cette implémentation et ces tests.

## Dépendances, validations et consignes reprise

Je n'ai ajouté aucune dépendance. Je n'ai exécuté aucune validation technique. Je conserve exception pour tests uniquement et ne l'étends pas à production. Toute future implémentation doit préserver contrôles serveur indépendants de l'interface, confidentialité des pièces et traçabilité des résultats de test.
