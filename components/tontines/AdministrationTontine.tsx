"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { appelApi } from "@/lib/api-client";
import type { Tontine } from "@/types";

export function AdministrationTontine({ tontine, onActualiser }: { tontine: Tontine; onActualiser?: () => Promise<void> }) {
  const [visibilite, setVisibilite] = useState(tontine.visibilite ?? "PRIVEE");
  const [adhesionsFermees, setAdhesionsFermees] = useState(tontine.adhesionsFermees ?? false);
  const [chargement, setChargement] = useState(false);
  const [message, setMessage] = useState("");
  const verrouillee = tontine.statut !== "EN_PREPARATION";

  const enregistrer = async () => {
    setChargement(true);
    setMessage("");
    try {
      await appelApi(`/api/tontines/${tontine.id}`, { method: "PATCH", body: JSON.stringify({ visibilite, adhesionsFermees }) });
      await onActualiser?.();
      setMessage("Paramètres enregistrés.");
    } catch (erreur) {
      setMessage(erreur instanceof Error ? erreur.message : "Modification impossible.");
    } finally {
      setChargement(false);
    }
  };

  return <section className="rounded-2xl border bg-white p-5"><h4 className="font-semibold text-[#20392d]">Paramètres d’adhésion</h4><p className="mt-1 text-sm text-muted-foreground">Le serveur protège les règles après démarrage.</p><label className="mt-4 block text-sm font-medium text-[#405247]" htmlFor="visibilite-tontine">Visibilité</label><select id="visibilite-tontine" value={visibilite} onChange={(event) => setVisibilite(event.target.value as "PUBLIQUE" | "PRIVEE")} disabled={verrouillee || chargement} className="mt-1 h-10 w-full rounded-lg border bg-white px-3 text-sm"><option value="PRIVEE">Privée</option><option value="PUBLIQUE">Publique</option></select><label className="mt-4 flex items-center gap-3 text-sm text-[#405247]"><input type="checkbox" checked={adhesionsFermees} onChange={(event) => setAdhesionsFermees(event.target.checked)} disabled={verrouillee || chargement} className="h-4 w-4 accent-[#237e56]" /> Fermer les adhésions</label>{verrouillee && <p className="mt-3 text-xs text-[#8a6300]">Paramètres verrouillés après démarrage.</p>}<Button onClick={() => void enregistrer()} disabled={verrouillee || chargement} className="mt-4 bg-[#237e56] hover:bg-[#1c6847]">{chargement ? "Enregistrement…" : "Enregistrer"}</Button>{message && <p role="status" className="mt-3 text-sm text-[#405247]">{message}</p>}</section>;
}
