import { prisma } from "@/lib/prisma";
export const tontinesRepository = {
  trouverParId: (id: string) => prisma.tontine.findUnique({ where: { id }, include: { membres: true, rotations: true } }),
  listerParCreateur: (createurId: string) => prisma.tontine.findMany({ where: { createurId } }),
};
