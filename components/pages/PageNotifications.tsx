"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, CalendarDays, Users, CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { formaterDateHeure, libelleTypeNotification } from "@/lib/format";
import type { TypeNotification, Notification } from "@/types";

const iconesParType: Record<TypeNotification, typeof Bell> = {
  INVITATION: Users,
  DEMANDE_ADHESION: Users,
  DEMANDE_ACCEPTEE: CheckCircle2,
  DEMANDE_REFUSEE: AlertCircle,
  COTISATION_A_PAYER: CreditCard,
  COTISATION_EN_RETARD: AlertCircle,
  COTISATION_VALIDEE: CheckCircle2,
  COTISATION_REJETEE: AlertCircle,
  NOUVELLE_ROTATION: CalendarDays,
  VERSEMENT_DECLARE: CreditCard,
  CONFIRMATION_RECEPTION: Bell,
  TONTINE_DEMARREE: CheckCircle2,
  TONTINE_TERMINEE: CheckCircle2,
};

const toneParType: Record<TypeNotification, "green" | "blue" | "amber" | "red" | "gray"> = {
  INVITATION: "blue",
  DEMANDE_ADHESION: "blue",
  DEMANDE_ACCEPTEE: "green",
  DEMANDE_REFUSEE: "red",
  COTISATION_A_PAYER: "amber",
  COTISATION_EN_RETARD: "red",
  COTISATION_VALIDEE: "green",
  COTISATION_REJETEE: "red",
  NOUVELLE_ROTATION: "gray",
  VERSEMENT_DECLARE: "blue",
  CONFIRMATION_RECEPTION: "amber",
  TONTINE_DEMARREE: "green",
  TONTINE_TERMINEE: "gray",
};

export function PageNotifications() {
  const { notifications, marquerNotificationLue, marquerToutesNotificationsLues } = useApp();
  const router = useRouter();
  const [filtre, setFiltre] = useState<"non_lues" | "toutes">("non_lues");

  const notificationsFiltrees = filtre === "non_lues" ? notifications.filter((n) => !n.lue) : notifications;
  const nonLues = notifications.filter((n) => !n.lue).length;
  const cheminNotification = (notification: Notification): string | null => {
    if (!notification.tontineId) return null;
    const onglet = notification.type === "DEMANDE_ADHESION" ? "membres"
      : notification.type === "COTISATION_A_PAYER" || notification.type === "COTISATION_EN_RETARD" || notification.type === "COTISATION_VALIDEE" || notification.type === "COTISATION_REJETEE" ? "cotisations"
      : notification.type === "VERSEMENT_DECLARE" || notification.type === "CONFIRMATION_RECEPTION" || notification.type === "NOUVELLE_ROTATION" ? "rotations"
      : notification.type === "INVITATION" ? "invitations"
      : "resume";
    return `/tontines/${notification.tontineId}/${onglet}`;
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Restez informé</p>
          <h2 className="mt-1 text-xl font-semibold text-[#20392d]">Vos notifications</h2>
        </div>
        {nonLues > 0 && (
          <Button onClick={marquerToutesNotificationsLues} variant="outline" className="border-[#c5dcc9] text-[#237e56]">
            <Check size={16} /> Tout marquer comme lu
          </Button>
        )}
      </div>

      <div className="flex gap-5 border-b text-sm">
        <button
          onClick={() => setFiltre("non_lues")}
          className={`border-b-2 pb-3 font-semibold ${filtre === "non_lues" ? "border-[#2c8c60] text-[#237e56]" : "border-transparent text-muted-foreground"}`}
        >
          Non lues {nonLues > 0 && <span className="ml-1 rounded-full bg-[#e8f5ef] px-2 py-0.5 text-xs">{nonLues}</span>}
        </button>
        <button
          onClick={() => setFiltre("toutes")}
          className={`border-b-2 pb-3 ${filtre === "toutes" ? "border-[#2c8c60] font-semibold text-[#237e56]" : "border-transparent text-muted-foreground"}`}
        >
          Toutes
        </button>
      </div>

      {notificationsFiltrees.length === 0 ? (
        <div className="rounded-2xl border bg-white p-12 text-center">
          <Bell size={32} className="mx-auto text-[#9bc8aa]" />
          <p className="mt-3 text-sm font-medium text-[#405247]">Aucune notification.</p>
          <p className="mt-1 text-xs text-muted-foreground">Vous êtes à jour.</p>
        </div>
      ) : (
        <div className="divide-y rounded-2xl border bg-white">
          {notificationsFiltrees.map((notif) => {
            const Icon = iconesParType[notif.type] || Bell;
            const tone = toneParType[notif.type] || "gray";
            const toneStyles: Record<string, string> = {
              green: "bg-[#e8f5ef] text-[#27845a]",
              blue: "bg-[#e8f2f8] text-[#287397]",
              amber: "bg-[#fff3d8] text-[#a96d00]",
              red: "bg-[#fdebea] text-[#a53d39]",
              gray: "bg-[#f0f1ee] text-[#68746d]",
            };
            return (
              <button
                key={notif.id}
                onClick={() => { marquerNotificationLue(notif.id); const chemin = cheminNotification(notif); if (chemin) router.push(chemin); }}
                className={`flex w-full gap-4 p-5 text-left transition hover:bg-[#fbfcf9] ${!notif.lue ? "bg-[#fcfefb]" : ""}`}
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${toneStyles[tone]}`}>
                  <Icon size={17} />
                </span>
                <div className="flex-1">
                  <div className="flex flex-col justify-between gap-1 sm:flex-row">
                    <p className="text-sm font-semibold text-[#33473b]">{notif.titre}</p>
                    <span className="text-xs text-muted-foreground">{formaterDateHeure(notif.date)}</span>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">{notif.message}</p>
                  <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-[#98a099]">
                    {libelleTypeNotification(notif.type)}
                  </p>
                </div>
                {!notif.lue && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#dda735]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
