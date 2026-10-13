# Intervention 0021 — Démarrage et rotations Tontine

Date : 12/10/2026

## Objectif

J'ai implémenté démarrage manuel et automatique déclenchable, ordre bénéficiaires, génération rotations et consultation sécurisée. J'ai conservé paiements, cotisations et reversements hors périmètre.

## Contexte et état initial

Les phases précédentes fournissaient authentification, création, invitations, demandes et administration Tontine. Le schéma Prisma comportait déjà champs lancement, ordre et rotations. Aucune route ne démarrait réellement une tontine ou ne lisait rotations PostgreSQL. Interface rotations utilisait données vides après API.

## Fichiers modifiés

- `services/tontines.service.ts`
- `lib/tontines/contrats.ts`, `lib/tontines/adaptateur-ui.ts`, `lib/format.ts`, `types/index.ts`
- `app/api/tontines/[tontineId]/demarrer/route.ts`
- `app/api/tontines/[tontineId]/ordre-beneficiaires/route.ts`
- `app/api/tontines/[tontineId]/rotations/route.ts`
- `app/api/taches/demarrage-automatique/route.ts`
- `components/tontines/DemarrageTontine.tsx`, `components/tontines/OrdreBeneficiaires.tsx`, `components/tontines/DetailTontine.tsx`, `components/tontines/DetailTontineRoute.tsx`
- Documents de suivi concernés. J'ai aussi préparé localement une entrée `TONTITRACK_TACHE_SECRET` dans `.env.example`, fichier ignoré par Git dans cet environnement.

## Modifications

J'ai ajouté service commun de démarrage transactionnel `Serializable`. Il contrôle créateur, statut, capacité exacte de membres approuvés actifs, créateur actif, cohérence modèle/nombre tours/montant/fréquence et ordre complet tournant. Il verrouille règles et adhésions, inscrit date effective, passe statut à `ACTIVE`, puis crée rotations atomiquement. Première rotation est `EN_COURS`; suivantes sont `A_VENIR`.

J'ai utilisé ordre `OrdreBeneficiaire` existant. Le créateur peut sauvegarder ordre manuel sans doublon. Génération aléatoire utilise Fisher-Yates avec `crypto.randomInt`; elle ne dépend pas de `Math.random()`. Après lancement, route refuse modification.

J'ai ajouté lecture rotations et ordre réservée créateur ou membre approuvé. Interface affiche conditions de lancement, confirmation, date effective, ordre, bénéficiaires, dates, statut réel et montant théorique. Elle ne présente aucun paiement ou reversement effectué.

J'ai ajouté point d'entrée `POST /api/taches/demarrage-automatique`. Il requiert `Authorization: Bearer` avec secret `TONTITRACK_TACHE_SECRET`. Il lance seulement tontines automatiques à date atteinte et réutilise même service. Aucun ordonnanceur n'est configuré dans dépôt : fonctionnement automatique reste à configurer manuellement.

Je n'ai modifié `prisma/schema.prisma` ni migration existante. Modèles/champs nécessaires existaient déjà.

## Commandes chronologiques

### Lecture exécutée par Codex

J'ai lu instructions projet, documentation métier/architecture/problèmes, dernier rapport, schéma Prisma, migrations, services, routes, composants, contrats, types et configuration. J'ai recherché usages démarrage, rotation et ordre. J'ai inspecté diff, état Git et espaces incohérents. Ces lectures n'ont modifié aucun état applicatif.

### Proposée au propriétaire

Depuis `C:\Users\isasa\Desktop\tontitrack_prod` :

```powershell
npm run typecheck
npm run lint
npm run build
npx prisma validate
```

Objectif pédagogique : vérifier types, règles lint, compilation routes et cohérence schéma/client Prisma. Résultat attendu : aucune erreur nouvelle liée démarrage/rotations. Risques : commandes peuvent signaler problèmes existants ; elles ne doivent pas modifier données ni appliquer migration.

Pour configurer automatisation, définir localement valeur secrète aléatoire dans `.env`, hors Git, puis configurer ordonnanceur hébergé appelant périodiquement :

```powershell
Invoke-RestMethod -Method Post -Uri "https://VOTRE_HOTE/api/taches/demarrage-automatique" -Headers @{ Authorization = "Bearer VOTRE_SECRET" }
```

Objectif pédagogique : déclencher contrôle serveur des tontines automatiques échues. Résultat attendu : réponse indiquant tontines examinées et démarrées ou non. Risque : démarre réellement toute tontine automatique valide arrivée à échéance ; utiliser environnement de test avant production. Je n'ai pas exécuté cette commande.

### Exécutée manuellement par propriétaire

Non déterminé. Aucune sortie n'a été communiquée.

### Restante

Je dois recevoir sorties des quatre validations. Je dois aussi recevoir résultat d'un test contrôlé du point d'entrée automatique après configuration de l'ordonnanceur.

## Dépendances et schéma

Je n'ai ajouté, supprimé ou mis à jour aucune dépendance. Je n'ai créé ni appliqué migration. `TONTITRACK_TACHE_SECRET` est seulement une variable d'environnement documentée sans valeur.

## Diagnostic, risques et limites

J'ai utilisé date effective de transaction comme début calendrier ; mensuel borne jours 29–31 au dernier jour du mois. Exigence d'audit persistant du tirage aléatoire reste non définie et non implémentée. Mode automatique dépend totalement ordonnanceur externe ; sans lui aucune tâche ne démarre seule. Aucune opération financière n'est déclenchée.

## Tests préparés

J'ai préparé scénarios : démarrage autorisé, capacité insuffisante, non-créateur, concurrence, date automatique avant/après échéance, verrouillage, ordre manuel invalide, ordre cryptographique sans doublon, trois modèles, trois fréquences, absence doublons et accès non autorisé.

## Validation et reprise

Je n'affirme aucune validation technique ni navigateur. Après résultats manuels, vérifier création tontine de chaque modèle, membres réels, ordre, démarrage, rechargement et refus API hors droits. Configurer ensuite ordonnanceur externe et enregistrer résultat avant annoncer démarrage automatique opérationnel.
