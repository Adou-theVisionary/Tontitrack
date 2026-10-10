"use client";

import { useState, useMemo } from "react";
import {
  ArrowDownLeft, ArrowUpRight, Plus, Search, Landmark,
  WalletCards, Sparkles, X, Filter, Ban,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { ModalTransaction } from "@/components/finances/ModalTransaction";
import { ModalConfirmation } from "@/components/ModalConfirmation";
import { formaterMontant, formaterDateCourte, libelleTypeTransaction } from "@/lib/format";
import { categories } from "@/lib/donnees-mock";
import type { TypeTransaction } from "@/types";

type FiltreType = "TOUS" | TypeTransaction;

export function PageFinances() {
  const { transactions, espaceActifId, espaces, changerEspace, annulerTransaction } = useApp();
  const [showTransaction, setShowTransaction] = useState(false);
  const [filtreType, setFiltreType] = useState<FiltreType>("TOUS");
  const [filtreCategorie, setFiltreCategorie] = useState("TOUS");
  const [recherche, setRecherche] = useState("");
  const [transactionAnnuler, setTransactionAnnuler] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const txFiltrees = useMemo(() => {
    let result = transactions.filter((t) => t.espaceId === espaceActifId);
    if (filtreType !== "TOUS") result = result.filter((t) => t.type === filtreType);
    if (filtreCategorie !== "TOUS") result = result.filter((t) => t.categorieId === filtreCategorie);
    if (recherche) result = result.filter((t) => t.description.toLowerCase().includes(recherche.toLowerCase()));
    return result;
  }, [transactions, espaceActifId, filtreType, filtreCategorie, recherche]);

  const txActives = txFiltrees.filter((t) => t.statut === "ACTIVE");
  const revenus = txActives.filter((t) => t.type === "REVENU").reduce((s, t) => s + t.montant, 0);
  const depenses = txActives.filter((t) => t.type === "DEPENSE").reduce((s, t) => s + t.montant, 0);
  const epargne = txActives.filter((t) => t.type === "EPARGNE").reduce((s, t) => s + t.montant, 0);
  const solde = revenus - depenses - epargne - txActives.filter((t) => t.type === "INVESTISSEMENT").reduce((s, t) => s + t.montant, 0);

  const handleAnnuler = () => {
    if (transactionAnnuler) {
      annulerTransaction(transactionAnnuler);
      setToast("Transaction annulée");
      setTimeout(() => setToast(""), 3000);
    }
    setTransactionAnnuler(null);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-muted-foreground">Espace {espaces.find((e) => e.id === espaceActifId)?.nom}</p>
          <h2 className="mt-1 text-xl font-semibold text-[#20392d]">Toutes vos opérations</h2>
        </div>
        <div className="flex gap-2">
          <select
            value={espaceActifId}
            onChange={(e) => changerEspace(e.target.value)}
            className="rounded-xl border bg-white px-3 py-2 text-sm text-[#53625a]"
          >
            {espaces.map((e) => (
              <option key={e.id} value={e.id}>{e.nom}</option>
            ))}
          </select>
          <Button onClick={() => setShowTransaction(true)} className="bg-[#237e56] hover:bg-[#1c6847]">
            <Plus size={17} /> <span className="hidden sm:inline">Nouvelle opération</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f5ef] text-[#237b54]"><WalletCards size={18} /></span>
            <div>
              <p className="text-xs text-muted-foreground">Solde disponible</p>
              <p className="text-lg font-semibold text-[#20392d]">{formaterMontant(solde)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f2f8] text-[#24698a]"><ArrowDownLeft size={18} /></span>
            <div>
              <p className="text-xs text-muted-foreground">Revenus du mois</p>
              <p className="text-lg font-semibold text-[#20392d]">{formaterMontant(revenus)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff3d8] text-[#9b6500]"><ArrowUpRight size={18} /></span>
            <div>
              <p className="text-xs text-muted-foreground">Dépenses du mois</p>
              <p className="text-lg font-semibold text-[#20392d]">{formaterMontant(depenses)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter size={16} className="text-[#98a099]" />
        {(["TOUS", "REVENU", "DEPENSE", "EPARGNE", "INVESTISSEMENT"] as FiltreType[]).map((t) => (
          <button
            key={t}
            onClick={() => setFiltreType(t)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filtreType === t ? "bg-[#237e56] text-white" : "bg-white text-[#728078] hover:bg-[#f0f3ed]"
            }`}
          >
            {t === "TOUS" ? "Tous" : libelleTypeTransaction(t)}
          </button>
        ))}
        <select
          value={filtreCategorie}
          onChange={(e) => setFiltreCategorie(e.target.value)}
          className="rounded-lg border bg-white px-3 py-1.5 text-xs text-[#53625a]"
        >
          <option value="TOUS">Toutes catégories</option>
          {categories.filter((c) => !c.estArchive).map((c) => (
            <option key={c.id} value={c.id}>{c.nom}</option>
          ))}
        </select>
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca8a0]" />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher..."
            className="h-9 w-full rounded-lg border bg-white pl-9 pr-3 text-sm outline-none ring-[#9ed0ae] focus:ring-2"
          />
        </div>
      </div>

      {/* Historique */}
      <div className="rounded-2xl border bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#20392d]">Historique</h3>
            <p className="mt-1 text-xs text-muted-foreground">{txFiltrees.length} opération(s)</p>
          </div>
        </div>

        {txFiltrees.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-[#405247]">Aucune opération trouvée.</p>
            <p className="mt-1 text-xs text-muted-foreground">Modifiez vos filtres ou ajoutez une opération.</p>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-[#f0efea]">
            {txFiltrees.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 py-3.5">
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${
                  tx.type === "REVENU" ? "bg-[#e8f5ef] text-[#27845a]" :
                  tx.type === "EPARGNE" ? "bg-[#e8f2f8] text-[#24698a]" :
                  tx.type === "INVESTISSEMENT" ? "bg-[#f0eaf8] text-[#6b4f9a]" :
                  "bg-[#fff1df] text-[#ad730c]"
                }`}>
                  {tx.type === "REVENU" ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-[#35493e]">{tx.description}</p>
                    {tx.statut === "ANNULEE" && (
                      <span className="rounded bg-[#fdebea] px-1.5 py-0.5 text-[10px] font-semibold text-[#a53d39]">Annulée</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {tx.categorieNom} · {formaterDateCourte(tx.dateOperation)} · {tx.moyenPaiement}
                  </p>
                </div>
                <p className={`text-sm font-semibold ${tx.statut === "ANNULEE" ? "text-[#98a099] line-through" : tx.type === "REVENU" ? "text-[#27845a]" : "text-[#405247]"}`}>
                  {tx.type === "REVENU" ? "+" : "-"}{formaterMontant(tx.montant)}
                </p>
                {tx.statut === "ACTIVE" && (
                  <button
                    onClick={() => setTransactionAnnuler(tx.id)}
                    className="rounded-lg p-1.5 text-[#98a099] hover:bg-[#fdebea] hover:text-[#a53d39]"
                    aria-label="Annuler la transaction"
                  >
                    <Ban size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conseil */}
      <div className="rounded-2xl border border-[#c5dcc9] bg-[#f1f8f2] p-5">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-[#268359]"><Sparkles size={16} /></span>
          <h3 className="font-semibold text-[#28583c]">Conseil du mois</h3>
        </div>
        <p className="mt-4 text-sm leading-6 text-[#537362]">
          Vous êtes à <b>16,7%</b> d’épargne. Mettre de côté 50 000 XOF de plus vous rapprocherait de votre objectif de 20%.
        </p>
      </div>

      {showTransaction && <ModalTransaction onClose={() => setShowTransaction(false)} />}
      {transactionAnnuler && (
        <ModalConfirmation
          titre="Annuler cette transaction ?"
          message="Cette action ne peut pas être annulée. La transaction restera visible dans l'historique avec le statut « Annulée »."
          boutonLabel="Annuler la transaction"
          boutonTone="red"
          onConfirm={handleAnnuler}
          onClose={() => setTransactionAnnuler(null)}
        />
      )}
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#20392d] px-4 py-3 text-sm font-medium text-white shadow-xl lg:bottom-8">
          <Check size={16} className="text-[#8dd0a5]" /> {toast}
        </div>
      )}
    </div>
  );
}

import { Check } from "lucide-react";
