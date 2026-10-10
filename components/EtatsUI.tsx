import { Loader2, AlertCircle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EtatChargement({ message = "Chargement..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Loader2 className="h-8 w-8 animate-spin text-[#237e56]" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function EtatErreur({
  message = "Une erreur est survenue.",
  onReessayer,
}: {
  message?: string;
  onReessayer?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-[#fdebea] text-[#a53d39]">
        <AlertCircle size={26} />
      </div>
      <p className="text-center text-sm font-medium text-[#405247]">{message}</p>
      {onReessayer && (
        <Button variant="outline" onClick={onReessayer} className="mt-1">
          Réessayer
        </Button>
      )}
    </div>
  );
}

export function EtatVide({
  titre,
  description,
  actionLabel,
  onAction,
  actionSecondaireLabel,
  onActionSecondaire,
}: {
  titre: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionSecondaireLabel?: string;
  onActionSecondaire?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-[#f1f8f2] text-[#237e56]">
        <Inbox size={28} />
      </div>
      <p className="text-base font-semibold text-[#20392d]">{titre}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-2 bg-[#237e56] hover:bg-[#1c6847]">
          {actionLabel}
        </Button>
      )}
      {actionSecondaireLabel && onActionSecondaire && (
        <Button variant="outline" onClick={onActionSecondaire} className="mt-1">
          {actionSecondaireLabel}
        </Button>
      )}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#e8e7e2] ${className}`} />;
}
