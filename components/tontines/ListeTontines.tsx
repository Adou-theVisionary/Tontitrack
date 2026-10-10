"use client";

import { Plus, Users, CalendarDays, LogIn, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BadgeStatut, toneStatutTontine } from "@/components/BadgeStatut";
import { EtatVide } from "@/components/EtatsUI";
import { formaterMontant, libelleModeTontine, libelleStatutTontine, descriptionStatutTontine, formaterDateCourte } from "@/lib/format";
import type { Tontine } from "@/types";

export function ListeTontines({
  tontines,
  onSelectionner,
  onCreer,
  onRejoindre,
}: {
  tontines: Tontine[];
  onSelectionner: (t: Tontine) => void;
  onCreer: () => void;
  onRejoindre: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-muted-foreground">{tontines.length} espace(s) de confiance</p>
          <h2 className="mt-1 text-xl font-semibold text-[#20392d]">Vos tontines</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRejoindre} className="border-[#c5dcc9] text-[#237e56]">
            <LogIn size={17} /> <span className="hidden sm:inline">Rejoindre</span>
          </Button>
          <Button onClick={onCreer} className="bg-[#237e56] hover:bg-[#1c6847]">
            <Plus size={17} /> <span className="hidden sm:inline">Nouvelle tontine</span>
          </Button>
        </div>
      </div>

      {tontines.length === 0 ? (
        <EtatVide
          titre="Vous ne participez encore à aucune tontine."
          description="Créez votre première tontine ou rejoignez une tontine existante avec un code d'invitation."
          actionLabel="Créer une tontine"
          onAction={onCreer}
          actionSecondaireLabel="Rejoindre une tontine"
          onActionSecondaire={onRejoindre}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tontines.map((tontine) => (
            <button
              key={tontine.id}
              onClick={() => onSelectionner(tontine)}
              className="group rounded-2xl border bg-white p-5 text-left shadow-[0_2px_10px_rgba(26,55,40,.03)] transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f5ef] text-[#237e56]">
                  <Users size={18} />
                </div>
                <BadgeStatut tone={toneStatutTontine(tontine.statut)}>
                  {libelleStatutTontine(tontine.statut)}
                </BadgeStatut>
              </div>
              <h4 className="mt-4 font-semibold text-[#20392d]">{tontine.nom}</h4>
              <p className="mt-1 text-xs text-muted-foreground">{libelleModeTontine(tontine.mode)}</p>
              <div className="mt-5 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#3d5448]">
                  {formaterMontant(tontine.montantCotisation, tontine.devise)} / mois
                </span>
                <span className="text-muted-foreground">
                  {tontine.nombreMembresApprouves} / {tontine.nombreParticipantsRequis} membres
                </span>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#edf0ea]">
                <div
                  className="h-full rounded-full bg-[#5eb783]"
                  style={{ width: `${(tontine.nombreMembresApprouves / tontine.nombreParticipantsRequis) * 100}%` }}
                />
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-[#6f7e75]">
                <CalendarDays size={13} />
                {tontine.rotations.find((r) => r.statut === "EN_COURS")
                  ? `Rotation ${tontine.rotations.find((r) => r.statut === "EN_COURS")?.numero} · ${formaterDateCourte(tontine.rotations.find((r) => r.statut === "EN_COURS")!.date)}`
                  : `Démarre le ${formaterDateCourte(tontine.dateCommencement)}`}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
