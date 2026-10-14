"use client";

import { useState } from "react";
import { X, Copy, Share2, Check, Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BadgeStatut, toneStatutDemande } from "@/components/BadgeStatut";
import { libelleStatutDemande } from "@/lib/format";
import type { Tontine } from "@/types";

export function ModalInvitation({
  tontine,
  onClose,
  onToast,
}: {
  tontine: Tontine;
  onClose: () => void;
  onToast: (msg: string) => void;
}) {
  const [copie, setCopie] = useState(false);

  const handleCopierCode = () => {
    navigator.clipboard?.writeText(tontine.codeInvitation);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  };

  const handleCopierLien = () => {
    const lien = `${window.location.origin}/tontines/rejoindre?code=${tontine.codeInvitation}`;
    navigator.clipboard?.writeText(lien);
    onToast("Lien copié");
  };

  const handlePartager = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Rejoignez ${tontine.nom}`,
          text: `Vous êtes invité à rejoindre la tontine "${tontine.nom}". Code : ${tontine.codeInvitation}`,
          url: `${window.location.origin}/tontines/rejoindre?code=${tontine.codeInvitation}`,
        });
      } catch { /* annulation */ }
    } else {
      handleCopierLien();
    }
  };

  const demandes = tontine.membres.filter((m) => m.statut === "EN_ATTENTE");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-sm sm:items-center sm:p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="titre-invitation" className="max-h-[calc(100dvh-1rem)] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-popover p-5 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 id="titre-invitation" className="text-lg font-semibold text-foreground">Invitation — {tontine.nom}</h3>
          <button aria-label="Fermer" onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><X size={19} /></button>
        </div>

        {/* Code d'invitation */}
        <div className="rounded-xl bg-surface-subtle p-4">
          <p className="text-xs text-muted-foreground">Code d’invitation</p>
          <div className="mt-2 flex items-center gap-3">
          <p className="text-2xl font-bold tracking-widest text-primary">{tontine.codeInvitation}</p>
          <Button onClick={handleCopierCode} variant="outline" className="border-primary/30 text-primary">
              {copie ? <><Check size={16} /> Copié</> : <><Copy size={16} /> Copier</>}
            </Button>
          </div>
        </div>

        {/* Lien d'invitation */}
        <div className="mt-3 rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Lien d’invitation</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 truncate rounded-lg bg-surface-subtle px-3 py-2 text-xs text-muted-foreground">
              /tontines/rejoindre?code={tontine.codeInvitation}
            </div>
            <Button onClick={handleCopierLien} variant="outline" className="shrink-0 border-primary/30 text-primary">
              <Copy size={16} /> Copier
            </Button>
          </div>
        </div>

        {/* Partager */}
        <Button onClick={handlePartager} className="mt-3 w-full">
          <Share2 size={17} /> Partager
        </Button>

        {/* Demandes en attente */}
        {demandes.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-[#237e56]" />
              <h4 className="font-semibold text-[#294237]">Demandes d’adhésion ({demandes.length})</h4>
            </div>
            <div className="mt-3 space-y-2">
              {demandes.map((membre) => (
                <div key={membre.id} className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: membre.avatarCouleur }}>
                    {membre.prenom[0]}{membre.nom[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#405247]">{membre.prenom} {membre.nom}</p>
                    <p className="text-xs text-muted-foreground">{membre.telephone}</p>
                  </div>
                  <BadgeStatut tone={toneStatutDemande(membre.statut)} dot={false}>
                    {libelleStatutDemande(membre.statut)}
                  </BadgeStatut>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-warning/15 p-3 text-xs text-warning">
          <Mail size={14} className="mt-0.5 shrink-0" />
          <span>L’invitation ne donne pas automatiquement accès à la tontine. Le créateur doit approuver chaque demande d’adhésion.</span>
        </div>
      </div>
    </div>
  );
}
