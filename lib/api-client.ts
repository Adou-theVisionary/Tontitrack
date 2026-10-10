import type { ReponseApi } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export class ErreurApi extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "ErreurApi";
  }
}

export async function appelApi<T>(
  chemin: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${chemin}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const corps: ReponseApi<T> = await response.json();

  if (!response.ok || corps.erreur) {
    throw new ErreurApi(
      corps.erreur?.code || "ERREUR_INCONNUE",
      corps.erreur?.message || "Une erreur est survenue."
    );
  }

  return corps.donnees;
}

export function traduireErreurApi(code: string): string {
  const messages: Record<string, string> = {
    TONTINE_NON_MODIFIABLE: "Cette tontine ne peut plus être modifiée.",
    TONTINE_ACTIVE: "Cette tontine est déjà active.",
    OPERATION_NON_AUTORISEE: "Cette opération n'est plus autorisée.",
    IDENTITE_NON_FOURNIE: "Vous devez fournir votre document d'identité avant de continuer.",
    COTISATION_EXCEEDS_RESTE: "Le montant dépasse le reste à payer.",
    COMPTE_NON_SUPPRIMABLE: "Vous participez à une tontine active. Votre compte ne peut pas être supprimé.",
    MOTIF_REJET_REQUIS: "Le motif du rejet est obligatoire.",
    API_NON_CONFIGUREE: "Mode démonstration : l'API backend n'est pas encore connectée.",
    ERREUR_INCONNUE: "Une erreur inattendue est survenue. Veuillez réessayer.",
  };
  return messages[code] || "Une erreur est survenue. Veuillez réessayer.";
}
