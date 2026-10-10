"use client";

import { useApp } from "@/contexts/AppContext";
import { Check, Loader2, WifiOff, AlertTriangle, RefreshCw } from "lucide-react";

export function IndicateurSync() {
  const { syncStatut, enLigne } = useApp();

  if (!enLigne || syncStatut === "HORS_LIGNE") {
    return (
      <div className="flex items-center gap-2 rounded-full bg-[#fff3d8] px-3 py-1.5 text-xs font-medium text-[#9b6500]">
        <WifiOff size={14} />
        Hors connexion
      </div>
    );
  }

  switch (syncStatut) {
    case "EN_COURS":
      return (
        <div className="flex items-center gap-2 rounded-full bg-[#e8f2f8] px-3 py-1.5 text-xs font-medium text-[#24698a]">
          <RefreshCw size={14} className="animate-spin" />
          Synchronisation...
        </div>
      );
    case "ERREUR":
      return (
        <div className="flex items-center gap-2 rounded-full bg-[#fdebea] px-3 py-1.5 text-xs font-medium text-[#a53d39]">
          <AlertTriangle size={14} />
          Erreur de sync
        </div>
      );
    default:
      return (
        <div className="flex items-center gap-2 rounded-full bg-[#e8f5ef] px-3 py-1.5 text-xs font-medium text-[#237b54]">
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
    <div className="flex items-center gap-2 border-b border-[#e5c44e]/30 bg-[#fff8e1] px-4 py-2 text-sm text-[#8a6300]">
      <WifiOff size={16} />
      <span>Vous êtes hors connexion. Les données affichées peuvent ne pas être à jour.</span>
    </div>
  );
}
