# Intervention 0014 — Intégration création Tontine

J'ai connecté formulaire `/tontines/nouvelle` à `POST /api/tontines`. Le client API accepte maintenant les routes Next locales sans exiger `NEXT_PUBLIC_API_URL`. Création envoie contrat serveur, bloque double soumission existante, affiche erreur API et redirige avec identifiant PostgreSQL retourné.

Je n'ai exécuté aucune commande technique. Liste, détail, invitations et adhésions des interfaces historiques restent mockées et ne doivent pas être déclarées finalisées.

Commandes restantes depuis racine : `npm run typecheck`, `npm run lint`, `npm run build`, puis création manuelle avec utilisateur connecté.
