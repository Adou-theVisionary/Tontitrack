"use client";

import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell, ChevronDown, Home, Landmark, Menu, MoreHorizontal,
  Search, Settings, ShieldCheck, Users, WalletCards, X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { IndicateurSync, BanniereHorsLigne } from "@/components/IndicateurSync";
import { useApp } from "@/contexts/AppContext";

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
    <div className="min-h-screen bg-[#f8f7f2]">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r bg-[#fbfaf7] px-5 py-7 lg:flex">
        <Logo />
        <div className="mt-10 flex flex-1 flex-col">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#98a099]">Espace principal</p>
          <nav className="space-y-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => naviguer(id)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  section === id
                    ? "bg-[#e8f5ef] text-[#207b54]"
                    : "text-[#657169] hover:bg-[#f0f3ed] hover:text-[#20392d]"
                }`}
              >
                <Icon size={18} strokeWidth={section === id ? 2.4 : 1.9} />
                {label}
                {id === "notifications" && notificationsNonLues > 0 && (
                  <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-[#e0ad39] px-1 text-[10px] font-bold text-white">
                    {notificationsNonLues}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <p className="mb-3 mt-10 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#98a099]">Mon compte</p>
          <nav className="space-y-1">
            <button
              onClick={() => naviguer("profil")}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                section === "profil" ? "bg-[#e8f5ef] text-[#207b54]" : "text-[#657169] hover:bg-[#f0f3ed]"
              }`}
            >
              <ShieldCheck size={18} /> Profil
            </button>
            <button
              onClick={() => naviguer("parametres")}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                section === "parametres" ? "bg-[#e8f5ef] text-[#207b54]" : "text-[#657169] hover:bg-[#f0f3ed]"
              }`}
            >
              <Settings size={18} /> Paramètres
            </button>
          </nav>

          <div className="mt-auto space-y-3">
            {modeDemo && (
              <div className="rounded-xl border border-[#d4eadb] bg-[#edf6ef] px-3 py-2.5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#237e56]">Mode démonstration</p>
                <p className="mt-0.5 text-[11px] text-[#71907c]">Données fictives</p>
              </div>
            )}
            <div className="rounded-2xl bg-[#edf6ef] p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-[#d4eadb] text-sm font-bold text-[#207b54]">
                  {utilisateur?.prenom?.[0]}{utilisateur?.nom?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#20392d]">{utilisateur?.prenom} {utilisateur?.nom}</p>
                  <p className="truncate text-xs text-[#71907c]">Compte sécurisé</p>
                </div>
                <MoreHorizontal size={16} className="ml-auto shrink-0 text-[#71907c]" />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="lg:pl-[248px]">
        <BanniereHorsLigne />
        <header className="sticky top-0 z-20 border-b bg-[#f8f7f2]/90 px-4 py-3.5 backdrop-blur-md sm:px-8 lg:px-10">
          <div className="mx-auto flex max-w-[1320px] items-center justify-between">
            <div className="flex items-center gap-3 lg:hidden">
              <button
                aria-label="Ouvrir le menu"
                onClick={() => setMenuMobileOuvert(true)}
                className="rounded-lg p-2 text-[#607069]"
              >
                <Menu size={21} />
              </button>
              <Logo compact />
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-medium text-[#8a968e]">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
              <h1 className="mt-0.5 text-lg font-semibold text-[#20392d]">{pageTitle}</h1>
            </div>
            <div className="flex items-center gap-2">
              <IndicateurSync />
              <button aria-label="Rechercher" className="hidden rounded-xl p-2.5 text-[#77847b] hover:bg-white sm:block">
                <Search size={18} />
              </button>
              <button
                onClick={() => naviguer("notifications")}
                aria-label="Notifications"
                className="relative rounded-xl p-2.5 text-[#77847b] hover:bg-white"
              >
                <Bell size={19} />
                {notificationsNonLues > 0 && (
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#dfaa32]" />
                )}
              </button>
              <div className="hidden h-8 w-px bg-[#e5e4df] sm:block" />
              <button
                onClick={() => naviguer("profil")}
                className="grid h-9 w-9 place-items-center rounded-full bg-[#d5ebdc] text-xs font-bold text-[#21794f]"
              >
                {utilisateur?.prenom?.[0]}{utilisateur?.nom?.[0]}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1320px] px-4 pb-28 pt-6 sm:px-8 sm:pt-8 lg:px-10 lg:pb-10">
          {children}
        </main>
      </div>

      {/* Bottom navigation mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t bg-[#fffefa]/95 px-2 py-2 shadow-[0_-4px_20px_rgba(31,57,43,.06)] backdrop-blur-md lg:hidden">
        {[...navItems, { id: "profil" as Section, label: "Profil", icon: ShieldCheck, shortLabel: "Profil" }].map(
          ({ id, label, icon: Icon, shortLabel }) => (
            <button
              key={id}
              onClick={() => naviguer(id)}
              className={`flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-medium ${
                section === id ? "text-[#238257]" : "text-[#87918b]"
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
          <div className="absolute inset-0 bg-[#183326]/30 backdrop-blur-sm" onClick={() => setMenuMobileOuvert(false)} />
          <div className="absolute left-0 top-0 h-full w-[280px] bg-[#fbfaf7] p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <Logo />
              <button onClick={() => setMenuMobileOuvert(false)} className="rounded-lg p-2 text-[#77847b]">
                <X size={20} />
              </button>
            </div>
            <div className="mt-8">
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#98a099]">Espace financier</p>
              <div className="mb-4 rounded-xl border bg-white p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Landmark size={16} className="text-[#2e8e62]" />
                  <select
                    value={espaceActifId}
                    onChange={(e) => changerEspace(e.target.value)}
                    className="flex-1 bg-transparent text-sm font-medium text-[#405247] outline-none"
                  >
                    {espaces.map((e) => (
                      <option key={e.id} value={e.id}>{e.nom}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="text-[#9ca8a0]" />
                </div>
              </div>
              <nav className="space-y-1">
                {[...navItems, { id: "parametres" as Section, label: "Paramètres", icon: Settings, shortLabel: "Paramètres" }].map(
                  ({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => { naviguer(id); setMenuMobileOuvert(false); }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${
                        section === id ? "bg-[#e8f5ef] text-[#207b54]" : "text-[#657169] hover:bg-[#f0f3ed]"
                      }`}
                    >
                      <Icon size={18} />
                      {label}
                      {id === "notifications" && notificationsNonLues > 0 && (
                        <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-[#e0ad39] px-1 text-[10px] font-bold text-white">
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
