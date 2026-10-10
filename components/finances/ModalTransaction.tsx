"use client";

import { useState } from "react";
import { X, Check, Camera, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { categories } from "@/lib/donnees-mock";
import { genererId } from "@/lib/format";
import type { TypeTransaction } from "@/types";

export function ModalTransaction({ onClose }: { onClose: () => void }) {
  const { ajouterTransaction, espaceActifId } = useApp();
  const [type, setType] = useState<TypeTransaction>("DEPENSE");
  const [montant, setMontant] = useState("");
  const [description, setDescription] = useState("");
  const [categorieId, setCategorieId] = useState("");
  const [moyenPaiement, setMoyenPaiement] = useState("Espèces");
  const [dateOperation, setDateOperation] = useState(new Date().toISOString().split("T")[0]);
  const [preuve, setPreuve] = useState<string | null>(null);
  const [erreur, setErreur] = useState("");

  const categoriesFiltrees = categories.filter((c) => c.type === type && !c.estArchive);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!montant || Number(montant) <= 0) { setErreur("Montant invalide."); return; }
    if (!description.trim()) { setErreur("Description requise."); return; }
    if (!categorieId) { setErreur("Catégorie requise."); return; }

    const montantNum = Number(montant);
    const categorie = categories.find((c) => c.id === categorieId);
    ajouterTransaction({
      id: genererId(),
      espaceId: espaceActifId,
      type,
      montant: montantNum,
      devise: "XOF",
      categorieId,
      categorieNom: categorie?.nom || "",
      description,
      moyenPaiement,
      dateOperation: new Date(dateOperation).toISOString(),
      statut: "ACTIVE",
    });
    onClose();
  };

  const handlePreuve = () => {
    setPreuve("recu-paiement.jpg");
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-[#183326]/30 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-lg rounded-t-3xl bg-[#fffefa] p-6 shadow-2xl sm:rounded-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2c8c60]">Nouvelle opération</p>
            <h2 className="mt-1 text-xl font-semibold text-[#20392d]">Ajouter à vos finances</h2>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="rounded-lg p-2 text-[#77847b] hover:bg-[#f0f2ed]">
            <X size={19} />
          </button>
        </div>

        {erreur && <div className="mb-4 rounded-xl bg-[#fdebea] px-4 py-3 text-sm text-[#a53d39]">{erreur}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(["REVENU", "DEPENSE", "EPARGNE", "INVESTISSEMENT"] as TypeTransaction[]).map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => { setType(item); setCategorieId(""); }}
                className={`rounded-xl border px-2 py-3 text-xs font-semibold transition ${
                  type === item ? "border-[#9ed0ae] bg-[#e8f5ef] text-[#237e56]" : "bg-white text-[#728078] hover:bg-[#f8faf6]"
                }`}
              >
                {item === "REVENU" ? "Revenu" : item === "DEPENSE" ? "Dépense" : item === "EPARGNE" ? "Épargne" : "Investissement"}
              </button>
            ))}
          </div>

          {/* Montant */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#405247]">Montant en XOF</label>
            <input
              type="number"
              inputMode="decimal"
              required
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              placeholder="0"
              className="h-12 w-full rounded-xl border bg-white px-4 text-lg font-semibold outline-none ring-[#9ed0ae] placeholder:text-[#a3aca6] placeholder:font-normal focus:ring-2"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#405247]">Libellé</label>
            <input
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex. Courses du marché"
              className="h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none ring-[#9ed0ae] placeholder:text-[#a3aca6] focus:ring-2"
            />
          </div>

          {/* Catégorie + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#405247]">Catégorie</label>
              <select
                value={categorieId}
                onChange={(e) => setCategorieId(e.target.value)}
                className="h-12 w-full rounded-xl border bg-white px-3 text-sm text-[#52635a] outline-none"
              >
                <option value="">Choisir...</option>
                {categoriesFiltrees.map((c) => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#405247]">Date</label>
              <input
                type="date"
                value={dateOperation}
                onChange={(e) => setDateOperation(e.target.value)}
                className="h-12 w-full rounded-xl border bg-white px-3 text-sm text-[#52635a] outline-none"
              />
            </div>
          </div>

          {/* Moyen de paiement */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#405247]">Moyen de paiement</label>
            <select
              value={moyenPaiement}
              onChange={(e) => setMoyenPaiement(e.target.value)}
              className="h-12 w-full rounded-xl border bg-white px-3 text-sm text-[#52635a] outline-none"
            >
              <option>Espèces</option>
              <option>Virement</option>
              <option>Mobile money</option>
              <option>Chèque</option>
              <option>Carte bancaire</option>
            </select>
          </div>

          {/* Preuve (optionnel) */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#405247]">Preuve (optionnel)</label>
            {preuve ? (
              <div className="flex items-center gap-3 rounded-xl border bg-[#f1f9f2] p-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-[#237e56]"><Check size={18} /></span>
                <span className="flex-1 text-sm text-[#405247]">{preuve}</span>
                <button type="button" onClick={() => setPreuve(null)} className="rounded-lg p-2 text-[#a53d39] hover:bg-[#fdebea]">
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePreuve}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#c5dcc9] py-4 text-sm text-[#71907c] hover:bg-[#f8fbf8]"
              >
                <Upload size={16} /> Ajouter une preuve
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
            <Button type="submit" className="flex-1 bg-[#237e56] hover:bg-[#1c6847]">
              <Check size={16} /> Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
