# Audit sécurité

Audit statique seulement. Aucun test intrusif ni secret exposé.

| Gravité | Constat | Preuve | Impact / correction |
|---|---|---|---|
| Critique | Application force connexion démo pour toute route applicative. | `app/(application)/layout.tsx:7-9` | Accès sans identité. Middleware/session serveur avant API/production. |
| Critique | Auth est mock ; mot de passe démo affiché dans UI. | `PageConnexion.tsx:20-42,145-146`; `mock-api.ts:63-69` | Aucun hash, session, rate limit ou contrôle accès. Retirer identifiants visibles hors démo, implémenter auth serveur. |
| Élevée | Repositories Prisma sans filtre propriétaire ni autorisation. | `repositories/*.repository.ts` | Futur IDOR si exposés par API. Autoriser dans service serveur par acteur/ressource. |
| Élevée | Fichiers/proofs simulés, sans upload, MIME, taille ou stockage privé. | `ModalTransaction.tsx:151-170`; `PageProfil.tsx` | Futur risque fuite/téléversement dangereux. Stockage privé + URLs signées + validation. |
| Moyenne | `NEXT_PUBLIC_API_URL` permet backend externe configuré client ; client ne gère pas échec JSON/non-JSON. | `lib/api-client.ts:3-29` | Contrat API fragile. Restreindre origines/CORS et durcir erreurs. |
| Moyenne | `sessionStorage` contient état démo entier et XSS peut le lire. | `AppContext.tsx:61-76` | Acceptable démo, jamais données sensibles. |
| Moyenne | Aucune API route, CSRF/cookies/headers/rate limiting inconnus. | `app/` inspecté | À concevoir avant exposition. |
| Faible | Trois `<img>` connus ; optimisation image absente. | lint historique/documentation | Performance, pas vulnérabilité directe. |

Secrets : `.env` ignoré par `.gitignore`; valeur non lue. Aucune clé exposée dans ce rapport. Dépendances vulnérables : **non vérifié**, `npm audit` échoue DNS le 10/10/2026.
