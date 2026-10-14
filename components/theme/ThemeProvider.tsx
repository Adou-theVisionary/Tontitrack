"use client";

import { ThemeProvider as FournisseurThemes } from "next-themes";
import type { ComponentProps } from "react";

/** Centralise le thème afin que l'ensemble des espaces partage le même choix persistant. */
export function ThemeProvider({ children, ...props }: ComponentProps<typeof FournisseurThemes>) {
  return (
    <FournisseurThemes
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </FournisseurThemes>
  );
}
