# Analyse fonctionnelle

## Vision — Confirmé

TontiTrack centralise finances et tontines. Solde attendu = revenus − dépenses − épargne − investissements (`components/pages/PageFinances.tsx:35-39`). Versement tontine est déclaré puis confirmé : l'application ne transfère pas argent (`docs/ETAT_PROJET_TONTITRACK.md`).

## Parcours

| Parcours | Interfaces | Fonctionnement réel |
|---|---|---|
| Connexion/inscription | `/`, `/connexion`, `/inscription`, vérifications, reset | Formulaires appellent mock ; connexion démo active contexte client (`components/auth/PageConnexion.tsx:20-42`). |
| Finances | `/finances` et sous-routes | Consultation, filtre, ajout et annulation dans état React mock. |
| Créer tontine | `/tontines/nouvelle` | Assistant 5 étapes ; contrôle identité côté UI ; crée objet mock. |
| Rejoindre/adhérer | `/tontines/rejoindre` | Recherche code et retour `EN_ATTENTE` mock ; membre non ajouté. |
| Gérer tontine | détail + onglets | Membre, ordre, cotisations, versements, invitation, annulation selon statuts mock. |
| Notifications | `/notifications` | Filtre, lecture et deep-link client. |
| Profil/paramètres | `/profil`, `/parametres` | Affichage, faux dépôt document, préférences locales, reset démo. |

## Règles métier — Confirmé dans mocks

- Modes : `FIXE_CREATEUR`, `TOURNANT_EXCLU`, `TOURNANT_INCLUS` (`types/index.ts:4`, `lib/format.ts:190-193`).
- Nombre tours : créateur exclu seulement pour `FIXE_CREATEUR`.
- Modification ordre seulement `EN_PREPARATION`/`PRETE_A_DEMARRER`; retrait seulement `EN_PREPARATION` (`services/mock-api.ts:279-302`).
- Cotisation `NON_CONCERNE` interdite à déclaration ; déclaration plafonnée au reste, déclarations en attente déduites ; seule validation majore montant validé (`services/mock-api.ts:304-354`).
- Versement déclaré seulement tontine active ; confirmation/contestation attend identifiant versement (`services/mock-api.ts:356-389`, `components/tontines/ModalVersement.tsx:35-62`).

## État fonctionnel

Implémenté mais non vérifié visuellement : écrans et mutations mock. Partiel : identité, fichiers, adhésion, paramètres et hors-ligne. Absent : API serveur, persistance DB, auth réelle, jobs automatiques, PWA, notifications réelles, tests.
