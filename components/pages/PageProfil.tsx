"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, FileText, Settings, ChevronDown, Lock, Mail, Phone, User, Camera, Check, X } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { BadgeStatut } from "@/components/BadgeStatut";
import { ModalConfirmation } from "@/components/ModalConfirmation";
import { libelleStatutIdentite, libelleTypeDocument } from "@/lib/format";
import type { TypeDocument, StatutIdentite } from "@/types";

export function PageProfil({ ouvrirIdentite = false }: { ouvrirIdentite?: boolean }) {
  const { utilisateur, deconnecter, reinitialiserDemo, modeDemo } = useApp();
  const router = useRouter();
  const [showIdentite, setShowIdentite] = useState(ouvrirIdentite);
  const [showSuppression, setShowSuppression] = useState(false);
  const [showResetDemo, setShowResetDemo] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  if (!utilisateur) return <div className="py-16 text-center text-sm text-muted-foreground">Connectez-vous pour accéder à votre profil.</div>;

  const statutIdentite = utilisateur.statutIdentite as StatutIdentite;
  const toneIdentite: "green" | "amber" | "gray" | "red" =
    statutIdentite === "VALIDE" ? "green" :
    statutIdentite === "EN_ATTENTE" ? "amber" :
    statutIdentite === "REJETE" ? "red" : "gray";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Votre espace personnel</p>
        <h2 className="mt-1 text-xl font-semibold text-[#20392d]">Mon profil</h2>
      </div>

      {/* Carte profil */}
      <div className="rounded-2xl border bg-white p-6 sm:p-8">
        <div className="flex flex-col items-center gap-4 border-b pb-7 sm:flex-row">
          <div className="relative">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-[#d8ecde] text-2xl font-semibold text-[#237e56]">
              {utilisateur.prenom[0]}{utilisateur.nom[0]}
            </div>
            <button className="absolute bottom-0 right-0 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-[#237e56] text-white shadow-sm">
              <Camera size={13} />
            </button>
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold text-[#20392d]">{utilisateur.prenom} {utilisateur.nom}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{utilisateur.email}</p>
            <div className="mt-2"><BadgeStatut tone={toneIdentite}>{libelleStatutIdentite(statutIdentite)}</BadgeStatut></div>
          </div>
          <Button variant="outline" className="sm:ml-auto" onClick={() => showToast("Modification du profil")}>
            Modifier le profil
          </Button>
        </div>

        <div className="grid gap-5 pt-7 sm:grid-cols-2">
          <InfoItem icon={User} label="Prénom" value={utilisateur.prenom} />
          <InfoItem icon={User} label="Nom" value={utilisateur.nom} />
          <InfoItem icon={Mail} label="Email" value={utilisateur.email} />
          <InfoItem icon={Phone} label="Téléphone" value={utilisateur.telephone} />
        </div>
      </div>

      {/* Identité et sécurité */}
      <div className="rounded-2xl border bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8f5ef] text-[#247f55]"><ShieldCheck size={17} /></span>
          <div>
            <h3 className="font-semibold text-[#294237]">Identité et sécurité</h3>
            <p className="text-xs text-muted-foreground">Vos documents restent strictement privés.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button onClick={() => router.push("/profil/identite")} className="flex items-center gap-3 rounded-xl border p-4 text-left hover:bg-[#fbfcf9]">
            <FileText size={18} className="text-[#2b8b60]" />
            <span className="text-sm font-medium text-[#405247]">Gérer mes documents</span>
            <ChevronDown size={15} className="ml-auto -rotate-90 text-[#9ca8a0]" />
          </button>
          <button onClick={() => showToast("Changement de mot de passe")} className="flex items-center gap-3 rounded-xl border p-4 text-left hover:bg-[#fbfcf9]">
            <Lock size={18} className="text-[#2b8b60]" />
            <span className="text-sm font-medium text-[#405247]">Changer le mot de passe</span>
            <ChevronDown size={15} className="ml-auto -rotate-90 text-[#9ca8a0]" />
          </button>
        </div>
      </div>

      {/* Zone démo et compte */}
      <div className="rounded-2xl border bg-white p-5">
        <h3 className="font-semibold text-[#294237]">Gestion du compte</h3>
        <div className="mt-4 space-y-3">
          {modeDemo && <button onClick={() => setShowResetDemo(true)} className="flex w-full items-center gap-3 rounded-xl border p-4 text-left hover:bg-[#fbfcf9]">
            <Settings size={18} className="text-[#2b8b60]" />
            <div>
              <p className="text-sm font-medium text-[#405247]">Réinitialiser la démonstration</p>
              <p className="text-xs text-muted-foreground">Restaure les données fictives d’origine.</p>
            </div>
          </button>}
          <button onClick={() => setShowSuppression(true)} className="flex w-full items-center gap-3 rounded-xl border border-[#f0d5d4] p-4 text-left hover:bg-[#fdf6f5]">
            <X size={18} className="text-[#a53d39]" />
            <div>
              <p className="text-sm font-medium text-[#a53d39]">Supprimer mon compte</p>
              <p className="text-xs text-muted-foreground">Impossible pendant une tontine active.</p>
            </div>
          </button>
          <button onClick={deconnecter} className="flex w-full items-center gap-3 rounded-xl border p-4 text-left hover:bg-[#fbfcf9]">
            <Lock size={18} className="text-[#728078]" />
            <p className="text-sm font-medium text-[#405247]">Se déconnecter</p>
          </button>
        </div>
      </div>

      {/* Modal identité */}
      {showIdentite && <ModalIdentite statut={statutIdentite} onClose={() => { setShowIdentite(false); router.push("/profil"); }} onToast={showToast} />}

      {/* Modal suppression */}
      {showSuppression && (
        <ModalConfirmation
          titre="Supprimer votre compte ?"
          message="Vous participez actuellement à une tontine active. Votre compte ne peut pas être supprimé avant la fin de vos engagements."
          boutonLabel="Supprimer"
          boutonTone="red"
          onConfirm={() => { setShowSuppression(false); showToast("Suppression impossible : tontine active"); }}
          onClose={() => setShowSuppression(false)}
        />
      )}

      {/* Modal reset démo */}
      {showResetDemo && (
        <ModalConfirmation
          titre="Réinitialiser la démonstration ?"
          message="Toutes les données de démonstration seront restaurées à leur état initial."
          boutonLabel="Réinitialiser"
          boutonTone="green"
          onConfirm={() => { reinitialiserDemo(); setShowResetDemo(false); showToast("Démonstration réinitialisée"); }}
          onClose={() => setShowResetDemo(false)}
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

function InfoItem({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <Icon size={15} className="text-[#9ca8a0]" />
        <p className="font-medium text-[#33473b]">{value}</p>
      </div>
    </div>
  );
}

function ModalIdentite({ statut, onClose, onToast }: { statut: StatutIdentite; onClose: () => void; onToast: (msg: string) => void }) {
  const [typeDocument, setTypeDocument] = useState<TypeDocument>("CARTE_NATIONALE");
  const [recto, setRecto] = useState<string | null>(null);
  const [verso, setVerso] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#183326]/30 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-lg rounded-t-3xl bg-[#fffefa] p-6 shadow-2xl sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#20392d]">Document d’identité</h3>
          <button onClick={onClose} className="rounded-lg p-2 text-[#77847b] hover:bg-[#f0f2ed]"><X size={19} /></button>
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-xl bg-[#f8faf6] p-3">
          <ShieldCheck size={16} className="text-[#237e56]" />
          <p className="text-xs text-[#537362]">Vos documents sont strictement privés et ne sont jamais visibles par les autres membres.</p>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-[#405247]">Type de document</label>
          <select
            value={typeDocument}
            onChange={(e) => setTypeDocument(e.target.value as TypeDocument)}
            className="h-12 w-full rounded-xl border bg-white px-3 text-sm text-[#52635a] outline-none"
          >
            <option value="CARTE_NATIONALE">Carte nationale d’identité</option>
            <option value="PASSEPORT">Passeport</option>
            <option value="PERMIS_CONDUIRE">Permis de conduire</option>
            <option value="ATTESTATION">Attestation</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#405247]">Recto</label>
            {recto ? (
              <div className="flex items-center gap-2 rounded-xl border bg-[#f1f9f2] p-3">
                <Check size={16} className="text-[#237e56]" />
                <span className="flex-1 text-xs text-[#405247]">recto.jpg</span>
                <button onClick={() => setRecto(null)} className="text-[#a53d39]"><X size={14} /></button>
              </div>
            ) : (
              <button onClick={() => setRecto("recto.jpg")} className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#c5dcc9] text-xs text-[#71907c] hover:bg-[#f8fbf8]">
                <Camera size={20} /> Ajouter une photo
              </button>
            )}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#405247]">Verso</label>
            {verso ? (
              <div className="flex items-center gap-2 rounded-xl border bg-[#f1f9f2] p-3">
                <Check size={16} className="text-[#237e56]" />
                <span className="flex-1 text-xs text-[#405247]">verso.jpg</span>
                <button onClick={() => setVerso(null)} className="text-[#a53d39]"><X size={14} /></button>
              </div>
            ) : (
              <button onClick={() => setVerso("verso.jpg")} className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#c5dcc9] text-xs text-[#71907c] hover:bg-[#f8fbf8]">
                <Camera size={20} /> Ajouter une photo
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <BadgeStatut tone={statut === "VALIDE" ? "green" : statut === "EN_ATTENTE" ? "amber" : statut === "REJETE" ? "red" : "gray"}>
            {libelleStatutIdentite(statut)}
          </BadgeStatut>
          {statut === "REJETE" && <p className="text-xs text-[#a53d39]">Vous pouvez soumettre un nouveau document.</p>}
        </div>

        <div className="mt-5 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Fermer</Button>
          <Button onClick={() => { onToast("Document soumis"); onClose(); }} className="flex-1 bg-[#237e56] hover:bg-[#1c6847]" disabled={!recto}>
            Soumettre
          </Button>
        </div>
      </div>
    </div>
  );
}
