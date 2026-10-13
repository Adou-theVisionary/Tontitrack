import type { Tontine, MembreTontine, Rotation } from "@/types";

export type TontineApi = {
  id: string; nom: string; mode: Tontine["mode"]; statut: Tontine["statut"]; montantCotisation: string | number;
  devise: string; frequence: Tontine["frequence"]; nombreParticipantsRequis: number; dateCommencement: string;
  createurId: string; fuseauHoraire?: string; visibilite?: "PUBLIQUE" | "PRIVEE"; adhesionsFermees?: boolean;
  nombreMembresApprouves?: number; modeDemarrage?: "MANUEL" | "AUTOMATIQUE"; methodeOrdre?: "MANUEL" | "ALEATOIRE";
  demarreeLe?: string | null; reglesVerrouilleesLe?: string | null;
  membres?: Array<{ id: string; utilisateurId: string; role: "CREATEUR" | "MEMBRE"; statut: "EN_ATTENTE" | "APPROUVE" | "REFUSE" | "RETIRE" | "TERMINE"; utilisateur?: { profil?: { prenom: string; nom: string } | null } }>;
};

export type RotationApi = {
  id: string; numero: number; statut: Rotation["statut"]; debutLe: string; echeanceLe: string; montantTheorique: string | number; montantValide: string | number;
  beneficiaire: { id: string; utilisateur: { profil: { prenom: string; nom: string } | null } };
};

/** Convertit seulement données réellement renvoyées par les API sécurisées. */
export function adapterTontineApi(tontine: TontineApi, utilisateurId?: string, rotationsApi: RotationApi[] = []): Tontine {
  const membres: MembreTontine[] = (tontine.membres ?? []).map((membre) => ({ id: membre.id, utilisateurId: membre.utilisateurId, prenom: membre.utilisateur?.profil?.prenom ?? "Membre", nom: membre.utilisateur?.profil?.nom ?? "", telephone: "", avatarCouleur: "#237e56", statut: membre.statut === "RETIRE" || membre.statut === "TERMINE" ? "REFUSE" : membre.statut, estCreateur: membre.role === "CREATEUR", position: 0 }));
  const rotations: Rotation[] = rotationsApi.map((rotation) => ({ id: rotation.id, numero: rotation.numero, beneficiaireId: rotation.beneficiaire.id, beneficiaireNom: [rotation.beneficiaire.utilisateur.profil?.prenom, rotation.beneficiaire.utilisateur.profil?.nom].filter(Boolean).join(" ") || "Membre", date: rotation.debutLe, montantAttendu: Number(rotation.montantTheorique), montantCollecte: Number(rotation.montantValide), statut: rotation.statut }));
  return { id: tontine.id, nom: tontine.nom, mode: tontine.mode, statut: tontine.statut, montantCotisation: Number(tontine.montantCotisation), devise: tontine.devise, frequence: tontine.frequence, nombreParticipantsRequis: tontine.nombreParticipantsRequis, nombreMembresApprouves: tontine.nombreMembresApprouves ?? membres.filter((m) => m.statut === "APPROUVE").length, dateCommencement: tontine.dateCommencement, fuseauHoraire: tontine.fuseauHoraire ?? "", createurId: tontine.createurId, createurNom: "", membres, rotations, cotisations: [], declarations: [], versements: [], codeInvitation: "", estCreateur: tontine.createurId === utilisateurId, visibilite: tontine.visibilite, adhesionsFermees: tontine.adhesionsFermees, modeDemarrage: tontine.modeDemarrage, methodeOrdre: tontine.methodeOrdre, demarreeLe: tontine.demarreeLe, reglesVerrouilleesLe: tontine.reglesVerrouilleesLe };
}
