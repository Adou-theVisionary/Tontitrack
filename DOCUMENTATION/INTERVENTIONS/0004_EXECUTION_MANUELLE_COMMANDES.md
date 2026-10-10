# 0004 — Exécution manuelle obligatoire des commandes techniques

Date : 10/10/2026. Statut : terminé.

## Objectif

J'ai instauré mode pédagogique : j'exécute toute commande technique manuellement après préparation et explication, puis j'analyse la sortie obtenue.

## État initial

`AGENTS.md` autorisait auparavant certaines vérifications techniques automatisées. Les documents installation ne séparaient pas clairement responsabilités.

## Fichiers modifiés

- `AGENTS.md`
- `DOCUMENTATION/00_LIRE_EN_PREMIER.md`
- `DOCUMENTATION/04_GUIDE_INSTALLATION.md`
- `DOCUMENTATION/06_JOURNAL_DE_DEVELOPPEMENT.md`
- `DOCUMENTATION/09_DECISIONS_TECHNIQUES.md`
- présent rapport

## Modifications

J'ai ajouté section permanente « EXÉCUTION MANUELLE OBLIGATOIRE DES COMMANDES TECHNIQUES ». Elle limite analyses aux lectures sans effet de bord et réserve npm, Prisma, SQL, test, build, serveur, Docker, Git modifiant état et environnement à mon exécution manuelle. Les rapports distinguent désormais quatre catégories de commandes et expliquent objectif pédagogique.

## Commandes

- **Lecture d'analyse** : `Get-Content` des instructions/documents et `Get-ChildItem` des rapports d'intervention. Objectif : identifier règles existantes et prochain numéro. Résultat : `AGENTS.md` présent, 0003 dernier rapport.
- **Proposée au propriétaire** : aucune.
- **Exécutée manuellement par propriétaire** : aucune preuve communiquée.
- **Restante** : aucune pour intervention documentaire.

## Dépendances, tests et risques

Dependencies : aucune. Je n'ai exécuté aucun test, build, lint, Prisma, SQL, migration, seed, serveur ou installation. Risque résiduel : rapports historiques décrivent anciennes commandes automatisées ; je préserve ces traces. Nouvelle règle s'applique à toutes interventions futures.

## Reprise

Avant prochaine commande technique, je prépare commande exacte, répertoire, rôle, résultat attendu et risques. Je l'exécute dans PowerShell et conserve sortie.
