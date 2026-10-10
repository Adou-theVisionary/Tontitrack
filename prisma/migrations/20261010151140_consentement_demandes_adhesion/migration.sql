/*
  Warnings:

  - Added the required column `consentementAccepteLe` to the `DemandeAdhesion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empreinteConditions` to the `DemandeAdhesion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `versionConditions` to the `DemandeAdhesion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DemandeAdhesion" ADD COLUMN     "consentementAccepteLe" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "empreinteConditions" TEXT NOT NULL,
ADD COLUMN     "versionConditions" TEXT NOT NULL;
