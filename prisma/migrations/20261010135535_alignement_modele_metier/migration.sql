/*
  Warnings:

  - The values [EN_ATTENTE] on the enum `StatutDeclaration` will be removed. If these variants are still used in the database, this will fail.
  - The values [NON_RECU,LITIGE,CONFIRMEE_AUTOMATIQUEMENT] on the enum `StatutVersement` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `utilisateurId` on the `ConfirmationReception` table. All the data in the column will be lost.
  - You are about to drop the column `versementId` on the `ConfirmationReception` table. All the data in the column will be lost.
  - You are about to drop the column `donnees` on the `EvenementAudit` table. All the data in the column will be lost.
  - You are about to drop the column `utilisateurId` on the `EvenementAudit` table. All the data in the column will be lost.
  - You are about to drop the column `donnees` on the `HistoriqueTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `donnees` on the `OperationSynchronisation` table. All the data in the column will be lost.
  - You are about to drop the column `datePrevue` on the `Rotation` table. All the data in the column will be lost.
  - You are about to drop the column `montantAttendu` on the `Rotation` table. All the data in the column will be lost.
  - You are about to drop the column `codeInvitation` on the `Tontine` table. All the data in the column will be lost.
  - The `statut` column on the `TransactionFinanciere` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `nom` on the `Utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `prenom` on the `Utilisateur` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[rotationId]` on the table `ConfirmationReception` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `InvitationTontine` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[jetonHash]` on the table `InvitationTontine` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tontineId,version,membreId]` on the table `OrdreBeneficiaire` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `beneficiaireId` to the `ConfirmationReception` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expireLe` to the `ConfirmationReception` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rotationId` to the `ConfirmationReception` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modifieLe` to the `Cotisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `declarantId` to the `DeclarationCotisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `declarantId` to the `DeclarationVersement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modifieLe` to the `EspaceFinancier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createurId` to the `InvitationTontine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expireLe` to the `InvitationTontine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jetonHash` to the `InvitationTontine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modifieLe` to the `OperationSynchronisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requete` to the `OperationSynchronisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creeParId` to the `PreuveCotisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creeParId` to the `PreuveVersement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `debutLe` to the `Rotation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `echeanceLe` to the `Rotation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `montantTheorique` to the `Rotation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modifieLe` to the `Tontine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombreParticipantsRequis` to the `Tontine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modifieLe` to the `TransactionFinanciere` table without a default value. This is not possible if the table is not empty.
  - Added the required column `utilisateurId` to the `TransactionFinanciere` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modifieLe` to the `Utilisateur` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatutUtilisateur" AS ENUM ('ACTIF', 'INACTIF', 'SUSPENDU', 'SUPPRIME');

-- CreateEnum
CREATE TYPE "StatutEspaceFinancier" AS ENUM ('ACTIF', 'DESACTIVE', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "StatutTransaction" AS ENUM ('ACTIVE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "RoleMembreTontine" AS ENUM ('CREATEUR', 'MEMBRE');

-- CreateEnum
CREATE TYPE "StatutRotation" AS ENUM ('A_VENIR', 'EN_COURS', 'EN_ATTENTE_VERSEMENT', 'EN_ATTENTE_CONFIRMATION', 'TERMINEE', 'EN_RETARD', 'LITIGE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "StatutConfirmationReception" AS ENUM ('EN_ATTENTE', 'CONFIRMEE', 'NON_RECUE', 'CONFIRMEE_AUTOMATIQUEMENT');

-- CreateEnum
CREATE TYPE "SourceEvenementAudit" AS ENUM ('WEB', 'MOBILE', 'OFFLINE_SYNC', 'SYSTEME');

-- AlterEnum
BEGIN;
CREATE TYPE "StatutDeclaration_new" AS ENUM ('EN_ATTENTE_VALIDATION', 'VALIDEE', 'REJETEE', 'ANNULEE');
ALTER TABLE "DeclarationCotisation" ALTER COLUMN "statut" DROP DEFAULT;
ALTER TABLE "DeclarationCotisation" ALTER COLUMN "statut" TYPE "StatutDeclaration_new" USING ("statut"::text::"StatutDeclaration_new");
ALTER TYPE "StatutDeclaration" RENAME TO "StatutDeclaration_old";
ALTER TYPE "StatutDeclaration_new" RENAME TO "StatutDeclaration";
DROP TYPE "StatutDeclaration_old";
ALTER TABLE "DeclarationCotisation" ALTER COLUMN "statut" SET DEFAULT 'EN_ATTENTE_VALIDATION';
COMMIT;

-- AlterEnum
ALTER TYPE "StatutMembre" ADD VALUE 'TERMINE';

-- AlterEnum
BEGIN;
CREATE TYPE "StatutVersement_new" AS ENUM ('DECLARE', 'CONFIRME', 'CONTESTE');
ALTER TABLE "DeclarationVersement" ALTER COLUMN "statut" DROP DEFAULT;
ALTER TABLE "DeclarationVersement" ALTER COLUMN "statut" TYPE "StatutVersement_new" USING ("statut"::text::"StatutVersement_new");
ALTER TYPE "StatutVersement" RENAME TO "StatutVersement_old";
ALTER TYPE "StatutVersement_new" RENAME TO "StatutVersement";
DROP TYPE "StatutVersement_old";
ALTER TABLE "DeclarationVersement" ALTER COLUMN "statut" SET DEFAULT 'DECLARE';
COMMIT;

-- AlterEnum
ALTER TYPE "TypeTransaction" ADD VALUE 'TOUS';

-- DropForeignKey
ALTER TABLE "ConfirmationReception" DROP CONSTRAINT "ConfirmationReception_versementId_fkey";

-- DropIndex
DROP INDEX "ConfirmationReception_versementId_key";

-- DropIndex
DROP INDEX "DeclarationCotisation_cotisationId_idx";

-- DropIndex
DROP INDEX "EspaceFinancier_utilisateurId_idx";

-- DropIndex
DROP INDEX "EvenementAudit_entiteType_entiteId_idx";

-- DropIndex
DROP INDEX "MembreTontine_tontineId_idx";

-- DropIndex
DROP INDEX "Rotation_tontineId_idx";

-- DropIndex
DROP INDEX "Tontine_codeInvitation_key";

-- DropIndex
DROP INDEX "Tontine_createurId_idx";

-- AlterTable
ALTER TABLE "ConfirmationReception" DROP COLUMN "utilisateurId",
DROP COLUMN "versementId",
ADD COLUMN     "beneficiaireId" TEXT NOT NULL,
ADD COLUMN     "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expireLe" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "rotationId" TEXT NOT NULL,
ADD COLUMN     "statut" "StatutConfirmationReception" NOT NULL DEFAULT 'EN_ATTENTE';

-- AlterTable
ALTER TABLE "Cotisation" ADD COLUMN     "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "modifieLe" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "DeclarationCotisation" ADD COLUMN     "decideLe" TIMESTAMP(3),
ADD COLUMN     "decideParId" TEXT,
ADD COLUMN     "declarantId" TEXT NOT NULL,
ADD COLUMN     "declareLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "statut" SET DEFAULT 'EN_ATTENTE_VALIDATION';

-- AlterTable
ALTER TABLE "DeclarationVersement" ADD COLUMN     "confirmeLe" TIMESTAMP(3),
ADD COLUMN     "contesteLe" TIMESTAMP(3),
ADD COLUMN     "declarantId" TEXT NOT NULL,
ADD COLUMN     "declareLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "motifContestation" TEXT;

-- AlterTable
ALTER TABLE "EspaceFinancier" ADD COLUMN     "archiveLe" TIMESTAMP(3),
ADD COLUMN     "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "modifieLe" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "statut" "StatutEspaceFinancier" NOT NULL DEFAULT 'ACTIF';

-- AlterTable
ALTER TABLE "EvenementAudit" DROP COLUMN "donnees",
DROP COLUMN "utilisateurId",
ADD COLUMN     "acteurId" TEXT,
ADD COLUMN     "anciennesDonnees" JSONB,
ADD COLUMN     "contexte" JSONB,
ADD COLUMN     "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nouvellesDonnees" JSONB,
ADD COLUMN     "source" "SourceEvenementAudit" NOT NULL DEFAULT 'SYSTEME';

-- AlterTable
ALTER TABLE "HistoriqueTransaction" DROP COLUMN "donnees",
ADD COLUMN     "ancienneValeur" JSONB,
ADD COLUMN     "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nouvelleValeur" JSONB;

-- AlterTable
ALTER TABLE "InvitationTontine" ADD COLUMN     "createurId" TEXT NOT NULL,
ADD COLUMN     "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "estActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "expireLe" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "jetonHash" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MembreTontine" ADD COLUMN     "approuveLe" TIMESTAMP(3),
ADD COLUMN     "rejointLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "retireLe" TIMESTAMP(3),
ADD COLUMN     "role" "RoleMembreTontine" NOT NULL DEFAULT 'MEMBRE';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "donnees" JSONB;

-- AlterTable
ALTER TABLE "OperationSynchronisation" DROP COLUMN "donnees",
ADD COLUMN     "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "erreur" JSONB,
ADD COLUMN     "modifieLe" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "requete" JSONB NOT NULL,
ADD COLUMN     "resultat" JSONB,
ADD COLUMN     "traiteeLe" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "OrdreBeneficiaire" ADD COLUMN     "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "PreuveCotisation" ADD COLUMN     "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creeParId" TEXT NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "PreuveVersement" ADD COLUMN     "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creeParId" TEXT NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Rotation" DROP COLUMN "datePrevue",
DROP COLUMN "montantAttendu",
ADD COLUMN     "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "debutLe" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "echeanceLe" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "montantTheorique" DECIMAL(18,2) NOT NULL,
ADD COLUMN     "montantValide" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN     "statut" "StatutRotation" NOT NULL DEFAULT 'A_VENIR',
ADD COLUMN     "termineeLe" TIMESTAMP(3),
ADD COLUMN     "versementEffectueLe" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Tontine" DROP COLUMN "codeInvitation",
ADD COLUMN     "archiveeLe" TIMESTAMP(3),
ADD COLUMN     "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "demarreeLe" TIMESTAMP(3),
ADD COLUMN     "modifieLe" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "nombreParticipantsRequis" INTEGER NOT NULL,
ADD COLUMN     "nombreTours" INTEGER,
ADD COLUMN     "termineeLe" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "TransactionFinanciere" ADD COLUMN     "annuleLe" TIMESTAMP(3),
ADD COLUMN     "annuleParId" TEXT,
ADD COLUMN     "categorieId" TEXT,
ADD COLUMN     "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "modifieLe" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "motifAnnulation" TEXT,
ADD COLUMN     "moyenPaiement" TEXT,
ADD COLUMN     "utilisateurId" TEXT NOT NULL,
DROP COLUMN "statut",
ADD COLUMN     "statut" "StatutTransaction" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Utilisateur" DROP COLUMN "nom",
DROP COLUMN "prenom",
ADD COLUMN     "derniereConnexionLe" TIMESTAMP(3),
ADD COLUMN     "emailVerifieLe" TIMESTAMP(3),
ADD COLUMN     "modifieLe" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "motDePasseHash" TEXT,
ADD COLUMN     "statut" "StatutUtilisateur" NOT NULL DEFAULT 'ACTIF',
ADD COLUMN     "supprimeLe" TIMESTAMP(3),
ADD COLUMN     "telephoneVerifieLe" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Profil" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "avatarFichierId" TEXT,
    "pays" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifieLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "jetonHash" TEXT NOT NULL,
    "expireLe" TIMESTAMP(3) NOT NULL,
    "invalideLe" TIMESTAMP(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationEmail" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "jetonHash" TEXT NOT NULL,
    "expireLe" TIMESTAMP(3) NOT NULL,
    "verifieLe" TIMESTAMP(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationTelephone" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expireLe" TIMESTAMP(3) NOT NULL,
    "verifieLe" TIMESTAMP(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationTelephone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fichier" (
    "id" TEXT NOT NULL,
    "proprietaireId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "typeMime" TEXT NOT NULL,
    "tailleOctets" INTEGER NOT NULL,
    "cleStockage" TEXT NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fichier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categorie" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT,
    "nom" TEXT NOT NULL,
    "type" "TypeTransaction" NOT NULL,
    "estSysteme" BOOLEAN NOT NULL DEFAULT false,
    "estActive" BOOLEAN NOT NULL DEFAULT true,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archiveLe" TIMESTAMP(3),

    CONSTRAINT "Categorie_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profil_utilisateurId_key" ON "Profil"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "Profil_avatarFichierId_key" ON "Profil"("avatarFichierId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_jetonHash_key" ON "Session"("jetonHash");

-- CreateIndex
CREATE INDEX "Session_utilisateurId_expireLe_idx" ON "Session"("utilisateurId", "expireLe");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationEmail_jetonHash_key" ON "VerificationEmail"("jetonHash");

-- CreateIndex
CREATE INDEX "VerificationEmail_utilisateurId_expireLe_idx" ON "VerificationEmail"("utilisateurId", "expireLe");

-- CreateIndex
CREATE INDEX "VerificationTelephone_utilisateurId_expireLe_idx" ON "VerificationTelephone"("utilisateurId", "expireLe");

-- CreateIndex
CREATE UNIQUE INDEX "Fichier_cleStockage_key" ON "Fichier"("cleStockage");

-- CreateIndex
CREATE INDEX "Fichier_proprietaireId_idx" ON "Fichier"("proprietaireId");

-- CreateIndex
CREATE INDEX "Categorie_utilisateurId_estActive_idx" ON "Categorie"("utilisateurId", "estActive");

-- CreateIndex
CREATE UNIQUE INDEX "Categorie_utilisateurId_nom_type_key" ON "Categorie"("utilisateurId", "nom", "type");

-- CreateIndex
CREATE UNIQUE INDEX "ConfirmationReception_rotationId_key" ON "ConfirmationReception"("rotationId");

-- CreateIndex
CREATE INDEX "ConfirmationReception_beneficiaireId_statut_idx" ON "ConfirmationReception"("beneficiaireId", "statut");

-- CreateIndex
CREATE INDEX "Cotisation_membreId_statut_idx" ON "Cotisation"("membreId", "statut");

-- CreateIndex
CREATE INDEX "DeclarationCotisation_cotisationId_statut_idx" ON "DeclarationCotisation"("cotisationId", "statut");

-- CreateIndex
CREATE INDEX "DeclarationVersement_rotationId_statut_idx" ON "DeclarationVersement"("rotationId", "statut");

-- CreateIndex
CREATE INDEX "EspaceFinancier_utilisateurId_statut_idx" ON "EspaceFinancier"("utilisateurId", "statut");

-- CreateIndex
CREATE INDEX "EvenementAudit_entiteType_entiteId_creeLe_idx" ON "EvenementAudit"("entiteType", "entiteId", "creeLe");

-- CreateIndex
CREATE INDEX "EvenementAudit_acteurId_creeLe_idx" ON "EvenementAudit"("acteurId", "creeLe");

-- CreateIndex
CREATE INDEX "HistoriqueTransaction_transactionId_creeLe_idx" ON "HistoriqueTransaction"("transactionId", "creeLe");

-- CreateIndex
CREATE UNIQUE INDEX "InvitationTontine_code_key" ON "InvitationTontine"("code");

-- CreateIndex
CREATE UNIQUE INDEX "InvitationTontine_jetonHash_key" ON "InvitationTontine"("jetonHash");

-- CreateIndex
CREATE INDEX "InvitationTontine_tontineId_estActive_idx" ON "InvitationTontine"("tontineId", "estActive");

-- CreateIndex
CREATE INDEX "MembreTontine_tontineId_statut_idx" ON "MembreTontine"("tontineId", "statut");

-- CreateIndex
CREATE INDEX "OperationSynchronisation_utilisateurId_statut_idx" ON "OperationSynchronisation"("utilisateurId", "statut");

-- CreateIndex
CREATE INDEX "OrdreBeneficiaire_membreId_idx" ON "OrdreBeneficiaire"("membreId");

-- CreateIndex
CREATE UNIQUE INDEX "OrdreBeneficiaire_tontineId_version_membreId_key" ON "OrdreBeneficiaire"("tontineId", "version", "membreId");

-- CreateIndex
CREATE INDEX "PreuveCotisation_declarationId_idx" ON "PreuveCotisation"("declarationId");

-- CreateIndex
CREATE INDEX "PreuveVersement_declarationId_idx" ON "PreuveVersement"("declarationId");

-- CreateIndex
CREATE INDEX "Rotation_tontineId_statut_idx" ON "Rotation"("tontineId", "statut");

-- CreateIndex
CREATE INDEX "Rotation_beneficiaireId_idx" ON "Rotation"("beneficiaireId");

-- CreateIndex
CREATE INDEX "Tontine_createurId_statut_idx" ON "Tontine"("createurId", "statut");

-- CreateIndex
CREATE INDEX "TransactionFinanciere_utilisateurId_dateOperation_idx" ON "TransactionFinanciere"("utilisateurId", "dateOperation");

-- AddForeignKey
ALTER TABLE "Profil" ADD CONSTRAINT "Profil_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profil" ADD CONSTRAINT "Profil_avatarFichierId_fkey" FOREIGN KEY ("avatarFichierId") REFERENCES "Fichier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationEmail" ADD CONSTRAINT "VerificationEmail_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationTelephone" ADD CONSTRAINT "VerificationTelephone_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fichier" ADD CONSTRAINT "Fichier_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categorie" ADD CONSTRAINT "Categorie_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionFinanciere" ADD CONSTRAINT "TransactionFinanciere_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionFinanciere" ADD CONSTRAINT "TransactionFinanciere_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "Categorie"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionFinanciere" ADD CONSTRAINT "TransactionFinanciere_annuleParId_fkey" FOREIGN KEY ("annuleParId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tontine" ADD CONSTRAINT "Tontine_createurId_fkey" FOREIGN KEY ("createurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationTontine" ADD CONSTRAINT "InvitationTontine_createurId_fkey" FOREIGN KEY ("createurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdreBeneficiaire" ADD CONSTRAINT "OrdreBeneficiaire_tontineId_fkey" FOREIGN KEY ("tontineId") REFERENCES "Tontine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdreBeneficiaire" ADD CONSTRAINT "OrdreBeneficiaire_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "MembreTontine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rotation" ADD CONSTRAINT "Rotation_beneficiaireId_fkey" FOREIGN KEY ("beneficiaireId") REFERENCES "MembreTontine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeclarationCotisation" ADD CONSTRAINT "DeclarationCotisation_declarantId_fkey" FOREIGN KEY ("declarantId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeclarationCotisation" ADD CONSTRAINT "DeclarationCotisation_decideParId_fkey" FOREIGN KEY ("decideParId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreuveCotisation" ADD CONSTRAINT "PreuveCotisation_fichierId_fkey" FOREIGN KEY ("fichierId") REFERENCES "Fichier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreuveCotisation" ADD CONSTRAINT "PreuveCotisation_creeParId_fkey" FOREIGN KEY ("creeParId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeclarationVersement" ADD CONSTRAINT "DeclarationVersement_declarantId_fkey" FOREIGN KEY ("declarantId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreuveVersement" ADD CONSTRAINT "PreuveVersement_fichierId_fkey" FOREIGN KEY ("fichierId") REFERENCES "Fichier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreuveVersement" ADD CONSTRAINT "PreuveVersement_creeParId_fkey" FOREIGN KEY ("creeParId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfirmationReception" ADD CONSTRAINT "ConfirmationReception_rotationId_fkey" FOREIGN KEY ("rotationId") REFERENCES "Rotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfirmationReception" ADD CONSTRAINT "ConfirmationReception_beneficiaireId_fkey" FOREIGN KEY ("beneficiaireId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvenementAudit" ADD CONSTRAINT "EvenementAudit_acteurId_fkey" FOREIGN KEY ("acteurId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
