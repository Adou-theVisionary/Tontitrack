"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Link2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { appelApi } from "@/lib/api-client";
import { useRafraichissementActif } from "@/hooks/useRafraichissementActif";

type Invitation = {
  id: string;
  code: string;
  inviteId: string | null;
  expireLe: string;
  statut: "EN_ATTENTE" | "ACCEPTEE" | "REFUSEE" | "REVOQUEE" | "EXPIREE";
  estActive: boolean;
  creeLe: string;
};

type InvitationCreee = { invitation: Invitation; jeton: string };

const libellesStatut: Record<Invitation["statut"], string> = {
  EN_ATTENTE: "En attente", ACCEPTEE: "Acceptée", REFUSEE: "Refusée", REVOQUEE: "Révoquée", EXPIREE: "Expirée",
};

export function GestionInvitations({ tontineId, estCreateur }: { tontineId: string; estCreateur: boolean }) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteId, setInviteId] = useState("");
  const [expireLe, setExpireLe] = useState(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
  const [lienCree, setLienCree] = useState("");
  const [chargement, setChargement] = useState(false);
  const [message, setMessage] = useState("");
  const [succes, setSucces] = useState("");

  const charger = useCallback(async (silencieux = false) => {
    if (!estCreateur) return;
    if (!silencieux) { setChargement(true); setMessage(""); setSucces(""); }
    try {
      setInvitations(await appelApi<Invitation[]>(`/api/tontines/${tontineId}/invitations`));
    } catch (erreur) {
      if (!silencieux) setMessage(erreur instanceof Error ? erreur.message : "Impossible de charger les invitations.");
    } finally {
      setChargement(false);
    }
  }, [estCreateur, tontineId]);

  useEffect(() => { void charger(); }, [charger]);
  useRafraichissementActif(() => charger(true), 60_000, estCreateur);

  const creer = async () => {
    setChargement(true);
    setMessage("");
    setLienCree("");
    try {
      const resultat = await appelApi<InvitationCreee>(`/api/tontines/${tontineId}/invitations`, {
        method: "POST",
        body: JSON.stringify({ inviteId: inviteId.trim() || undefined, expireLe: new Date(expireLe).toISOString() }),
      });
      setInviteId("");
      if (!resultat.invitation.inviteId) setLienCree(`${window.location.origin}/tontines/rejoindre?invitation=${resultat.invitation.id}&jeton=${encodeURIComponent(resultat.jeton)}`);
      await charger();
      setSucces("Invitation créée.");
    } catch (erreur) {
      setMessage(erreur instanceof Error ? erreur.message : "Création de l’invitation impossible.");
    } finally {
      setChargement(false);
    }
  };

  const revoquer = async (invitationId: string) => {
    setChargement(true);
    setMessage("");
    setSucces("");
    try {
      await appelApi(`/api/tontines/invitations/${invitationId}/revoquer`, { method: "POST" });
      await charger();
      setSucces("Invitation révoquée.");
    } catch (erreur) {
      setMessage(erreur instanceof Error ? erreur.message : "Révocation impossible.");
    } finally {
      setChargement(false);
    }
  };

  if (!estCreateur) return <p className="rounded-xl bg-[#f8faf6] p-4 text-sm text-muted-foreground">Seul le créateur peut gérer les invitations.</p>;

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-[#f8faf6] p-4">
        <h4 className="font-semibold text-[#20392d]">Nouvelle invitation</h4>
        <p className="mt-1 text-xs text-muted-foreground">Laissez l’identifiant vide pour créer un lien sécurisé. Le jeton n’est affiché qu’une fois.</p>
        <label className="mt-4 block text-xs font-medium text-[#405247]" htmlFor="invite-id">Identifiant utilisateur ciblé</label>
        <input id="invite-id" value={inviteId} onChange={(event) => setInviteId(event.target.value.trim())} placeholder="Optionnel" className="mt-1 h-11 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#9ed0ae]" />
        <label className="mt-3 block text-xs font-medium text-[#405247]" htmlFor="invitation-expire-le">Expiration</label>
        <input id="invitation-expire-le" type="datetime-local" value={expireLe} onChange={(event) => setExpireLe(event.target.value)} className="mt-1 h-11 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#9ed0ae]" />
        <Button onClick={() => void creer()} disabled={chargement || !expireLe} className="mt-3 w-full bg-[#237e56] hover:bg-[#1c6847]"><Send size={16} /> Créer l’invitation</Button>
      </div>

      {lienCree && (
        <div className="rounded-xl border border-[#c5dcc9] bg-[#edf8f0] p-4">
          <p className="text-sm font-semibold text-[#28583c]">Lien sécurisé créé</p>
          <p className="mt-1 break-all text-xs text-[#537362]">{lienCree}</p>
          <Button onClick={() => void navigator.clipboard?.writeText(lienCree)} variant="outline" className="mt-3 border-[#c5dcc9] text-[#237e56]"><Copy size={15} /> Copier le lien</Button>
        </div>
      )}

      {message && <p role="alert" className="rounded-xl bg-[#fdebea] p-3 text-sm text-[#a53d39]">{message}</p>}
      {succes && <p role="status" className="rounded-xl bg-[#edf8f0] p-3 text-sm text-[#28583c]">{succes}</p>}
      {chargement && invitations.length === 0 ? <p className="text-sm text-muted-foreground">Chargement des invitations…</p> : null}
      {!chargement && invitations.length === 0 ? <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">Aucune invitation créée.</p> : null}
      <div className="space-y-2">
        {invitations.map((invitation) => (
          <div key={invitation.id} className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-3">
            <Link2 size={16} className="text-[#237e56]" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#405247]">{invitation.inviteId ? "Invitation ciblée" : "Lien sécurisé"}</p>
              <p className="text-xs text-muted-foreground">Expire le {new Date(invitation.expireLe).toLocaleString("fr-FR")}</p>
            </div>
            <span className="text-xs font-medium text-[#657169]">{libellesStatut[invitation.statut]}</span>
            {invitation.estActive && <button aria-label="Révoquer l’invitation" onClick={() => void revoquer(invitation.id)} disabled={chargement} className="grid h-11 w-11 place-items-center rounded-lg text-[#a53d39] hover:bg-[#fdebea]"><X size={16} /></button>}
          </div>
        ))}
      </div>
    </div>
  );
}
