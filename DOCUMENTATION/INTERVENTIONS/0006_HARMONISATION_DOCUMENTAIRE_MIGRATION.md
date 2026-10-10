# 0006 — Harmonisation documentaire et préparation migration

Date : 10/10/2026. Statut : terminé, sans modification applicative.

## Objectifs

J'ai harmonisé rédaction des documents de suivi en journal personnel. J'ai aussi mis à jour stratégie migration avec résultats manuels communiqués, sans lancer commande technique.

## Documents inspectés

J'ai lu `AGENTS.md`, rapports Prisma/stabilisation/préparation, règles Tontine, schéma, migration initiale, repositories et contrats concernés. J'ai recherché références d'auteur dans `DOCUMENTATION/` et `AUDIT_PROJET/`.

## Documents modifiés

J'ai mis à jour `AGENTS.md`, guide reprise, guide installation, décisions techniques, journal, rapport préparation migration, interventions 0004/0005 et présent rapport. Je n'ai modifié aucun code, schéma, migration, API ou donnée.

## Règle rédactionnelle

J'ai ajouté convention permanente : rapports, journaux et comptes rendus techniques sont rédigés à première personne, sans désigner outil d'assistance comme auteur. Je conserve faits, dates, résultats et statuts exacts.

## Résultats techniques utilisés

J'ai reçu résultats manuels : `prisma migrate diff` confirme écarts ; PostgreSQL contient 18 tables applicatives plus table historique ; statistiques estiment zéro ligne pour 18 tables ; `Utilisateur` contient exactement zéro enregistrement. Je n'affirme pas encore absence totale données : les 17 autres tables n'ont pas été comptées exactement.

## Commandes

- **Lecture d'analyse** : lecture/recherche documentaire et fichiers Prisma. Objectif : harmoniser narration et préparer migration. Résultat : références reformulées dans documents de suivi.
- **Proposée pour mon exécution manuelle** : comptage exact des tables via `psql`, documenté dans `RAPPORT_PREPARATION_MIGRATION.md`. Objectif : prouver ou infirmer absence de données avant migration. Non exécutée.
- **Exécutée manuellement avec résultat communiqué** : résultats `prisma migrate diff`, statistiques 18 tables et comptage `Utilisateur` transmis comme contexte de phase. Je les ai documentés sans les transformer en preuve des autres tables.
- **Restante** : comptage exact global, sauvegarde si données, génération SQL non appliquée, revue, validation puis migration future.

## Décision et reprise

Je sépare strictement alignement actuel et futures règles Tontine. Je commence par comptage exact, puis j'attends sortie PowerShell avant toute nouvelle commande ou migration.
