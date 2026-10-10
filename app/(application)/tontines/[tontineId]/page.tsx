import { redirect } from "next/navigation";
export default function TontinePage({ params }: { params: { tontineId: string } }) { redirect(`/tontines/${params.tontineId}/resume`); }
