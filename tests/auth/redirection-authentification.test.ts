import { destinationApresAuthentification } from "@/lib/navigation/destination-authentification";
import { permissionsParRole } from "@/lib/administration/permissions";

/**
 * Cas à raccorder au runner TypeScript retenu. Ils n'accèdent ni à une base ni à un compte réel.
 * Les routes, layouts et sessions doivent compléter ces vérifications par intégration manuelle.
 */
const casRedirectionAuthentification = [
  {
    nom: "Super Admin actif sans retour demandé",
    obtenu: destinationApresAuthentification({ permissions: permissionsParRole.SUPER_ADMIN }),
    attendu: "/administration-plateforme",
  },
  {
    nom: "Utilisateur standard sans retour demandé",
    obtenu: destinationApresAuthentification({ permissions: [] }),
    attendu: "/tableau-de-bord",
  },
  {
    nom: "Retour Tontine interne préservé",
    obtenu: destinationApresAuthentification({ permissions: [], retour: "/tontines/tontine-valide?onglet=rotations" }),
    attendu: "/tontines/tontine-valide?onglet=rotations",
  },
  {
    nom: "Retour administration refusé à un utilisateur standard",
    obtenu: destinationApresAuthentification({ permissions: [], retour: "/administration-plateforme" }),
    attendu: "/tableau-de-bord",
  },
  {
    nom: "Retour externe refusé",
    obtenu: destinationApresAuthentification({ permissions: permissionsParRole.SUPER_ADMIN, retour: "https://exemple-invalide.test" }),
    attendu: "/administration-plateforme",
  },
  {
    nom: "Préfixe administratif non reconnu refusé",
    obtenu: destinationApresAuthentification({ permissions: permissionsParRole.SUPER_ADMIN, retour: "/administration-plateforme-invalide" }),
    attendu: "/administration-plateforme",
  },
] as const;

const scenariosIntegrationAuthentification = [
  "refuse la connexion d'un utilisateur suspendu avant toute création de session",
  "recalcule la destination lors d'une connexion après attribution ou retrait d'un rôle",
  "refuse une session expirée ou invalidée dans les layouts utilisateur et administration",
  "relit les rôles persistés à chaque obtenirUtilisateurAuthentifie, sans faire de la destination une permission",
  "redirige après déconnexion vers connexion sans boucle vers administration",
] as const;

export { casRedirectionAuthentification, scenariosIntegrationAuthentification };
