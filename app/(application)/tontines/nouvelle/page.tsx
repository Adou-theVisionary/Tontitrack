"use client";
import { useRouter } from "next/navigation";
import { CreationTontine } from "@/components/tontines/CreationTontine";
export default function NouvelleTontinePage() {
  const router = useRouter();
  return <CreationTontine onRetour={() => router.push("/tontines")} onCreee={(tontineId) => router.push(`/tontines/${tontineId}/resume`)} />;
}
