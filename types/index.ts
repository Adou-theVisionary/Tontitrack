// Types TypeScript correspondant au contrat API du backend TontiTrack V1.
// Ces types reflètent exactement les valeurs métier attendues par le backend.

export type ModeTontine = "FIXE_CREATEUR" | "TOURNANT_EXCLU" | "TOURNANT_INCLUS";

export type StatutTontine =
  | "EN_PREPARATION"
  | "PRETE_A_DEMARRER"
  | "ACTIVE"
  | "TERMINEE"
  | "ANNULEE"
  | "ARCHIVEE";

export type StatutCotisation =
  | "A_PAYER"
  | "PARTIEL"
  | "PAYEE"
  | "EN_RETARD"
  | "NON_CONCERNE";

export type StatutDemande = "EN_ATTENTE" | "APPROUVE" | "REFUSE";

export type StatutDeclaration = "EN_ATTENTE" | "VALIDEE" | "REJETEE";

export type StatutVersement = "DECLARE" | "CONFIRME" | "NON_RECU" | "LITIGE" | "CONFIRMEE_AUTOMATIQUEMENT";

export type StatutSynchronisation = "EN_ATTENTE" | "EN_COURS" | "SYNCHRONISEE" | "ERREUR" | "CONFLIT";

export type StatutIdentite = "NON_FOURNI" | "EN_ATTENTE" | "VALIDE" | "REJETE";

export type TypeTransaction = "REVENU" | "DEPENSE" | "EPARGNE" | "INVESTISSEMENT";

export type StatutTransaction = "ACTIVE" | "ANNULEE";

export type FrequenceTontine = "QUOTIDIENNE" | "HEBDOMADAIRE" | "MENSUELLE";

export type TypeNotification =
  | "INVITATION"
  | "DEMANDE_ADHESION"
  | "DEMANDE_ACCEPTEE"
  | "DEMANDE_REFUSEE"
  | "COTISATION_A_PAYER"
  | "COTISATION_EN_RETARD"
  | "COTISATION_VALIDEE"
  | "COTISATION_REJETEE"
  | "NOUVELLE_ROTATION"
  | "VERSEMENT_DECLARE"
  | "CONFIRMATION_RECEPTION"
  | "TONTINE_DEMARREE"
  | "TONTINE_TERMINEE";

export type EspaceFinancier = "PERSONNEL" | "ACTIVITE";

export type TypeDocument = "CARTE_NATIONALE" | "PASSEPORT" | "PERMIS_CONDUIRE" | "ATTESTATION";

export interface Utilisateur {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  photoUrl?: string;
  statutIdentite: StatutIdentite;
  dateInscription: string;
}

export interface EspaceFinancierInfo {
  id: string;
  nom: string;
  type: EspaceFinancier;
}

export interface Transaction {
  id: string;
  espaceId: string;
  type: TypeTransaction;
  montant: number;
  devise: string;
  categorieId: string;
  categorieNom: string;
  description: string;
  moyenPaiement: string;
  dateOperation: string;
  statut: StatutTransaction;
}

export interface Categorie {
  id: string;
  nom: string;
  type: TypeTransaction;
  estSysteme: boolean;
  estArchive: boolean;
}

export interface MembreTontine {
  id: string;
  utilisateurId: string;
  prenom: string;
  nom: string;
  telephone: string;
  avatarCouleur: string;
  statut: "APPROUVE" | "EN_ATTENTE" | "REFUSE";
  estCreateur: boolean;
  position: number;
}

export interface Cotisation {
  id: string;
  rotationId: string;
  membreId: string;
  membreNom: string;
  montantAttendu: number;
  montantValide: number;
  statut: StatutCotisation;
}

export interface Rotation {
  id: string;
  numero: number;
  beneficiaireId: string;
  beneficiaireNom: string;
  date: string;
  montantAttendu: number;
  montantCollecte: number;
  statut: "EN_ATTENTE" | "EN_COURS" | "TERMINEE";
}

export interface DeclarationCotisation {
  id: string;
  cotisationId: string;
  montant: number;
  preuveUrl?: string;
  preuveNom?: string;
  statut: StatutDeclaration;
  motifRejet?: string;
  dateDeclaration: string;
}

export interface Versement {
  id: string;
  rotationId: string;
  montant: number;
  preuveUrl?: string;
  preuveNom?: string;
  statut: StatutVersement;
  dateDeclaration: string;
  tempsRestantConfirmation?: string;
}

export interface Tontine {
  id: string;
  nom: string;
  mode: ModeTontine;
  statut: StatutTontine;
  montantCotisation: number;
  devise: string;
  frequence: FrequenceTontine;
  nombreParticipantsRequis: number;
  nombreMembresApprouves: number;
  dateCommencement: string;
  fuseauHoraire: string;
  createurId: string;
  createurNom: string;
  membres: MembreTontine[];
  rotations: Rotation[];
  cotisations: Cotisation[];
  declarations: DeclarationCotisation[];
  versements: Versement[];
  codeInvitation: string;
  estCreateur: boolean;
  monStatutMembre?: "APPROUVE" | "EN_ATTENTE" | "REFUSE";
  visibilite?: "PUBLIQUE" | "PRIVEE";
  adhesionsFermees?: boolean;
}

export interface Notification {
  id: string;
  type: TypeNotification;
  titre: string;
  message: string;
  date: string;
  lue: boolean;
  tontineId?: string;
}

export interface OperationSynchronisation {
  id: string;
  idempotencyKey: string;
  typeOperation: string;
  entiteType: string;
  entiteId: string;
  statut: StatutSynchronisation;
  donnees: unknown;
  creeLe: string;
}

export interface ReponseApi<T> {
  donnees: T;
  message?: string;
  erreur?: {
    code: string;
    message: string;
  };
}
