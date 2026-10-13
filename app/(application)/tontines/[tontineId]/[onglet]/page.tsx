"use client";
import { useParams } from "next/navigation";
import { DetailTontineRoute } from "@/components/tontines/DetailTontineRoute";
import type { OngletTontine } from "@/components/tontines/DetailTontine";

const onglets: OngletTontine[] = ["resume", "rotations", "cotisations", "reversements", "cloture", "membres", "invitations", "historique"];
export default function OngletTontinePage() {
  const params = useParams<{ tontineId: string; onglet: string }>();
  const onglet = onglets.includes(params.onglet as OngletTontine) ? params.onglet as OngletTontine : "resume";
  return <DetailTontineRoute tontineId={params.tontineId} onglet={onglet} />;
}
