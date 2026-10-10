import { cn } from "@/lib/utils";

type Tone = "green" | "amber" | "gray" | "red" | "blue";

const toneStyles: Record<Tone, string> = {
  green: "bg-[#e8f5ef] text-[#237b54]",
  amber: "bg-[#fff3d8] text-[#9b6500]",
  gray: "bg-[#f1f0eb] text-[#676b64]",
  red: "bg-[#fdebea] text-[#a53d39]",
  blue: "bg-[#e8f2f8] text-[#24698a]",
};

export function BadgeStatut({
  children,
  tone = "green",
  dot = true,
  className = "",
}: {
  children: React.ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        toneStyles[tone],
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function toneStatutTontine(statut: string): Tone {
  switch (statut) {
    case "ACTIVE": return "green";
    case "PRETE_A_DEMARRER": return "amber";
    case "EN_PREPARATION": return "gray";
    case "TERMINEE": return "blue";
    case "ANNULEE": return "red";
    case "ARCHIVEE": return "gray";
    default: return "gray";
  }
}

export function toneStatutCotisation(statut: string): Tone {
  switch (statut) {
    case "PAYEE": return "green";
    case "PARTIEL": return "amber";
    case "A_PAYER": return "gray";
    case "EN_RETARD": return "red";
    case "NON_CONCERNE": return "gray";
    default: return "gray";
  }
}

export function toneStatutDeclaration(statut: string): Tone {
  switch (statut) {
    case "VALIDEE": return "green";
    case "EN_ATTENTE": return "amber";
    case "REJETEE": return "red";
    default: return "gray";
  }
}

export function toneStatutDemande(statut: string): Tone {
  switch (statut) {
    case "APPROUVE": return "green";
    case "EN_ATTENTE": return "amber";
    case "REFUSE": return "red";
    default: return "gray";
  }
}
