"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Search, Users, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BadgeStatut, toneStatutTontine } from "@/components/BadgeStatut";
import { appelApi } from "@/lib/api-client";
import { adapterTontineApi, type TontineApi } from "@/lib/tontines/adaptateur-ui";
import { useRafraichissementActif } from "@/hooks/useRafraichissementActif";
import {
  formaterMontant, libelleModeTontine, libelleStatutTontine,
  descriptionStatutTontine, formaterDateCourte,
} from "@/lib/format";
import type { Tontine } from "@/types";

type Etat = "saisie" | "trouvee" | "demandeEnvoyee" | "erreur";
type InvitationRecue = { id: string; expireLe: string; tontine: { id: string; nom: string; mode: Tontine["mode"]; montantCotisation: string | number; frequence: Tontine["frequence"] } };

export function RejoindreTontine({ onRetour }: { onRetour: () => void }) {
  const router = useRouter();
  const parametres = useSearchParams();
  const [code, setCode] = useState("");
  const [etat, setEtat] = useState<Etat>("saisie");
  const [tontine, setTontine] = useState<Tontine | null>(null);
  const [chargement, setChargement] = useState(false);
  const [message, setMessage] = useState("");
  const [conditionsAcceptees, setConditionsAcceptees] = useState(false);
  const [invitationsRecues, setInvitationsRecues] = useState<InvitationRecue[]>([]);
  const [chargementInvitations, setChargementInvitations] = useState(true);
  const [traitementInvitation, setTraitementInvitation] = useState<string | null>(null);
  const invitationLienId = parametres.get("invitation");
  const jetonLien = parametres.get("jeton");

  const chargerInvitations = useCallback(async (silencieux = false) => {
    try { setInvitationsRecues(await appelApi<InvitationRecue[]>("/api/tontines/invitations/recues")); }
    catch (erreur: unknown) { if (!silencieux) setMessage(erreur instanceof Error ? erreur.message : "Impossible de charger les invitations."); }
    finally { if (!silencieux) setChargementInvitations(false); }
  }, []);
  useEffect(() => { void chargerInvitations(); }, [chargerInvitations]);
  useRafraichissementActif(() => chargerInvitations(true));

  const handleRechercher = async () => {
    if (!code.trim()) return;
    setChargement(true);
    setMessage("");
    try {
      const catalogue = await appelApi<TontineApi[]>("/api/tontines/catalogue");
      const result = catalogue.find((item) => item.id === code.trim());
      if (!result) throw new Error("Aucune tontine publique ne correspond à cet identifiant.");
      setTontine(adapterTontineApi(result));
      setEtat("trouvee");
    } catch (err: unknown) {
      const e = err as { message?: string };
      setMessage(e?.message || "Aucune tontine trouvée avec ce code.");
      setEtat("erreur");
    } finally {
      setChargement(false);
    }
  };

  const handleDemander = async () => {
    if (!tontine || !conditionsAcceptees) {
      setMessage("Vous devez accepter les conditions de participation.");
      return;
    }
    setChargement(true);
    try {
      await appelApi(`/api/tontines/${tontine.id}/demandes`, { method: "POST", body: JSON.stringify({ conditionsAcceptees: true }) });
      setEtat("demandeEnvoyee");
    } catch (erreur) {
      setMessage(erreur instanceof Error ? erreur.message : "Demande impossible.");
    } finally {
      setChargement(false);
    }
  };

  const traiterInvitation = async (invitationId: string, accepter: boolean, jeton?: string) => {
    if (accepter && !conditionsAcceptees) {
      setMessage("Vous devez accepter les conditions de participation.");
      return;
    }
    setTraitementInvitation(invitationId);
    setMessage("");
    try {
      const resultat = await appelApi<{ tontineId: string; statut: "ACCEPTEE" | "REFUSEE" }>(`/api/tontines/invitations/${invitationId}/${accepter ? "accepter" : "refuser"}`, {
        method: "POST",
        body: JSON.stringify(accepter ? { conditionsAcceptees: true, jeton } : { jeton }),
      });
      setInvitationsRecues((invitations) => invitations.filter((invitation) => invitation.id !== invitationId));
      if (resultat.statut === "ACCEPTEE") {
        router.replace(`/tontines/${resultat.tontineId}`);
        router.refresh();
        return;
      }
      setMessage("Invitation refusée.");
    } catch (erreur) {
      setMessage(erreur instanceof Error ? erreur.message : "Action impossible.");
    } finally {
      setTraitementInvitation(null);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <button onClick={onRetour} className="flex items-center gap-2 text-sm text-[#728078] hover:text-[#237e56]">
        <ArrowLeft size={16} /> Retour aux tontines
      </button>

      <div>
        <h2 className="text-xl font-semibold text-[#20392d]">Rejoindre une tontine</h2>
        <p className="mt-1 text-sm text-muted-foreground">Recherchez une tontine publique ou gérez une invitation reçue.</p>
      </div>

      {etat === "saisie" && (
        <div className="rounded-2xl border bg-white p-6">
          <label className="mb-2 block text-sm font-medium text-[#405247]">Identifiant de tontine publique</label>
          <div className="relative">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca8a0]" />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Identifiant de la tontine"
              className="h-14 w-full rounded-xl border bg-white pl-11 pr-4 text-center text-sm outline-none ring-[#9ed0ae] placeholder:font-normal placeholder:text-[#a3aca6] focus:ring-2"
            />
          </div>
          <Button onClick={handleRechercher} disabled={chargement || !code.trim()} className="mt-4 h-12 w-full bg-[#237e56] hover:bg-[#1c6847]">
            {chargement ? "Recherche..." : "Rechercher la tontine"}
          </Button>
          {message && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#fdebea] px-4 py-3 text-sm text-[#a53d39]">
              <AlertCircle size={16} /> {message}
            </div>
          )}
        </div>
      )}

      {etat === "trouvee" && tontine && (
        <div className="rounded-2xl border bg-white p-6">
          <div className="flex items-start justify-between">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#e8f5ef] text-[#237e56]"><Users size={22} /></div>
            <BadgeStatut tone={toneStatutTontine(tontine.statut)}>{libelleStatutTontine(tontine.statut)}</BadgeStatut>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-[#20392d]">{tontine.nom}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{libelleModeTontine(tontine.mode)}</p>
          <p className="mt-2 text-xs text-[#98a099]">{descriptionStatutTontine(tontine.statut)}</p>

          <div className="mt-5 space-y-3 rounded-xl bg-[#f8faf6] p-4">
            <Row label="Créateur" value={tontine.createurNom} />
            <Row label="Montant" value={formaterMontant(tontine.montantCotisation, tontine.devise)} />
            <Row label="Fréquence" value={tontine.frequence} />
            <Row label="Membres" value={`${tontine.nombreMembresApprouves} / ${tontine.nombreParticipantsRequis}`} />
            <Row label="Places disponibles" value={`${tontine.nombreParticipantsRequis - tontine.nombreMembresApprouves}`} />
            <Row label="Démarre le" value={formaterDateCourte(tontine.dateCommencement)} />
          </div>

          <label className="mt-5 flex items-start gap-3 text-sm text-[#405247]">
            <input type="checkbox" checked={conditionsAcceptees} onChange={(event) => setConditionsAcceptees(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#237e56]" />
            <span>J’accepte explicitement les conditions de participation affichées pour cette tontine.</span>
          </label>

          <div className="mt-5 flex gap-3">
            <Button variant="outline" onClick={() => { setEtat("saisie"); setTontine(null); }} className="flex-1">Retour</Button>
            <Button onClick={handleDemander} disabled={chargement} className="flex-1 bg-[#237e56] hover:bg-[#1c6847]">
              {chargement ? "Envoi..." : "Demander à rejoindre"}
            </Button>
          </div>
        </div>
      )}

      {etat === "demandeEnvoyee" && (
        <div className="rounded-2xl border bg-white p-8 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e8f5ef] text-[#237e56]">
            <Check size={32} />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-[#20392d]">Demande envoyée</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Votre demande d’adhésion a été envoyée au créateur. Vous serez notifié dès qu’elle sera traitée.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#fff3d8] px-3 py-1.5 text-xs font-semibold text-[#9b6500]">
            <span className="h-1.5 w-1.5 rounded-full bg-current" /> En attente d’approbation
          </div>
          <Button onClick={onRetour} className="mt-6 w-full bg-[#237e56] hover:bg-[#1c6847]">Retour aux tontines</Button>
        </div>
      )}

      {etat === "erreur" && (
        <div className="rounded-2xl border bg-white p-8 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#fdebea] text-[#a53d39]">
            <X size={32} />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-[#20392d]">Tontine introuvable</h3>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          <Button onClick={() => setEtat("saisie")} className="mt-6 w-full bg-[#237e56] hover:bg-[#1c6847]">Réessayer</Button>
        </div>
      )}

      {(invitationsRecues.length > 0 || (invitationLienId && jetonLien)) && (
        <section className="rounded-2xl border bg-white p-6">
          <h3 className="text-lg font-semibold text-[#20392d]">Invitations reçues</h3>
          <p className="mt-1 text-sm text-muted-foreground">Acceptez les conditions avant de rejoindre une tontine.</p>
          <label className="mt-4 flex items-start gap-3 text-sm text-[#405247]"><input type="checkbox" checked={conditionsAcceptees} onChange={(event) => setConditionsAcceptees(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#237e56]" /><span>J’accepte explicitement les conditions de participation.</span></label>
          <div className="mt-4 space-y-3">
            {invitationsRecues.map((invitation) => <InvitationCarte key={invitation.id} nom={invitation.tontine.nom} expiration={invitation.expireLe} chargement={traitementInvitation === invitation.id} onAccepter={() => void traiterInvitation(invitation.id, true)} onRefuser={() => void traiterInvitation(invitation.id, false)} />)}
            {invitationLienId && jetonLien && <InvitationCarte nom="Invitation par lien sécurisé" expiration="" chargement={traitementInvitation === invitationLienId} onAccepter={() => void traiterInvitation(invitationLienId, true, jetonLien)} onRefuser={() => void traiterInvitation(invitationLienId, false, jetonLien)} />}
          </div>
        </section>
      )}
      {chargementInvitations && <p className="text-center text-sm text-muted-foreground">Chargement des invitations reçues…</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-[#405247]">{value}</span>
    </div>
  );
}

function InvitationCarte({ nom, expiration, chargement, onAccepter, onRefuser }: { nom: string; expiration: string; chargement: boolean; onAccepter: () => void; onRefuser: () => void }) {
  return <div className="rounded-xl border bg-[#f8faf6] p-4"><div className="flex items-center justify-between gap-3"><p className="font-medium text-[#20392d]">{nom}</p><span className="text-xs font-medium text-[#9b6500]">En attente</span></div>{expiration && <p className="mt-1 text-xs text-muted-foreground">Expire le {new Date(expiration).toLocaleString("fr-FR")}</p>}<div className="mt-3 flex gap-2"><Button onClick={onAccepter} disabled={chargement} className="flex-1 bg-[#237e56] hover:bg-[#1c6847]"><Check size={15} /> Accepter</Button><Button onClick={onRefuser} disabled={chargement} variant="outline" className="flex-1 border-[#f0d5d4] text-[#a53d39]"><X size={15} /> Refuser</Button></div></div>;
}
