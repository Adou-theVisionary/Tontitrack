import { prisma } from "@/lib/prisma";

export const authentificationRepository = {
  trouverParIdentifiant(email: string, telephone: string) {
    return prisma.utilisateur.findFirst({ where: { OR: [{ email }, { telephone }] }, select: { id: true } });
  },
  trouverParEmail(email: string) {
    return prisma.utilisateur.findUnique({ where: { email }, include: { profil: true, rolesPlateforme: true } });
  },
  creerCompte(donnees: { email: string; telephone: string; motDePasseHash: string; prenom: string; nom: string; jetonVerificationHash: string; expireLe: Date }) {
    return prisma.$transaction(async (transaction) => {
      const utilisateur = await transaction.utilisateur.create({ data: { email: donnees.email, telephone: donnees.telephone, motDePasseHash: donnees.motDePasseHash } });
      await transaction.profil.create({ data: { utilisateurId: utilisateur.id, prenom: donnees.prenom, nom: donnees.nom } });
      await transaction.verificationEmail.create({ data: { utilisateurId: utilisateur.id, jetonHash: donnees.jetonVerificationHash, expireLe: donnees.expireLe } });
      return transaction.utilisateur.findUniqueOrThrow({ where: { id: utilisateur.id }, include: { profil: true } });
    });
  },
  enregistrerDerniereConnexion(utilisateurId: string) {
    return prisma.utilisateur.update({ where: { id: utilisateurId }, data: { derniereConnexionLe: new Date() } });
  },
};
