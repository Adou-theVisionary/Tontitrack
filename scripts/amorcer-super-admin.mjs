import { PrismaClient } from "@prisma/client";

const utilisateurId = process.env.TONTITRACK_AMORCAGE_UTILISATEUR_ID?.trim();
const confirmation = process.env.TONTITRACK_AMORCAGE_CONFIRME;

if (!utilisateurId || confirmation !== "OUI") {
  throw new Error("Définir TONTITRACK_AMORCAGE_UTILISATEUR_ID pour un compte existant et TONTITRACK_AMORCAGE_CONFIRME=OUI.");
}

const prisma = new PrismaClient();

try {
  const resultat = await prisma.$transaction(async (transaction) => {
    const utilisateur = await transaction.utilisateur.findUnique({ where: { id: utilisateurId }, select: { id: true, statut: true } });
    if (!utilisateur) throw new Error("Utilisateur d’amorçage introuvable.");
    if (utilisateur.statut !== "ACTIF") throw new Error("Le premier Super Admin doit avoir un compte ACTIF.");

    const existant = await transaction.attributionRolePlateforme.findUnique({ where: { utilisateurId_role: { utilisateurId, role: "SUPER_ADMIN" } }, select: { id: true } });
    if (existant) return { etat: "DEJA_AMORCE" };

    const nombreSuperAdmins = await transaction.attributionRolePlateforme.count({ where: { role: "SUPER_ADMIN", utilisateur: { statut: "ACTIF" } } });
    if (nombreSuperAdmins > 0) throw new Error("Un Super Admin actif existe déjà. L’amorçage initial est fermé.");

    const attribution = await transaction.attributionRolePlateforme.create({ data: { utilisateurId, role: "SUPER_ADMIN" } });
    await transaction.evenementAudit.create({
      data: {
        entiteType: "AttributionRolePlateforme", entiteId: attribution.id, action: "AMORCAGE_PREMIER_SUPER_ADMIN",
        source: "SYSTEME", module: "plateforme", autorisation: "plateforme.roles.gerer", resultat: "SUCCES",
        motif: "Amorçage manuel explicite du premier Super Admin", contexte: { utilisateurId },
      },
    });
    return { etat: "AMORCE" };
  }, { isolationLevel: "Serializable" });
  console.log(resultat.etat);
} finally {
  await prisma.$disconnect();
}
