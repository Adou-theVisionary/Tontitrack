import type { Tontine, MembreTontine } from "@/types";

export type TontineApi = {
  id: string; nom: string; mode: Tontine["mode"]; statut: Tontine["statut"]; montantCotisation: string | number;
  devise: string; frequence: Tontine["frequence"]; nombreParticipantsRequis: number; dateCommencement: string;
  createurId: string; fuseauHoraire?: string; visibilite?: "PUBLIQUE" | "PRIVEE"; adhesionsFermees?: boolean;
  membres?: Array<{ id: string; utilisateurId: string; role: "CREATEUR" | "MEMBRE"; statut: "EN_ATTENTE" | "APPROUVE" | "REFUSE" | "RETIRE" | "TERMINE"; utilisateur?: { profil?: { prenom: string; nom: string } | null } }>;
};

/** Convertit réponse API sans inventer rotations, cotisations ou versements indisponibles. */
export function adapterTontineApi(tontine: TontineApi, utilisateurId?: string): Tontine {
  const membres: MembreTontine[] = (tontine.membres ?? []).map((membre) => ({ id: membre.id, utilisateurId: membre.utilisateurId, prenom: membre.utilisateur?.profil?.prenom ?? "Membre", nom: membre.utilisateur?.profil?.nom ?? "", telephone: "", avatarCouleur: "#237e56", statut: membre.statut === "RETIRE" || membre.statut === "TERMINE" ? "REFUSE" : membre.statut, estCreateur: membre.role === "CREATEUR", position: 0 }));
  return { id: tontine.id, nom: tontine.nom, mode: tontine.mode, statut: tontine.statut, montantCotisation: Number(tontine.montantCotisation), devise: tontine.devise, frequence: tontine.frequence, nombreParticipantsRequis: tontine.nombreParticipantsRequis, nombreMembresApprouves: membres.filter((m) => m.statut === "APPROUVE").length, dateCommencement: tontine.dateCommencement, fuseauHoraire: tontine.fuseauHoraire ?? "", createurId: tontine.createurId, createurNom: "", membres, rotations: [], cotisations: [], declarations: [], versements: [], codeInvitation: "", estCreateur: tontine.createurId === utilisateurId, visibilite: tontine.visibilite, adhesionsFermees: tontine.adhesionsFermees };
}
