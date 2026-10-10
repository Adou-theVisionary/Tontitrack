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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#183326]/30 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-lg rounded-t-3xl bg-[#fffefa] p-6 shadow-2xl sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8f2f8] text-[#24698a]"><CreditCard size={18} /></span>
            <h3 className="text-lg font-semibold text-[#20392d]">
              {mode === "declaration" ? "Déclarer un versement" : "Confirmer la réception"}
            </h3>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="rounded-lg p-2 text-[#77847b] hover:bg-[#f0f2ed]"><X size={19} /></button>
        </div>

        {erreur && <div className="mb-4 rounded-xl bg-[#fdebea] px-4 py-3 text-sm text-[#a53d39]">{erreur}</div>}

        {mode === "declaration" ? (
          <form onSubmit={handleDeclarer} className="space-y-4">
            <div className="rounded-xl bg-[#fff8e1] p-3 text-xs text-[#8a6300]">
              TontiTrack ne réalise aucun transfert d’argent. Le paiement réel se fait en dehors de l’application. Vous déclarez ici qu’un versement a été effectué.
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#405247]">Montant versé (XOF)</label>
              <input
                type="number"
                inputMode="decimal"
                required
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                placeholder="0"
                className="h-12 w-full rounded-xl border bg-white px-4 text-lg font-semibold outline-none ring-[#9ed0ae] placeholder:font-normal placeholder:text-[#a3aca6] focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#405247]">Preuve (optionnel)</label>
              {preuve ? (
                <div className="flex items-center gap-3 rounded-xl border bg-[#f1f9f2] p-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-[#237e56]"><Check size={18} /></span>
                  <span className="flex-1 text-sm text-[#405247]">{preuve}</span>
                  <button type="button" onClick={() => setPreuve(null)} className="rounded-lg p-2 text-[#a53d39] hover:bg-[#fdebea]"><Trash2 size={16} /></button>
                </div>
              ) : (
                <button type="button" onClick={() => setPreuve("preuve-versement.jpg")} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#c5dcc9] py-4 text-sm text-[#71907c] hover:bg-[#f8fbf8]">
                  <Upload size={16} /> Ajouter une preuve
                </button>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
              <Button type="submit" disabled={chargement} className="flex-1 bg-[#237e56] hover:bg-[#1c6847]">
                {chargement ? "Envoi..." : <><Check size={16} /> Déclarer</>}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-[#f8faf6] p-4">
              <div className="flex items-center gap-2 text-sm text-[#537362]">
                <Clock size={16} className="text-[#9b6500]" />
                <span>Temps restant pour confirmer : <b>23h 41min</b></span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Après 48 heures sans réponse, la réception sera confirmée automatiquement.
              </p>
            </div>
            <div className="rounded-xl bg-[#fff8e1] p-3 text-xs text-[#8a6300]">
              <AlertCircle size={14} className="mr-1 inline" />
              Si vous n’avez pas reçu le versement, signalez-le pour ouvrir un litige.
            </div>
            <div className="space-y-2">
              <Button onClick={handleConfirmer} disabled={chargement} className="h-12 w-full bg-[#237e56] hover:bg-[#1c6847]">
                <Check size={18} /> J’ai reçu le versement
              </Button>
              <Button onClick={handleContester} disabled={chargement} variant="outline" className="h-12 w-full border-[#f0d5d4] text-[#a53d39] hover:bg-[#fdf6f5]">
                <X size={18} /> Je n’ai pas reçu le versement
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
