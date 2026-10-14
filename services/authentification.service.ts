import { randomBytes, createHash } from "crypto";
import { Prisma, StatutUtilisateur } from "@prisma/client";
import { hasherMotDePasse, verifierMotDePasse } from "@/lib/auth/mot-de-passe";
import type { DonneesInscription } from "@/lib/auth/contrats";
import { authentificationRepository } from "@/repositories/authentification.repository";
import { permissionsEffectives } from "@/lib/administration/permissions";

export class ErreurAuthentification extends Error {
  constructor(public code: string, message: string, public statutHttp: number) { super(message); }
}

export type UtilisateurPublic = { id: string; prenom: string; nom: string; email: string; telephone: string; statutIdentite: "NON_FOURNI" };

export function presenterUtilisateur(utilisateur: { id: string; email: string; telephone: string; profil: { prenom: string; nom: string } | null }): UtilisateurPublic {
  return { id: utilisateur.id, prenom: utilisateur.profil?.prenom ?? "", nom: utilisateur.profil?.nom ?? "", email: utilisateur.email, telephone: utilisateur.telephone, statutIdentite: "NON_FOURNI" };
}

function hashJeton(jeton: string) { return createHash("sha256").update(jeton).digest("base64url"); }

export async function inscrireUtilisateur(donnees: DonneesInscription) {
  const existe = await authentificationRepository.trouverParIdentifiant(donnees.email, donnees.telephone);
  if (existe) throw new ErreurAuthentification("IDENTIFIANT_DEJA_UTILISE", "Cette adresse e-mail ou ce numéro de téléphone est déjà utilisé.", 409);

  const motDePasseHash = await hasherMotDePasse(donnees.motDePasse);
  const jetonVerification = randomBytes(32).toString("base64url");
  try {
    // Jeton stocké sous empreinte. Aucun e-mail n'est envoyé dans cette phase.
    const utilisateur = await authentificationRepository.creerCompte({
      email: donnees.email, telephone: donnees.telephone, motDePasseHash,
      prenom: donnees.prenom, nom: donnees.nom, jetonVerificationHash: hashJeton(jetonVerification),
      expireLe: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    return presenterUtilisateur(utilisateur);
  } catch (erreur) {
    if (erreur instanceof Prisma.PrismaClientKnownRequestError && erreur.code === "P2002") {
      throw new ErreurAuthentification("IDENTIFIANT_DEJA_UTILISE", "Cette adresse e-mail ou ce numéro de téléphone est déjà utilisé.", 409);
    }
    throw erreur;
  }
}

export async function authentifierUtilisateur(email: string, motDePasse: string) {
  const utilisateur = await authentificationRepository.trouverParEmail(email);
  const erreur = new ErreurAuthentification("IDENTIFIANTS_INVALIDES", "Email ou mot de passe incorrect.", 401);
  if (!utilisateur?.motDePasseHash || !(await verifierMotDePasse(motDePasse, utilisateur.motDePasseHash))) throw erreur;
  if (utilisateur.statut !== StatutUtilisateur.ACTIF) throw new ErreurAuthentification("COMPTE_INDISPONIBLE", "Ce compte ne permet pas la connexion.", 403);
  await authentificationRepository.enregistrerDerniereConnexion(utilisateur.id);
  return {
    utilisateur: presenterUtilisateur(utilisateur),
    permissions: permissionsEffectives(utilisateur.rolesPlateforme.map((attribution) => attribution.role), utilisateur.rolesPersonnalises.flatMap((attribution) => attribution.role.permissions.map((permissionRole) => permissionRole.permission))),
  };
}
