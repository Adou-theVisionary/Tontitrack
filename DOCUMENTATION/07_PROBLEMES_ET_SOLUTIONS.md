# Problèmes et solutions

| Statut | Problème | Diagnostic | Action requise |
|---|---|---|---|
| Bloquant Phase 2.2 | Modèle Tontine insuffisant | Configuration, demandes et invitations ciblées absentes du schéma Prisma actuel | Valider extension, générer migration contrôlée et Prisma Client ; voir intervention 0010 |

| Statut | Problème | Diagnostic | Action requise |
|---|---|---|---|
| À vérifier | TS2554 scrypt | `promisify` perdait surcharge TypeScript avec options | Exécuter typecheck après enveloppe Promise explicite ; voir intervention 0009 |

| Statut | Problème | Diagnostic | Action requise |
|---|---|---|---|
| Bloquant | Schéma Prisma non migré | Schema actuel diffère migration initiale | Générer/inspecter SQL migration sûre avant seed/API |
| Important production | Vérification e-mail et téléphone incomplète | Jeton e-mail créé mais aucun fournisseur d'envoi ; SMS hors phase | Ajouter envoi e-mail, route validation jeton et OTP fournisseur avant production |
| Important production | Limitation connexion locale | Limiteur mémoire disparaît au redémarrage et n'est pas partagé | Utiliser stockage partagé avant multi-instance |
| Important | Données applicatives mock après connexion réelle | Auth serveur ne relie pas encore finances/tontines aux comptes PostgreSQL | Construire API métier et contrôles objet par lot |
| Important | Tontines mock | `tontiTrackService` alias `mockApi` | Services métier transactionnels après migration |
| Important | Règles Tontine nouvelles incomplètes | Configuration/public/retards/remplacement non modélisés | Clarifier propriétaire avant code |
| Important | Fichiers fictifs | Preuves/identité simulées | Stockage privé, MIME/taille/permissions |
| Moyen | Lint non reproductible | Next tente installation réseau | Corriger déclaration outils, puis vérifier |
| Moyen | Tests absents | Aucun script/fichier détecté | Tests règles, intégration et E2E |
| Bloquant futur seed/API | Schéma Prisma non représenté par migration | `schema.prisma` contient modèles/champs/enums absents migration initiale | Préparer migration d'alignement, inspecter SQL et données avant application |
| Résolu environnement | `prisma migrate status` échoue sandbox | Sandbox Windows bloque TCP localhost ; hors sandbox PostgreSQL répond et status est valide | Utiliser contrôle lecture seule hors sandbox autorisé ; ne pas traiter comme erreur Prisma |
| Faible | ESLint Next indirect non reproductible | `npm run lint` tente installer des outils ; ESLint binaire direct passe avec 3 avertissements image | Corriger configuration dépendances/Next dans lot dédié, après reproduction contrôlée |

Ne marquer problème résolu qu'avec rapport, commandes et preuves.
