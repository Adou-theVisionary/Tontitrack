"use client";

import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ModalConfirmation({
  titre,
  message,
  boutonLabel = "Confirmer",
  boutonTone = "green",
  onConfirm,
  onClose,
}: {
  titre: string;
  message: string;
  boutonLabel?: string;
  boutonTone?: "green" | "red";
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#183326]/30 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl bg-[#fffefa] p-6 shadow-2xl sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <div className={`grid h-12 w-12 place-items-center rounded-full ${boutonTone === "red" ? "bg-[#fdebea] text-[#a53d39]" : "bg-[#e8f5ef] text-[#237e56]"}`}>
            <AlertTriangle size={24} />
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-[#77847b] hover:bg-[#f0f2ed]">
            <X size={19} />
          </button>
        </div>
        <h3 className="text-lg font-semibold text-[#20392d]">{titre}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{message}</p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Retour</Button>
          <Button
            onClick={onConfirm}
            className={`flex-1 ${boutonTone === "red" ? "bg-[#c54842] hover:bg-[#a53d39]" : "bg-[#237e56] hover:bg-[#1c6847]"}`}
          >
            {boutonLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
