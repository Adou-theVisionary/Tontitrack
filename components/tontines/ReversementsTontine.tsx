"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, CreditCard, FileImage, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EtatChargement, EtatErreur } from "@/components/EtatsUI";
import { useRafraichissementActif } from "@/hooks/useRafraichissementActif";
import { appelApi } from "@/lib/api-client";
import { formaterDateCourte, formaterMontant } from "@/lib/format";

type Preuve = { id: string; fichier: { nom: string; typeMime: string; tailleOctets: number } };
type Confirmation = { id: string; statut: "EN_ATTENTE" | "CONFIRMEE" | "NON_RECUE"; montantConfirme: string | number; motifContestation: string | null; observation: string | null; confirmeLe: string | null };
type Evenement = { id: string; type: string; creeLe: string; acteurNom: string | null };
type Reversement = { id: string; montant: string | number; montantConfirme: string | number; verseLe: string; statut: "DECLARE" | "CONFIRME" | "CONTESTE"; motifContestation: string | null; referenceVersement: string | null; moyenVersement: string | null; observation: string | null; preuves: Preuve[]; confirmation: Confirmation | null; historique: Evenement[] };
type Rotation = { id: string; numero: number; statut: string; beneficiaireNom: string; montantAttendu: string | number; montantDisponible: string | number; montantDeclare: string | number; montantConfirme: string | number; montantRestantAReverser: string | number; montantRestantAConfirmer: string | number; attenteConfirmation: number; contestations: number; etatCollectif: "A_DECLARER" | "EN_ATTENTE_CONFIRMATION" | "CONFIRME" | "CONTESTE"; peutDeclarer: boolean; peutConfirmer: boolean; reversements: Reversement[] };
type FormulaireDeclaration = { montant: string; verseLe: string; moyenVersement: string; referenceVersement: string; observation: string };
type FormulaireDecision = { montantConfirme: string; observation: string; motifContestation: string };

const formulaireDeclarationInitial = (): FormulaireDeclaration => ({ montant: "", verseLe: new Date().toISOString().slice(0, 10), moyenVersement: "", referenceVersement: "", observation: "" });
const formulaireDecisionInitial = (montant = ""): FormulaireDecision => ({ montantConfirme: montant, observation: "", motifContestation: "" });
const nombre = (montant: string | number) => Number(montant);
const libelleEtat = (etat: Rotation["etatCollectif"]) => ({ A_DECLARER: "À reverser", EN_ATTENTE_CONFIRMATION: "En attente de confirmation", CONFIRME: "Réception confirmée", CONTESTE: "Contestation en cours" })[etat];

