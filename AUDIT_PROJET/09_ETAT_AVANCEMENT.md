# État d'avancement

| Module | Fonctionnalité | État | Preuve | Problème | Prochaine action |
|---|---|---|---|---|---|
| UI/navigation | Routes, sidebar, mobile nav | Présent mais non testé | `app/`, `AppShell.tsx` | Aucun test visuel | Parcours navigateur/responsive |
| Auth | Écrans et validation | Partiellement fonctionnel | `components/auth/*` | Mock, connexion forcée | API/auth/session |
| Finances | Liste/filtre/création/annulation | Partiellement fonctionnel | `PageFinances`, `ModalTransaction` | État client uniquement | API + DB + autorisation |
| Tontines | Création/détail/mutations | Partiellement fonctionnel | `components/tontines/*` | Mock, automatisations absentes | Services métier transactionnels |
| Cotisations/versements | Déclarer/valider/rejeter/confirmer | Partiellement fonctionnel | `mock-api.ts:304-389` | Preuves et 48h simulées | API, fichiers, jobs |
| Notifications | Liste/lire/deep links | Partiellement fonctionnel | `PageNotifications.tsx` | Locales seulement | DB + génération serveur |
| Profil/identité | Écran et dépôt | Non fonctionnel | `PageProfil.tsx` | Aucun upload/persistance | Stockage sécurisé |
| PostgreSQL/Prisma | Schéma et migration initiale | Partiellement fonctionnel | `prisma/` | Schéma/DB divergent | Lot 5B migration sûre |
| Repositories | Requêtes simples | Présent mais non testé | `repositories/` | Pas service/API/autorisations | Couche serveur |
| PWA/offline | Indicateur réseau | Non fonctionnel | `AppContext.tsx` | Pas manifest/SW/Dexie | Concevoir sync |
| Tests/CI | Automatisation | Absent ou prévu | absence fichiers/scripts | Régressions non détectées | Tests puis CI |
