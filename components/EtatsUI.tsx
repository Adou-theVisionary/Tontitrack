import { Loader2, AlertCircle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EtatChargement({ message = "Chargement..." }: { message?: string }) {
  return (
    <div className="entree-discrete flex flex-col items-center justify-center gap-3 py-16" role="status" aria-live="polite">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    <div className="retour-validation flex flex-col items-center justify-center gap-3 py-16" role="alert">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle size={26} />
      </div>
      <p className="text-center text-sm font-medium text-foreground">{message}</p>
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
    <div className="entree-discrete flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
        <Inbox size={28} />
      </div>
      <p className="text-base font-semibold text-foreground">{titre}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-2">
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
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}
