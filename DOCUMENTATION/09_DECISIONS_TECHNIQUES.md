# Décisions techniques

## Interfaces Tontine reliées aux API — 10/10/2026

Je détermine rôle créateur depuis identifiant utilisateur de session comparé à `createurId` retourné par API. Je conserve API comme autorité : interface améliore parcours mais ne remplace jamais permission, capacité, consentement ou verrouillage serveur. Jeton lien est conservé seulement dans état navigateur après création et transmis uniquement à action d'invitation. Voir `INTERVENTIONS/0019_INTERFACES_INVITATIONS_MEMBRES_ADMINISTRATION.md`.

## Schémas Tontine composables — 10/10/2026

Je construis variantes Zod depuis `tontineBaseSchema` avant application de `refine`. Les effets de création ne sont pas réutilisables pour composer un objet partiel. Je revalide côté service configuration complète fusionnée avec données PostgreSQL afin de préserver invariants des modifications partielles. Voir `INTERVENTIONS/0018_CORRECTION_ZOD_MODIFICATION_TONTINE.md`.

## Invitations Tontine — 10/10/2026

Je garde jeton brut uniquement dans réponse de création au créateur afin qu'il le partage par canal choisi. PostgreSQL conserve seulement empreinte SHA-256. Les actions d'une invitation par lien exigent jeton et utilisent comparaison constante. Les mutations d'acceptation utilisent transaction `Serializable` afin de protéger capacité contre concurrence. Voir `INTERVENTIONS/0017_BACKEND_INVITATIONS.md`.

## Authentification Phase 2.1

Je conserve Prisma côté serveur. Les routes auth appellent service métier puis repositories. Les mots de passe utilisent scrypt natif avec sel aléatoire ; les sessions utilisent jeton aléatoire dont seule empreinte est persistée. Cookie ne contient aucune donnée personnelle.

Je n'ajoute pas bcrypt : dépendance nouvelle non nécessaire, `crypto.scrypt` étant disponible. Je limite tentatives en mémoire pour environnement local ; solution partagée reste obligatoire avant déploiement multi-instance.

## Migration d'alignement Prisma : SQL généré, jamais déduit

Je décide de ne pas écrire manuellement migration d'alignement lorsque sortie exacte de `prisma migrate diff` n'est pas archivée. Écarts combinent enums, relations, contraintes et colonnes obligatoires. SQL sera généré avec `prisma migrate dev --create-only`, revu puis appliqué seulement après validation explicite.

Base de développement est vide au contrôle communiqué et sauvegardée. Cette situation réduit risque de données, mais ne dispense pas revue opérations `DROP`, conversions d'enums et nouvelles contraintes.

| Décision | État | Justification / source |
|---|---|---|
| Priorité Tontine | Validée propriétaire | Finances reportées ; voir présentation |
| Paiements futurs, non présents | Validée propriétaire | Ne pas introduire transfert interne maintenant |
| Interface jamais Prisma/DB | À préserver | Architecture cible/audit |
| Prisma Migrate seulement | À préserver | Pas `db push`/reset pour contourner migration |
| XOF et fuseaux IANA | À préserver | Schéma et audit antérieur |
| Mock temporaire | À remplacer plus tard | Service actuel alias `mockApi` |
| Documentation intervention obligatoire | Validée propriétaire | `AGENTS.md` et ce dossier |
| Exécution manuelle commandes techniques | Validée propriétaire | Je lance moi-même npm, Prisma, SQL, tests, builds, serveurs et toute commande à effet potentiel ; les analyses ne réalisent que lectures sans effet de bord |
| Alignement Prisma séparé des évolutions Tontine | Validée phase préparation | Corriger d'abord décalage schéma/migration ; config publique, retards, permissions et règles financières dans lots futurs distincts |

Nouvelles décisions doivent indiquer date, décideur, contexte, alternatives, impact et rapport associé.
