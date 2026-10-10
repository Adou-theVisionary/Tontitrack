"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Utilisateur, EspaceFinancierInfo, Notification, Tontine, Transaction } from "@/types";
import { utilisateurMock, espacesFinanciers, notificationsMock, tontinesMock, transactionsMock } from "@/lib/donnees-mock";
import { mockApi } from "@/services/mock-api";

interface AppContextType {
  utilisateur: Utilisateur | null;
  estConnecte: boolean;
  modeDemo: boolean;
  etatDemoHydrate: boolean;
  enLigne: boolean;
  syncStatut: "SYNCHRONISEE" | "EN_COURS" | "ERREUR" | "HORS_LIGNE";
  espaceActifId: string;
  espaces: EspaceFinancierInfo[];
  notifications: Notification[];
  notificationsNonLues: number;
  transactions: Transaction[];
  tontines: Tontine[];
  connecter: () => void;
  connecterUtilisateur: (utilisateur: Utilisateur) => void;
  deconnecter: () => Promise<void>;
  changerEspace: (id: string) => void;
  ajouterTransaction: (transaction: Transaction) => void;
  annulerTransaction: (id: string) => void;
  ajouterTontine: (tontine: Tontine) => void;
  remplacerTontine: (tontine: Tontine) => void;
  marquerNotificationLue: (id: string) => void;
  marquerToutesNotificationsLues: () => void;
  reinitialiserDemo: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [estConnecte, setEstConnecte] = useState(false);
  const [modeDemo, setModeDemo] = useState(false);
  const [enLigne, setEnLigne] = useState(true);
  const [syncStatut, setSyncStatut] = useState<"SYNCHRONISEE" | "EN_COURS" | "ERREUR" | "HORS_LIGNE">("SYNCHRONISEE");
  const [espaceActifId, setEspaceActifId] = useState("e1");
  const [espaces, setEspaces] = useState<EspaceFinancierInfo[]>(espacesFinanciers);
  const [notifications, setNotifications] = useState<Notification[]>(notificationsMock);
  const [transactions, setTransactions] = useState<Transaction[]>(transactionsMock);
  const [tontines, setTontines] = useState<Tontine[]>(tontinesMock);
  const [etatDemoHydrate, setEtatDemoHydrate] = useState(false);

  // Détection de la connexion réseau
  useEffect(() => {
    const handleOnline = () => { setEnLigne(true); setSyncStatut("SYNCHRONISEE"); };
    const handleOffline = () => { setEnLigne(false); setSyncStatut("HORS_LIGNE"); };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const etatSauvegarde = window.sessionStorage.getItem("tontitrack-demo");
    if (etatSauvegarde) {
      try {
        mockApi.restaurerEtatDemo(JSON.parse(etatSauvegarde));
        setTransactions([...transactionsMock]);
        setTontines([...tontinesMock]);
        setNotifications([...notificationsMock]);
      } catch {
        window.sessionStorage.removeItem("tontitrack-demo");
      }
    }
    setEtatDemoHydrate(true);
  }, []);

  useEffect(() => {
    if (etatDemoHydrate) window.sessionStorage.setItem("tontitrack-demo", JSON.stringify(mockApi.obtenirEtatDemo()));
  }, [etatDemoHydrate, transactions, tontines, notifications]);

  const connecter = useCallback(() => {
    setUtilisateur(utilisateurMock);
    setEstConnecte(true);
    setModeDemo(true);
  }, []);

  const connecterUtilisateur = useCallback((utilisateurAuthentifie: Utilisateur) => {
    setUtilisateur(utilisateurAuthentifie);
    setEstConnecte(true);
    setModeDemo(false);
  }, []);

  const deconnecter = useCallback(async () => {
    try {
      await fetch("/api/auth/deconnexion", { method: "POST", credentials: "same-origin" });
    } finally {
      // L'interface ne conserve jamais état connecté après action de déconnexion.
      setUtilisateur(null);
      setEstConnecte(false);
      setModeDemo(false);
      window.location.assign("/connexion");
    }
  }, []);

  const changerEspace = useCallback((id: string) => {
    setEspaceActifId(id);
  }, []);

  const ajouterTransaction = useCallback((transaction: Transaction) => {
    setTransactions((prev) => [transaction, ...prev]);
  }, []);

  const annulerTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, statut: "ANNULEE" as const } : t)));
  }, []);

  const ajouterTontine = useCallback((tontine: Tontine) => {
    setTontines((prev) => [tontine, ...prev]);
  }, []);

  const remplacerTontine = useCallback((tontine: Tontine) => {
    setTontines((precedentes) => precedentes.map((item) => item.id === tontine.id ? tontine : item));
  }, []);

  const marquerNotificationLue = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lue: true } : n)));
  }, []);

  const marquerToutesNotificationsLues = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, lue: true })));
  }, []);

  const reinitialiserDemo = useCallback(() => {
    mockApi.reinitialiserDemo();
    setTransactions([...transactionsMock]);
    setTontines([...tontinesMock]);
    setNotifications([...notificationsMock]);
    setEspaceActifId("e1");
    window.sessionStorage.removeItem("tontitrack-demo");
  }, []);

  const notificationsNonLues = notifications.filter((n) => !n.lue).length;

  return (
    <AppContext.Provider
      value={{
        utilisateur,
        estConnecte,
        modeDemo,
        etatDemoHydrate,
        enLigne,
        syncStatut,
        espaceActifId,
        espaces,
        notifications,
        notificationsNonLues,
        transactions,
        tontines,
        connecter,
        connecterUtilisateur,
        deconnecter,
        changerEspace,
        ajouterTransaction,
        annulerTransaction,
        ajouterTontine,
        remplacerTontine,
        marquerNotificationLue,
        marquerToutesNotificationsLues,
        reinitialiserDemo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp doit être utilisé dans AppProvider");
  return ctx;
}
