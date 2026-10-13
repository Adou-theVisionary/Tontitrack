"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EtatChargement, EtatErreur } from "@/components/EtatsUI";
import { DetailTontine, type OngletTontine } from "@/components/tontines/DetailTontine";
import type { Tontine } from "@/types";
import { appelApi } from "@/lib/api-client";
import { adapterTontineApi, type RotationApi, type TontineApi } from "@/lib/tontines/adaptateur-ui";
import { useRafraichissementActif } from "@/hooks/useRafraichissementActif";

export function DetailTontineRoute({ tontineId, onglet }: { tontineId: string; onglet: OngletTontine }) {
  const router = useRouter();
  const [tontine, setTontine] = useState<Tontine | null>(null);
  const [erreur, setErreur] = useState("");

  const charger = useCallback(async () => {
    setErreur("");
    try {
      const [reponseTontine, reponseUtilisateur] = await Promise.all([
        appelApi<TontineApi>(`/api/tontines/${tontineId}`),
        appelApi<{ utilisateur: { id: string } }>("/api/auth/moi"),
      ]);
      const estMembre = reponseTontine.createurId === reponseUtilisateur.utilisateur.id || reponseTontine.membres?.some((membre) => membre.utilisateurId === reponseUtilisateur.utilisateur.id && membre.statut === "APPROUVE");
      const rotations = estMembre ? await appelApi<RotationApi[]>(`/api/tontines/${tontineId}/rotations`) : [];
      setTontine(adapterTontineApi(reponseTontine, reponseUtilisateur.utilisateur.id, rotations));
    } catch (e) { setErreur(e instanceof Error ? e.message : "Impossible de charger cette tontine."); }
  }, [tontineId]);

  useEffect(() => { void charger(); }, [charger]);
  useRafraichissementActif(charger);
  if (erreur) return <EtatErreur message={erreur} onReessayer={() => void charger()} />;
  if (!tontine) return <EtatChargement message="Chargement de la tontine..." />;
  return <DetailTontine tontine={tontine} ongletInitial={onglet} onMutation={setTontine} onActualiser={charger} onRetour={() => router.push("/tontines")} onChangerOnglet={(ongletSuivant) => router.push(`/tontines/${tontine.id}/${ongletSuivant}`)} />;
}
