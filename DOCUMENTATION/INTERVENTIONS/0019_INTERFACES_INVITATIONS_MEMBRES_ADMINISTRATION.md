# Intervention 0019 — Interfaces invitations, membres et administration

## Objectif

J'ai connecté interfaces Tontine aux API PostgreSQL déjà disponibles : invitations, membres, demandes d'adhésion et paramètres administratifs.

## Fichiers modifiés ou créés

- `types/index.ts`
- `lib/tontines/adaptateur-ui.ts`
- `components/tontines/DetailTontineRoute.tsx`
- `components/tontines/DetailTontine.tsx`
- `components/tontines/RejoindreTontine.tsx`
- `components/tontines/GestionInvitations.tsx`
- `components/tontines/GestionMembresDemandes.tsx`
- `components/tontines/AdministrationTontine.tsx`
- `DOCUMENTATION/06_JOURNAL_DE_DEVELOPPEMENT.md`
- `DOCUMENTATION/08_TESTS_ET_VALIDATIONS.md`
- `DOCUMENTATION/09_DECISIONS_TECHNIQUES.md`

## Modifications

J'ai chargé utilisateur authentifié dans route détail afin de distinguer créateur et participant sans faire confiance au navigateur. Adaptateur UI conserve ce statut, visibilité, adhésions fermées et fuseau retournés par API.

Onglet Invitations utilise listes, création et révocation réelles. Créateur peut créer invitation ciblée par identifiant ou lien sécurisé. Jeton ne reste affiché que dans lien créé localement; aucune liste ne le renvoie. États chargement, erreur, vide, confirmation et actualisation sont présents.

Écran Rejoindre charge invitations ciblées reçues. Il accepte ou refuse invitation réelle. Lien sécurisé transmet jeton seulement à action concernée. Demande d'adhésion et acceptation exigent case de consentement non cochée par défaut et transmettent `conditionsAcceptees: true` seulement après action explicite.

Onglet Membres charge membres et demandes depuis API. Créateur approuve ou refuse demande avec actualisation des demandes, membres et détail. Paramètres d'adhésion utilisent `PATCH /api/tontines/[tontineId]`; interface limite visibilité et fermeture/réouverture, tandis que serveur reste autorité pour permissions et verrouillage financier.

Je n'ai pas connecté rotations, cotisations, déclarations ou versements à PostgreSQL. Leurs écrans historiques restent hors périmètre et ne reçoivent aucune donnée financière inventée par cette intervention.

## Contrôles statiques

J'ai vérifié présence des appels réels dans nouveaux parcours et absence de `mockApi` ou `tontiTrackService` dans composants finalisés. J'ai vérifié que demandes, membres et invitations rechargent après mutation. Je n'ai exécuté aucune commande de compilation ni test.

## Tests préparés, non exécutés

- Création invitation ciblée et lien sécurisé; vérification que liste ne contient jamais jeton.
- Révocation, expiration, acceptation et refus invitation.
- Refus acceptation sans consentement; demande d'adhésion avec case non cochée.
- Approbation/refus demande puis actualisation membres et compteur.
- Accès créateur, participant et utilisateur extérieur aux onglets.
- Modification visibilité, fermeture et réouverture adhésions; refus après démarrage.
- Persistance après rechargement de page et erreur réseau/API.
- Capacité maximale et invitation déjà traitée.

## Commandes

### Lecture exécutée par Codex

J'ai lu `AGENTS.md`, dernier rapport, composants de détail/rejoindre, adaptateur UI, client API et routes concernées. J'ai recherché appels simulés dans parcours finalisés. Ces inspections sont sans effet de bord.

### Proposées au propriétaire, non exécutées

Depuis `C:\Users\isasa\Desktop\tontitrack_prod` :

```powershell
npm run typecheck
npm run lint
npm run build
```

Ces commandes contrôlent respectivement contrats TypeScript, règles de qualité et compilation routes/interfaces. Résultat attendu : aucune erreur introduite. Risque : elles peuvent signaler défaut existant, sans modifier base ni migrations.

Tester ensuite scénarios préparés avec comptes développement distincts. Ces requêtes modifient invitations, demandes et membres; les lancer seulement sur base développement.

### Exécutée manuellement par propriétaire

Aucun résultat de commande pour cette intervention ne m'a été transmis.

### Restante

Exécuter commandes proposées puis transmettre sorties. Effectuer parcours navigateur des scénarios préparés avant considérer interfaces validées.

## Dépendances, risques et reprise

Je n'ai ajouté aucune dépendance, migration ou API métier. L'ordre bénéficiaires, retraits membres, rotations, cotisations et versements restent hors de ces interfaces réelles. La reprise doit traiter seulement ces domaines lorsque routes sécurisées correspondantes seront prêtes.
