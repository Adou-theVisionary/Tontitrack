# Règles métier Tontine

## Décisions validées par propriétaire

- Tout utilisateur inscrit peut créer tontine ; créateur administre ses propres tontines.
- Tontine publique ou privée. Adhésion par invitation ou demande selon paramètres.
- Lancement manuel ou automatique.
- Ordre bénéficiaires tournants manuel ou aléatoire.
- Retards : rappels, grâce et pénalités configurables.
- Départ libre avant démarrage ; encadré après lancement.
- Exclusion décidée administrateur avant démarrage ; procédure spéciale après.
- Remplacement encadré, avec accords appropriés.
- Règles financières verrouillées au démarrage.
- Membre verse cotisation créateur ; créateur collecte puis reverse bénéficiaire.
- Créateur confirme réception cotisations ; bénéficiaire confirme réception reversements.
- Reversement partiel autorisé/interdit selon configuration définie avant lancement.
- Visibilité collective sur cotisations, collecte et reversements ; données privées/justificatifs confidentiels protégés.
- Paiements réels prévus version ultérieure, non implémentés.

## Modèles existants à préserver — Confirmé code/audit

- `FIXE_CREATEUR` : créateur toujours bénéficiaire et ne cotise pas ; autres cotisent ; tours = membres hors créateur.
- `TOURNANT_EXCLU` : bénéficiaire de son tour est `NON_CONCERNE`, jamais cotisation artificielle à 0 ; il cotise autres tours.
- `TOURNANT_INCLUS` : bénéficiaire cotise aussi pendant son tour.

## Règles déjà présentes dans mock

Ordre modifiable avant démarrage ; retrait restreint ; déclaration cotisation plafonnée au reste ; validation seule majore montant validé. Sources : `services/mock-api.ts:279-354`, `lib/format.ts:190-199`.

## À préciser avant implémentation

Définition publique/privée, droits exacts créateur/admin, critère lancement automatique, méthode aléatoire/audit ordre, délais/pénalités, procédure exclusion/remplacement, accords requis, visibilité détaillée, seuil reversement partiel, litige, clôture et confirmation automatique. Ne pas inventer ces règles.
