-- CreateEnum
CREATE TYPE "TypeEspace" AS ENUM ('PERSONNEL', 'ACTIVITE');

-- CreateEnum
CREATE TYPE "TypeTransaction" AS ENUM ('REVENU', 'DEPENSE', 'EPARGNE', 'INVESTISSEMENT');

-- CreateEnum
CREATE TYPE "ModeTontine" AS ENUM ('FIXE_CREATEUR', 'TOURNANT_EXCLU', 'TOURNANT_INCLUS');

-- CreateEnum
CREATE TYPE "StatutTontine" AS ENUM ('EN_PREPARATION', 'PRETE_A_DEMARRER', 'ACTIVE', 'TERMINEE', 'ANNULEE', 'ARCHIVEE');

-- CreateEnum
CREATE TYPE "FrequenceTontine" AS ENUM ('QUOTIDIENNE', 'HEBDOMADAIRE', 'MENSUELLE');

-- CreateEnum
CREATE TYPE "StatutMembre" AS ENUM ('EN_ATTENTE', 'APPROUVE', 'REFUSE', 'RETIRE');

-- CreateEnum
CREATE TYPE "StatutCotisation" AS ENUM ('A_PAYER', 'PARTIEL', 'PAYEE', 'EN_RETARD', 'NON_CONCERNE');

-- CreateEnum
CREATE TYPE "StatutDeclaration" AS ENUM ('EN_ATTENTE', 'VALIDEE', 'REJETEE');

-- CreateEnum
CREATE TYPE "StatutVersement" AS ENUM ('DECLARE', 'CONFIRME', 'NON_RECU', 'LITIGE', 'CONFIRMEE_AUTOMATIQUEMENT');

-- CreateEnum
CREATE TYPE "TypeNotification" AS ENUM ('INVITATION', 'DEMANDE_ADHESION', 'DEMANDE_ACCEPTEE', 'DEMANDE_REFUSEE', 'COTISATION_A_PAYER', 'COTISATION_EN_RETARD', 'COTISATION_VALIDEE', 'COTISATION_REJETEE', 'NOUVELLE_ROTATION', 'VERSEMENT_DECLARE', 'CONFIRMATION_RECEPTION', 'TONTINE_DEMARREE', 'TONTINE_TERMINEE');

