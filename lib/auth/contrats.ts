import { z } from "zod";

const telephone = z.string().transform((valeur) => valeur.replace(/[\s().-]/g, ""))
  .refine((valeur) => /^\+?[1-9]\d{7,14}$/.test(valeur), "Numéro de téléphone invalide.");

export const inscriptionSchema = z.object({
  prenom: z.string().trim().min(1, "Prénom requis.").max(100),
  nom: z.string().trim().min(1, "Nom requis.").max(100),
  email: z.string().trim().email("Adresse e-mail invalide.").transform((valeur) => valeur.toLowerCase()),
  telephone,
  motDePasse: z.string().min(8, "Mot de passe : 8 caractères minimum.")
    .regex(/[A-Z]/, "Mot de passe : une majuscule requise.")
    .regex(/[0-9]/, "Mot de passe : un chiffre requis."),
  confirmationMotDePasse: z.string(),
}).refine((donnees) => donnees.motDePasse === donnees.confirmationMotDePasse, {
  path: ["confirmationMotDePasse"], message: "Les mots de passe ne correspondent pas.",
});

export const connexionSchema = z.object({
  email: z.string().trim().email().transform((valeur) => valeur.toLowerCase()),
  motDePasse: z.string().min(1),
  retour: z.string().max(2_000).optional(),
});

export type DonneesInscription = z.infer<typeof inscriptionSchema>;
