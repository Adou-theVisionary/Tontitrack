"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ListeTontines } from "@/components/tontines/ListeTontines";
import { DetailTontine } from "@/components/tontines/DetailTontine";
import { CreationTontine } from "@/components/tontines/CreationTontine";
import { RejoindreTontine } from "@/components/tontines/RejoindreTontine";
import type { Tontine } from "@/types";
import { appelApi } from "@/lib/api-client";
import { adapterTontineApi, type TontineApi } from "@/lib/tontines/adaptateur-ui";
import { EtatChargement, EtatErreur } from "@/components/EtatsUI";

type Vue = "liste" | "detail" | "creation" | "rejoindre";

export function PageTontines() {
  const router = useRouter();
  const [tontines, setTontines] = useState<Tontine[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [vue, setVue] = useState<Vue>("liste");
  const [tontineSelectionnee, setTontineSelectionnee] = useState<Tontine | null>(null);
  const charger = async () => { setChargement(true); setErreur(""); try { setTontines((await appelApi<TontineApi[]>("/api/tontines")).map((tontine) => adapterTontineApi(tontine))); } catch (e) { setErreur(e instanceof Error ? e.message : "Impossible de charger les tontines."); } finally { setChargement(false); } };
  useEffect(() => { void charger(); }, []);

  if (vue === "detail" && tontineSelectionnee) {
    return (
      <DetailTontine
        tontine={tontineSelectionnee}
        onMutation={(tontine) => setTontineSelectionnee(tontine)}
        onRetour={() => { setVue("liste"); setTontineSelectionnee(null); }}
      />
    );
  }

  if (vue === "creation") {
    return <CreationTontine onRetour={() => router.push("/tontines")} onCreee={() => router.push("/tontines")} />;
  }

  if (vue === "rejoindre") {
    return <RejoindreTontine onRetour={() => router.push("/tontines")} />;
  }

  if (chargement) return <EtatChargement message="Chargement des tontines..." />;
  if (erreur) return <EtatErreur message={erreur} onReessayer={() => void charger()} />;
  return (
    <ListeTontines
      tontines={tontines}
      onSelectionner={(t) => router.push(`/tontines/${t.id}/resume`)}
      onCreer={() => router.push("/tontines/nouvelle")}
      onRejoindre={() => router.push("/tontines/rejoindre")}
    />
  );
}