export function ReversementsTontine({ tontineId }: { tontineId: string }) {
  const [rotations, setRotations] = useState<Rotation[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [selectionDeclaration, setSelectionDeclaration] = useState<Rotation | null>(null);
  const [selectionDecision, setSelectionDecision] = useState<{ rotation: Rotation; reversement: Reversement } | null>(null);
  const [formulaireDeclaration, setFormulaireDeclaration] = useState<FormulaireDeclaration>(formulaireDeclarationInitial);
  const [formulaireDecision, setFormulaireDecision] = useState<FormulaireDecision>(formulaireDecisionInitial);
  const [preuve, setPreuve] = useState<File | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [cleDeclaration, setCleDeclaration] = useState("");
  const [cleDecision, setCleDecision] = useState("");

  const charger = useCallback(async (silencieux = false) => {
    if (!silencieux) setChargement(true);
    try {
      setRotations(await appelApi<Rotation[]>(`/api/tontines/${tontineId}/reversements`));
      setErreur("");
    } catch (cause) {
      if (!silencieux) setErreur(cause instanceof Error ? cause.message : "Impossible de charger les reversements.");
    } finally {
      if (!silencieux) setChargement(false);
    }
  }, [tontineId]);

  useEffect(() => { void charger(); }, [charger]);
  useRafraichissementActif(() => charger(true));

  const fermerDeclaration = () => {
    if (envoi) return;
    setSelectionDeclaration(null);
    setFormulaireDeclaration(formulaireDeclarationInitial());
    setPreuve(null);
    setCleDeclaration("");
  };
  const fermerDecision = () => {
    if (envoi) return;
    setSelectionDecision(null);
    setFormulaireDecision(formulaireDecisionInitial());
    setCleDecision("");
  };
  const ouvrirDeclaration = (rotation: Rotation) => {
    setSelectionDeclaration(rotation);
    setFormulaireDeclaration(formulaireDeclarationInitial());
    setPreuve(null);
    setCleDeclaration(crypto.randomUUID());
  };
  const ouvrirDecision = (rotation: Rotation, reversement: Reversement) => {
    setSelectionDecision({ rotation, reversement });
    setFormulaireDecision(formulaireDecisionInitial(String(reversement.montant)));
    setCleDecision(crypto.randomUUID());
  };

  const declarer = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectionDeclaration || envoi) return;
    setEnvoi(true);
    setErreur("");
    try {
      const chemin = `/api/tontines/${tontineId}/reversements/${selectionDeclaration.id}/declarations`;
      const corps = preuve
        ? (() => {
            const data = new FormData();
            data.set("montant", formulaireDeclaration.montant);
            data.set("verseLe", formulaireDeclaration.verseLe);
            data.set("moyenVersement", formulaireDeclaration.moyenVersement);
            data.set("referenceVersement", formulaireDeclaration.referenceVersement);
            data.set("observation", formulaireDeclaration.observation);
            data.set("preuve", preuve);
            return data;
          })()
        : JSON.stringify({ ...formulaireDeclaration, moyenVersement: formulaireDeclaration.moyenVersement || undefined, referenceVersement: formulaireDeclaration.referenceVersement || undefined, observation: formulaireDeclaration.observation || undefined });
      await appelApi(chemin, { method: "POST", body: corps, headers: { "Idempotency-Key": cleDeclaration } });
      setSelectionDeclaration(null);
      setFormulaireDeclaration(formulaireDeclarationInitial());
      setPreuve(null);
      setCleDeclaration("");
      await charger(true);
    } catch (cause) {
      setErreur(cause instanceof Error ? cause.message : "Impossible d'enregistrer le reversement.");
    } finally {
      setEnvoi(false);
    }
  };

  const decider = async (decision: "CONFIRMER" | "CONTESTER") => {
    if (!selectionDecision || envoi) return;
    setEnvoi(true);
    setErreur("");
    try {
      const donnees = decision === "CONFIRMER"
        ? { decision, montantConfirme: formulaireDecision.montantConfirme, observation: formulaireDecision.observation || undefined }
        : { decision, motifContestation: formulaireDecision.motifContestation, observation: formulaireDecision.observation || undefined };
      await appelApi(`/api/tontines/${tontineId}/reversements/declarations/${selectionDecision.reversement.id}`, { method: "PATCH", body: JSON.stringify(donnees), headers: { "Idempotency-Key": cleDecision } });
      setSelectionDecision(null);
      setFormulaireDecision(formulaireDecisionInitial());
      setCleDecision("");
      await charger(true);
    } catch (cause) {
      setErreur(cause instanceof Error ? cause.message : "Impossible de traiter le reversement.");
    } finally {
      setEnvoi(false);
    }
  };

  if (chargement) return <EtatChargement message="Chargement des reversements..." />;
  if (erreur && rotations.length === 0) return <EtatErreur message={erreur} onReessayer={() => void charger()} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-[#20392d]">Reversements</h3>
          <p className="mt-1 text-sm text-muted-foreground">Transferts externes déclarés, confirmés ou contestés par le bénéficiaire.</p>
        </div>
        <Button variant="outline" onClick={() => void charger()} className="border-[#c5dcc9] text-[#237e56]"><RefreshCw size={15} /> Actualiser</Button>
      </div>
      {erreur && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{erreur}</p>}
      {rotations.length === 0 ? (
        <p className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">Aucune rotation ne permet encore de suivre un reversement.</p>
      ) : rotations.map((rotation) => (
        <article key={rotation.id} className="rounded-2xl border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-[#20392d]">Tour {rotation.numero} · {rotation.beneficiaireNom}</p>
              <p className="mt-1 text-sm text-muted-foreground">{libelleEtat(rotation.etatCollectif)} · Rotation {rotation.statut.toLowerCase().replaceAll("_", " ")}</p>
            </div>
            {rotation.peutDeclarer && <Button onClick={() => ouvrirDeclaration(rotation)} className="bg-[#237e56] hover:bg-[#1c6847]"><CreditCard size={15} /> Déclarer un reversement</Button>}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Montant libelle="Attendu" valeur={rotation.montantAttendu} />
            <Montant libelle="Collecté confirmé" valeur={rotation.montantDisponible} />
            <Montant libelle="Déclaré" valeur={rotation.montantDeclare} />
            <Montant libelle="Reçu confirmé" valeur={rotation.montantConfirme} />
            <Montant libelle="Reste à reverser" valeur={rotation.montantRestantAReverser} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{rotation.attenteConfirmation} en attente de confirmation · {rotation.contestations} contestation(s) · {formaterMontant(nombre(rotation.montantRestantAConfirmer))} à confirmer.</p>
          {rotation.reversements.map((reversement) => (
            <div key={reversement.id} className="mt-4 rounded-xl bg-surface-subtle p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-[#294237]">{formaterMontant(nombre(reversement.montant))} · {reversement.statut}</span>
                <span className="text-xs text-muted-foreground">Déclaré le {formaterDateCourte(reversement.verseLe)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Reçu confirmé : {formaterMontant(nombre(reversement.montantConfirme))}</p>
              {reversement.motifContestation && <p className="mt-2 text-xs text-[#a53d39]">Contestation : {reversement.motifContestation}</p>}
              {reversement.preuves.map((preuveJointe) => <button key={preuveJointe.id} type="button" onClick={() => window.open(`/api/tontines/${tontineId}/reversements/declarations/${reversement.id}/preuves/${preuveJointe.id}`, "_blank", "noopener,noreferrer")} className="mt-2 flex items-center gap-1 text-xs font-medium text-[#237e56] hover:underline"><FileImage size={14} /> Voir le justificatif</button>)}
              {rotation.peutConfirmer && reversement.statut === "DECLARE" && <Button variant="outline" onClick={() => ouvrirDecision(rotation, reversement)} className="mt-3 border-[#c5dcc9] text-[#237e56]"><Check size={15} /> Confirmer ou contester</Button>}
              {reversement.historique.length > 0 && <p className="mt-3 text-xs text-muted-foreground">Historique : {reversement.historique.map((evenement) => evenement.type.replaceAll("_", " ")).join(" · ")}</p>}
            </div>
          ))}
        </article>
      ))}

      <Dialog open={Boolean(selectionDeclaration)} onOpenChange={(ouvert) => { if (!ouvert) fermerDeclaration(); }}>
        <DialogContent className="rounded-2xl sm:max-w-xl">
          <DialogHeader><DialogTitle>Déclarer un reversement</DialogTitle><DialogDescription>Le transfert est externe. Sa réception reste à confirmer par le bénéficiaire.</DialogDescription></DialogHeader>
          {selectionDeclaration && <form onSubmit={declarer} className="grid gap-3 sm:grid-cols-2">
            <p className="rounded-xl bg-surface-subtle p-3 text-sm sm:col-span-2">Disponible : <b>{formaterMontant(nombre(selectionDeclaration.montantRestantAReverser))}</b>. Les montants suivent les cotisations déjà confirmées.</p>
            <input required type="number" min="0.01" step="0.01" max={nombre(selectionDeclaration.montantRestantAReverser)} value={formulaireDeclaration.montant} onChange={(event) => setFormulaireDeclaration({ ...formulaireDeclaration, montant: event.target.value })} placeholder="Montant" className="h-11 rounded-xl border px-3" />
            <input required type="date" max={new Date().toISOString().slice(0, 10)} value={formulaireDeclaration.verseLe} onChange={(event) => setFormulaireDeclaration({ ...formulaireDeclaration, verseLe: event.target.value })} className="h-11 rounded-xl border px-3" />
            <input value={formulaireDeclaration.moyenVersement} onChange={(event) => setFormulaireDeclaration({ ...formulaireDeclaration, moyenVersement: event.target.value })} placeholder="Moyen de transfert" className="h-11 rounded-xl border px-3" />
            <input value={formulaireDeclaration.referenceVersement} onChange={(event) => setFormulaireDeclaration({ ...formulaireDeclaration, referenceVersement: event.target.value })} placeholder="Référence facultative" className="h-11 rounded-xl border px-3" />
            <textarea value={formulaireDeclaration.observation} onChange={(event) => setFormulaireDeclaration({ ...formulaireDeclaration, observation: event.target.value })} placeholder="Observation facultative" rows={3} className="rounded-xl border p-3 sm:col-span-2" />
            <label className="sm:col-span-2"><span className="mb-1 block text-xs text-muted-foreground">Justificatif facultatif — JPG, PNG ou WebP, 5 Mo maximum</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setPreuve(event.target.files?.[0] ?? null)} className="block w-full text-sm" /></label>
            <DialogFooter className="sm:col-span-2"><Button disabled={envoi} type="button" variant="outline" onClick={fermerDeclaration}>Annuler</Button><Button disabled={envoi} type="submit" className="bg-[#237e56] hover:bg-[#1c6847]">{envoi ? "Envoi..." : "Déclarer"}</Button></DialogFooter>
          </form>}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectionDecision)} onOpenChange={(ouvert) => { if (!ouvert) fermerDecision(); }}>
        <DialogContent className="rounded-2xl sm:max-w-xl">
          <DialogHeader><DialogTitle>Confirmer la réception</DialogTitle><DialogDescription>Confirmez seulement le montant reçu hors de TontiTrack. Une contestation ne vaut jamais confirmation.</DialogDescription></DialogHeader>
          {selectionDecision && <div className="space-y-3">
            <p className="rounded-xl bg-surface-subtle p-3 text-sm">Reversement déclaré : <b>{formaterMontant(nombre(selectionDecision.reversement.montant))}</b>.</p>
            <label className="block text-sm">Montant réellement reçu<input required type="number" min="0.01" step="0.01" max={nombre(selectionDecision.reversement.montant)} value={formulaireDecision.montantConfirme} onChange={(event) => setFormulaireDecision({ ...formulaireDecision, montantConfirme: event.target.value })} className="mt-1 h-11 w-full rounded-xl border px-3" /></label>
            <textarea value={formulaireDecision.observation} onChange={(event) => setFormulaireDecision({ ...formulaireDecision, observation: event.target.value })} placeholder="Observation facultative" rows={2} className="w-full rounded-xl border p-3 text-sm" />
            <textarea value={formulaireDecision.motifContestation} onChange={(event) => setFormulaireDecision({ ...formulaireDecision, motifContestation: event.target.value })} placeholder="Motif obligatoire si vous contestez" rows={2} className="w-full rounded-xl border p-3 text-sm" />
            <DialogFooter><Button disabled={envoi} type="button" variant="outline" onClick={fermerDecision}>Annuler</Button><Button disabled={envoi || formulaireDecision.motifContestation.trim().length < 3} onClick={() => void decider("CONTESTER")} variant="outline" className="text-[#a53d39]"><X size={15} /> Contester</Button><Button disabled={envoi} onClick={() => void decider("CONFIRMER")} className="bg-[#237e56] hover:bg-[#1c6847]"><Check size={15} /> Confirmer réception</Button></DialogFooter>
          </div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Montant({ libelle, valeur }: { libelle: string; valeur: string | number }) {
  return <div className="rounded-xl bg-[#f8faf6] p-3"><p className="text-xs text-muted-foreground">{libelle}</p><p className="mt-1 font-semibold text-[#294237]">{formaterMontant(nombre(valeur))}</p></div>;
}
