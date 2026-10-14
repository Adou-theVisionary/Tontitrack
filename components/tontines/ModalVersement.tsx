"use client";

import { useState } from "react";
import { X, Check, Upload, Trash2, CreditCard, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tontiTrackService } from "@/services/tontitrack-service";
import { formaterMontant } from "@/lib/format";

export function ModalVersement({
  rotationId,
  versementId,
  mode,
  onClose,
  onConfirm,
  onContester,
}: {
  rotationId?: string;
  versementId?: string;
  mode: "declaration" | "confirmation";
  onClose: () => void;
  onConfirm: () => void;
  onContester: () => void;
}) {
  const [montant, setMontant] = useState("");
  const [preuve, setPreuve] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  const handleDeclarer = async (e: React.FormEvent) => {
    e.preventDefault();
    const montantNum = Number(montant);
    if (!montantNum || montantNum <= 0) { setErreur("Montant invalide."); return; }
    setChargement(true);
    try {
      if (!rotationId) throw new Error("Rotation introuvable.");
      await tontiTrackService.declarerVersement(rotationId, montantNum, preuve || undefined);
      onConfirm();
    } catch {
      setErreur("Une erreur est survenue.");
    } finally {
      setChargement(false);
    }
  };

  const handleConfirmer = async () => {
    setChargement(true);
    try {
      if (!versementId) throw new Error("Versement introuvable.");
      await tontiTrackService.confirmerVersement(versementId);
      onConfirm();
    } catch {
      setErreur("Une erreur est survenue.");
    } finally {
      setChargement(false);
    }
  };

  const handleContester = async () => {
    setChargement(true);
    try {
      if (!versementId) throw new Error("Versement introuvable.");
      await tontiTrackService.contesterVersement(versementId);
      onContester();
    } catch {
      setErreur("Une erreur est survenue.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-sm sm:items-center sm:p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="titre-versement" className="max-h-[calc(100dvh-1rem)] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-popover p-5 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-info/10 text-info"><CreditCard size={18} /></span>
            <h3 id="titre-versement" className="text-lg font-semibold text-foreground">
              {mode === "declaration" ? "Déclarer un versement" : "Confirmer la réception"}
            </h3>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted"><X size={19} /></button>
        </div>

        {erreur && <div role="alert" className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{erreur}</div>}

        {mode === "declaration" ? (
          <form onSubmit={handleDeclarer} className="space-y-4">
            <div className="rounded-xl bg-warning/15 p-3 text-xs text-warning">
              TontiTrack ne réalise aucun transfert d’argent. Le paiement réel se fait en dehors de l’application. Vous déclarez ici qu’un versement a été effectué.
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Montant versé (XOF)</label>
              <input
                type="number"
                inputMode="decimal"
                required
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                placeholder="0"
                className="h-12 w-full rounded-xl border bg-card px-4 text-lg font-semibold outline-none placeholder:font-normal placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Preuve (optionnel)</label>
              {preuve ? (
                <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/10 p-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-card text-primary"><Check size={18} /></span>
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">{preuve}</span>
                  <button type="button" onClick={() => setPreuve(null)} aria-label="Retirer la preuve" className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-destructive hover:bg-destructive/10"><Trash2 size={16} /></button>
                </div>
              ) : (
                <button type="button" onClick={() => setPreuve("preuve-versement.jpg")} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/30 py-4 text-sm text-muted-foreground hover:bg-muted">
                  <Upload size={16} /> Ajouter une preuve
                </button>
              )}
            </div>
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={onClose} className="w-full sm:flex-1">Annuler</Button>
              <Button type="submit" disabled={chargement} className="w-full sm:flex-1">
                {chargement ? "Envoi..." : <><Check size={16} /> Déclarer</>}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-surface-subtle p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={16} className="text-warning" />
                <span>Temps restant pour confirmer : <b>23h 41min</b></span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Après 48 heures sans réponse, la réception sera confirmée automatiquement.
              </p>
            </div>
            <div className="rounded-xl bg-warning/15 p-3 text-xs text-warning">
              <AlertCircle size={14} className="mr-1 inline" />
              Si vous n’avez pas reçu le versement, signalez-le pour ouvrir un litige.
            </div>
            <div className="space-y-2">
              <Button onClick={handleConfirmer} disabled={chargement} className="h-12 w-full">
                <Check size={18} /> J’ai reçu le versement
              </Button>
              <Button onClick={handleContester} disabled={chargement} variant="outline" className="h-12 w-full border-destructive/30 text-destructive hover:bg-destructive/10">
                <X size={18} /> Je n’ai pas reçu le versement
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
