# Instructions permanentes — TontiTrack

## Avant chaque intervention

1. Lire `DOCUMENTATION/00_LIRE_EN_PREMIER.md`, documents métier/architecture concernés et dernier rapport `DOCUMENTATION/INTERVENTIONS/`.
2. Identifier objectif, fichiers, dépendances, risques et validations prévues.
3. Vérifier règles métier tontine dans `DOCUMENTATION/03_REGLES_METIER_TONTINE.md`.
4. Ne pas confondre état mock, schéma Prisma préparé et DB réellement migrée.

## Pendant

- Modifier seulement fichiers nécessaires. Préserver conventions et interface existante.
- Préférer français pour nouveaux identifiants et commentaires métier quand interfaces techniques le permettent.
- Commenter finalité, règles métier, sécurité, calculs et choix non évidents ; ne pas commenter évidence.
- Consigner commandes selon catégories obligatoires : lecture exécutée par Codex ; commande proposée au propriétaire ; commande manuelle exécutée avec résultat communiqué ; commande restante.
- Consigner dépendances modifiées et problèmes rencontrés.
- Ne jamais afficher, committer ou transmettre secrets.
- Ne jamais lancer migration destructive, `prisma migrate reset` ou `prisma db push` sans validation explicite du propriétaire.
- Ne jamais modifier silencieusement règles financières ou règles tontine validées.

## Après

Créer `DOCUMENTATION/INTERVENTIONS/NNNN_DESCRIPTION.md` avec date, objectif, contexte, état initial, fichiers, modifications, commandes chronologiques et raisons, résultats/erreurs, dépendances, diagnostic, tests, validations, risques, travail restant et consignes reprise. Indiquer « Non déterminé » si nécessaire.

Mettre à jour si concerné : journal, dépendances, problèmes, tests, décisions, architecture et règles métier.

## Convention rédactionnelle permanente

Tous rapports d'intervention, journaux et comptes rendus techniques sont rédigés naturellement à la première personne du singulier, comme mon journal de développement. Je n'y mentionne aucun outil d'assistance comme auteur ou rédacteur. Je préserve strictement authenticité des actions, commandes, résultats, dates et limites : je précise lorsqu'une commande est préparée, exécutée manuellement avec sortie transmise, ou reste à faire.

## Garde-fous

Frontend ne doit jamais accéder directement à Prisma/PostgreSQL. `mockApi` reste temporaire jusqu'à API sécurisée. Avant seed, aligner schéma Prisma et migration PostgreSQL en sécurité.

## EXÉCUTION MANUELLE OBLIGATOIRE DES COMMANDES TECHNIQUES

### Autorisé à Codex

Codex exécute seulement commandes de lecture et inspection sans effet de bord : lister fichiers/dossiers, lire fichiers, rechercher texte, consulter configurations, état et historique Git non modifiants. Codex ne lance aucune lecture qui exécute un script, accède à ressource sensible ou peut modifier état.

### Interdit à Codex

Codex ne lance jamais directement commandes npm, pnpm, yarn, npx, TypeScript, ESLint, build, tests, Prisma, SQL, migrations, seeds, Docker, scripts applicatifs, démarrage/arrêt serveurs, installation/suppression/mise à jour dépendances, modification environnement ni commande Git modifiant dépôt. Cette règle inclut commandes normalement non destructives.

### Procédure obligatoire

1. Codex prépare modifications fichiers.
2. Codex fournit commande exacte, répertoire PowerShell, rôle pédagogique, résultat attendu et risques.
3. Propriétaire exécute manuellement commande puis transmet sortie.
4. Codex analyse seulement résultat communiqué et documente problème/solution.
5. Codex ne déclare jamais réussite sans preuve communiquée.

### Rapports intervention

Pour chaque commande, indiquer objectif pédagogique et une seule catégorie :

- **Lecture exécutée par Codex** : inspection sans effet de bord.
- **Proposée au propriétaire** : non exécutée.
- **Exécutée manuellement par propriétaire** : sortie communiquée.
- **Restante** : nécessaire avant conclusion.
