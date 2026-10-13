"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Check, CreditCard, FileImage, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EtatChargement, EtatErreur } from "@/components/EtatsUI";
import { useApp } from "@/contexts/AppContext";
import { useRafraichissementActif } from "@/hooks/useRafraichissementActif";
import { appelApi } from "@/lib/api-client";
import { formaterDateCourte, formaterMontant } from "@/lib/format";

type Preuve = { id: string; fichier: { nom: string; typeMime: string; tailleOctets: number } };
type Declaration = { id: string; montant: string | number; verseLe: string; referenceVersement: string | null; moyenVersement: string | null; statut: "EN_ATTENTE_VALIDATION" | "VALIDEE" | "REJETEE"; motifRejet: string | null; observationDecision: string | null; preuves: Preuve[] };
type Cotisation = { id: string; montantAttendu: string | number; montantDeclare: string | number; montantValide: string | number; echeanceLe: string; statut: "A_PAYER" | "PARTIEL" | "PAYEE" | "EN_RETARD" | "NON_CONCERNE"; penaliteAppliqueeMontant: string | number; penaliteAppliqueeLe: string | null; rotation: { id: string; numero: number; statut: string }; membre: { id: string; utilisateurId: string; utilisateur: { profil: { prenom: string; nom: string } | null } }; declarations: Declaration[] };
type Formulaire = { montant: string; verseLe: string; referenceVersement: string; moyenVersement: string };

const initial = (): Formulaire => ({ montant: "", verseLe: new Date().toISOString().slice(0, 10), referenceVersement: "", moyenVersement: "" });
const libelle = (statut: Cotisation["statut"]) => ({ A_PAYER: "À payer", PARTIEL: "Partiel", PAYEE: "Confirmée", EN_RETARD: "En retard", NON_CONCERNE: "Non concerné" })[statut];

