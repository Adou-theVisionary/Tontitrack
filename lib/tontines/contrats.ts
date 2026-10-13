import { z } from "zod";

const tontineBaseSchema = z.object({
  nom: z.string({ required_error: "Le nom est requis." }).trim().min(3, "Le nom doit contenir au moins 3 caractères.").max(120, "Le nom ne peut pas dépasser 120 caractères."),
  description: z.string().trim().max(1000, "La description ne peut pas dépasser 1 000 caractères.").optional(),
  mode: z.enum(["FIXE_CREATEUR", "TOURNANT_EXCLU", "TOURNANT_INCLUS"], { required_error: "Le mode de tontine est requis." }),
  montantCotisation: z.number({ required_error: "Le montant de cotisation est requis.", invalid_type_error: "Le montant de cotisation doit être un nombre." }).finite("Le montant de cotisation est invalide.").positive("Le montant de cotisation doit être supérieur à zéro."),
  frequence: z.enum(["QUOTIDIENNE", "HEBDOMADAIRE", "MENSUELLE"], { required_error: "La fréquence est requise." }),
  nombreParticipantsRequis: z.number({ required_error: "Le nombre de participants est requis.", invalid_type_error: "Le nombre de participants doit être un nombre entier." }).int("Le nombre de participants doit être un nombre entier.").min(2, "La tontine requiert au moins 2 participants.").max(200, "La tontine ne peut pas dépasser 200 participants."),
  dateCommencement: z.coerce.date({ invalid_type_error: "La date de commencement est invalide." }),
  fuseauHoraire: z.string({ required_error: "Le fuseau horaire est requis." }).min(1, "Le fuseau horaire est requis.").max(64, "Le fuseau horaire est invalide."),
  visibilite: z.enum(["PUBLIQUE", "PRIVEE"], { required_error: "La visibilité est requise." }),
  modeDemarrage: z.enum(["MANUEL", "AUTOMATIQUE"], { required_error: "Le mode de démarrage est requis." }),
  strategieAdhesion: z.enum(["INVITATION", "DEMANDE", "INVITATION_ET_DEMANDE"], { required_error: "La stratégie d'adhésion est requise." }),
  methodeOrdre: z.enum(["MANUEL", "ALEATOIRE"], { required_error: "La méthode d'ordre est requise." }),
  reversementsPartielsAutorises: z.boolean().default(false),
  rappelsActifs: z.boolean().default(false),
  delaiGraceJours: z.number({ invalid_type_error: "Le délai de grâce doit être un nombre entier." }).int("Le délai de grâce doit être un nombre entier.").min(0, "Le délai de grâce ne peut pas être négatif.").max(90, "Le délai de grâce ne peut pas dépasser 90 jours.").default(0),
  penaliteActive: z.boolean().default(false),
  penaliteMontant: z.number({ invalid_type_error: "Le montant de pénalité doit être un nombre." }).finite("Le montant de pénalité est invalide.").positive("Le montant de pénalité doit être supérieur à zéro.").optional(),
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

/** Ordre complet, défini avant lancement uniquement. */
export const ordreBeneficiairesSchema = z.discriminatedUnion("methodeOrdre", [
  z.object({ methodeOrdre: z.literal("MANUEL"), membreIds: z.array(z.string().cuid()).min(1).max(200) }),
  z.object({ methodeOrdre: z.literal("ALEATOIRE") }),
]);

/** Déclaration d'un versement externe : elle ne prouve jamais réception des fonds. */
export const declarationCotisationSchema = z.object({
  montant: z.string({ required_error: "Le montant déclaré est requis.", invalid_type_error: "Le montant déclaré doit être une décimale." })
    .trim()
    .regex(/^(?:0|[1-9]\d*)(?:[.,]\d{1,2})?$/, "Le montant doit contenir au plus deux décimales.")
    .refine((montant) => !/^0(?:[.,]0{1,2})?$/.test(montant), "Le montant déclaré doit être supérieur à zéro.")
    .transform((montant) => montant.replace(",", ".")),
  verseLe: z.coerce.date({ invalid_type_error: "La date de versement est invalide." }),
  referenceVersement: z.string().trim().max(120, "La référence ne peut pas dépasser 120 caractères.").optional(),
  moyenVersement: z.string().trim().max(80, "Le moyen de versement ne peut pas dépasser 80 caractères.").optional(),
});

export const decisionDeclarationCotisationSchema = z.object({
  decision: z.enum(["CONFIRMER", "REJETER"]),
  motifRejet: z.string().trim().min(3, "Le motif de rejet doit contenir au moins 3 caractères.").max(500, "Le motif de rejet ne peut pas dépasser 500 caractères.").optional(),
  observation: z.string().trim().max(500, "L'observation ne peut pas dépasser 500 caractères.").optional(),
}).superRefine((donnees, contexte) => {
  if (donnees.decision === "REJETER" && !donnees.motifRejet) {
    contexte.addIssue({ code: z.ZodIssueCode.custom, path: ["motifRejet"], message: "Le motif de rejet est requis." });
  }
});

const montantPositifSchema = z.string({ required_error: "Le montant est requis.", invalid_type_error: "Le montant doit être une décimale." })
  .trim()
  .regex(/^(?:0|[1-9]\d*)(?:[.,]\d{1,2})?$/, "Le montant doit contenir au plus deux décimales.")
  .refine((montant) => !/^0(?:[.,]0{1,2})?$/.test(montant), "Le montant doit être supérieur à zéro.")
  .transform((montant) => montant.replace(",", "."));

/** Déclaration d'un reversement externe : aucune réception n'est présumée. */
export const declarationReversementSchema = z.object({
  montant: montantPositifSchema,
  verseLe: z.coerce.date({ invalid_type_error: "La date de reversement est invalide." }),
  referenceVersement: z.string().trim().max(120, "La référence ne peut pas dépasser 120 caractères.").optional(),
  moyenVersement: z.string().trim().max(80, "Le moyen de transfert ne peut pas dépasser 80 caractères.").optional(),
  observation: z.string().trim().max(500, "L'observation ne peut pas dépasser 500 caractères.").optional(),
});

/** Le bénéficiaire confirme un montant reçu ou ouvre explicitement un désaccord. */
export const decisionReceptionReversementSchema = z.discriminatedUnion("decision", [
  z.object({
    decision: z.literal("CONFIRMER"),
    montantConfirme: montantPositifSchema,
    observation: z.string().trim().max(500, "L'observation ne peut pas dépasser 500 caractères.").optional(),
  }),
  z.object({
    decision: z.literal("CONTESTER"),
    motifContestation: z.string().trim().min(3, "Le motif de contestation doit contenir au moins 3 caractères.").max(500, "Le motif de contestation ne peut pas dépasser 500 caractères."),
    observation: z.string().trim().max(500, "L'observation ne peut pas dépasser 500 caractères.").optional(),
  }),
]);

/** La confirmation explicite évite toute clôture déclenchée par erreur d'interface. */
export const confirmationClotureTontineSchema = z.object({ confirmation: z.literal(true) });
