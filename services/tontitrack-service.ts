import { mockApi } from "@/services/mock-api";

// Point d'entrée unique des données frontend. L'adaptateur mock sera remplacé
// par l'API serveur sans exposer son détail aux composants.
export const tontiTrackService = mockApi;
