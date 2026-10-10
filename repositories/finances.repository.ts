import { prisma } from "@/lib/prisma";
export const financesRepository = {
  listerTransactions: (espaceId: string) => prisma.transactionFinanciere.findMany({ where: { espaceId }, orderBy: { dateOperation: "desc" } }),
  trouverEspace: (id: string) => prisma.espaceFinancier.findUnique({ where: { id } }),
};
