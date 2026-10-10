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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#183326]/30 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl bg-[#fffefa] p-6 shadow-2xl sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-[#fdebea] text-[#a53d39]">
            <AlertTriangle size={24} />
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-[#77847b] hover:bg-[#f0f2ed]"><X size={19} /></button>
        </div>

        <h3 className="text-lg font-semibold text-[#20392d]">Rejeter cette cotisation</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Le membre pourra soumettre une nouvelle déclaration après le rejet.
        </p>

        {erreur && <div className="mt-4 rounded-xl bg-[#fdebea] px-4 py-3 text-sm text-[#a53d39]">{erreur}</div>}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#405247]">Motif du rejet</label>
            <textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              rows={3}
              placeholder="Expliquez pourquoi cette déclaration est rejetée..."
              className="w-full rounded-xl border bg-white p-3 text-sm outline-none ring-[#f0d5d4] focus:ring-2"
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
            <Button type="submit" className="flex-1 bg-[#c54842] hover:bg-[#a53d39]">
              Rejeter
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
