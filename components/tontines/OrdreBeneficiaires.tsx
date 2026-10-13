"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { appelApi } from "@/lib/api-client";
import type { Tontine } from "@/types";

type MembreOrdre = { id: string; role: "CREATEUR" | "MEMBRE"; utilisateur: { profil: { prenom: string; nom: string } | null } };
type ReponseOrdre = { mode: Tontine["mode"]; methodeOrdre: "MANUEL" | "ALEATOIRE"; verrouille: boolean; membres: MembreOrdre[]; ordre: Array<{ membreId: string; position: number }> };

function nomMembre(membre: MembreOrdre) { return [membre.utilisateur.profil?.prenom, membre.utilisateur.profil?.nom].filter(Boolean).join(" ") || "Membre"; }

export function OrdreBeneficiaires({ tontine, estCreateur, onActualiser }: { tontine: Tontine; estCreateur: boolean; onActualiser: () => Promise<void> }) {
  const [reponse, setReponse] = useState<ReponseOrdre | null>(null);
  const [ordreIds, setOrdreIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [chargement, setChargement] = useState(false);
  const charger = useCallback(async () => { try { const donnees = await appelApi<ReponseOrdre>(`/api/tontines/${tontine.id}/ordre-beneficiaires`); setReponse(donnees); setOrdreIds(donnees.ordre.length ? donnees.ordre.map((item) => item.membreId) : donnees.membres.map((membre) => membre.id)); } catch (erreur) { setMessage(erreur instanceof Error ? erreur.message : "Impossible de charger l'ordre."); } }, [tontine.id]);
  useEffect(() => { void charger(); }, [charger]);

  const enregistrer = async (methodeOrdre: "MANUEL" | "ALEATOIRE") => { setChargement(true); setMessage(""); try { await appelApi(`/api/tontines/${tontine.id}/ordre-beneficiaires`, { method: "PUT", body: JSON.stringify(methodeOrdre === "MANUEL" ? { methodeOrdre, membreIds: ordreIds } : { methodeOrdre }) }); await charger(); await onActualiser(); setMessage(methodeOrdre === "MANUEL" ? "Ordre enregistré." : "Ordre aléatoire généré côté serveur."); } catch (erreur) { setMessage(erreur instanceof Error ? erreur.message : "Enregistrement impossible."); } finally { setChargement(false); } };
  const deplacer = (index: number, direction: -1 | 1) => setOrdreIds((precedent) => { const cible = index + direction; if (cible < 0 || cible >= precedent.length) return precedent; const suivant = [...precedent]; [suivant[index], suivant[cible]] = [suivant[cible], suivant[index]]; return suivant; });

  if (!reponse) return <section className="rounded-2xl border bg-white p-5 text-sm text-muted-foreground">Chargement de l&apos;ordre des bénéficiaires…</section>;
  if (reponse.mode === "FIXE_CREATEUR") return <section className="rounded-2xl border bg-white p-5"><h4 className="font-semibold text-[#20392d]">Bénéficiaire fixe</h4><p className="mt-1 text-sm text-muted-foreground">Créateur bénéficiaire de chaque tour. Aucun ordre tournant à configurer.</p></section>;
  const membresParId = new Map(reponse.membres.map((membre) => [membre.id, membre]));
  return (
    <section className="rounded-2xl border bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-[#20392d]">Ordre des bénéficiaires</h4>
          <p className="mt-1 text-sm text-muted-foreground">{reponse.verrouille ? "Ordre verrouillé au démarrage." : "Chaque membre actif doit apparaître une seule fois."}</p>
        </div>
        <span className="rounded-full bg-[#f1f0eb] px-2.5 py-1 text-xs font-semibold text-[#676b64]">{reponse.methodeOrdre === "ALEATOIRE" ? "Aléatoire" : "Manuel"}</span>
      </div>
      <ol className="mt-4 space-y-2">
        {ordreIds.map((membreId, index) => {
          const membre = membresParId.get(membreId);
          return (
            <li key={membreId} className="flex items-center gap-3 rounded-xl bg-[#f8faf6] p-3">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#237e56] text-xs font-bold text-white">{index + 1}</span>
              <span className="flex-1 text-sm font-medium text-[#405247]">{membre ? nomMembre(membre) : "Membre indisponible"}</span>
              {estCreateur && !reponse.verrouille && (
                <span className="flex gap-1">
                  <button aria-label="Monter" disabled={index === 0 || chargement} onClick={() => deplacer(index, -1)} className="rounded p-1 hover:bg-white disabled:opacity-40"><ArrowUp size={16} /></button>
                  <button aria-label="Descendre" disabled={index === ordreIds.length - 1 || chargement} onClick={() => deplacer(index, 1)} className="rounded p-1 hover:bg-white disabled:opacity-40"><ArrowDown size={16} /></button>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {estCreateur && !reponse.verrouille && (
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={() => void enregistrer("MANUEL")} disabled={chargement} variant="outline" className="border-[#c5dcc9] text-[#237e56]">Enregistrer l&apos;ordre manuel</Button>
          <Button onClick={() => void enregistrer("ALEATOIRE")} disabled={chargement} className="bg-[#237e56] hover:bg-[#1c6847]"><Shuffle size={16} /> Générer ordre aléatoire</Button>
        </div>
      )}
      {message && <p role="status" className="mt-3 text-sm text-[#405247]">{message}</p>}
    </section>
  );
}
