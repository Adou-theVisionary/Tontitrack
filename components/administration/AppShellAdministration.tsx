"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BookOpenCheck, Boxes, LayoutDashboard, Menu, Settings, ShieldCheck, Users, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import type { PermissionPlateforme } from "@/lib/administration/permissions";

const navigation: { href: string; libelle: string; icone: typeof LayoutDashboard; permission: PermissionPlateforme }[] = [
  { href: "/administration-plateforme", libelle: "Vue d’ensemble", icone: LayoutDashboard, permission: "plateforme.tableau_de_bord.lire" },
  { href: "/administration-plateforme/utilisateurs", libelle: "Utilisateurs", icone: Users, permission: "plateforme.utilisateurs.lire" },
  { href: "/administration-plateforme/roles", libelle: "Rôles et permissions", icone: ShieldCheck, permission: "plateforme.roles.gerer" },
  { href: "/administration-plateforme/modules", libelle: "Modules", icone: Boxes, permission: "plateforme.modules.lire" },
  { href: "/administration-plateforme/tontines", libelle: "Supervision tontines", icone: Activity, permission: "tontines.supervision.lire" },
  { href: "/administration-plateforme/audit", libelle: "Journal d’audit", icone: BookOpenCheck, permission: "plateforme.audit.lire" },
  { href: "/administration-plateforme/parametres", libelle: "Paramètres", icone: Settings, permission: "plateforme.parametres.lire" },
];

export function AppShellAdministration({ children, nom, roles, permissions }: { children: React.ReactNode; nom: string; roles: string[]; permissions: PermissionPlateforme[] }) {
  const pathname = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const liens = navigation.filter((lien) => permissions.includes(lien.permission));
  const menu = (mobile = false) => <nav className="space-y-1">{liens.map(({ href, libelle, icone: Icone }) => {
    const actif = href === "/administration-plateforme" ? pathname === href : pathname.startsWith(href);
    return <Link key={href} href={href} onClick={() => setOuvert(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${actif ? "bg-[#e8f5ef] text-[#207b54]" : "text-[#657169] hover:bg-[#f0f3ed] hover:text-[#20392d]"}`}><Icone size={18} strokeWidth={actif ? 2.4 : 1.9} />{libelle}</Link>;
  })}</nav>;
  return <div className="min-h-screen bg-[#f8f7f2]">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r bg-[#fbfaf7] px-5 py-7 lg:flex">
      <Logo />
      <div className="mt-10 flex flex-1 flex-col">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#98a099]">Administration globale</p>{menu()}
        <div className="mt-auto rounded-2xl bg-[#edf6ef] p-4"><p className="truncate text-sm font-semibold text-[#20392d]">{nom}</p><p className="mt-1 text-xs text-[#71907c]">{roles.join(" · ")}</p></div>
      </div>
    </aside>
    <div className="lg:pl-[248px]">
      <header className="sticky top-0 z-20 border-b bg-[#f8f7f2]/90 px-4 py-3.5 backdrop-blur-md sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between"><div className="flex items-center gap-3 lg:hidden"><button aria-label="Ouvrir le menu administratif" onClick={() => setOuvert(true)} className="rounded-lg p-2 text-[#607069]"><Menu size={21} /></button><Logo compact /></div><div className="hidden lg:block"><p className="text-xs font-medium text-[#8a968e]">Espace protégé</p><h1 className="mt-0.5 text-lg font-semibold text-[#20392d]">Administration TontiTrack</h1></div><Link className="rounded-xl px-3 py-2 text-sm font-medium text-[#237e56] hover:bg-white" href="/tableau-de-bord">Retour à mon espace</Link></div>
      </header>
      <main className="mx-auto max-w-[1320px] px-4 pb-10 pt-6 sm:px-8 sm:pt-8 lg:px-10">{children}</main>
    </div>
    {ouvert && <div className="fixed inset-0 z-40 lg:hidden"><button aria-label="Fermer le menu" className="absolute inset-0 bg-[#183326]/30 backdrop-blur-sm" onClick={() => setOuvert(false)} /><div className="absolute left-0 top-0 h-full w-[280px] bg-[#fbfaf7] p-5 shadow-2xl"><div className="flex items-center justify-between"><Logo /><button aria-label="Fermer" onClick={() => setOuvert(false)} className="rounded-lg p-2 text-[#77847b]"><X size={20} /></button></div><p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#98a099]">Administration globale</p>{menu(true)}</div></div>}
  </div>;
}
