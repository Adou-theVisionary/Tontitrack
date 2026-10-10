"use client";
import { useRouter } from "next/navigation";
import { Dashboard } from "@/components/pages/Dashboard";
export default function TableauDeBordPage() {
  const router = useRouter();
  return <Dashboard onSection={(section) => router.push(section === "tontines" ? "/tontines" : "/finances")} />;
}
