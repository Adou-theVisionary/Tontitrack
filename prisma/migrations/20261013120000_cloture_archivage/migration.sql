-- Phase 2.6 : instantané de clôture. Cette migration ne clôture ni n'archive
-- aucune tontine existante ; seule l'API sécurisée crée un rapport après contrôle.
CREATE TABLE "RapportClotureTontine" (
  "id" TEXT NOT NULL,
  "tontineId" TEXT NOT NULL,
  "creeParId" TEXT NOT NULL,
  "clotureeLe" TIMESTAMP(3) NOT NULL,
  "montantCotisationsAttendu" DECIMAL(18,2) NOT NULL,
  "montantCotisationsConfirme" DECIMAL(18,2) NOT NULL,
  "montantPenalitesAppliquees" DECIMAL(18,2) NOT NULL,
  "montantReversementsConfirmes" DECIMAL(18,2) NOT NULL,
  "nombreRotations" INTEGER NOT NULL,
  "donnees" JSONB NOT NULL,
  "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RapportClotureTontine_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RapportClotureTontine_tontineId_key" ON "RapportClotureTontine"("tontineId");
CREATE INDEX "RapportClotureTontine_clotureeLe_idx" ON "RapportClotureTontine"("clotureeLe");

ALTER TABLE "RapportClotureTontine"
  ADD CONSTRAINT "RapportClotureTontine_tontineId_fkey"
  FOREIGN KEY ("tontineId") REFERENCES "Tontine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
