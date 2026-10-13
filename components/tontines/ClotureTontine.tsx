"use client";

import { useCallback, useEffect, useState } from "react";
import { Archive, Check, LockKeyhole, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EtatChargement, EtatErreur } from "@/components/EtatsUI";
import { useRafraichissementActif } from "@/hooks/useRafraichissementActif";
import { appelApi } from "@/lib/api-client";
import { formaterDate, formaterMontant } from "@/lib/format";

type Condition = { cle: string; libelle: string; remplie: boolean; detail: string };
type Montant = string | number;
type EtatCloture = {
  statut: "ACTIVE" | "TERMINEE" | "ARCHIVEE" | string;
  termineeLe: string | null;
  archiveeLe: string | null;
  estCreateur: boolean;
  peutCloturer: boolean;
  peutArchiver: boolean;
  conditions: Condition[];
  blocages: { cotisationsNonReglees: number; reversementsNonConfirmes: number; contestationsOuvertes: number; operationsSynchronisationEnAttente: number };
  totaux: { montantCotisationsAttendu: Montant; montantCotisationsConfirme: Montant; montantPenalitesAppliquees: Montant; montantReversementsConfirmes: Montant; nombreRotations: number };
  monResultat: { cotisationsAttendues: Montant; cotisationsConfirmees: Montant; penalitesHistoriques: Montant; reversementsRecus: Montant; nombreCotisations: number; nombreRotationsBeneficiees: number };
  rapport: { id: string; clotureeLe: string; montantCotisationsAttendu: Montant; montantCotisationsConfirme: Montant; montantPenalitesAppliquees: Montant; montantReversementsConfirmes: Montant; nombreRotations: number; donnees: { rotations?: Array<{ numero: number; montantTheorique: Montant; montantCotisationsConfirme: Montant; montantReversementsConfirmes: Montant; termineeLe: string | null }> } } | null;
};

const nombre = (montant: Montant) => Number(montant);

