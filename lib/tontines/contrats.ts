import { z } from "zod";

const tontineBaseSchema = z.object({
  nom: z.string().trim().min(3).max(120), description: z.string().trim().max(1000).optional(),
  mode: z.enum(["FIXE_CREATEUR", "TOURNANT_EXCLU", "TOURNANT_INCLUS"]),
  montantCotisation: z.number().positive(), frequence: z.enum(["QUOTIDIENNE", "HEBDOMADAIRE", "MENSUELLE"]),
  nombreParticipantsRequis: z.number().int().min(2).max(200), dateCommencement: z.coerce.date(),
  fuseauHoraire: z.string().min(1).max(64), visibilite: z.enum(["PUBLIQUE", "PRIVEE"]),
  modeDemarrage: z.enum(["MANUEL", "AUTOMATIQUE"]), strategieAdhesion: z.enum(["INVITATION", "DEMANDE", "INVITATION_ET_DEMANDE"]),
  methodeOrdre: z.enum(["MANUEL", "ALEATOIRE"]), reversementsPartielsAutorises: z.boolean().default(false),
  rappelsActifs: z.boolean().default(false), delaiGraceJours: z.number().int().min(0).max(90).default(0),
  penaliteActive: z.boolean().default(false), penaliteMontant: z.number().positive().optional(),
});

export const creationTontineSchema = tontineBaseSchema
  .refine((donnees) => donnees.dateCommencement > new Date(), { path: ["dateCommencement"], message: "Date de démarrage future requise." })
  .refine((donnees) => !donnees.penaliteActive || donnees.penaliteMontant !== undefined, { path: ["penaliteMontant"], message: "Montant pénalité requis." });

export const invitationSchema = z.object({ inviteId: z.string().cuid().optional(), expireLe: z.coerce.date() });
export const acceptationInvitationSchema = z.object({
  conditionsAcceptees: z.literal(true),
  jeton: z.string().min(32).max(256).optional(),
});
export const jetonInvitationSchema = z.object({ jeton: z.string().min(32).max(256).optional() });
export const modificationTontineSchema = tontineBaseSchema
  .omit({ mode: true })
  .partial()
  .extend({ adhesionsFermees: z.boolean().optional() })
  .refine((donnees) => !donnees.dateCommencement || donnees.dateCommencement > new Date(), { path: ["dateCommencement"], message: "Date de démarrage future requise." });
export const demandeSchema = z.object({ motif: z.string().trim().max(500).optional(), conditionsAcceptees: z.literal(true) });
