import { prisma } from "@/lib/prisma";
export const notificationsRepository = {
  listerParUtilisateur: (utilisateurId: string) => prisma.notification.findMany({ where: { utilisateurId }, orderBy: { id: "desc" } }),
  marquerLue: (id: string) => prisma.notification.update({ where: { id }, data: { lueLe: new Date() } }),
};
