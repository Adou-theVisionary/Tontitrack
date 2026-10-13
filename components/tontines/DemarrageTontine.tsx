"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModalConfirmation } from "@/components/ModalConfirmation";
import { appelApi } from "@/lib/api-client";
import { formaterDateHeure } from "@/lib/format";
import type { Tontine } from "@/types";

type EtatDemarrage = { conditions: Array<{ cle: string; libelle: string; remplie: boolean }>; peutDemarrer: boolean; modeDemarrage: "MANUEL" | "AUTOMATIQUE"; datePrevue: string };

export function DemarrageTontine({ tontine, onActualiser }: { tontine: Tontine; onActualiser: () => Promise<void> }) {
  const [etat, setEtat] = useState<EtatDemarrage | null>(null);
  const [erreur, setErreur] = useState("");
  const [confirmation, setConfirmation] = useState(false);
  const [chargement, setChargement] = useState(false);

  const charger = useCallback(async () => {
    try { setErreur(""); setEtat(await appelApi<EtatDemarrage>(`/api/tontines/${tontine.id}/demarrer`)); }
    catch (erreur) { setErreur(erreur instanceof Error ? erreur.message : "Impossible de vérifier le démarrage."); }
  }, [tontine.id]);

  useEffect(() => { void charger(); }, [charger]);

  const demarrer = async () => {
    setChargement(true);
    setErreur("");
    try { await appelApi(`/api/tontines/${tontine.id}/demarrer`, { method: "POST" }); setConfirmation(false); await onActualiser(); }
    catch (erreur) { setErreur(erreur instanceof Error ? erreur.message : "Démarrage impossible."); await charger(); }
    finally { setChargement(false); }
  };

  if (tontine.statut === "ACTIVE") return <section className="rounded-2xl border border-[#d4eadb] bg-[#f1f9f2] p-5"><h4 className="font-semibold text-[#28583c]">Tontine démarrée</h4><p className="mt-1 text-sm text-[#537362]">Démarrage effectif : {tontine.demarreeLe ? formaterDateHeure(tontine.demarreeLe) : "date indisponible"}. Les règles et adhésions sont verrouillées.</p></section>;
  if (!etat && !erreur) return <section className="rounded-2xl border bg-white p-5 text-sm text-muted-foreground">Vérification des conditions de démarrage…</section>;

  return (
    <section className="rounded-2xl border bg-white p-5">
      <h4 className="font-semibold text-[#20392d]">Démarrage</h4>
      {etat?.modeDemarrage === "AUTOMATIQUE" ? (
        <p className="mt-2 text-sm text-muted-foreground">Démarrage automatique prévu à partir du {formaterDateHeure(etat.datePrevue)}. Il exige l&apos;appel configuré de la tâche serveur.</p>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">Le démarrage sera définitif : règles financières et adhésions seront verrouillées.</p>
      )}
      <ul className="mt-4 space-y-2">
        {etat?.conditions.map((condition) => (
          <li key={condition.cle} className={`flex items-start gap-2 text-sm ${condition.remplie ? "text-[#237b54]" : "text-[#a53d39]"}`}>
            <Check size={16} className="mt-0.5 shrink-0" /> {condition.libelle}
          </li>
        ))}
      </ul>
      {etat?.modeDemarrage === "MANUEL" && (
        <Button onClick={() => setConfirmation(true)} disabled={!etat.peutDemarrer || chargement} className="mt-5 bg-[#237e56] hover:bg-[#1c6847]">
          <Play size={16} /> {chargement ? "Démarrage…" : "Démarrer la tontine"}
        </Button>
      )}
      {erreur && <p role="alert" className="mt-3 text-sm text-[#a53d39]">{erreur}</p>}
      {confirmation && <ModalConfirmation titre="Démarrer cette tontine ?" message="Les rotations seront créées et les règles financières ne pourront plus être modifiées." boutonLabel="Confirmer le démarrage" onConfirm={() => void demarrer()} onClose={() => setConfirmation(false)} />}
    </section>
  );
}
