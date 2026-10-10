"use client";

import { useState } from "react";
import { Settings, Bell, Globe, Moon, Smartphone, Info, Check, Wifi, WifiOff } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { ModalConfirmation } from "@/components/ModalConfirmation";

export function PageParametres() {
  const { modeDemo, enLigne, reinitialiserDemo, deconnecter } = useApp();
  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);
  const [themeSombre, setThemeSombre] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Configuration de l’application</p>
        <h2 className="mt-1 text-xl font-semibold text-[#20392d]">Paramètres</h2>
      </div>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        <ToggleRow label="Notifications push" description="Recevoir les alertes sur votre appareil" value={notifPush} onChange={setNotifPush} />
        <ToggleRow label="Notifications par email" description="Recevoir un résumé par email" value={notifEmail} onChange={setNotifEmail} />
      </Section>

      {/* Apparence */}
      <Section title="Apparence" icon={Moon}>
        <ToggleRow label="Thème sombre" description="Activer le mode sombre" value={themeSombre} onChange={setThemeSombre} />
      </Section>

      {/* Connexion */}
      <Section title="Connexion" icon={Globe}>
        <InfoRow icon={enLigne ? Wifi : WifiOff} label="État du réseau" value={enLigne ? "En ligne" : "Hors connexion"} />
        <InfoRow icon={Smartphone} label="Mode" value={modeDemo ? "Démonstration" : "Production"} />
      </Section>

      {/* À propos */}
      <Section title="À propos" icon={Info}>
        <InfoRow icon={Settings} label="Version" value="TontiTrack V1.0.0" />
        <InfoRow icon={Info} label="Mode" value="Frontend avec données mockées" />
      </Section>

      {/* Actions */}
      <div className="rounded-2xl border bg-white p-5">
        <h3 className="font-semibold text-[#294237]">Actions</h3>
        <div className="mt-4 space-y-3">
          <button onClick={() => setShowReset(true)} className="flex w-full items-center gap-3 rounded-xl border p-4 text-left hover:bg-[#fbfcf9]">
            <Settings size={18} className="text-[#2b8b60]" />
            <div>
              <p className="text-sm font-medium text-[#405247]">Réinitialiser la démonstration</p>
              <p className="text-xs text-muted-foreground">Restaure les données fictives d’origine.</p>
            </div>
          </button>
          <button onClick={deconnecter} className="flex w-full items-center gap-3 rounded-xl border p-4 text-left hover:bg-[#fbfcf9]">
            <Bell size={18} className="text-[#728078]" />
            <p className="text-sm font-medium text-[#405247]">Se déconnecter</p>
          </button>
        </div>
      </div>

      {showReset && (
        <ModalConfirmation
          titre="Réinitialiser la démonstration ?"
          message="Toutes les données de démonstration seront restaurées à leur état initial."
          boutonLabel="Réinitialiser"
          boutonTone="green"
          onConfirm={() => { reinitialiserDemo(); setShowReset(false); showToast("Démonstration réinitialisée"); }}
          onClose={() => setShowReset(false)}
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

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Bell; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex items-center gap-2">
        <Icon size={18} className="text-[#237e56]" />
        <h3 className="font-semibold text-[#294237]">{title}</h3>
      </div>
      <div className="mt-4 divide-y divide-[#f0efea]">{children}</div>
    </div>
  );
}

function ToggleRow({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <div>
        <p className="text-sm font-medium text-[#405247]">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition ${value ? "bg-[#237e56]" : "bg-[#dcdad4]"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${value ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Bell; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-[#9ca8a0]" />
        <p className="text-sm font-medium text-[#405247]">{label}</p>
      </div>
      <p className="text-sm text-muted-foreground">{value}</p>
    </div>
  );
}
