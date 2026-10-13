-- Phase 3.1 : rôles globaux et compléments immuables du journal d'audit.
CREATE TYPE "RolePlateforme" AS ENUM ('SUPER_ADMIN', 'ADMIN_SUPPORT', 'ADMIN_AUDIT');

CREATE TABLE "AttributionRolePlateforme" (
  "id" TEXT NOT NULL,
  "utilisateurId" TEXT NOT NULL,
  "role" "RolePlateforme" NOT NULL,
  "attribueParId" TEXT,
  "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AttributionRolePlateforme_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AttributionRolePlateforme_utilisateurId_role_key"
  ON "AttributionRolePlateforme"("utilisateurId", "role");
CREATE INDEX "AttributionRolePlateforme_role_creeLe_idx"
  ON "AttributionRolePlateforme"("role", "creeLe");

ALTER TABLE "AttributionRolePlateforme"
  ADD CONSTRAINT "AttributionRolePlateforme_utilisateurId_fkey"
  FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EvenementAudit"
  ADD COLUMN "module" TEXT,
  ADD COLUMN "autorisation" TEXT,
  ADD COLUMN "resultat" TEXT NOT NULL DEFAULT 'SUCCES',
  ADD COLUMN "motif" TEXT;
