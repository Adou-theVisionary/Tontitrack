"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const options = [
  { valeur: "light", libelle: "Clair", icone: Sun },
  { valeur: "dark", libelle: "Sombre", icone: Moon },
  { valeur: "system", libelle: "Système", icone: Monitor },
] as const;

/** Sélecteur natif : simple au clavier, lisible par les lecteurs d'écran et sans dépendance supplémentaire. */
export function SelecteurTheme({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [monte, setMonte] = useState(false);

  useEffect(() => setMonte(true), []);

  if (!monte) return null;

  const option = options.find(({ valeur }) => valeur === theme) ?? options[2];
  const Icone = option.icone;

  return (
    <label className={cn("inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-2 text-sm text-foreground shadow-sm", className)}>
      <Icone aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="sr-only">Thème d’affichage</span>
      <select
        aria-label="Thème d’affichage"
        className="min-w-0 bg-transparent pr-1 font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={option.valeur}
        onChange={(event) => setTheme(event.target.value)}
      >
        {options.map(({ valeur, libelle }) => <option key={valeur} value={valeur}>{libelle}</option>)}
      </select>
    </label>
  );
}
