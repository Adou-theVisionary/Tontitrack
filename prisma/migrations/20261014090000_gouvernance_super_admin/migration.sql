-- Phase 3.1.1 : gouvernance, supervision administrative et litiges.
-- Cette migration est préparée uniquement ; son exécution reste manuelle.
CREATE TYPE "StatutAdministrationTontine" AS ENUM ('ACTIVE', 'SUSPENDUE');
CREATE TYPE "StatutLitigeAdministration" AS ENUM ('OUVERT', 'EN_EXAMEN', 'EN_ATTENTE_INFORMATION', 'RESOLU', 'REJETE', 'CLOTURE');
CREATE TYPE "StatutIncidentAdministration" AS ENUM ('OUVERT', 'EN_COURS', 'RESOLU', 'CLOTURE');
CREATE TYPE "PrioriteIncidentAdministration" AS ENUM ('BASSE', 'NORMALE', 'HAUTE', 'CRITIQUE');

ALTER TABLE "Tontine"
  ADD COLUMN "statutAdministration" "StatutAdministrationTontine" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN "suspendueLe" TIMESTAMP(3),
  ADD COLUMN "suspendueParId" TEXT,
  ADD COLUMN "motifSuspension" TEXT,
  ADD COLUMN "statutAvantSuspension" "StatutTontine";