-- CreateEnum
CREATE TYPE "StatutSynchronisation" AS ENUM ('EN_ATTENTE', 'EN_COURS', 'SYNCHRONISEE', 'ERREUR', 'CONFLIT');

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EspaceFinancier" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" "TypeEspace" NOT NULL,
    "devise" TEXT NOT NULL DEFAULT 'XOF',

    CONSTRAINT "EspaceFinancier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionFinanciere" (
    "id" TEXT NOT NULL,
    "espaceId" TEXT NOT NULL,
    "type" "TypeTransaction" NOT NULL,
    "montant" DECIMAL(18,2) NOT NULL,
    "devise" TEXT NOT NULL DEFAULT 'XOF',
    "description" TEXT NOT NULL,
    "dateOperation" TIMESTAMP(3) NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "TransactionFinanciere_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoriqueTransaction" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "donnees" JSONB,

    CONSTRAINT "HistoriqueTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tontine" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "createurId" TEXT NOT NULL,
    "mode" "ModeTontine" NOT NULL,
    "statut" "StatutTontine" NOT NULL DEFAULT 'EN_PREPARATION',
    "montantCotisation" DECIMAL(18,2) NOT NULL,
    "devise" TEXT NOT NULL DEFAULT 'XOF',
    "frequence" "FrequenceTontine" NOT NULL,
    "dateCommencement" TIMESTAMP(3) NOT NULL,
    "fuseauHoraire" TEXT NOT NULL,
    "codeInvitation" TEXT NOT NULL,

    CONSTRAINT "Tontine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembreTontine" (
    "id" TEXT NOT NULL,
    "tontineId" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "statut" "StatutMembre" NOT NULL DEFAULT 'EN_ATTENTE',
    "position" INTEGER,

    CONSTRAINT "MembreTontine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvitationTontine" (
    "id" TEXT NOT NULL,
    "tontineId" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "InvitationTontine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdreBeneficiaire" (
    "id" TEXT NOT NULL,
    "tontineId" TEXT NOT NULL,
    "membreId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "OrdreBeneficiaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rotation" (
    "id" TEXT NOT NULL,
    "tontineId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "beneficiaireId" TEXT NOT NULL,
    "datePrevue" TIMESTAMP(3) NOT NULL,
    "montantAttendu" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "Rotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cotisation" (
    "id" TEXT NOT NULL,
    "rotationId" TEXT NOT NULL,
    "membreId" TEXT NOT NULL,
    "montantAttendu" DECIMAL(18,2) NOT NULL,
    "montantValide" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "statut" "StatutCotisation" NOT NULL DEFAULT 'A_PAYER',

    CONSTRAINT "Cotisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeclarationCotisation" (
    "id" TEXT NOT NULL,
    "cotisationId" TEXT NOT NULL,
    "montant" DECIMAL(18,2) NOT NULL,
    "statut" "StatutDeclaration" NOT NULL DEFAULT 'EN_ATTENTE',
    "motifRejet" TEXT,

    CONSTRAINT "DeclarationCotisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreuveCotisation" (
    "id" TEXT NOT NULL,
    "declarationId" TEXT NOT NULL,
    "fichierId" TEXT NOT NULL,

    CONSTRAINT "PreuveCotisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeclarationVersement" (
    "id" TEXT NOT NULL,
    "rotationId" TEXT NOT NULL,
    "montant" DECIMAL(18,2) NOT NULL,
    "statut" "StatutVersement" NOT NULL DEFAULT 'DECLARE',

    CONSTRAINT "DeclarationVersement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreuveVersement" (
    "id" TEXT NOT NULL,
    "declarationId" TEXT NOT NULL,
    "fichierId" TEXT NOT NULL,

    CONSTRAINT "PreuveVersement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfirmationReception" (
    "id" TEXT NOT NULL,
    "versementId" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "confirmeLe" TIMESTAMP(3),

    CONSTRAINT "ConfirmationReception_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "type" "TypeNotification" NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "cibleUrl" TEXT,
    "lueLe" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvenementAudit" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT,
    "entiteType" TEXT NOT NULL,
    "entiteId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "donnees" JSONB,

    CONSTRAINT "EvenementAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationSynchronisation" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "typeOperation" TEXT NOT NULL,
    "entiteType" TEXT NOT NULL,
    "entiteId" TEXT NOT NULL,
    "statut" "StatutSynchronisation" NOT NULL DEFAULT 'EN_ATTENTE',
    "donnees" JSONB NOT NULL,

    CONSTRAINT "OperationSynchronisation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_telephone_key" ON "Utilisateur"("telephone");

-- CreateIndex
CREATE INDEX "EspaceFinancier_utilisateurId_idx" ON "EspaceFinancier"("utilisateurId");

-- CreateIndex
CREATE INDEX "TransactionFinanciere_espaceId_dateOperation_idx" ON "TransactionFinanciere"("espaceId", "dateOperation");

-- CreateIndex
CREATE UNIQUE INDEX "Tontine_codeInvitation_key" ON "Tontine"("codeInvitation");

-- CreateIndex
CREATE INDEX "Tontine_createurId_idx" ON "Tontine"("createurId");

-- CreateIndex
CREATE INDEX "MembreTontine_tontineId_idx" ON "MembreTontine"("tontineId");

-- CreateIndex
CREATE UNIQUE INDEX "MembreTontine_tontineId_utilisateurId_key" ON "MembreTontine"("tontineId", "utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "OrdreBeneficiaire_tontineId_version_position_key" ON "OrdreBeneficiaire"("tontineId", "version", "position");

-- CreateIndex
CREATE INDEX "Rotation_tontineId_idx" ON "Rotation"("tontineId");

-- CreateIndex
CREATE UNIQUE INDEX "Rotation_tontineId_numero_key" ON "Rotation"("tontineId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "Cotisation_rotationId_membreId_key" ON "Cotisation"("rotationId", "membreId");

-- CreateIndex
CREATE INDEX "DeclarationCotisation_cotisationId_idx" ON "DeclarationCotisation"("cotisationId");

-- CreateIndex
CREATE UNIQUE INDEX "ConfirmationReception_versementId_key" ON "ConfirmationReception"("versementId");

-- CreateIndex
CREATE INDEX "Notification_utilisateurId_lueLe_idx" ON "Notification"("utilisateurId", "lueLe");

-- CreateIndex
CREATE INDEX "EvenementAudit_entiteType_entiteId_idx" ON "EvenementAudit"("entiteType", "entiteId");

-- CreateIndex
CREATE UNIQUE INDEX "OperationSynchronisation_utilisateurId_idempotencyKey_key" ON "OperationSynchronisation"("utilisateurId", "idempotencyKey");

-- AddForeignKey
ALTER TABLE "EspaceFinancier" ADD CONSTRAINT "EspaceFinancier_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionFinanciere" ADD CONSTRAINT "TransactionFinanciere_espaceId_fkey" FOREIGN KEY ("espaceId") REFERENCES "EspaceFinancier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriqueTransaction" ADD CONSTRAINT "HistoriqueTransaction_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "TransactionFinanciere"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembreTontine" ADD CONSTRAINT "MembreTontine_tontineId_fkey" FOREIGN KEY ("tontineId") REFERENCES "Tontine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembreTontine" ADD CONSTRAINT "MembreTontine_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationTontine" ADD CONSTRAINT "InvitationTontine_tontineId_fkey" FOREIGN KEY ("tontineId") REFERENCES "Tontine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rotation" ADD CONSTRAINT "Rotation_tontineId_fkey" FOREIGN KEY ("tontineId") REFERENCES "Tontine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cotisation" ADD CONSTRAINT "Cotisation_rotationId_fkey" FOREIGN KEY ("rotationId") REFERENCES "Rotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cotisation" ADD CONSTRAINT "Cotisation_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "MembreTontine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeclarationCotisation" ADD CONSTRAINT "DeclarationCotisation_cotisationId_fkey" FOREIGN KEY ("cotisationId") REFERENCES "Cotisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreuveCotisation" ADD CONSTRAINT "PreuveCotisation_declarationId_fkey" FOREIGN KEY ("declarationId") REFERENCES "DeclarationCotisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeclarationVersement" ADD CONSTRAINT "DeclarationVersement_rotationId_fkey" FOREIGN KEY ("rotationId") REFERENCES "Rotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreuveVersement" ADD CONSTRAINT "PreuveVersement_declarationId_fkey" FOREIGN KEY ("declarationId") REFERENCES "DeclarationVersement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfirmationReception" ADD CONSTRAINT "ConfirmationReception_versementId_fkey" FOREIGN KEY ("versementId") REFERENCES "DeclarationVersement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationSynchronisation" ADD CONSTRAINT "OperationSynchronisation_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;
