"use client";

import { useEffect } from "react";
import type { Utilisateur } from "@/types";
import { useApp } from "@/contexts/AppContext";

export function InitialiserSession({ utilisateur, children }: { utilisateur: Utilisateur; children: React.ReactNode }) {
  const { connecterUtilisateur } = useApp();
  useEffect(() => { connecterUtilisateur(utilisateur); }, [connecterUtilisateur, utilisateur]);
  return <>{children}</>;
}
