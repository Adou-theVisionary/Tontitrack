"use client";

import { useState } from "react";
import { X, Check, Upload, Trash2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tontiTrackService } from "@/services/tontitrack-service";
import { formaterMontant, calculerResteAPayer, calculerPourcentage } from "@/lib/format";
import type { Tontine } from "@/types";

export function ModalDeclarationCotisation({
  cotisationId,
  tontine,
  onClose,
  onSuccess,
}: {
  cotisationId: string;
  tontine: Tontine;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const cotisation = tontine.cotisations.find((c) => c.id === cotisationId);
  const [montant, setMontant] = useState("");
  const [preuve, setPreuve] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  if (!cotisation) return null;

  const reste = calculerResteAPayer(cotisation.montantAttendu, cotisation.montantValide);
  const pct = calculerPourcentage(cotisation.montantValide, cotisation.montantAttendu);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const montantNum = Number(montant);
    if (!montantNum || montantNum <= 0) { setErreur("Montant invalide."); return; }
    if (montantNum > reste) { setErreur(`Le montant ne peut pas dépasser le reste à payer (${formaterMontant(reste)}).`); return; }
    setChargement(true);
    try {
      await tontiTrackService.declarerCotisation(cotisationId, montantNum, preuve || undefined);
      onSuccess();
    } catch {
      setErreur("Une erreur est survenue.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-sm sm:items-center sm:p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="titre-declaration" className="max-h-[calc(100dvh-1rem)] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-popover p-5 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary"><CreditCard size={18} /></span>
            <h3 id="titre-declaration" className="text-lg font-semibold text-foreground">Déclarer un paiement</h3>
          </div>
          <button aria-label="Fermer" onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted"><X size={19} /></button>
        </div>

        {/* Résumé cotisation */}
        <div className="mb-5 rounded-xl bg-surface-subtle p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Montant attendu</span>
            <span className="font-semibold text-foreground">{formaterMontant(cotisation.montantAttendu)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Déjà validé</span>
            <span className="font-semibold text-primary">{formaterMontant(cotisation.montantValide)}</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-[#e9eee9]">
            <div className="h-full rounded-full bg-[#dca83e]" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Reste à payer</span>
            <span className="font-semibold text-destructive">{formaterMontant(reste)}</span>
          </div>
        </div>

        {erreur && <div role="alert" className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{erreur}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Montant de ce paiement (XOF)</label>
            <input
              type="number"
              inputMode="decimal"
              required
              max={reste}
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              placeholder="0"
              className="h-12 w-full rounded-xl border bg-card px-4 text-lg font-semibold outline-none placeholder:font-normal placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
            <p className="mt-1 text-xs text-muted-foreground">Maximum : {formaterMontant(reste)}</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Preuve de paiement</label>
            {preuve ? (
              <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/10 p-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-card text-primary"><Check size={18} /></span>
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{preuve}</span>
                <button type="button" onClick={() => setPreuve(null)} aria-label="Retirer la preuve" className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-destructive hover:bg-destructive/10"><Trash2 size={16} /></button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPreuve("recu-paiement.jpg")}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/30 py-4 text-sm text-muted-foreground hover:bg-muted"
              >
                <Upload size={16} /> Ajouter une preuve
              </button>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:flex-1">Annuler</Button>
            <Button type="submit" disabled={chargement} className="w-full sm:flex-1">
              {chargement ? "Envoi..." : <><Check size={16} /> Envoyer</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
