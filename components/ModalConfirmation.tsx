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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-sm sm:items-center sm:p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="titre-confirmation" className="max-h-[calc(100dvh-1rem)] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card p-5 text-card-foreground shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className={`grid h-12 w-12 place-items-center rounded-full ${boutonTone === "red" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
            <AlertTriangle size={24} />
          </div>
          <button aria-label="Fermer" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-lg text-muted-foreground hover:bg-muted">
            <X size={19} />
          </button>
        </div>
        <h3 id="titre-confirmation" className="text-lg font-semibold text-foreground">{titre}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{message}</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <Button variant="outline" onClick={onClose} className="w-full sm:flex-1">Retour</Button>
          <Button
            onClick={onConfirm}
            variant={boutonTone === "red" ? "destructive" : "default"}
            className="w-full sm:flex-1"
          >
            {boutonLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
