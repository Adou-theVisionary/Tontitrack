"use client";

import { useApp } from "@/contexts/AppContext";
import { Check, Loader2, WifiOff, AlertTriangle, RefreshCw } from "lucide-react";

export function IndicateurSync() {
  const { syncStatut, enLigne } = useApp();

  if (!enLigne || syncStatut === "HORS_LIGNE") {
    return (
      <div className="retour-validation flex items-center gap-2 rounded-full bg-warning/15 px-3 py-1.5 text-xs font-medium text-warning" role="status" aria-live="polite">
        <WifiOff size={14} />
        Hors connexion
      </div>
    );
  }

  switch (syncStatut) {
    case "EN_COURS":
      return (
        <div className="retour-validation flex items-center gap-2 rounded-full bg-info/10 px-3 py-1.5 text-xs font-medium text-info" role="status" aria-live="polite">
          <RefreshCw size={14} className="animate-spin" />
          Synchronisation...
        </div>
      );
    case "ERREUR":
      return (
        <div className="retour-validation flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive" role="status" aria-live="polite">
          <AlertTriangle size={14} />
          Erreur de sync
        </div>
      );
    default:
      return (
        <div className="retour-validation flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary" role="status" aria-live="polite">
          <Check size={14} />
          Synchronisé
        </div>
      );
  }
}

export function BanniereHorsLigne() {
  const { enLigne } = useApp();
  if (enLigne) return null;
  return (
    <div className="retour-validation flex items-center gap-2 border-b border-warning/30 bg-warning/10 px-4 py-2 text-sm text-warning" role="status" aria-live="polite">
      <WifiOff size={16} />
      <span>Vous êtes hors connexion. Les données affichées peuvent ne pas être à jour.</span>
    </div>
  );
}
