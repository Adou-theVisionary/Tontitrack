import type {
  ModeTontine,
  StatutTontine,
  StatutCotisation,
  StatutDemande,
  StatutDeclaration,
  StatutVersement,
  StatutIdentite,
  StatutSynchronisation,
  TypeTransaction,
  FrequenceTontine,
  TypeNotification,
  TypeDocument,
} from "@/types";

export function formaterMontant(montant: number, devise = "XOF"): string {
  const formate = new Intl.NumberFormat("fr-FR").format(Math.abs(montant));
  const signe = montant < 0 ? "-" : "";
  return `${signe}${formate} ${devise}`;
}

export function formaterMontantCourt(montant: number): string {
  const abs = Math.abs(montant);
  if (abs >= 1_000_000) return `${(montant / 1_000_000).toFixed(1).replace(".", ",")} M`;
  if (abs >= 1_000) return `${Math.round(montant / 1_000)} k`;
  return String(montant);
}

export function formaterDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function formaterDateCourte(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function formaterDateHeure(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function formaterPourcentage(valeur: number): string {
  return `${Math.round(valeur)}%`;
}

export function libelleModeTontine(mode: ModeTontine): string {
  switch (mode) {
    case "FIXE_CREATEUR": return "Bénéficiaire fixe — créateur";
    case "TOURNANT_EXCLU": return "Bénéficiaire tournant — exempté";
    case "TOURNANT_INCLUS": return "Bénéficiaire tournant — tous cotisent";
  default: return mode;
  }
}

export function libelleStatutTontine(statut: StatutTontine): string {
  switch (statut) {
    case "EN_PREPARATION": return "En préparation";
    case "PRETE_A_DEMARRER": return "Prête à démarrer";
    case "ACTIVE": return "Active";
    case "TERMINEE": return "Terminée";
    case "ANNULEE": return "Annulée";
    case "ARCHIVEE": return "Archivée";
    default: return statut;
  }
}

export function descriptionStatutTontine(statut: StatutTontine): string {
  switch (statut) {
    case "EN_PREPARATION": return "La tontine est en cours de constitution.";
    case "PRETE_A_DEMARRER": return "Tous les participants requis sont présents. La tontine démarrera à la date prévue.";
    case "ACTIVE": return "La tontine est en cours. Les rotations se succèdent selon la fréquence définie.";
    case "TERMINEE": return "Toutes les rotations sont terminées.";
    case "ANNULEE": return "Cette tontine a été annulée avant son démarrage.";
    case "ARCHIVEE": return "Cette tontine est archivée. L'historique reste consultable.";
    default: return "";
  }
}

export function libelleStatutCotisation(statut: StatutCotisation): string {
  switch (statut) {
    case "A_PAYER": return "À payer";
    case "PARTIEL": return "Partiel";
    case "PAYEE": return "Payée";
    case "EN_RETARD": return "En retard";
    case "NON_CONCERNE": return "Non concerné";
    default: return statut;
  }
}

export function libelleStatutDemande(statut: StatutDemande): string {
  switch (statut) {
    case "EN_ATTENTE": return "En attente";
    case "APPROUVE": return "Approuvée";
    case "REFUSE": return "Refusée";
    default: return statut;
  }
}

export function libelleStatutDeclaration(statut: StatutDeclaration): string {
  switch (statut) {
    case "EN_ATTENTE": return "En attente de validation";
    case "VALIDEE": return "Validée";
    case "REJETEE": return "Rejetée";
    default: return statut;
  }
}

export function libelleStatutVersement(statut: StatutVersement): string {
  switch (statut) {
    case "DECLARE": return "Versement déclaré";
    case "CONFIRME": return "Réception confirmée";
    case "NON_RECU": return "Non reçu";
    case "LITIGE": return "En litige";
    case "CONFIRMEE_AUTOMATIQUEMENT": return "Confirmée automatiquement";
    default: return statut;
  }
}

export function libelleStatutIdentite(statut: StatutIdentite): string {
  switch (statut) {
    case "NON_FOURNI": return "Non fourni";
    case "EN_ATTENTE": return "En attente de validation";
    case "VALIDE": return "Validé";
    case "REJETE": return "Rejeté";
    default: return statut;
  }
}

export function libelleStatutSynchronisation(statut: StatutSynchronisation): string {
  switch (statut) {
    case "EN_ATTENTE": return "En attente";
    case "EN_COURS": return "Synchronisation en cours";
    case "SYNCHRONISEE": return "Synchronisé";
    case "ERREUR": return "Erreur de synchronisation";
    case "CONFLIT": return "Conflit de synchronisation";
    default: return statut;
  }
}

export function libelleTypeTransaction(type: TypeTransaction): string {
  switch (type) {
    case "REVENU": return "Revenu";
    case "DEPENSE": return "Dépense";
    case "EPARGNE": return "Épargne";
    case "INVESTISSEMENT": return "Investissement";
    default: return type;
  }
}

export function libelleFrequence(frequence: FrequenceTontine): string {
  switch (frequence) {
    case "QUOTIDIENNE": return "Quotidienne";
    case "HEBDOMADAIRE": return "Hebdomadaire";
    case "MENSUELLE": return "Mensuelle";
    default: return frequence;
  }
}

export function libelleTypeNotification(type: TypeNotification): string {
  switch (type) {
    case "INVITATION": return "Invitation";
    case "DEMANDE_ADHESION": return "Demande d'adhésion";
    case "DEMANDE_ACCEPTEE": return "Demande acceptée";
    case "DEMANDE_REFUSEE": return "Demande refusée";
    case "COTISATION_A_PAYER": return "Cotisation à payer";
    case "COTISATION_EN_RETARD": return "Cotisation en retard";
    case "COTISATION_VALIDEE": return "Cotisation validée";
    case "COTISATION_REJETEE": return "Cotisation rejetée";
    case "NOUVELLE_ROTATION": return "Nouvelle rotation";
    case "VERSEMENT_DECLARE": return "Versement déclaré";
    case "CONFIRMATION_RECEPTION": return "Confirmation de réception";
    case "TONTINE_DEMARREE": return "Tontine démarrée";
    case "TONTINE_TERMINEE": return "Tontine terminée";
    default: return type;
  }
}

export function libelleTypeDocument(type: TypeDocument): string {
  switch (type) {
    case "CARTE_NATIONALE": return "Carte nationale d'identité";
    case "PASSEPORT": return "Passeport";
    case "PERMIS_CONDUIRE": return "Permis de conduire";
    case "ATTESTATION": return "Attestation";
    default: return type;
  }
}

export function calculerNombreTours(mode: ModeTontine, nombreMembres: number): number {
  if (mode === "FIXE_CREATEUR") return Math.max(0, nombreMembres - 1);
  return nombreMembres;
}

export function calculerResteAPayer(montantAttendu: number, montantValide: number): number {
  return Math.max(0, montantAttendu - montantValide);
}

export function calculerPourcentage(montantValide: number, montantAttendu: number): number {
  if (montantAttendu <= 0) return 0;
  return Math.min(100, (montantValide / montantAttendu) * 100);
}

export function genererCodeInvitation(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function genererId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function genererIdempotencyKey(): string {
  return crypto.randomUUID();
}
