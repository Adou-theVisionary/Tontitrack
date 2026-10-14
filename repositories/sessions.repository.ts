import { prisma } from "@/lib/prisma";

export const sessionsRepository = {
  creer(utilisateurId: string, jetonHash: string, expireLe: Date) {
    return prisma.session.create({ data: { utilisateurId, jetonHash, expireLe } });
  },
  trouverValide(jetonHash: string) {
    return prisma.session.findUnique({
      where: { jetonHash },
      include: { utilisateur: { include: { profil: true, rolesPlateforme: true, rolesPersonnalises: { include: { role: { include: { permissions: true } } } } } } },
    });
  },
  invalider(jetonHash: string) {
    return prisma.session.updateMany({ where: { jetonHash, invalideLe: null }, data: { invalideLe: new Date() } });
  },
  invaliderToutesPourUtilisateur(utilisateurId: string) {
    return prisma.session.updateMany({
      where: { utilisateurId, invalideLe: null },
      data: { invalideLe: new Date() },
    });
  },
};
