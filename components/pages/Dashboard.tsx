"use client";

import { useState, useMemo } from "react";
import {
  ArrowDownLeft, ArrowUpRight, Bell, CalendarDays, Check, ChevronDown,
  CreditCard, Landmark, Plus, Users, WalletCards, Zap, Sparkles,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { BadgeStatut, toneStatutTontine } from "@/components/BadgeStatut";
import { Button } from "@/components/ui/button";
import { formaterMontant, formaterMontantCourt, libelleModeTontine, libelleStatutTontine, formaterDateCourte } from "@/lib/format";
import type { Section } from "@/components/AppShell";
import { ModalTransaction } from "@/components/finances/ModalTransaction";

export function Dashboard({ onSection }: { onSection: (s: Section) => void }) {
  const { utilisateur, transactions, tontines, espaceActifId, espaces } = useApp();
  const [showTransaction, setShowTransaction] = useState(false);

  const txEspace = useMemo(
    () => transactions.filter((t) => t.espaceId === espaceActifId && t.statut === "ACTIVE"),
    [transactions, espaceActifId]
  );

  const revenus = txEspace.filter((t) => t.type === "REVENU").reduce((s, t) => s + t.montant, 0);
  const depenses = txEspace.filter((t) => t.type === "DEPENSE").reduce((s, t) => s + t.montant, 0);
  const epargne = txEspace.filter((t) => t.type === "EPARGNE").reduce((s, t) => s + t.montant, 0);
  const invest = txEspace.filter((t) => t.type === "INVESTISSEMENT").reduce((s, t) => s + t.montant, 0);
  const solde = revenus - depenses - epargne - invest;

  const tontinesActives = tontines.filter((t) => t.statut === "ACTIVE" || t.statut === "PRETE_A_DEMARRER" || t.statut === "EN_PREPARATION");

  return (
    <div className="space-y-7">
      {/* En-tête */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Bonjour {utilisateur?.prenom},</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Voici votre situation.</h2>
        </div>
        <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2 text-sm text-foreground shadow-sm">
          <Landmark size={16} className="text-primary" />
          <span>{espaces.find((e) => e.id === espaceActifId)?.nom || "Personnel"}</span>
          <ChevronDown size={15} />
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="entree-discrete grid gap-4 xl:grid-cols-[1.35fr_1fr_1fr_1fr]">
        {/* Carte solde principale */}
        <div className="relative overflow-hidden rounded-2xl bg-[#237e56] p-6 text-white shadow-[0_10px_30px_rgba(35,126,86,.18)] sm:p-7">
          <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full border-[22px] border-white/10" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white/75">Solde disponible</p>
              <span className="rounded-lg bg-white/15 p-2"><WalletCards size={18} /></span>
            </div>
            <p className="mt-5 text-3xl font-semibold tracking-tight">{formaterMontant(solde)}</p>
            <p className="mt-2 text-xs text-white/65">Mis à jour il y a quelques secondes</p>
            <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-3 border-t border-white/15 pt-4 text-xs">
              <span className="text-white/70">Revenus <b className="float-right font-semibold text-white">{formaterMontantCourt(revenus)}</b></span>
              <span className="text-white/70">Dépenses <b className="float-right font-semibold text-white">-{formaterMontantCourt(depenses)}</b></span>
              <span className="text-white/70">Épargne <b className="float-right font-semibold text-white">-{formaterMontantCourt(epargne)}</b></span>
              <span className="text-white/70">Investis. <b className="float-right font-semibold text-white">-{formaterMontantCourt(invest)}</b></span>
            </div>
          </div>
        </div>
        <StatCard label="Revenus" value={formaterMontant(revenus)} detail="Ce mois-ci" icon={ArrowDownLeft} tone="green" />
        <StatCard label="Dépenses" value={formaterMontant(depenses)} detail="Ce mois-ci" icon={ArrowUpRight} tone="amber" />
        <StatCard label="Épargne" value={formaterMontant(epargne)} detail="Objectif à 63%" icon={Landmark} tone="blue" />
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Revenu", icon: ArrowDownLeft, color: "bg-primary/10 text-primary" },
          { label: "Dépense", icon: ArrowUpRight, color: "bg-warning/15 text-warning" },
          { label: "Épargne", icon: Landmark, color: "bg-info/10 text-info" },
          { label: "Investir", icon: Sparkles, color: "bg-[hsl(var(--chart-5)/.14)] text-[hsl(var(--chart-5))]" },
        ].map(({ label, icon: Icon, color }) => (
          <button
            key={label}
            onClick={() => setShowTransaction(true)}
            className="surface-interactive flex min-h-14 items-center gap-3 rounded-xl border bg-card p-4 text-left motion-reduce:transform-none"
          >
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${color}`}><Icon size={18} /></span>
            <span className="text-sm font-medium text-foreground">{label}</span>
          </button>
        ))}
      </div>

      {/* Graphique + À faire */}
      <div className="entree-discrete grid gap-7 xl:grid-cols-[1.35fr_.85fr]">
        <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Évolution du solde</h3>
              <p className="mt-1 text-xs text-muted-foreground">Janvier — Septembre 2026</p>
            </div>
            <select className="rounded-lg border bg-surface-subtle px-2.5 py-2 text-xs font-medium text-foreground">
              <option>Cette année</option>
              <option>Ce mois</option>
            </select>
          </div>
          <div className="mt-7 h-[190px] w-full">
            <div className="flex h-full items-end gap-2 sm:gap-4">
              {[42, 52, 48, 61, 55, 68, 63, 78, 91].map((height, index) => (
                <div key={index} className="group flex flex-1 flex-col items-center gap-2">
                  <div className={`w-full max-w-[38px] rounded-t-lg transition group-hover:bg-[#237e56] ${index === 8 ? "bg-[#2e9b6b]" : "bg-[#dcefe3]"}`} style={{ height: `${height}%` }} />
                  <span className="text-[10px] text-[#98a099]">{["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep"][index]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">À faire</h3>
              <p className="mt-1 text-xs text-muted-foreground">Vos actions importantes</p>
            </div>
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-warning/15 text-warning"><Zap size={16} /></span>
          </div>
          <div className="mt-5 space-y-4">
            <button onClick={() => onSection("tontines")} className="flex w-full items-start gap-3 rounded-lg p-1 text-left transition-[background-color,color] duration-150 hover:bg-surface-subtle">
              <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-[#fff2d4] text-[#bb7d08]"><CreditCard size={13} /></span>
              <span className="flex-1">
                <b className="block text-sm font-medium text-foreground">Cotisation à déclarer</b>
                <span className="mt-0.5 block text-xs text-muted-foreground">Tontine Solidarité · 100 000 XOF</span>
              </span>
              <ChevronDown size={16} className="-rotate-90 text-[#a6aea8]" />
            </button>
            <button onClick={() => onSection("tontines")} className="flex w-full items-start gap-3 rounded-lg p-1 text-left transition-[background-color,color] duration-150 hover:bg-surface-subtle">
              <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-[#e8f2f8] text-[#287397]"><Users size={13} /></span>
              <span className="flex-1">
                <b className="block text-sm font-medium text-foreground">2 demandes d’adhésion</b>
                <span className="mt-0.5 block text-xs text-muted-foreground">Projet Entrepreneur</span>
              </span>
              <ChevronDown size={16} className="-rotate-90 text-[#a6aea8]" />
            </button>
            <button onClick={() => onSection("tontines")} className="flex w-full items-start gap-3 rounded-lg p-1 text-left transition-[background-color,color] duration-150 hover:bg-surface-subtle">
              <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-[#e8f5ef] text-[#287a53]"><Check size={13} /></span>
              <span className="flex-1">
                <b className="block text-sm font-medium text-foreground">Versement à confirmer</b>
                <span className="mt-0.5 block text-xs text-muted-foreground">Tontine Solidarité · Tour 2</span>
              </span>
              <ChevronDown size={16} className="-rotate-90 text-[#a6aea8]" />
            </button>
          </div>
        </div>
      </div>

      {/* Tontines */}
      <div className="entree-discrete">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#20392d]">Mes tontines</h3>
            <p className="mt-1 text-xs text-muted-foreground">Vos engagements en cours</p>
          </div>
          <button onClick={() => onSection("tontines")} className="text-sm font-semibold text-[#238257] hover:underline">Tout voir</button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tontinesActives.map((tontine) => (
            <button
              key={tontine.id}
              onClick={() => onSection("tontines")}
              className="surface-interactive group rounded-2xl border bg-white p-5 text-left shadow-[0_2px_10px_rgba(26,55,40,.03)]"
            >
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f5ef] text-[#237e56]"><Users size={18} /></div>
                <BadgeStatut tone={toneStatutTontine(tontine.statut)}>{libelleStatutTontine(tontine.statut)}</BadgeStatut>
              </div>
              <h4 className="mt-4 font-semibold text-[#20392d]">{tontine.nom}</h4>
              <p className="mt-1 text-xs text-muted-foreground">{libelleModeTontine(tontine.mode)}</p>
              <div className="mt-5 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#3d5448]">{formaterMontant(tontine.montantCotisation, tontine.devise)} / mois</span>
                <span className="text-muted-foreground">{tontine.nombreMembresApprouves} membres</span>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#edf0ea]">
                <div className="h-full rounded-full bg-[#5eb783]" style={{ width: `${tontine.rotations.length > 0 ? (tontine.rotations.filter(r => r.statut === "TERMINEE").length / tontine.rotations.length * 100) : 0}%` }} />
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-[#6f7e75]">
                <CalendarDays size={13} />
                {tontine.rotations.find(r => r.statut === "EN_COURS") ? `Rotation en cours : ${tontine.rotations.find(r => r.statut === "EN_COURS")?.beneficiaireNom}` : "En attente de démarrage"}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Activité récente */}
      <div className="entree-discrete rounded-2xl border bg-white p-5 shadow-[0_2px_10px_rgba(26,55,40,.03)]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#20392d]">Activité récente</h3>
            <p className="mt-1 text-xs text-muted-foreground">Vos dernières opérations</p>
          </div>
          <button onClick={() => onSection("finances")} className="text-sm font-semibold text-[#238257] hover:underline">Voir tout</button>
        </div>
        <div className="mt-4 divide-y divide-[#f0efea]">
          {txEspace.slice(0, 4).map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 py-3">
              <span className={`grid h-9 w-9 place-items-center rounded-xl ${tx.type === "REVENU" ? "bg-[#e8f5ef] text-[#27845a]" : "bg-[#fff1df] text-[#ad730c]"}`}>
                {tx.type === "REVENU" ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#35493e]">{tx.description}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{tx.categorieNom} · {formaterDateCourte(tx.dateOperation)}</p>
              </div>
              <p className={`shrink-0 text-right text-sm font-semibold ${tx.type === "REVENU" ? "text-[#27845a]" : "text-[#405247]"}`}>
                {tx.type === "REVENU" ? "+" : "-"}{formaterMontant(tx.montant)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {showTransaction && <ModalTransaction onClose={() => setShowTransaction(false)} />}
    </div>
  );
}

function StatCard({ label, value, detail, icon: Icon, tone }: { label: string; value: string; detail: string; icon: typeof WalletCards; tone: "green" | "blue" | "amber" | "slate" }) {
  const styles: Record<string, string> = {
    green: "bg-primary/10 text-primary",
    blue: "bg-info/10 text-info",
    amber: "bg-warning/15 text-warning",
    slate: "bg-muted text-muted-foreground",
  };
  return (
    <div className="surface-interactive rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${styles[tone]}`}><Icon size={17} /></span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
