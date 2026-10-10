import { prisma } from "@/lib/prisma";
export const auditRepository = {
  listerParEntite: (entiteType: string, entiteId: string) => prisma.evenementAudit.findMany({ where: { entiteType, entiteId } }),
};