ALTER TABLE "Tontine" ADD CONSTRAINT "Tontine_suspendueParId_fkey" FOREIGN KEY ("suspendueParId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Tontine_statutAdministration_statut_idx" ON "Tontine"("statutAdministration", "statut");

CREATE TABLE "RolePersonnalise" (
  "id" TEXT NOT NULL, "code" TEXT NOT NULL, "nom" TEXT NOT NULL, "description" TEXT,
  "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "modifieLe" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RolePersonnalise_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RolePersonnalise_code_key" ON "RolePersonnalise"("code");
CREATE TABLE "PermissionRolePersonnalise" (
  "id" TEXT NOT NULL, "roleId" TEXT NOT NULL, "permission" TEXT NOT NULL,
  CONSTRAINT "PermissionRolePersonnalise_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PermissionRolePersonnalise_roleId_permission_key" ON "PermissionRolePersonnalise"("roleId", "permission");
CREATE INDEX "PermissionRolePersonnalise_permission_idx" ON "PermissionRolePersonnalise"("permission");
ALTER TABLE "PermissionRolePersonnalise" ADD CONSTRAINT "PermissionRolePersonnalise_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "RolePersonnalise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE TABLE "AttributionRolePersonnalise" (
  "id" TEXT NOT NULL, "utilisateurId" TEXT NOT NULL, "roleId" TEXT NOT NULL, "attribueParId" TEXT,
  "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AttributionRolePersonnalise_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AttributionRolePersonnalise_utilisateurId_roleId_key" ON "AttributionRolePersonnalise"("utilisateurId", "roleId");
CREATE INDEX "AttributionRolePersonnalise_roleId_creeLe_idx" ON "AttributionRolePersonnalise"("roleId", "creeLe");
ALTER TABLE "AttributionRolePersonnalise" ADD CONSTRAINT "AttributionRolePersonnalise_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AttributionRolePersonnalise" ADD CONSTRAINT "AttributionRolePersonnalise_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "RolePersonnalise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ConfigurationModulePlateforme" ("id" TEXT NOT NULL, "moduleId" TEXT NOT NULL, "estActive" BOOLEAN NOT NULL DEFAULT true, "parametres" JSONB, "modifieLe" TIMESTAMP(3) NOT NULL, CONSTRAINT "ConfigurationModulePlateforme_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "ConfigurationModulePlateforme_moduleId_key" ON "ConfigurationModulePlateforme"("moduleId");
CREATE TABLE "ParametrePlateforme" ("id" TEXT NOT NULL, "cle" TEXT NOT NULL, "valeur" JSONB NOT NULL, "modifieParId" TEXT, "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "modifieLe" TIMESTAMP(3) NOT NULL, CONSTRAINT "ParametrePlateforme_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "ParametrePlateforme_cle_key" ON "ParametrePlateforme"("cle");

CREATE TABLE "LitigeAdministration" (
  "id" TEXT NOT NULL, "tontineId" TEXT, "type" TEXT NOT NULL, "statut" "StatutLitigeAdministration" NOT NULL DEFAULT 'OUVERT', "titre" TEXT NOT NULL, "description" TEXT, "operationType" TEXT, "operationId" TEXT, "ouvertParId" TEXT NOT NULL, "prisEnChargeParId" TEXT, "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "modifieLe" TIMESTAMP(3) NOT NULL, "fermeLe" TIMESTAMP(3), CONSTRAINT "LitigeAdministration_pkey" PRIMARY KEY ("id"));
CREATE INDEX "LitigeAdministration_statut_creeLe_idx" ON "LitigeAdministration"("statut", "creeLe");
CREATE INDEX "LitigeAdministration_tontineId_statut_idx" ON "LitigeAdministration"("tontineId", "statut");
ALTER TABLE "LitigeAdministration" ADD CONSTRAINT "LitigeAdministration_tontineId_fkey" FOREIGN KEY ("tontineId") REFERENCES "Tontine"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LitigeAdministration" ADD CONSTRAINT "LitigeAdministration_ouvertParId_fkey" FOREIGN KEY ("ouvertParId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LitigeAdministration" ADD CONSTRAINT "LitigeAdministration_prisEnChargeParId_fkey" FOREIGN KEY ("prisEnChargeParId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE TABLE "EvenementLitigeAdministration" ("id" TEXT NOT NULL, "litigeId" TEXT NOT NULL, "acteurId" TEXT NOT NULL, "action" TEXT NOT NULL, "ancienStatut" "StatutLitigeAdministration", "nouveauStatut" "StatutLitigeAdministration", "note" TEXT, "fichierId" TEXT, "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "EvenementLitigeAdministration_pkey" PRIMARY KEY ("id"));
CREATE INDEX "EvenementLitigeAdministration_litigeId_creeLe_idx" ON "EvenementLitigeAdministration"("litigeId", "creeLe");
ALTER TABLE "EvenementLitigeAdministration" ADD CONSTRAINT "EvenementLitigeAdministration_litigeId_fkey" FOREIGN KEY ("litigeId") REFERENCES "LitigeAdministration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EvenementLitigeAdministration" ADD CONSTRAINT "EvenementLitigeAdministration_acteurId_fkey" FOREIGN KEY ("acteurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EvenementLitigeAdministration" ADD CONSTRAINT "EvenementLitigeAdministration_fichierId_fkey" FOREIGN KEY ("fichierId") REFERENCES "Fichier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "IncidentAdministration" ("id" TEXT NOT NULL, "type" TEXT NOT NULL, "priorite" "PrioriteIncidentAdministration" NOT NULL DEFAULT 'NORMALE', "statut" "StatutIncidentAdministration" NOT NULL DEFAULT 'OUVERT', "titre" TEXT NOT NULL, "description" TEXT, "module" TEXT, "entiteType" TEXT, "entiteId" TEXT, "auditId" TEXT, "assigneAId" TEXT, "resolution" TEXT, "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "modifieLe" TIMESTAMP(3) NOT NULL, "resoluLe" TIMESTAMP(3), CONSTRAINT "IncidentAdministration_pkey" PRIMARY KEY ("id"));
CREATE INDEX "IncidentAdministration_statut_priorite_creeLe_idx" ON "IncidentAdministration"("statut", "priorite", "creeLe");
CREATE INDEX "IncidentAdministration_module_creeLe_idx" ON "IncidentAdministration"("module", "creeLe");
ALTER TABLE "IncidentAdministration" ADD CONSTRAINT "IncidentAdministration_assigneAId_fkey" FOREIGN KEY ("assigneAId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
