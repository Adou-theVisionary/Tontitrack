"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ModalRejetCotisation({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (motif: string) => void;
}) {
  const [motif, setMotif] = useState("");
  const [erreur, setErreur] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motif.trim()) { setErreur("Le motif du rejet est obligatoire."); return; }
    onConfirm(motif);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-sm sm:items-center sm:p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="titre-rejet-cotisation" className="max-h-[calc(100dvh-1rem)] w-full max-w-md overflow-y-auto rounded-t-3xl bg-popover p-6 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle size={24} />
          </div>
          <button aria-label="Fermer" onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><X size={19} /></button>
        </div>

        <h3 id="titre-rejet-cotisation" className="text-lg font-semibold text-foreground">Rejeter cette cotisation</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Le membre pourra soumettre une nouvelle déclaration après le rejet.
        </p>

        {erreur && <div role="alert" className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{erreur}</div>}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Motif du rejet</label>
            <textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              rows={3}
              placeholder="Expliquez pourquoi cette déclaration est rejetée..."
              className="w-full rounded-xl border bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
            <Button type="submit" variant="destructive" className="flex-1">
              Rejeter
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
