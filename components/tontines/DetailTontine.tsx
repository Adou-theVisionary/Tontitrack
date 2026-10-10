"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft, MoreHorizontal, CalendarDays, Users, Check, Copy,
  CreditCard, Upload, X, FileText,
  AlertCircle, Clock, Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BadgeStatut, toneStatutTontine, toneStatutCotisation, toneStatutDeclaration } from "@/components/BadgeStatut";
import { ModalConfirmation } from "@/components/ModalConfirmation";
import { ModalDeclarationCotisation } from "@/components/tontines/ModalDeclarationCotisation";
import { ModalRejetCotisation } from "@/components/tontines/ModalRejetCotisation";
import { ModalVersement } from "@/components/tontines/ModalVersement";
import { GestionInvitations } from "@/components/tontines/GestionInvitations";
import { GestionMembresDemandes } from "@/components/tontines/GestionMembresDemandes";
import { AdministrationTontine } from "@/components/tontines/AdministrationTontine";
import { useApp } from "@/contexts/AppContext";
import { tontiTrackService } from "@/services/tontitrack-service";
import {
  formaterMontant, formaterDate, formaterDateCourte, libelleModeTontine,
  libelleStatutTontine, descriptionStatutTontine, libelleStatutCotisation,
  libelleStatutDeclaration,
  calculerResteAPayer, calculerPourcentage, calculerNombreTours,
} from "@/lib/format";
import type { Tontine } from "@/types";

export type OngletTontine = "resume" | "rotations" | "cotisations" | "membres" | "invitations" | "historique";

