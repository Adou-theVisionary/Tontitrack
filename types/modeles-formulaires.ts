import { z } from "zod";

export const schemaConnexion = z.object({
  email: z.string().email("Adresse email invalide"),
  motDePasse: z.string().min(1, "Mot de passe requis"),
});

export const schemaInscription = z
  .object({
    prenom: z.string().min(1, "Prénom requis"),
    nom: z.string().min(1, "Nom requis"),
    email: z.string().email("Adresse email invalide"),
    telephone: z.string().min(8, "Téléphone invalide"),
    motDePasse: z
      .string()
      .min(8, "Au moins 8 caractères")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[0-9]/, "Au moins un chiffre"),
    confirmationMotDePasse: z.string(),
  })
  .refine((data) => data.motDePasse === data.confirmationMotDePasse, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmationMotDePasse"],
  });

export const schemaOTP = z.object({
  code: z.string().length(6, "Le code doit contenir 6 chiffres"),
});

export const schemaMotDePasseOublie = z.object({
  email: z.string().email("Adresse email invalide"),
});

export const schemaReinitialisationMotDePasse = z
  .object({
    code: z.string().length(6, "Code de 6 chiffres"),
    motDePasse: z
      .string()
      .min(8, "Au moins 8 caractères")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[0-9]/, "Au moins un chiffre"),
    confirmationMotDePasse: z.string(),
  })
  .refine((data) => data.motDePasse === data.confirmationMotDePasse, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmationMotDePasse"],
  });

export const schemaTransaction = z.object({
  type: z.enum(["REVENU", "DEPENSE", "EPARGNE", "INVESTISSEMENT"]),
  montant: z.string().min(1, "Montant requis"),
  devise: z.string().default("XOF"),
  categorieId: z.string().min(1, "Catégorie requise"),
  description: z.string().min(1, "Description requise"),
  moyenPaiement: z.string().min(1, "Moyen de paiement requis"),
  dateOperation: z.string().min(1, "Date requise"),
});

export const schemaCreationTontine = z.object({
  nom: z.string().min(1, "Nom requis"),
  nombreParticipantsRequis: z.number().int().min(2, "Au moins 2 participants"),
  montantCotisation: z.string().min(1, "Montant requis"),
  devise: z.string().default("XOF"),
  frequence: z.enum(["QUOTIDIENNE", "HEBDOMADAIRE", "MENSUELLE"]),
  mode: z.enum(["FIXE_CREATEUR", "TOURNANT_EXCLU", "TOURNANT_INCLUS"]),
  dateCommencement: z.string().min(1, "Date requise"),
  fuseauHoraire: z.string().default("Africa/Niamey"),
});

export const schemaDeclarationCotisation = z.object({
  montant: z.string().min(1, "Montant requis"),
  preuveNom: z.string().optional(),
});

export const schemaRejetCotisation = z.object({
  motif: z.string().min(1, "Le motif du rejet est obligatoire"),
});

export const schemaVersement = z.object({
  montant: z.string().min(1, "Montant requis"),
  preuveNom: z.string().optional(),
});

export const schemaDocumentIdentite = z.object({
  typeDocument: z.enum(["CARTE_NATIONALE", "PASSEPORT", "PERMIS_CONDUIRE", "ATTESTATION"]),
  rectoNom: z.string().optional(),
  versoNom: z.string().optional(),
});

export const schemaProfil = z.object({
  prenom: z.string().min(1, "Prénom requis"),
  nom: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  telephone: z.string().min(8, "Téléphone invalide"),
});

export type FormulaireConnexion = z.infer<typeof schemaConnexion>;
export type FormulaireInscription = z.infer<typeof schemaInscription>;
export type FormulaireOTP = z.infer<typeof schemaOTP>;
export type FormulaireCreationTontine = z.infer<typeof schemaCreationTontine>;
export type FormulaireTransaction = z.infer<typeof schemaTransaction>;
export type FormulaireDeclarationCotisation = z.infer<typeof schemaDeclarationCotisation>;
export type FormulaireRejetCotisation = z.infer<typeof schemaRejetCotisation>;
export type FormulaireVersement = z.infer<typeof schemaVersement>;
