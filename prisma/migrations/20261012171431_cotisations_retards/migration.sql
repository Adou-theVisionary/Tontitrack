/*
  Warnings:

  - Added the required column `echeanceLe` to the `Cotisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tontineId` to the `Cotisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verseLe` to the `DeclarationCotisation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cotisation" ADD COLUMN     "echeanceLe" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "montantDeclare" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN     "penaliteAppliqueeLe" TIMESTAMP(3),
ADD COLUMN     "penaliteAppliqueeMontant" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN     "rappelAvantEcheanceEnvoyeLe" TIMESTAMP(3),
ADD COLUMN     "rappelRetardEnvoyeLe" TIMESTAMP(3),
ADD COLUMN     "tontineId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DeclarationCotisation" ADD COLUMN     "moyenVersement" TEXT,
ADD COLUMN     "observationDecision" TEXT,
ADD COLUMN     "referenceVersement" TEXT,
ADD COLUMN     "verseLe" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Cotisation_tontineId_statut_idx" ON "Cotisation"("tontineId", "statut");

-- AddForeignKey
ALTER TABLE "Cotisation" ADD CONSTRAINT "Cotisation_tontineId_fkey" FOREIGN KEY ("tontineId") REFERENCES "Tontine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