export function DetailTontine({ tontine, onRetour, onMutation, onActualiser, ongletInitial = "resume", onChangerOnglet }: { tontine: Tontine; onRetour: () => void; onMutation: (tontine: Tontine) => void; onActualiser?: () => Promise<void>; ongletInitial?: OngletTontine; onChangerOnglet?: (onglet: OngletTontine) => void }) {
  const { remplacerTontine } = useApp();
  const [onglet, setOnglet] = useState<OngletTontine>(ongletInitial);
  const [showActions, setShowActions] = useState(false);
  const [showAnnuler, setShowAnnuler] = useState(false);
  const [showDeclaration, setShowDeclaration] = useState<string | null>(null);
  const [showRejet, setShowRejet] = useState<string | null>(null);
  const [showVersement, setShowVersement] = useState<string | null>(null);
  const [showDeclarationVersement, setShowDeclarationVersement] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => { setOnglet(ongletInitial); }, [ongletInitial]);

  const estCreateur = tontine.estCreateur;
  const rotationEnCours = tontine.rotations.find((r) => r.statut === "EN_COURS");
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
    { id: "membres", label: "Membres" },
    { id: "invitations", label: "Invitations" },
    { id: "historique", label: "Historique" },
  ];

  return (
    <div className="space-y-6">
      <button onClick={onRetour} className="flex items-center gap-2 text-sm text-[#728078] hover:text-[#237e56]">
        <ArrowLeft size={16} /> Retour aux tontines
      </button>

      {/* En-tête tontine */}
      <div className="rounded-2xl border bg-white p-5 sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-[#20392d]">{tontine.nom}</h3>
              <BadgeStatut tone={toneStatutTontine(tontine.statut)}>
                {libelleStatutTontine(tontine.statut)}
              </BadgeStatut>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {libelleModeTontine(tontine.mode)} · {formaterMontant(tontine.montantCotisation, tontine.devise)} / mois
            </p>
            <p className="mt-2 text-xs text-[#98a099]">{descriptionStatutTontine(tontine.statut)}</p>
          </div>
          {estCreateur && (
            <div className="relative">
              <button onClick={() => setShowActions(!showActions)} className="rounded-lg p-2 text-[#718078] hover:bg-[#f3f5f0]">
                <MoreHorizontal size={19} />
              </button>
              {showActions && (
                <div className="absolute right-0 top-10 z-10 w-48 rounded-xl border bg-white py-2 shadow-lg">
                  <button onClick={() => { setOnglet("invitations"); onChangerOnglet?.("invitations"); setShowActions(false); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#405247] hover:bg-[#f8faf6]">
                    <Copy size={15} /> Inviter des membres
                  </button>
                  {tontine.statut === "EN_PREPARATION" && (
                    <button onClick={() => { setShowAnnuler(true); setShowActions(false); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#a53d39] hover:bg-[#fdebea]">
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
          <div className="rounded-xl bg-[#f8faf6] p-4">
            <p className="text-xs text-muted-foreground">Membres</p>
            <p className="mt-2 font-semibold text-[#294237]">{tontine.nombreMembresApprouves} / {tontine.nombreParticipantsRequis}</p>
          </div>
          <div className="rounded-xl bg-[#f8faf6] p-4">
            <p className="text-xs text-muted-foreground">Nombre de tours</p>
            <p className="mt-2 font-semibold text-[#294237]">{nombreTours}</p>
          </div>
          <div className="rounded-xl bg-[#f8faf6] p-4">
            <p className="text-xs text-muted-foreground">Fréquence</p>
            <p className="mt-2 font-semibold text-[#294237]">{tontine.frequence}</p>
          </div>
          <div className="rounded-xl bg-[#f8faf6] p-4">
            <p className="text-xs text-muted-foreground">Fuseau horaire</p>
            <p className="mt-2 font-semibold text-[#294237]">{tontine.fuseauHoraire}</p>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 overflow-x-auto border-b scrollbar-hide">
        {onglets.map((o) => (
          <button
            key={o.id}
            onClick={() => { setOnglet(o.id); onChangerOnglet?.(o.id); }}
            className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition ${
              onglet === o.id ? "border-[#2b8b60] text-[#237e56]" : "border-transparent text-muted-foreground hover:text-[#405247]"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Onglet Résumé */}
      {onglet === "resume" && (
        <div className="space-y-6">
          {rotationEnCours && (
            <div className="rounded-2xl border bg-white p-5">
              <h4 className="font-semibold text-[#20392d]">Rotation en cours — Tour {rotationEnCours.numero}</h4>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-[#f8faf6] p-4">
                  <p className="text-xs text-muted-foreground">Bénéficiaire</p>
                  <p className="mt-2 font-semibold text-[#294237]">{rotationEnCours.beneficiaireNom}</p>
                  <p className="mt-1 text-xs text-[#6c8274]">{formaterDate(rotationEnCours.date)}</p>
                </div>
                <div className="rounded-xl bg-[#f8faf6] p-4">
                  <p className="text-xs text-muted-foreground">Montant collecté</p>
                  <p className="mt-2 font-semibold text-[#294237]">{formaterMontant(rotationEnCours.montantCollecte)} / {formaterMontant(rotationEnCours.montantAttendu)}</p>
                  <div className="mt-2 h-2 rounded-full bg-[#e2ebe3]">
                    <div className="h-full rounded-full bg-[#399867]" style={{ width: `${calculerPourcentage(rotationEnCours.montantCollecte, rotationEnCours.montantAttendu)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Votre action */}
          {estCreateur && tontine.statut === "ACTIVE" && (
            <div className="rounded-2xl border border-[#d4eadb] bg-[#f1f9f2] p-5">
              <h4 className="flex items-center gap-2 font-semibold text-[#28583c]">
                <AlertCircle size={18} /> Actions en attente
              </h4>
              <div className="mt-4 space-y-3">
                {tontine.cotisations.filter((c) => c.statut === "PARTIEL" || c.statut === "EN_RETARD").map((cot) => (
                  <div key={cot.id} className="flex items-center gap-3 rounded-xl bg-white p-3">
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
                {tontine.versements.filter((v) => v.statut === "DECLARE").map((v) => (
                  <div key={v.id} className="flex items-center gap-3 rounded-xl bg-white p-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e8f2f8] text-[#24698a]"><Check size={15} /></span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#405247]">Versement à confirmer</p>
                      <p className="text-xs text-muted-foreground">{formaterMontant(v.montant)} · Reste {v.tempsRestantConfirmation}</p>
                    </div>
                    <Button onClick={() => setShowVersement(v.id)} variant="outline" className="border-[#c5dcc9] text-[#237e56] text-xs">
                      Confirmer
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ma cotisation (membre) */}
          {!estCreateur && tontine.statut === "ACTIVE" && rotationEnCours && (
            <div className="rounded-2xl border bg-white p-5">
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
                      <Button onClick={() => setShowDeclaration(maCot.id)} className="mt-4 w-full bg-[#237e56] hover:bg-[#1c6847]">
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
            <div className="rounded-2xl border bg-white p-5">
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
        <div className="rounded-2xl border bg-white p-5">
          <h4 className="font-semibold text-[#20392d]">Invitations</h4>
          <p className="mt-1 text-sm text-muted-foreground">Les invitations et leurs statuts proviennent de votre espace sécurisé.</p>
          <div className="mt-4"><GestionInvitations tontineId={tontine.id} estCreateur={estCreateur} /></div>
        </div>
      )}

      {/* Onglet Rotations */}
      {onglet === "rotations" && (
        <div className="space-y-4">
          {tontine.rotations.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center">
              <CalendarDays size={32} className="mx-auto text-[#9bc8aa]" />
              <p className="mt-3 text-sm font-medium text-[#405247]">Aucune rotation pour le moment.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {tontine.statut === "EN_PREPARATION" ? "Les rotations apparaîtront après le démarrage." : "En attente de démarrage."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tontine.rotations.map((rotation) => (
                <div key={rotation.id} className="rounded-2xl border bg-white p-5">
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
                          {rotation.statut === "TERMINEE" ? "Terminé" : rotation.statut === "EN_COURS" ? "En cours" : "À venir"}
                        </BadgeStatut>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">Bénéficiaire : {rotation.beneficiaireNom}</p>
                      <p className="text-xs text-muted-foreground">{formaterDate(rotation.date)}</p>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{formaterMontant(rotation.montantCollecte)} / {formaterMontant(rotation.montantAttendu)}</span>
                        <span className="font-semibold text-[#287b54]">{Math.round(calculerPourcentage(rotation.montantCollecte, rotation.montantAttendu))}%</span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-[#edf0ea]">
                        <div className="h-full rounded-full bg-[#5eb783]" style={{ width: `${calculerPourcentage(rotation.montantCollecte, rotation.montantAttendu)}%` }} />
                      </div>
                      {estCreateur && tontine.statut === "ACTIVE" && rotation.statut === "EN_COURS" && (
                        <Button onClick={() => setShowDeclarationVersement(rotation.id)} variant="outline" className="mt-4 border-[#c5dcc9] text-[#237e56] text-xs">
                          <Upload size={14} /> Déclarer le versement
                        </Button>
                      )}
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
        <div className="space-y-4">
          {tontine.cotisations.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center">
              <CreditCard size={32} className="mx-auto text-[#9bc8aa]" />
              <p className="mt-3 text-sm font-medium text-[#405247]">Aucune cotisation pour le moment.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {tontine.rotations.find((r) => r.statut === "EN_COURS")
                  ? `Cotisations du tour ${tontine.rotations.find((r) => r.statut === "EN_COURS")?.numero}`
                  : "Aucune rotation active"}
              </p>
              <div className="space-y-3">
                {tontine.cotisations.map((cot) => {
                  const reste = calculerResteAPayer(cot.montantAttendu, cot.montantValide);
                  const pct = calculerPourcentage(cot.montantValide, cot.montantAttendu);
                  return (
                    <div key={cot.id} className="rounded-2xl border bg-white p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-full bg-[#f0f3ed] text-xs font-bold text-[#657169]">
                            {cot.membreNom.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#405247]">{cot.membreNom}</p>
                            {cot.statut === "NON_CONCERNE" ? (
                              <p className="text-xs text-muted-foreground">Bénéficiaire exempté</p>
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                {formaterMontant(cot.montantValide)} / {formaterMontant(cot.montantAttendu)}
                              </p>
                            )}
                          </div>
                        </div>
                        <BadgeStatut tone={toneStatutCotisation(cot.statut)} dot={false}>
                          {libelleStatutCotisation(cot.statut)}
                        </BadgeStatut>
                      </div>
                      {cot.statut !== "NON_CONCERNE" && cot.statut !== "PAYEE" && (
                        <div className="mt-3">
                          <div className="h-1.5 rounded-full bg-[#edf0ea]">
                            <div className={`h-full rounded-full ${cot.statut === "EN_RETARD" ? "bg-[#c54842]" : "bg-[#dca83e]"}`} style={{ width: `${pct}%` }} />
                          </div>
                          {reste > 0 && (
                            <p className="mt-2 text-xs text-muted-foreground">Reste : {formaterMontant(reste)}</p>
                          )}
                        </div>
                      )}
                      {/* Déclarations */}
                      {estCreateur && cot.statut !== "NON_CONCERNE" && cot.statut !== "PAYEE" && (
                        <div className="mt-3 flex gap-2">
                          {tontine.declarations.filter((d) => d.cotisationId === cot.id && d.statut === "EN_ATTENTE").length > 0 ? (
                            <>
                              <Button onClick={() => {
                                const declaration = tontine.declarations.find((item) => item.cotisationId === cot.id && item.statut === "EN_ATTENTE");
                                if (declaration) void executerMutation(() => tontiTrackService.validerCotisation(declaration.id), "Cotisation validée");
                              }} variant="outline" className="flex-1 border-[#c5dcc9] text-[#237e56] text-xs">
                                <Check size={14} /> Valider
                              </Button>
                              <Button onClick={() => {
                                const declaration = tontine.declarations.find((item) => item.cotisationId === cot.id && item.statut === "EN_ATTENTE");
                                if (declaration) setShowRejet(declaration.id);
                              }} variant="outline" className="flex-1 border-[#f0d5d4] text-[#a53d39] text-xs">
                                <X size={14} /> Rejeter
                              </Button>
                            </>
                          ) : (
                            <p className="text-xs text-muted-foreground">Aucune déclaration en attente</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
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
            <div className="rounded-2xl border bg-white p-8 text-center">
              <FileText size={32} className="mx-auto text-[#9bc8aa]" />
              <p className="mt-3 text-sm font-medium text-[#405247]">Aucun historique de déclaration.</p>
            </div>
          ) : (
            tontine.declarations.map((decl) => (
              <div key={decl.id} className="rounded-xl border bg-white p-4">
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
      {showVersement && (
        <ModalVersement
          versementId={showVersement}
          mode="confirmation"
          onClose={() => setShowVersement(null)}
          onConfirm={() => { void actualiserTontine(); setShowVersement(null); showToast("Réception confirmée"); }}
          onContester={() => { void actualiserTontine(); setShowVersement(null); showToast("Litige signalé"); }}
        />
      )}
      {showDeclarationVersement && (
        <ModalVersement
          rotationId={showDeclarationVersement}
          mode="declaration"
          onClose={() => setShowDeclarationVersement(null)}
          onConfirm={() => { void actualiserTontine(); setShowDeclarationVersement(null); showToast("Versement déclaré"); }}
          onContester={() => undefined}
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
