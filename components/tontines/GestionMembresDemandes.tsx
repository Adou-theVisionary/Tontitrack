"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { appelApi } from "@/lib/api-client";
import { useRafraichissementActif } from "@/hooks/useRafraichissementActif";

type MembreApi = { id: string; role: "CREATEUR" | "MEMBRE"; statut: string; rejointLe: string; utilisateur: { profil: { prenom: string; nom: string } | null } };
type DemandeApi = { id: string; statut: "EN_ATTENTE" | "APPROUVEE" | "REFUSEE" | "ANNULEE"; motif: string | null; creeLe: string; decideLe: string | null; demandeur: { profil: { prenom: string; nom: string } | null } };

export function GestionMembresDemandes({ tontineId, estCreateur, onActualiser }: { tontineId: string; estCreateur: boolean; onActualiser?: () => Promise<void> }) {
  const [membres, setMembres] = useState<MembreApi[]>([]);
  const [demandes, setDemandes] = useState<DemandeApi[]>([]);
  const [chargement, setChargement] = useState(true);
  const [mutation, setMutation] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const charger = useCallback(async (silencieux = false) => {
    if (!silencieux) { setChargement(true); setMessage(""); }
    try {
      const membresCharges = await appelApi<MembreApi[]>(`/api/tontines/${tontineId}/membres`);
      setMembres(membresCharges);
      setDemandes(estCreateur ? await appelApi<DemandeApi[]>(`/api/tontines/${tontineId}/demandes`) : []);
    } catch (erreur) {
      if (!silencieux) setMessage(erreur instanceof Error ? erreur.message : "Impossible de charger les membres.");
    } finally {
      setChargement(false);
    }
  }, [estCreateur, tontineId]);

  useEffect(() => { void charger(); }, [charger]);
  useRafraichissementActif(() => charger(true));

  const decider = async (demandeId: string, approuver: boolean) => {
    setMutation(demandeId);
    setMessage("");
    try {
      await appelApi(`/api/tontines/demandes/${demandeId}`, { method: "PATCH", body: JSON.stringify({ approuver }) });
      await charger();
      await onActualiser?.();
    } catch (erreur) {
      setMessage(erreur instanceof Error ? erreur.message : "Décision impossible.");
    } finally {
      setMutation(null);
    }
  };

  return (
    <div className="space-y-5">
      {message && <p role="alert" className="rounded-xl bg-[#fdebea] p-3 text-sm text-[#a53d39]">{message}</p>}
      {estCreateur && (
        <section>
          <h4 className="mb-3 font-semibold text-[#20392d]">Demandes d’adhésion</h4>
          {chargement ? <p className="text-sm text-muted-foreground">Chargement…</p> : demandes.length === 0 ? <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">Aucune demande reçue.</p> : <div className="space-y-2">{demandes.map((demande) => <div key={demande.id} className="rounded-xl border bg-white p-4"><div className="flex flex-wrap items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#e8f5ef] text-[#237e56]"><Users size={16} /></div><div className="min-w-0 flex-1"><p className="break-words text-sm font-medium text-[#405247]">{demande.demandeur.profil ? `${demande.demandeur.profil.prenom} ${demande.demandeur.profil.nom}` : "Utilisateur"}</p><p className="break-words text-xs text-muted-foreground">{demande.motif || "Aucun motif"}</p></div><span className="text-xs font-medium text-[#657169]">{demande.statut}</span></div>{demande.statut === "EN_ATTENTE" && <div className="mt-3 flex flex-col gap-2 sm:flex-row"><Button onClick={() => void decider(demande.id, true)} disabled={mutation === demande.id} className="w-full sm:flex-1 bg-[#237e56] hover:bg-[#1c6847]"><Check size={15} /> Approuver</Button><Button onClick={() => void decider(demande.id, false)} disabled={mutation === demande.id} variant="outline" className="w-full sm:flex-1 border-[#f0d5d4] text-[#a53d39]"><X size={15} /> Refuser</Button></div>}</div>)}</div>}
        </section>
      )}
      <section>
        <h4 className="mb-3 font-semibold text-[#20392d]">Membres</h4>
        {chargement ? <p className="text-sm text-muted-foreground">Chargement…</p> : membres.length === 0 ? <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">Aucun membre approuvé.</p> : <div className="space-y-2">{membres.map((membre) => <div key={membre.id} className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#f0f3ed] text-[#657169]"><Users size={15} /></div><div className="min-w-0 flex-1"><p className="break-words text-sm font-medium text-[#405247]">{membre.utilisateur.profil ? `${membre.utilisateur.profil.prenom} ${membre.utilisateur.profil.nom}` : "Membre"}</p><p className="text-xs text-muted-foreground">{membre.role === "CREATEUR" ? "Créateur" : "Participant"}</p></div><span className="text-xs font-medium text-[#657169]">{membre.statut}</span></div>)}</div>}
      </section>
    </div>
  );
}
