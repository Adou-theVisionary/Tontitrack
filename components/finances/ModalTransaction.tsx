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
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/30 backdrop-blur-sm sm:items-center sm:p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="titre-transaction" className="max-h-[calc(100dvh-1rem)] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-popover p-5 text-popover-foreground shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Nouvelle opération</p>
            <h2 id="titre-transaction" className="mt-1 text-xl font-semibold text-foreground">Ajouter à vos finances</h2>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="grid h-11 w-11 place-items-center rounded-lg text-muted-foreground hover:bg-muted">
            <X size={19} />
          </button>
        </div>

        {erreur && <div role="alert" className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{erreur}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(["REVENU", "DEPENSE", "EPARGNE", "INVESTISSEMENT"] as TypeTransaction[]).map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => { setType(item); setCategorieId(""); }}
                className={`min-h-11 rounded-xl border px-2 py-3 text-xs font-semibold transition ${
                  type === item ? "border-primary/40 bg-primary/10 text-primary" : "bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                {item === "REVENU" ? "Revenu" : item === "DEPENSE" ? "Dépense" : item === "EPARGNE" ? "Épargne" : "Investissement"}
              </button>
            ))}
          </div>

          {/* Montant */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Montant en XOF</label>
            <input
              type="number"
              inputMode="decimal"
              required
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              placeholder="0"
              className="h-12 w-full rounded-xl border bg-card px-4 text-lg font-semibold outline-none placeholder:text-muted-foreground placeholder:font-normal focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Libellé</label>
            <input
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex. Courses du marché"
              className="h-12 w-full rounded-xl border bg-card px-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Catégorie + Date */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Catégorie</label>
              <select
                value={categorieId}
                onChange={(e) => setCategorieId(e.target.value)}
                className="h-12 w-full rounded-xl border bg-card px-3 text-sm text-foreground outline-none"
              >
                <option value="">Choisir...</option>
                {categoriesFiltrees.map((c) => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Date</label>
              <input
                type="date"
                value={dateOperation}
                onChange={(e) => setDateOperation(e.target.value)}
                className="h-12 w-full rounded-xl border bg-card px-3 text-sm text-foreground outline-none"
              />
            </div>
          </div>

          {/* Moyen de paiement */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Moyen de paiement</label>
            <select
              value={moyenPaiement}
              onChange={(e) => setMoyenPaiement(e.target.value)}
              className="h-12 w-full rounded-xl border bg-card px-3 text-sm text-foreground outline-none"
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
            <label className="mb-2 block text-sm font-medium text-foreground">Preuve (optionnel)</label>
            {preuve ? (
              <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/10 p-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-card text-primary"><Check size={18} /></span>
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{preuve}</span>
                <button type="button" onClick={() => setPreuve(null)} aria-label="Retirer la preuve" className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-destructive hover:bg-destructive/10">
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePreuve}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/30 py-4 text-sm text-muted-foreground hover:bg-muted"
              >
                <Upload size={16} /> Ajouter une preuve
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:flex-1">Annuler</Button>
            <Button type="submit" className="w-full sm:flex-1">
              <Check size={16} /> Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
