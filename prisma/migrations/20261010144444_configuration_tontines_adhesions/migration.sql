-- CreateEnum
CREATE TYPE "VisibiliteTontine" AS ENUM ('PUBLIQUE', 'PRIVEE');

-- CreateEnum
CREATE TYPE "ModeDemarrageTontine" AS ENUM ('MANUEL', 'AUTOMATIQUE');

-- CreateEnum
CREATE TYPE "StrategieAdhesion" AS ENUM ('INVITATION', 'DEMANDE', 'INVITATION_ET_DEMANDE');

-- CreateEnum
CREATE TYPE "MethodeOrdreBeneficiaires" AS ENUM ('MANUEL', 'ALEATOIRE');

-- CreateEnum
CREATE TYPE "StatutInvitationTontine" AS ENUM ('EN_ATTENTE', 'ACCEPTEE', 'REFUSEE', 'REVOQUEE', 'EXPIREE');

-- CreateEnum
CREATE TYPE "StatutDemandeAdhesion" AS ENUM ('EN_ATTENTE', 'APPROUVEE', 'REFUSEE', 'ANNULEE');

-- AlterTable
ALTER TABLE "InvitationTontine" ADD COLUMN     "accepteeLe" TIMESTAMP(3),
ADD COLUMN     "inviteId" TEXT,
ADD COLUMN     "refuseeLe" TIMESTAMP(3),
ADD COLUMN     "revoqueeLe" TIMESTAMP(3),
ADD COLUMN     "statut" "StatutInvitationTontine" NOT NULL DEFAULT 'EN_ATTENTE';

-- AlterTable
ALTER TABLE "Tontine" ADD COLUMN     "adhesionsFermees" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "delaiGraceJours" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "methodeOrdre" "MethodeOrdreBeneficiaires" NOT NULL DEFAULT 'MANUEL',
ADD COLUMN     "modeDemarrage" "ModeDemarrageTontine" NOT NULL DEFAULT 'MANUEL',
ADD COLUMN     "penaliteActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "penaliteMontant" DECIMAL(18,2),
ADD COLUMN     "rappelsActifs" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reglesVerrouilleesLe" TIMESTAMP(3),
ADD COLUMN     "reversementsPartielsAutorises" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "strategieAdhesion" "StrategieAdhesion" NOT NULL DEFAULT 'INVITATION_ET_DEMANDE',
ADD COLUMN     "visibilite" "VisibiliteTontine" NOT NULL DEFAULT 'PRIVEE';

-- CreateTable
CREATE TABLE "DemandeAdhesion" (
    "id" TEXT NOT NULL,
    "tontineId" TEXT NOT NULL,
    "demandeurId" TEXT NOT NULL,
    "statut" "StatutDemandeAdhesion" NOT NULL DEFAULT 'EN_ATTENTE',
    "motif" TEXT,
    "decideParId" TEXT,
    "decideLe" TIMESTAMP(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemandeAdhesion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DemandeAdhesion_tontineId_statut_idx" ON "DemandeAdhesion"("tontineId", "statut");

-- CreateIndex
CREATE UNIQUE INDEX "DemandeAdhesion_tontineId_demandeurId_key" ON "DemandeAdhesion"("tontineId", "demandeurId");

-- CreateIndex
CREATE INDEX "InvitationTontine_inviteId_statut_idx" ON "InvitationTontine"("inviteId", "statut");

-- AddForeignKey
ALTER TABLE "InvitationTontine" ADD CONSTRAINT "InvitationTontine_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandeAdhesion" ADD CONSTRAINT "DemandeAdhesion_tontineId_fkey" FOREIGN KEY ("tontineId") REFERENCES "Tontine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandeAdhesion" ADD CONSTRAINT "DemandeAdhesion_demandeurId_fkey" FOREIGN KEY ("demandeurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandeAdhesion" ADD CONSTRAINT "DemandeAdhesion_decideParId_fkey" FOREIGN KEY ("decideParId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
