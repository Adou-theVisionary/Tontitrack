"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, CalendarDays, Users, CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { appelApi } from "@/lib/api-client";
import { formaterDateHeure, libelleTypeNotification } from "@/lib/format";
import { useRafraichissementActif } from "@/hooks/useRafraichissementActif";
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
  RECEPTION_PARTIELLE: AlertCircle,
  VERSEMENT_CONTESTE: AlertCircle,
  VERSEMENT_REGULARISE: CreditCard,
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
  RECEPTION_PARTIELLE: "amber",
  VERSEMENT_CONTESTE: "red",
  VERSEMENT_REGULARISE: "blue",
  TONTINE_DEMARREE: "green",
  TONTINE_TERMINEE: "gray",
};

export function PageNotifications() {
  const router = useRouter();
  const [filtre, setFiltre] = useState<"non_lues" | "toutes">("non_lues");
  const [notifications, setNotifications] = useState<(Notification & { cibleUrl?: string | null })[]>([]);

  const charger = useCallback(async () => {
    try { setNotifications(await appelApi<(Notification & { cibleUrl?: string | null })[]>("/api/notifications")); }
    catch { setNotifications([]); }
  }, []);

  useEffect(() => { void charger(); }, [charger]);
  useRafraichissementActif(charger);

  const marquerNotificationLue = async (notificationId: string) => {
    try { await appelApi(`/api/notifications/${notificationId}`, { method: "PATCH" }); }
    finally { setNotifications((courantes) => courantes.map((notification) => notification.id === notificationId ? { ...notification, lue: true } : notification)); }
  };

  const marquerToutesNotificationsLues = async () => {
    try { await appelApi("/api/notifications", { method: "PATCH" }); }
    finally { setNotifications((courantes) => courantes.map((notification) => ({ ...notification, lue: true }))); }
  };

  const notificationsFiltrees = filtre === "non_lues" ? notifications.filter((n) => !n.lue) : notifications;
  const nonLues = notifications.filter((n) => !n.lue).length;
  const cheminNotification = (notification: Notification & { cibleUrl?: string | null }): string | null => {
    if (notification.cibleUrl) return notification.cibleUrl;
    if (!notification.tontineId) return null;
    const onglet = notification.type === "DEMANDE_ADHESION" ? "membres"
      : notification.type === "COTISATION_A_PAYER" || notification.type === "COTISATION_EN_RETARD" || notification.type === "COTISATION_VALIDEE" || notification.type === "COTISATION_REJETEE" ? "cotisations"
      : notification.type === "VERSEMENT_DECLARE" || notification.type === "CONFIRMATION_RECEPTION" || notification.type === "RECEPTION_PARTIELLE" || notification.type === "VERSEMENT_CONTESTE" || notification.type === "VERSEMENT_REGULARISE" ? "reversements"
      : notification.type === "NOUVELLE_ROTATION" ? "rotations"
      : notification.type === "INVITATION" ? "invitations"
      : "resume";
    return `/tontines/${notification.tontineId}/${onglet}`;
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Restez informé</p>
          <h2 className="mt-1 text-xl font-semibold text-foreground">Vos notifications</h2>
        </div>
        {nonLues > 0 && (
          <Button onClick={marquerToutesNotificationsLues} variant="outline" className="w-full sm:w-auto">
            <Check size={16} /> Tout marquer comme lu
          </Button>
        )}
      </div>

      <div className="flex gap-5 overflow-x-auto border-b text-sm">
        <button
          onClick={() => setFiltre("non_lues")}
          className={`min-h-11 shrink-0 border-b-2 pb-3 font-semibold ${filtre === "non_lues" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
        >
          Non lues {nonLues > 0 && <span className="ml-1 rounded-full bg-primary-soft px-2 py-0.5 text-xs">{nonLues}</span>}
        </button>
        <button
          onClick={() => setFiltre("toutes")}
          className={`min-h-11 shrink-0 border-b-2 pb-3 ${filtre === "toutes" ? "border-primary font-semibold text-primary" : "border-transparent text-muted-foreground"}`}
        >
          Toutes
        </button>
      </div>

      {notificationsFiltrees.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center">
          <Bell size={32} className="mx-auto text-primary" />
          <p className="mt-3 text-sm font-medium text-foreground">Aucune notification.</p>
          <p className="mt-1 text-xs text-muted-foreground">Vous êtes à jour.</p>
        </div>
      ) : (
        <div className="divide-y rounded-2xl border bg-card">
          {notificationsFiltrees.map((notif) => {
            const Icon = iconesParType[notif.type] || Bell;
            const tone = toneParType[notif.type] || "gray";
            const toneStyles: Record<string, string> = {
              green: "bg-primary-soft text-success",
              blue: "bg-info/15 text-info",
              amber: "bg-warning/15 text-warning",
              red: "bg-destructive/15 text-destructive",
              gray: "bg-muted text-muted-foreground",
            };
            return (
              <button
                key={notif.id}
                onClick={() => { void marquerNotificationLue(notif.id); const chemin = cheminNotification(notif); if (chemin) router.push(chemin); }}
                className={`entree-discrete flex w-full gap-4 p-5 text-left transition-[background-color,box-shadow,transform] duration-200 hover:bg-surface-subtle hover:shadow-sm focus-visible:relative ${!notif.lue ? "bg-surface-raised" : ""}`}
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${toneStyles[tone]}`}>
                  <Icon size={17} />
                </span>
                <div className="flex-1">
                  <div className="flex flex-col justify-between gap-1 sm:flex-row">
                    <p className="text-sm font-semibold text-foreground">{notif.titre}</p>
                    <span className="text-xs text-muted-foreground">{formaterDateHeure(notif.date)}</span>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">{notif.message}</p>
                  <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {libelleTypeNotification(notif.type)}
                  </p>
                </div>
                {!notif.lue && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-warning" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
