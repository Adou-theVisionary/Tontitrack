"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ArrowLeft, BookOpenCheck, Boxes, LayoutDashboard, Menu, Settings, ShieldCheck, Siren, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { SelecteurTheme } from "@/components/theme/SelecteurTheme";
import type { PermissionPlateforme } from "@/lib/administration/permissions";

const navigation: { href: string; libelle: string; icone: typeof LayoutDashboard; permission: PermissionPlateforme }[] = [
  { href: "/administration-plateforme", libelle: "Vue d’ensemble", icone: LayoutDashboard, permission: "plateforme.tableau_de_bord.lire" },
  { href: "/administration-plateforme/utilisateurs", libelle: "Utilisateurs", icone: Users, permission: "plateforme.utilisateurs.lire" },
  { href: "/administration-plateforme/roles", libelle: "Rôles et permissions", icone: ShieldCheck, permission: "plateforme.roles.gerer" },
  { href: "/administration-plateforme/modules", libelle: "Modules", icone: Boxes, permission: "plateforme.modules.lire" },
  { href: "/administration-plateforme/tontines", libelle: "Supervision tontines", icone: Activity, permission: "tontines.supervision.lire" },
  { href: "/administration-plateforme/litiges", libelle: "Litiges", icone: ShieldCheck, permission: "tontines.litiges.lire" },
  { href: "/administration-plateforme/audit", libelle: "Journal d’audit", icone: BookOpenCheck, permission: "plateforme.audit.lire" },
  { href: "/administration-plateforme/incidents", libelle: "Incidents", icone: Siren, permission: "plateforme.incidents.lire" },
  { href: "/administration-plateforme/parametres", libelle: "Paramètres", icone: Settings, permission: "plateforme.parametres.lire" },
];

type PropsAppShellAdministration = {
  children: React.ReactNode;
  nom: string;
  roles: string[];
  permissions: PermissionPlateforme[];
};

export function AppShellAdministration({ children, nom, roles, permissions }: PropsAppShellAdministration) {
  const pathname = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const liens = navigation.filter((lien) => permissions.includes(lien.permission));

  useEffect(() => {
    if (!ouvert) return;
    const fermerAvecEchap = (evenement: KeyboardEvent) => {
      if (evenement.key === "Escape") setOuvert(false);
    };
    window.addEventListener("keydown", fermerAvecEchap);
    return () => window.removeEventListener("keydown", fermerAvecEchap);
  }, [ouvert]);
  const menu = (
    <nav className="space-y-1">
      {liens.map(({ href, libelle, icone: Icone }) => {
        const actif = href === "/administration-plateforme"
          ? pathname === href
          : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={actif ? "page" : undefined}
            onClick={() => setOuvert(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-[background-color,color,box-shadow] duration-150 ${
              actif
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icone size={18} strokeWidth={actif ? 2.4 : 1.9} />
            {libelle}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r bg-card px-5 py-7 lg:flex">
        <Logo />
        <div className="mt-10 flex flex-1 flex-col">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground">
            Administration globale
          </p>
          {menu}
          <div className="mt-auto rounded-2xl bg-primary/10 p-4">
            <p className="truncate text-sm font-semibold text-foreground">{nom}</p>
            <p className="mt-1 text-xs text-muted-foreground">{roles.join(" · ")}</p>
          </div>
        </div>
      </aside>

      <div className="min-w-0 lg:pl-[248px]">
        <header className="sticky top-0 z-20 border-b bg-background/90 px-3 py-3 backdrop-blur-md sm:px-8 sm:py-3.5 lg:px-10">
          <div className="mx-auto flex min-w-0 max-w-[1320px] items-center justify-between gap-2">
            <div className="flex items-center gap-3 lg:hidden">
              <button aria-label="Ouvrir le menu administratif" onClick={() => setOuvert(true)} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-muted">
                <Menu size={21} />
              </button>
              <Logo compact />
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-medium text-muted-foreground">Espace protégé</p>
              <h1 className="mt-0.5 text-lg font-semibold text-foreground">Administration TontiTrack</h1>
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <SelecteurTheme className="hidden sm:inline-flex" />
              <Link aria-label="Retour à mon espace" className="inline-flex h-11 items-center gap-2 rounded-xl px-2 text-sm font-medium text-primary transition-colors duration-150 hover:bg-card sm:px-3" href="/tableau-de-bord">
                <ArrowLeft size={17} />
                <span className="hidden sm:inline">Retour à mon espace</span>
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto min-w-0 max-w-[1320px] px-4 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-6 sm:px-8 sm:pt-8 lg:px-10">{children}</main>
      </div>

      {ouvert && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button aria-label="Fermer le menu" className="absolute inset-0 cursor-default bg-foreground/30 backdrop-blur-sm animate-in fade-in-0 duration-200 motion-reduce:backdrop-blur-none" onClick={() => setOuvert(false)} />
          <div role="dialog" aria-modal="true" aria-label="Menu administratif" className="absolute left-0 top-0 h-full w-[min(280px,calc(100vw-2rem))] overflow-y-auto overscroll-contain bg-card p-5 shadow-2xl animate-in slide-in-from-left duration-200 [animation-timing-function:var(--easing-naturel)]">
            <div className="flex items-center justify-between">
              <Logo />
              <button aria-label="Fermer" onClick={() => setOuvert(false)} className="grid h-11 w-11 place-items-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-muted">
                <X size={20} />
              </button>
            </div>
            <p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground">Administration globale</p>
            <SelecteurTheme className="mb-4 flex w-full justify-between" />
            {menu}
          </div>
        </div>
      )}
    </div>
  );
}
