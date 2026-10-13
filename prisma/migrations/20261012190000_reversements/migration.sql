-- Phase 2.5 : suivi déclaratif et privé des reversements externes.
-- Cette migration dépend de la migration Phase 2.4 des cotisations.

ALTER TYPE "TypeNotification" ADD VALUE IF NOT EXISTS 'RECEPTION_PARTIELLE';
ALTER TYPE "TypeNotification" ADD VALUE IF NOT EXISTS 'VERSEMENT_CONTESTE';
ALTER TYPE "TypeNotification" ADD VALUE IF NOT EXISTS 'VERSEMENT_REGULARISE';

ALTER TABLE "DeclarationVersement"
  ADD COLUMN "tontineId" TEXT,
  ADD COLUMN "montantConfirme" DECIMAL(18,2) NOT NULL DEFAULT 0,
  ADD COLUMN "verseLe" TIMESTAMP(3),
  ADD COLUMN "referenceVersement" TEXT,
  ADD COLUMN "moyenVersement" TEXT,
  ADD COLUMN "observation" TEXT,
  ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;

UPDATE "DeclarationVersement" AS versement
SET "tontineId" = rotation."tontineId",
    "verseLe" = versement."declareLe"
FROM "Rotation" AS rotation
WHERE rotation."id" = versement."rotationId";

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "DeclarationVersement" WHERE "tontineId" IS NULL OR "verseLe" IS NULL) THEN
    RAISE EXCEPTION 'Migration Phase 2.5 interrompue : chaque reversement existant doit référencer une rotation et une tontine.';
  END IF;
END $$;

ALTER TABLE "DeclarationVersement"
  ALTER COLUMN "tontineId" SET NOT NULL,
  ALTER COLUMN "verseLe" SET NOT NULL;

ALTER TABLE "ConfirmationReception"
  ADD COLUMN "declarationId" TEXT,
  ADD COLUMN "montantConfirme" DECIMAL(18,2) NOT NULL DEFAULT 0,
  ADD COLUMN "motifContestation" TEXT,
  ADD COLUMN "observation" TEXT;

-- L'ancien modèle liait une confirmation à une rotation. Seul un reversement
-- historique unique permet une association sûre ; les autres cas sont bloqués.
UPDATE "ConfirmationReception" AS confirmation
SET "declarationId" = versement."id"
FROM "DeclarationVersement" AS versement
WHERE versement."rotationId" = confirmation."rotationId"
  AND 1 = (
    SELECT COUNT(*)
    FROM "DeclarationVersement" AS candidat
    WHERE candidat."rotationId" = confirmation."rotationId"
  );

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "ConfirmationReception" WHERE "declarationId" IS NULL) THEN
    RAISE EXCEPTION 'Migration Phase 2.5 interrompue : une confirmation historique ne peut pas être reliée sûrement à un reversement. Corriger ces données avant reprise.';
  END IF;
END $$;

ALTER TABLE "ConfirmationReception"
  ALTER COLUMN "declarationId" SET NOT NULL,
  ALTER COLUMN "expireLe" DROP NOT NULL;

DROP INDEX "ConfirmationReception_rotationId_key";
CREATE UNIQUE INDEX "ConfirmationReception_declarationId_key" ON "ConfirmationReception"("declarationId");
CREATE INDEX "ConfirmationReception_rotationId_statut_idx" ON "ConfirmationReception"("rotationId", "statut");
CREATE INDEX "DeclarationVersement_tontineId_statut_idx" ON "DeclarationVersement"("tontineId", "statut");

ALTER TABLE "DeclarationVersement"
  ADD CONSTRAINT "DeclarationVersement_tontineId_fkey"
  FOREIGN KEY ("tontineId") REFERENCES "Tontine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ConfirmationReception"
  ADD CONSTRAINT "ConfirmationReception_declarationId_fkey"
  FOREIGN KEY ("declarationId") REFERENCES "DeclarationVersement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "EvenementReversement" (
  "id" TEXT NOT NULL,
  "declarationId" TEXT NOT NULL,
  "acteurId" TEXT,
  "type" TEXT NOT NULL,
  "donnees" JSONB,
  "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EvenementReversement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EvenementReversement_declarationId_creeLe_idx" ON "EvenementReversement"("declarationId", "creeLe");
CREATE INDEX "EvenementReversement_acteurId_creeLe_idx" ON "EvenementReversement"("acteurId", "creeLe");

ALTER TABLE "EvenementReversement"
  ADD CONSTRAINT "EvenementReversement_declarationId_fkey"
  FOREIGN KEY ("declarationId") REFERENCES "DeclarationVersement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EvenementReversement"
  ADD CONSTRAINT "EvenementReversement_acteurId_fkey"
  FOREIGN KEY ("acteurId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