export function CotisationsTontine({ tontineId, estCreateur }: { tontineId: string; estCreateur: boolean }) {
  const { utilisateur } = useApp();
  const [cotisations, setCotisations] = useState<Cotisation[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [selection, setSelection] = useState<Cotisation | null>(null);
  const [decision, setDecision] = useState<{ cotisation: Cotisation; declaration: Declaration } | null>(null);
  const [formulaire, setFormulaire] = useState<Formulaire>(initial);
  const [preuve, setPreuve] = useState<File | null>(null);
  const [apercu, setApercu] = useState("");
  const [motif, setMotif] = useState("");
  const [observation, setObservation] = useState("");
  const [envoi, setEnvoi] = useState(false);

  const charger = useCallback(async (silencieux = false) => {
    if (!silencieux) setChargement(true);
    try { setCotisations(await appelApi<Cotisation[]>(`/api/tontines/${tontineId}/cotisations`)); setErreur(""); }
    catch (cause) { if (!silencieux) setErreur(cause instanceof Error ? cause.message : "Impossible de charger les cotisations."); }
    finally { if (!silencieux) setChargement(false); }
  }, [tontineId]);

  useEffect(() => { void charger(); }, [charger]);
  useRafraichissementActif(() => charger(true));
  useEffect(() => {
    if (!preuve) { setApercu(""); return; }
    const url = URL.createObjectURL(preuve); setApercu(url);
    return () => URL.revokeObjectURL(url);
  }, [preuve]);

  const fermer = () => { if (!envoi) { setSelection(null); setPreuve(null); setFormulaire(initial()); } };
  const declarer = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selection) return;
    setEnvoi(true); setErreur("");
    try {
      const chemin = `/api/tontines/${tontineId}/cotisations/${selection.id}/declarations`;
      const corps = preuve ? (() => { const data = new FormData(); data.set("montant", formulaire.montant); data.set("verseLe", formulaire.verseLe); data.set("referenceVersement", formulaire.referenceVersement); data.set("moyenVersement", formulaire.moyenVersement); data.set("preuve", preuve); return data; })() : JSON.stringify({ ...formulaire, referenceVersement: formulaire.referenceVersement || undefined, moyenVersement: formulaire.moyenVersement || undefined });
      await appelApi(chemin, { method: "POST", body: corps });
      setSelection(null); setPreuve(null); setFormulaire(initial()); await charger(true);
    } catch (cause) { setErreur(cause instanceof Error ? cause.message : "Impossible d'enregistrer la déclaration."); }
    finally { setEnvoi(false); }
  };
  const decider = async (choix: "CONFIRMER" | "REJETER") => {
    if (!decision) return;
    setEnvoi(true); setErreur("");
    try {
      await appelApi(`/api/tontines/${tontineId}/cotisations/declarations/${decision.declaration.id}`, { method: "PATCH", body: JSON.stringify({ decision: choix, motifRejet: choix === "REJETER" ? motif : undefined, observation: observation || undefined }) });
      setDecision(null); setMotif(""); setObservation(""); await charger(true);
    } catch (cause) { setErreur(cause instanceof Error ? cause.message : "Impossible de traiter la déclaration."); }
    finally { setEnvoi(false); }
  };

  if (chargement) return <EtatChargement message="Chargement des cotisations..." />;
  if (erreur && !cotisations.length) return <EtatErreur message={erreur} onReessayer={() => void charger()} />;
  if (!cotisations.length) return <div className="rounded-2xl border bg-white p-8 text-center"><CreditCard size={32} className="mx-auto text-[#9bc8aa]" /><p className="mt-3 text-sm font-medium text-[#405247]">Aucune cotisation disponible.</p></div>;

  return <div className="space-y-4">
    <div className="flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Déclaré et confirmé restent distincts.</p><Button variant="outline" onClick={() => void charger()} className="text-xs"><RefreshCw size={14} /> Actualiser</Button></div>
    {erreur && <p role="alert" className="rounded-xl bg-[#fdebea] p-3 text-sm text-[#a53d39]">{erreur}</p>}
    {cotisations.map((cotisation) => {
      const attendu = Number(cotisation.montantAttendu); const confirme = Number(cotisation.montantValide); const reste = Math.max(0, attendu - confirme);
      const nom = [cotisation.membre.utilisateur.profil?.prenom, cotisation.membre.utilisateur.profil?.nom].filter(Boolean).join(" ") || "Membre";
      const maCotisation = cotisation.membre.utilisateurId === utilisateur?.id;
      return <article key={cotisation.id} className="rounded-2xl border bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold text-[#20392d]">Tour {cotisation.rotation.numero} · {nom}</p><p className="mt-1 text-xs text-muted-foreground">Échéance : {formaterDateCourte(cotisation.echeanceLe)}</p></div><span className="rounded-full bg-[#f8faf6] px-2.5 py-1 text-xs font-medium text-[#405247]">{libelle(cotisation.statut)}</span></div>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-4"><p>Attendu <b>{formaterMontant(attendu)}</b></p><p>Déclaré <b>{formaterMontant(Number(cotisation.montantDeclare))}</b></p><p>Confirmé <b>{formaterMontant(confirme)}</b></p><p>Reste <b>{formaterMontant(reste)}</b></p></div>
        {cotisation.penaliteAppliqueeLe && <p className="mt-3 rounded-lg bg-[#fff3d8] p-2 text-xs text-[#8a6300]">Pénalité distincte : {formaterMontant(Number(cotisation.penaliteAppliqueeMontant))}.</p>}
        {maCotisation && reste > 0 && cotisation.statut !== "NON_CONCERNE" && <Button onClick={() => setSelection(cotisation)} className="mt-4 bg-[#237e56] hover:bg-[#1c6847]"><CreditCard size={15} /> Déclarer un paiement</Button>}
        <div className="mt-4 space-y-2 border-t pt-3">{cotisation.declarations.map((declaration) => <div key={declaration.id} className="rounded-lg bg-[#f8faf6] p-3 text-xs"><div className="flex justify-between gap-2"><span>{formaterMontant(Number(declaration.montant))} · {formaterDateCourte(declaration.verseLe)}</span><b>{declaration.statut}</b></div>{(declaration.referenceVersement || declaration.moyenVersement) && <p className="mt-1 text-muted-foreground">{declaration.moyenVersement || "Versement externe"}{declaration.referenceVersement ? ` · ${declaration.referenceVersement}` : ""}</p>}{declaration.preuves.map((item) => <button key={item.id} type="button" onClick={() => window.open(`/api/tontines/${tontineId}/cotisations/${cotisation.id}/declarations/${declaration.id}/preuves/${item.id}`, "_blank", "noopener,noreferrer")} className="mt-2 flex items-center gap-1 font-medium text-[#237e56] hover:underline"><FileImage size={14} /> Voir le justificatif</button>)}{declaration.motifRejet && <p className="mt-1 text-[#a53d39]">Motif : {declaration.motifRejet}</p>}{estCreateur && declaration.statut === "EN_ATTENTE_VALIDATION" && <Button onClick={() => setDecision({ cotisation, declaration })} variant="outline" className="mt-3 border-[#c5dcc9] text-[#237e56]"><Check size={14} /> Examiner</Button>}</div>)}</div>
      </article>;
    })}
    <Dialog open={Boolean(selection)} onOpenChange={(ouvert) => { if (!ouvert) fermer(); }}><DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl bg-[#fffefa] sm:max-w-xl"><DialogHeader><DialogTitle>Déclarer un versement externe</DialogTitle><DialogDescription>La déclaration est comptée seulement après confirmation du créateur.</DialogDescription></DialogHeader><form onSubmit={declarer} className="grid gap-3 sm:grid-cols-2"><input required type="number" min="0.01" step="0.01" value={formulaire.montant} onChange={(event) => setFormulaire({ ...formulaire, montant: event.target.value })} placeholder="Montant" className="h-11 rounded-xl border px-3" /><input required type="date" max={new Date().toISOString().slice(0, 10)} value={formulaire.verseLe} onChange={(event) => setFormulaire({ ...formulaire, verseLe: event.target.value })} className="h-11 rounded-xl border px-3" /><input value={formulaire.referenceVersement} onChange={(event) => setFormulaire({ ...formulaire, referenceVersement: event.target.value })} placeholder="Référence facultative" className="h-11 rounded-xl border px-3" /><input value={formulaire.moyenVersement} onChange={(event) => setFormulaire({ ...formulaire, moyenVersement: event.target.value })} placeholder="Moyen facultatif" className="h-11 rounded-xl border px-3" /><label className="sm:col-span-2"><span className="mb-1 block text-xs text-muted-foreground">Justificatif facultatif — JPG, PNG ou WebP, 5 Mo maximum</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setPreuve(event.target.files?.[0] ?? null)} className="block w-full text-sm" /></label>{apercu && <div className="relative h-40 overflow-hidden rounded-xl border sm:col-span-2"><Image src={apercu} alt="Prévisualisation du justificatif" fill unoptimized className="object-contain" /></div>}<DialogFooter className="sm:col-span-2"><Button disabled={envoi} type="button" variant="outline" onClick={fermer}>Annuler</Button><Button disabled={envoi} type="submit" className="bg-[#237e56] hover:bg-[#1c6847]">{envoi ? "Envoi..." : "Envoyer la déclaration"}</Button></DialogFooter></form></DialogContent></Dialog>
    <Dialog open={Boolean(decision)} onOpenChange={(ouvert) => { if (!ouvert && !envoi) setDecision(null); }}><DialogContent className="rounded-2xl bg-[#fffefa]"><DialogHeader><DialogTitle>Décider de la réception</DialogTitle><DialogDescription>Seule une confirmation augmente le montant confirmé.</DialogDescription></DialogHeader><textarea value={observation} onChange={(event) => setObservation(event.target.value)} placeholder="Observation facultative" className="w-full rounded-xl border p-3 text-sm" rows={2} /><textarea value={motif} onChange={(event) => setMotif(event.target.value)} placeholder="Motif obligatoire en cas de rejet" className="w-full rounded-xl border p-3 text-sm" rows={2} /><DialogFooter><Button disabled={envoi} variant="outline" onClick={() => setDecision(null)}>Annuler</Button><Button disabled={envoi} onClick={() => void decider("REJETER")} variant="outline" className="text-[#a53d39]"><X size={15} /> Rejeter</Button><Button disabled={envoi} onClick={() => void decider("CONFIRMER")} className="bg-[#237e56] hover:bg-[#1c6847]"><Check size={15} /> Confirmer</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}
