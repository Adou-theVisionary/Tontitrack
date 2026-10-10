import { prisma } from "@/lib/prisma";
export const utilisateursRepository = {
  trouverParEmail: (email: string) => prisma.utilisateur.findUnique({ where: { email } }),
  trouverParId: (id: string) => prisma.utilisateur.findUnique({ where: { id } }),
};
