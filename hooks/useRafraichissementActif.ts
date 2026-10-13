"use client";

import { useEffect, useRef } from "react";

/** Rafraîchit seulement un onglet visible, sans écraser l'état local des formulaires. */
export function useRafraichissementActif(rafraichir: () => Promise<unknown>, delaiMs = 60_000, actif = true) {
  const rafraichirRef = useRef(rafraichir);
  const enCours = useRef(false);
  useEffect(() => { rafraichirRef.current = rafraichir; }, [rafraichir]);

  useEffect(() => {
    if (!actif) return;
    const executer = () => {
      if (document.visibilityState !== "visible" || enCours.current) return;
      enCours.current = true;
      void rafraichirRef.current().finally(() => { enCours.current = false; });
    };
    const intervalle = window.setInterval(executer, delaiMs);
    document.addEventListener("visibilitychange", executer);
    return () => {
      window.clearInterval(intervalle);
      document.removeEventListener("visibilitychange", executer);
    };
  }, [actif, delaiMs]);
}
