"use client";
import { useRouter } from "next/navigation";
import { RejoindreTontine } from "@/components/tontines/RejoindreTontine";
export default function RejoindreTontinePage() {
  const router = useRouter();
  return <RejoindreTontine onRetour={() => router.push("/tontines")} />;
}
