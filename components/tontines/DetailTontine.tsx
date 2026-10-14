"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft, MoreHorizontal, CalendarDays, Users, Check, Copy,
  CreditCard, X, FileText,
  AlertCircle, Clock, Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BadgeStatut, toneStatutTontine, toneStatutCotisation, toneStatutDeclaration } from "@/components/BadgeStatut";
import { ModalConfirmation } from "@/components/ModalConfirmation";
import { ModalDeclarationCotisation } from "@/components/tontines/ModalDeclarationCotisation";
import { ModalRejetCotisation } from "@/components/tontines/ModalRejetCotisation";
import { GestionInvitations } from "@/components/tontines/GestionInvitations";
import { GestionMembresDemandes } from "@/components/tontines/GestionMembresDemandes";
import { AdministrationTontine } from "@/components/tontines/AdministrationTontine";
import { DemarrageTontine } from "@/components/tontines/DemarrageTontine";
import { OrdreBeneficiaires } from "@/components/tontines/OrdreBeneficiaires";
import { CotisationsTontine } from "@/components/tontines/CotisationsTontine";
import { ApercuCotisationsTontine } from "@/components/tontines/ApercuCotisationsTontine";
import { ReversementsTontine } from "@/components/tontines/ReversementsTontine";
import { ClotureTontine } from "@/components/tontines/ClotureTontine";
import { useApp } from "@/contexts/AppContext";
import { tontiTrackService } from "@/services/tontitrack-service";
import {
  formaterMontant, formaterDate, formaterDateCourte, libelleModeTontine,
  libelleStatutTontine, descriptionStatutTontine, libelleStatutCotisation,
  libelleStatutDeclaration,
  libelleStatutRotation,
  calculerResteAPayer, calculerPourcentage, calculerNombreTours,
} from "@/lib/format";
import type { Tontine } from "@/types";

export type OngletTontine = "resume" | "rotations" | "cotisations" | "reversements" | "cloture" | "membres" | "invitations" | "historique";

