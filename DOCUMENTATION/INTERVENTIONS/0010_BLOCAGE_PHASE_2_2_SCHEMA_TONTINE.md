# Intervention 0010 — Blocage préalable Phase 2.2

## Constat

J'ai inspecté le schéma Prisma, les règles métier, les pages tontines, le repository et le dernier rapport. Le modèle `Tontine` actuel ne porte pas les paramètres nécessaires à la phase 2.2 : description, visibilité, démarrage manuel/automatique, modes d'adhésion, fermeture des adhésions, ordre manuel/aléatoire, reversement partiel, rappels, délai de grâce et pénalités.

`InvitationTontine` ne cible aucun utilisateur et ne conserve ni acceptation ni refus. Aucun modèle de demande d'adhésion n'existe. Les interfaces actuelles utilisent encore `tontiTrackService`, alias de `mockApi`, pour création, recherche et demande.

## Blocage

Je ne peux pas implémenter intégralement API, permissions et interfaces réelles sans étendre le schéma puis régénérer Prisma Client. Le client Prisma actuellement généré ne contient ni colonnes ni modèle nécessaires. Écrire API avec `any`, SQL brut ou mocks contournerait les règles de sécurité et d'architecture.

Je n'ai pas modifié `schema.prisma` pendant ce constat : le choix des nouveaux enums, valeurs par défaut et transition des invitations existantes doit être revu dans migration générée, jamais approximée.

## Évolutions minimales à valider dans schéma

- Configuration Tontine : description, visibilité, démarrage, adhésion, ordre, adhésions fermées, reversement partiel, rappel, grâce et pénalité.
- Invitation ciblée : destinataire optionnel, statut, acceptée/refusée/révoquée et dates de décision.
- `DemandeAdhesion` : tontine, demandeur, statut, décision, décideur et unicité `[tontineId, demandeurId]`.
- Relations `Utilisateur` et index nécessaires à ces nouveaux flux.

## Commandes manuelles restantes

Depuis `C:\Users\isasa\Desktop\tontitrack_prod`, après ajout documenté au schéma et revue :

```powershell
npx prisma migrate dev --name configuration_tontines_adhesions --create-only
```

Rôle : générer SQL de migration sans l'appliquer. Résultat attendu : dossier migration et `migration.sql`. Risque : création de fichiers et usage shadow database ; ne pas appliquer ni confirmer opération imprévue.

Après revue SQL et validation explicite, exécuter :

```powershell
npx prisma migrate dev
npx prisma generate
```

Rôle : appliquer migration validée puis aligner Prisma Client. Risque : modification structure PostgreSQL ; prérequis pour API réelle.

## Traçabilité

- **Lecture exécutée par moi** : règles métier, schéma, pages, repository et rapports.
- **Proposée au propriétaire** : génération, revue, application et génération Prisma Client.
- **Exécutée manuellement avec résultat communiqué** : aucune commande Phase 2.2.
- **Restante** : validation schéma, migration, génération Client, puis implémentation complète Phase 2.2.
