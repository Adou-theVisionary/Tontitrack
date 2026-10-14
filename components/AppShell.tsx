"use client";

import { useEffect, useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell, ChevronDown, Home, Landmark, Menu, MoreHorizontal,
  Search, Settings, ShieldCheck, Users, WalletCards, X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { IndicateurSync, BanniereHorsLigne } from "@/components/IndicateurSync";
import { useApp } from "@/contexts/AppContext";
import { SelecteurTheme } from "@/components/theme/SelecteurTheme";

export type Section =
  | "tableau"
  | "finances"
  | "tontines"
  | "notifications"
  | "profil"
  | "parametres";

const navItems: { id: Section; label: string; icon: typeof Home; shortLabel: string }[] = [
  { id: "tableau", label: "Tableau de bord", icon: Home, shortLabel: "Accueil" },
  { id: "finances", label: "Finances", icon: WalletCards, shortLabel: "Finances" },
  { id: "tontines", label: "Tontines", icon: Users, shortLabel: "Tontines" },
  { id: "notifications", label: "Notifications", icon: Bell, shortLabel: "Notif." },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { utilisateur, notificationsNonLues, espaces, espaceActifId, changerEspace, modeDemo } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [menuMobileOuvert, setMenuMobileOuvert] = useState(false);

  useEffect(() => {
    if (!menuMobileOuvert) return;
    const fermerAvecEchap = (evenement: KeyboardEvent) => {
      if (evenement.key === "Escape") setMenuMobileOuvert(false);
    };
    window.addEventListener("keydown", fermerAvecEchap);
    return () => window.removeEventListener("keydown", fermerAvecEchap);
  }, [menuMobileOuvert]);

  const section: Section = pathname.startsWith("/finances") ? "finances"
    : pathname.startsWith("/tontines") ? "tontines"
    : pathname.startsWith("/notifications") ? "notifications"
    : pathname.startsWith("/profil") ? "profil"
    : pathname.startsWith("/parametres") ? "parametres"
    : "tableau";
  const cheminSection: Record<Section, string> = {
    tableau: "/tableau-de-bord", finances: "/finances", tontines: "/tontines",
    notifications: "/notifications", profil: "/profil", parametres: "/parametres",
  };
  const naviguer = (id: Section) => router.push(cheminSection[id]);

  const espaceActif = espaces.find((e) => e.id === espaceActifId) || espaces[0];

  const pageTitle = useMemo(() => ({
    tableau: "Tableau de bord",
    finances: "Finances",
    tontines: "Mes tontines",
    notifications: "Notifications",
    profil: "Mon profil",
    parametres: "Paramètres",
  }[section]), [section]);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r bg-card px-5 py-7 lg:flex">
        <Logo />
        <div className="mt-10 flex flex-1 flex-col">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground">Espace principal</p>
          <nav className="space-y-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => naviguer(id)}
                aria-current={section === id ? "page" : undefined}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-[background-color,color,box-shadow] duration-150 ${
                  section === id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon size={18} strokeWidth={section === id ? 2.4 : 1.9} />
                {label}
                {id === "notifications" && notificationsNonLues > 0 && (
                  <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                    {notificationsNonLues}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <p className="mb-3 mt-10 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground">Mon compte</p>
          <nav className="space-y-1">
            <button
              onClick={() => naviguer("profil")}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-[background-color,color,box-shadow] duration-150 ${
                section === "profil" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <ShieldCheck size={18} /> Profil
            </button>
            <button
              onClick={() => naviguer("parametres")}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-[background-color,color,box-shadow] duration-150 ${
                section === "parametres" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Settings size={18} /> Paramètres
            </button>
          </nav>

          <div className="mt-auto space-y-3">
            {modeDemo && (
              <div className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-2.5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Mode démonstration</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Données fictives</p>
              </div>
            )}
            <div className="rounded-2xl bg-primary/10 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                  {utilisateur?.prenom?.[0]}{utilisateur?.nom?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{utilisateur?.prenom} {utilisateur?.nom}</p>
                  <p className="truncate text-xs text-muted-foreground">Compte sécurisé</p>
                </div>
                <MoreHorizontal size={16} className="ml-auto shrink-0 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="min-w-0 lg:pl-[248px]">
        <BanniereHorsLigne />
        <header className="sticky top-0 z-20 border-b bg-background/90 px-3 py-3 backdrop-blur-md sm:px-8 sm:py-3.5 lg:px-10">
          <div className="mx-auto flex min-w-0 max-w-[1320px] items-center justify-between gap-2">
            <div className="flex items-center gap-3 lg:hidden">
              <button
                aria-label="Ouvrir le menu"
                onClick={() => setMenuMobileOuvert(true)}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-muted"
              >
                <Menu size={21} />
              </button>
              <Logo compact />
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-medium text-muted-foreground">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
              <h1 className="mt-0.5 text-lg font-semibold text-foreground">{pageTitle}</h1>
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <div className="hidden min-[390px]:block"><IndicateurSync /></div>
              <SelecteurTheme className="hidden sm:inline-flex" />
              <button aria-label="Rechercher" className="hidden rounded-xl p-2.5 text-muted-foreground hover:bg-card sm:block">
                <Search size={18} />
              </button>
              <button
                onClick={() => naviguer("notifications")}
                aria-label="Notifications"
                className="relative grid h-11 w-11 place-items-center rounded-xl text-muted-foreground transition-colors duration-150 hover:bg-card"
              >
                <Bell size={19} />
                {notificationsNonLues > 0 && (
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />
                )}
              </button>
              <div className="hidden h-8 w-px bg-border sm:block" />
              <button
                onClick={() => naviguer("profil")}
                className="hidden h-11 w-11 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary min-[360px]:grid"
              >
                {utilisateur?.prenom?.[0]}{utilisateur?.nom?.[0]}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto min-w-0 max-w-[1320px] px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-6 sm:px-8 sm:pt-8 lg:px-10 lg:pb-10">
          {children}
        </main>
      </div>

      {/* Bottom navigation mobile */}
      <nav aria-label="Navigation principale" className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t bg-card/95 px-1 py-2 pb-[calc(.5rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(31,57,43,.10)] backdrop-blur-md lg:hidden">
        {[...navItems, { id: "profil" as Section, label: "Profil", icon: ShieldCheck, shortLabel: "Profil" }].map(
          ({ id, label, icon: Icon, shortLabel }) => (
            <button
              key={id}
              onClick={() => naviguer(id)}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-[background-color,color,transform] duration-150 active:scale-[.97] motion-reduce:transform-none ${
                section === id ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon size={19} strokeWidth={section === id ? 2.5 : 1.8} />
              {shortLabel}
            </button>
          )
        )}
      </nav>

      {/* Drawer menu mobile */}
      {menuMobileOuvert && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button aria-label="Fermer le menu" className="absolute inset-0 cursor-default bg-foreground/30 backdrop-blur-sm animate-in fade-in-0 duration-200 motion-reduce:backdrop-blur-none" onClick={() => setMenuMobileOuvert(false)} />
          <div role="dialog" aria-modal="true" aria-label="Menu de navigation" className="absolute left-0 top-0 h-full w-[min(280px,calc(100vw-2rem))] overflow-y-auto overscroll-contain bg-card p-5 shadow-2xl animate-in slide-in-from-left duration-200 [animation-timing-function:var(--easing-naturel)]">
            <div className="flex items-center justify-between">
              <Logo />
              <button aria-label="Fermer" onClick={() => setMenuMobileOuvert(false)} className="grid h-11 w-11 place-items-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-muted">
                <X size={20} />
              </button>
            </div>
            <div className="mt-8">
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground">Espace financier</p>
              <div className="mb-4 rounded-xl border bg-card p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Landmark size={16} className="text-primary" />
                  <select
                    value={espaceActifId}
                    onChange={(e) => changerEspace(e.target.value)}
                    className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none"
                  >
                    {espaces.map((e) => (
                      <option key={e.id} value={e.id}>{e.nom}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="text-muted-foreground" />
                </div>
              </div>
              <SelecteurTheme className="mb-4 flex w-full justify-between" />
              <nav className="space-y-1">
                {[...navItems, { id: "parametres" as Section, label: "Paramètres", icon: Settings, shortLabel: "Paramètres" }].map(
                  ({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => { naviguer(id); setMenuMobileOuvert(false); }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-[background-color,color] duration-150 ${
                        section === id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon size={18} />
                      {label}
                      {id === "notifications" && notificationsNonLues > 0 && (
                        <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                          {notificationsNonLues}
                        </span>
                      )}
                    </button>
                  )
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