export function DetailTontine({ tontine, onRetour, onMutation, onActualiser, ongletInitial = "resume", onChangerOnglet }: { tontine: Tontine; onRetour: () => void; onMutation: (tontine: Tontine) => void; onActualiser?: () => Promise<void>; ongletInitial?: OngletTontine; onChangerOnglet?: (onglet: OngletTontine) => void }) {
  const { remplacerTontine } = useApp();
  const [onglet, setOnglet] = useState<OngletTontine>(ongletInitial);
  const [showActions, setShowActions] = useState(false);
  const [showAnnuler, setShowAnnuler] = useState(false);
  const [showDeclaration, setShowDeclaration] = useState<string | null>(null);
  const [showRejet, setShowRejet] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => { setOnglet(ongletInitial); }, [ongletInitial]);

  const estCreateur = tontine.estCreateur;
  const rotationEnCours = tontine.rotations.find((r) => r.statut === "EN_COURS");
  const prochainTour = tontine.rotations.find((r) => r.statut === "A_VENIR");
  const nombreTours = calculerNombreTours(tontine.mode, tontine.nombreMembresApprouves);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const actualiserTontine = async () => {
    if (onActualiser) {
      await onActualiser();
      return;
    }
    const tontineActualisee = await tontiTrackService.obtenirTontine(tontine.id);
    if (!tontineActualisee) throw new Error("Tontine introuvable.");
    remplacerTontine(tontineActualisee);
    onMutation(tontineActualisee);
  };

  const executerMutation = async (action: () => Promise<unknown>, succes: string) => {
    try {
      await action();
      await actualiserTontine();
      showToast(succes);
      return true;
    } catch (erreur: unknown) {
      const message = typeof erreur === "object" && erreur && "message" in erreur && typeof erreur.message === "string"
        ? erreur.message
        : "Cette action n’est pas disponible.";
      showToast(message);
      return false;
    }
  };

  const handleAnnuler = async () => {
    const succes = await executerMutation(() => tontiTrackService.annulerTontine(tontine.id), "Tontine annulée");
    setShowAnnuler(false);
    if (succes) onRetour();
  };


  const onglets: { id: OngletTontine; label: string }[] = [
    { id: "resume", label: "Résumé" },
    { id: "rotations", label: "Rotations" },
    { id: "cotisations", label: "Cotisations" },
    { id: "reversements", label: "Reversements" },
    { id: "cloture", label: "Clôture" },
    { id: "membres", label: "Membres" },
    { id: "invitations", label: "Invitations" },
    { id: "historique", label: "Historique" },
  ];

  return (
    <div className="space-y-6">
      <button onClick={onRetour} className="flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft size={16} /> Retour aux tontines
      </button>

      {/* En-tête tontine */}
      <div className="rounded-2xl border bg-card p-5 sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="min-w-0 break-words text-xl font-semibold text-foreground">{tontine.nom}</h3>
              <BadgeStatut tone={toneStatutTontine(tontine.statut)}>
                {libelleStatutTontine(tontine.statut)}
              </BadgeStatut>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {libelleModeTontine(tontine.mode)} · {formaterMontant(tontine.montantCotisation, tontine.devise)} / mois
            </p>
            <p className="mt-2 text-xs text-[#98a099]">{descriptionStatutTontine(tontine.statut)}</p>
            {tontine.demarreeLe && <p className="mt-2 text-xs text-[#6c8274]">Démarrage effectif : {formaterDate(tontine.demarreeLe)}</p>}
          </div>
          {estCreateur && (
            <div className="relative">
              <button aria-label="Actions de la tontine" onClick={() => setShowActions(!showActions)} className="grid h-11 w-11 place-items-center rounded-lg text-muted-foreground hover:bg-muted">
                <MoreHorizontal size={19} />
              </button>
              {showActions && (
                <div role="menu" className="absolute right-0 top-10 z-10 w-52 rounded-xl border bg-popover py-2 text-popover-foreground shadow-lg">
                  <button onClick={() => { setOnglet("invitations"); onChangerOnglet?.("invitations"); setShowActions(false); }} className="flex min-h-10 w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted">
                    <Copy size={15} /> Inviter des membres
                  </button>
                  {tontine.statut === "EN_PREPARATION" && (
                    <button onClick={() => { setShowAnnuler(true); setShowActions(false); }} className="flex min-h-10 w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10">
                      <Ban size={15} /> Annuler la tontine
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats rapides */}
        <div className="mt-7 grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-surface-subtle p-4">
            <p className="text-xs text-muted-foreground">Membres</p>
            <p className="mt-2 font-semibold text-[#294237]">{tontine.nombreMembresApprouves} / {tontine.nombreParticipantsRequis}</p>
          </div>
          <div className="rounded-xl bg-surface-subtle p-4">
            <p className="text-xs text-muted-foreground">Nombre de tours</p>
            <p className="mt-2 font-semibold text-[#294237]">{nombreTours}</p>
          </div>
          <div className="rounded-xl bg-surface-subtle p-4">
            <p className="text-xs text-muted-foreground">Fréquence</p>
            <p className="mt-2 font-semibold text-[#294237]">{tontine.frequence}</p>
          </div>
          <div className="rounded-xl bg-surface-subtle p-4">
            <p className="text-xs text-muted-foreground">Fuseau horaire</p>
            <p className="mt-2 font-semibold text-[#294237]">{tontine.fuseauHoraire}</p>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div aria-label="Onglets de la tontine" className="flex gap-1 overflow-x-auto overscroll-x-contain border-b scrollbar-hide [-webkit-overflow-scrolling:touch]">
        {onglets.map((o) => (
          <button
            key={o.id}
            onClick={() => { setOnglet(o.id); onChangerOnglet?.(o.id); }}
            className={`min-h-11 shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition ${
              onglet === o.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Onglet Résumé */}
      {onglet === "resume" && (
        <div className="space-y-6">
          {estCreateur && (tontine.statut === "EN_PREPARATION" || tontine.statut === "PRETE_A_DEMARRER" || tontine.statut === "ACTIVE") && <DemarrageTontine tontine={tontine} onActualiser={actualiserTontine} />}
          {tontine.statut === "ACTIVE" && <ApercuCotisationsTontine tontineId={tontine.id} estCreateur={estCreateur} prochainTour={prochainTour} allerCotisations={() => { setOnglet("cotisations"); onChangerOnglet?.("cotisations"); }} allerMembres={() => { setOnglet("membres"); onChangerOnglet?.("membres"); }} allerRotations={() => { setOnglet("rotations"); onChangerOnglet?.("rotations"); }} />}
          {rotationEnCours && (
            <div className="rounded-2xl border bg-card p-5">
              <h4 className="font-semibold text-[#20392d]">Rotation en cours — Tour {rotationEnCours.numero}</h4>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-[#f8faf6] p-4">
                  <p className="text-xs text-muted-foreground">Bénéficiaire</p>
                  <p className="mt-2 font-semibold text-[#294237]">{rotationEnCours.beneficiaireNom}</p>
                  <p className="mt-1 text-xs text-[#6c8274]">{formaterDate(rotationEnCours.date)}</p>
                </div>
                <div className="rounded-xl bg-[#f8faf6] p-4">
                  <p className="text-xs text-muted-foreground">Montant théorique du tour</p>
                  <p className="mt-2 font-semibold text-[#294237]">{formaterMontant(rotationEnCours.montantAttendu)}</p>
                  <p className="mt-1 text-xs text-[#6c8274]">Aucune cotisation ni aucun reversement n&apos;est enregistré ici.</p>
                </div>
              </div>
            </div>
          )}

          {/* Votre action */}
          {estCreateur && tontine.statut === "ACTIVE" && (
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-5">
              <h4 className="flex items-center gap-2 font-semibold text-foreground">
                <AlertCircle size={18} /> Actions en attente
              </h4>
              <div className="mt-4 space-y-3">
                {tontine.cotisations.filter((c) => c.statut === "PARTIEL" || c.statut === "EN_RETARD").map((cot) => (
                  <div key={cot.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-card p-3">
                    <span className={`grid h-8 w-8 place-items-center rounded-full ${cot.statut === "EN_RETARD" ? "bg-[#fdebea] text-[#a53d39]" : "bg-[#fff3d8] text-[#9b6500]"}`}>
                      <Clock size={15} />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#405247]">{cot.membreNom}</p>
                      <p className="text-xs text-muted-foreground">
                        {libelleStatutCotisation(cot.statut)} · Reste : {formaterMontant(calculerResteAPayer(cot.montantAttendu, cot.montantValide))}
                      </p>
                    </div>
                    <BadgeStatut tone={toneStatutCotisation(cot.statut)} dot={false}>{libelleStatutCotisation(cot.statut)}</BadgeStatut>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ma cotisation (membre) */}
          {!estCreateur && tontine.statut === "ACTIVE" && rotationEnCours && (
            <div className="rounded-2xl border bg-card p-5">
              <h4 className="font-semibold text-[#20392d]">Votre cotisation</h4>
              {(() => {
                const maCot = tontine.cotisations.find((c) => c.membreId === "m1");
                if (!maCot) return null;
                const reste = calculerResteAPayer(maCot.montantAttendu, maCot.montantValide);
                const pct = calculerPourcentage(maCot.montantValide, maCot.montantAttendu);
                return (
                  <>
                    <div className="mt-4 flex items-center justify-between">
                      <BadgeStatut tone={toneStatutCotisation(maCot.statut)}>{libelleStatutCotisation(maCot.statut)}</BadgeStatut>
                      <span className="text-sm font-semibold text-[#287b54]">{Math.round(pct)}%</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-[#e9eee9]">
                      <div className="h-full rounded-full bg-[#dca83e]" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formaterMontant(maCot.montantValide)} / {formaterMontant(maCot.montantAttendu)}
                    </p>
                    {reste > 0 && maCot.statut !== "NON_CONCERNE" && (
                      <Button onClick={() => setShowDeclaration(maCot.id)} className="mt-4 w-full">
                        <CreditCard size={16} /> Déclarer un paiement ({formaterMontant(reste)})
                      </Button>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {/* Invitations */}
          {estCreateur && (tontine.statut === "EN_PREPARATION" || tontine.statut === "PRETE_A_DEMARRER") && (
            <div className="rounded-2xl border bg-card p-5">
              <h4 className="font-semibold text-[#20392d]">Invitation</h4>
              <p className="mt-1 text-sm text-muted-foreground">Créez une invitation ciblée ou un lien sécurisé.</p>
              <Button onClick={() => { setOnglet("invitations"); onChangerOnglet?.("invitations"); }} variant="outline" className="mt-3 w-full border-[#c5dcc9] text-[#237e56]">
                Gérer les invitations
              </Button>
            </div>
          )}
        </div>
      )}

      {onglet === "invitations" && (
        <div className="rounded-2xl border bg-card p-5">
          <h4 className="font-semibold text-[#20392d]">Invitations</h4>
          <p className="mt-1 text-sm text-muted-foreground">Les invitations et leurs statuts proviennent de votre espace sécurisé.</p>
          <div className="mt-4"><GestionInvitations tontineId={tontine.id} estCreateur={estCreateur} /></div>
        </div>
      )}

      {/* Onglet Rotations */}
      {onglet === "rotations" && (
        <div className="space-y-4">
          {(estCreateur || tontine.membres.length > 0) && <OrdreBeneficiaires tontine={tontine} estCreateur={estCreateur} onActualiser={actualiserTontine} />}
          {tontine.rotations.length === 0 ? (
            <div className="rounded-2xl border bg-card p-8 text-center">
              <CalendarDays size={32} className="mx-auto text-[#9bc8aa]" />
              <p className="mt-3 text-sm font-medium text-[#405247]">Aucune rotation pour le moment.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {tontine.statut === "EN_PREPARATION" ? "Les rotations apparaîtront après le démarrage." : "En attente de démarrage."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tontine.rotations.map((rotation) => (
                <div key={rotation.id} className="rounded-2xl border bg-card p-5">
                  <div className="flex items-start gap-4">
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold ${
                      rotation.statut === "TERMINEE" ? "bg-[#e8f5ef] text-[#237b54]" :
                      rotation.statut === "EN_COURS" ? "bg-[#fff3d8] text-[#9b6500]" :
                      "bg-[#f0f1ee] text-[#68746d]"
                    }`}>
                      {rotation.statut === "TERMINEE" ? <Check size={18} /> : rotation.numero}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-[#20392d]">Tour {rotation.numero}</p>
                        <BadgeStatut tone={rotation.statut === "TERMINEE" ? "green" : rotation.statut === "EN_COURS" ? "amber" : "gray"} dot={false}>
                          {libelleStatutRotation(rotation.statut)}
                        </BadgeStatut>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">Bénéficiaire : {rotation.beneficiaireNom}</p>
                      <p className="text-xs text-muted-foreground">Début prévu : {formaterDate(rotation.date)}</p>
                      <p className="mt-3 text-xs text-muted-foreground">Montant théorique : {formaterMontant(rotation.montantAttendu)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Onglet Cotisations */}
      {onglet === "cotisations" && (
        <CotisationsTontine tontineId={tontine.id} estCreateur={estCreateur} />
      )}

      {onglet === "reversements" && (
        <ReversementsTontine tontineId={tontine.id} />
      )}

      {onglet === "cloture" && (
        <ClotureTontine
          tontineId={tontine.id}
          onActualiser={actualiserTontine}
          versCotisations={() => { setOnglet("cotisations"); onChangerOnglet?.("cotisations"); }}
          versReversements={() => { setOnglet("reversements"); onChangerOnglet?.("reversements"); }}
        />
      )}

      {/* Onglet Membres */}
      {onglet === "membres" && (
        <div className="space-y-5">
          <GestionMembresDemandes tontineId={tontine.id} estCreateur={estCreateur} onActualiser={onActualiser} />
          {estCreateur && <AdministrationTontine tontine={tontine} onActualiser={onActualiser} />}
        </div>
      )}

      {/* Onglet Historique */}
      {onglet === "historique" && (
        <div className="space-y-3">
          {tontine.declarations.length === 0 ? (
            <div className="rounded-2xl border bg-card p-8 text-center">
              <FileText size={32} className="mx-auto text-[#9bc8aa]" />
              <p className="mt-3 text-sm font-medium text-[#405247]">Aucun historique de déclaration.</p>
            </div>
          ) : (
            tontine.declarations.map((decl) => (
              <div key={decl.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-9 w-9 place-items-center rounded-full ${decl.statut === "VALIDEE" ? "bg-[#e8f5ef] text-[#237b54]" : decl.statut === "REJETEE" ? "bg-[#fdebea] text-[#a53d39]" : "bg-[#fff3d8] text-[#9b6500]"}`}>
                      {decl.statut === "VALIDEE" ? <Check size={17} /> : <Clock size={17} />}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[#405247]">{formaterMontant(decl.montant)}</p>
                      <p className="text-xs text-muted-foreground">{formaterDateCourte(decl.dateDeclaration)}</p>
                    </div>
                  </div>
                  <BadgeStatut tone={toneStatutDeclaration(decl.statut)} dot={false}>
                    {libelleStatutDeclaration(decl.statut)}
                  </BadgeStatut>
                </div>
                {decl.preuveNom && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#f8faf6] p-2 text-xs text-muted-foreground">
                    <FileText size={14} /> {decl.preuveNom}
                  </div>
                )}
                {decl.motifRejet && (
                  <p className="mt-2 text-xs text-[#a53d39]">Motif : {decl.motifRejet}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      {showAnnuler && (
        <ModalConfirmation
          titre="Annuler cette tontine ?"
          message="Cette action ne peut pas être annulée. La tontine passera en statut « Annulée » et ne pourra plus être démarrée."
          boutonLabel="Annuler la tontine"
          boutonTone="red"
          onConfirm={handleAnnuler}
          onClose={() => setShowAnnuler(false)}
        />
      )}
      {showDeclaration && (
        <ModalDeclarationCotisation
          cotisationId={showDeclaration}
          tontine={tontine}
          onClose={() => setShowDeclaration(null)}
          onSuccess={() => { void actualiserTontine(); setShowDeclaration(null); showToast("Déclaration envoyée"); }}
        />
      )}
      {showRejet && (
        <ModalRejetCotisation
          onClose={() => setShowRejet(null)}
          onConfirm={(motif) => { void executerMutation(() => tontiTrackService.rejeterCotisation(showRejet, motif), "Cotisation rejetée").then(() => setShowRejet(null)); }}
        />
      )}
      {toast && (
        <div role="status" className="notification-flottante fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-popover px-4 py-3 text-center text-sm font-medium text-popover-foreground shadow-xl lg:bottom-8">
          <Check size={16} className="text-primary" /> {toast}
        </div>
      )}
    </div>
  );
}