export function ClotureTontine({ tontineId, onActualiser, versCotisations, versReversements }: { tontineId: string; onActualiser: () => Promise<void>; versCotisations: () => void; versReversements: () => void }) {
  const [etat, setEtat] = useState<EtatCloture | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [confirmationOuverte, setConfirmationOuverte] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  const charger = useCallback(async (silencieux = false) => {
    if (!silencieux) setChargement(true);
    try {
      setEtat(await appelApi<EtatCloture>(`/api/tontines/${tontineId}/cloture`));
      setErreur("");
    } catch (cause) {
      if (!silencieux) setErreur(cause instanceof Error ? cause.message : "Impossible de charger la clôture.");
    } finally {
      if (!silencieux) setChargement(false);
    }
  }, [tontineId]);

  useEffect(() => { void charger(); }, [charger]);
  useRafraichissementActif(() => charger(true));

  const cloturer = async () => {
    setEnvoi(true);
    setErreur("");
    try {
      await appelApi(`/api/tontines/${tontineId}/cloture`, { method: "POST", body: JSON.stringify({ confirmation: true }) });
      setConfirmationOuverte(false);
      await Promise.all([charger(true), onActualiser()]);
    } catch (cause) {
      setErreur(cause instanceof Error ? cause.message : "Impossible de clôturer la tontine.");
    } finally {
      setEnvoi(false);
    }
  };

  const archiver = async () => {
    setEnvoi(true);
    setErreur("");
    try {
      await appelApi(`/api/tontines/${tontineId}/archiver`, { method: "POST" });
      await Promise.all([charger(true), onActualiser()]);
    } catch (cause) {
      setErreur(cause instanceof Error ? cause.message : "Impossible d'archiver la tontine.");
    } finally {
      setEnvoi(false);
    }
  };

  if (chargement) return <EtatChargement message="Chargement de la clôture..." />;
  if (!etat) return <EtatErreur message={erreur || "Clôture indisponible."} onReessayer={() => void charger()} />;

  const cloturee = etat.statut === "TERMINEE" || etat.statut === "ARCHIVEE";
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border bg-white p-5">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-[#20392d]">{cloturee ? <Check size={18} className="text-[#237e56]" /> : <LockKeyhole size={18} className="text-[#9b6500]" />}{cloturee ? "Tontine clôturée" : "Clôture"}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{cloturee ? "Historique et rapport disponibles en lecture seule." : "Le serveur vérifie toutes les conditions financières avant clôture."}</p>
          {etat.termineeLe && <p className="mt-2 text-xs text-muted-foreground">Clôturée le {formaterDate(etat.termineeLe)}.</p>}
          {etat.archiveeLe && <p className="mt-1 text-xs text-muted-foreground">Archivée le {formaterDate(etat.archiveeLe)}.</p>}
        </div>
        <Button variant="outline" onClick={() => void charger()} disabled={envoi} className="border-[#c5dcc9] text-[#237e56]"><RefreshCw size={15} /> Actualiser</Button>
      </div>

      {erreur && <p role="alert" className="rounded-xl bg-[#fdebea] p-3 text-sm text-[#a53d39]">{erreur}</p>}

      <section className="rounded-2xl border bg-white p-5">
        <h4 className="font-semibold text-[#20392d]">État d&apos;avancement</h4>
        <div className="mt-4 space-y-2">
          {etat.conditions.map((condition) => <div key={condition.cle} className={`rounded-xl p-3 text-sm ${condition.remplie ? "bg-[#f1f9f2] text-[#28583c]" : "bg-[#fff3d8] text-[#8a6300]"}`}><div className="flex gap-2"><span>{condition.remplie ? <Check size={16} /> : <X size={16} />}</span><div><p className="font-medium">{condition.libelle}</p><p className="mt-1 text-xs opacity-90">{condition.detail}</p></div></div></div>)}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5">
        <h4 className="font-semibold text-[#20392d]">Rapport financier</h4>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Montant libelle="Cotisations attendues" valeur={etat.totaux.montantCotisationsAttendu} />
          <Montant libelle="Cotisations confirmées" valeur={etat.totaux.montantCotisationsConfirme} />
          <Montant libelle="Pénalités historiques" valeur={etat.totaux.montantPenalitesAppliquees} />
          <Montant libelle="Reversements confirmés" valeur={etat.totaux.montantReversementsConfirmes} />
          <Valeur libelle="Rotations" valeur={etat.totaux.nombreRotations} />
        </div>
        {etat.rapport && <div className="mt-4 space-y-2"><p className="rounded-xl bg-[#f1f9f2] p-3 text-sm text-[#28583c]">Rapport de clôture enregistré le {formaterDate(etat.rapport.clotureeLe)}. Il conserve les totaux et rotations calculés lors de la clôture.</p>{etat.rapport.donnees.rotations?.map((rotation) => <div key={rotation.numero} className="grid gap-2 rounded-xl bg-[#f8faf6] p-3 text-xs sm:grid-cols-4"><span>Tour {rotation.numero}</span><span>Attendu : {formaterMontant(nombre(rotation.montantTheorique))}</span><span>Cotisé : {formaterMontant(nombre(rotation.montantCotisationsConfirme))}</span><span>Reçu : {formaterMontant(nombre(rotation.montantReversementsConfirmes))}</span></div>)}</div>}
      </section>

      <section className="rounded-2xl border bg-white p-5">
        <h4 className="font-semibold text-[#20392d]">Votre participation</h4>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Montant libelle="Cotisations confirmées" valeur={etat.monResultat.cotisationsConfirmees} /><Montant libelle="Reversements reçus" valeur={etat.monResultat.reversementsRecus} /><Montant libelle="Pénalités historiques" valeur={etat.monResultat.penalitesHistoriques} /><Valeur libelle="Tours bénéficiaire" valeur={etat.monResultat.nombreRotationsBeneficiees} /></div>
        <div className="mt-4 flex flex-wrap gap-2"><Button variant="outline" onClick={versCotisations}>Mes cotisations</Button><Button variant="outline" onClick={versReversements}>Mes reversements</Button></div>
      </section>

      {etat.estCreateur && !cloturee && <section className="rounded-2xl border border-[#d4eadb] bg-[#f1f9f2] p-5"><h4 className="font-semibold text-[#28583c]">Action du créateur</h4><p className="mt-1 text-sm text-[#405247]">La clôture est irréversible et ne modifie aucun historique financier.</p><Button disabled={!etat.peutCloturer || envoi} onClick={() => setConfirmationOuverte(true)} className="mt-4 bg-[#237e56] hover:bg-[#1c6847]">Clôturer la tontine</Button>{!etat.peutCloturer && <p className="mt-2 text-xs text-[#8a6300]">Corrigez toutes les conditions bloquantes avant clôture.</p>}</section>}
      {etat.estCreateur && etat.peutArchiver && <section className="rounded-2xl border bg-white p-5"><h4 className="font-semibold text-[#20392d]">Archivage</h4><p className="mt-1 text-sm text-muted-foreground">L&apos;archive conserve le rapport et tout historique en lecture seule.</p><Button disabled={envoi} onClick={() => void archiver()} variant="outline" className="mt-4 border-[#c5dcc9] text-[#237e56]"><Archive size={15} /> Archiver la tontine</Button></section>}

      <Dialog open={confirmationOuverte} onOpenChange={(ouvert) => { if (!envoi) setConfirmationOuverte(ouvert); }}>
        <DialogContent className="rounded-2xl bg-[#fffefa]"><DialogHeader><DialogTitle>Clôturer cette tontine ?</DialogTitle><DialogDescription>Cette opération verrouille définitivement les opérations financières. Les montants, confirmations, contestations et justificatifs existants restent inchangés.</DialogDescription></DialogHeader><div className="rounded-xl bg-[#f8faf6] p-3 text-sm">{etat.totaux.nombreRotations} rotation(s), {formaterMontant(nombre(etat.totaux.montantCotisationsConfirme))} de cotisations confirmées et {formaterMontant(nombre(etat.totaux.montantReversementsConfirmes))} de reversements confirmés seront consignés dans le rapport.</div><DialogFooter><Button disabled={envoi} variant="outline" onClick={() => setConfirmationOuverte(false)}>Annuler</Button><Button disabled={envoi} onClick={() => void cloturer()} className="bg-[#237e56] hover:bg-[#1c6847]">{envoi ? "Clôture..." : "Confirmer la clôture"}</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}

function Montant({ libelle, valeur }: { libelle: string; valeur: Montant }) { return <div className="rounded-xl bg-[#f8faf6] p-3"><p className="text-xs text-muted-foreground">{libelle}</p><p className="mt-1 font-semibold text-[#294237]">{formaterMontant(nombre(valeur))}</p></div>; }
function Valeur({ libelle, valeur }: { libelle: string; valeur: number }) { return <div className="rounded-xl bg-[#f8faf6] p-3"><p className="text-xs text-muted-foreground">{libelle}</p><p className="mt-1 font-semibold text-[#294237]">{valeur}</p></div>; }
