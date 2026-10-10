import type {
  Utilisateur,
  EspaceFinancierInfo,
  Transaction,
  Categorie,
  Tontine,
  Notification,
  MembreTontine,
  Rotation,
  Cotisation,
  DeclarationCotisation,
  Versement,
} from "@/types";

export const utilisateurMock: Utilisateur = {
  id: "u1",
  prenom: "Moussa",
  nom: "Traoré",
  email: "demo@tontitrack.local",
  telephone: "+225 07 00 00 00 00",
  statutIdentite: "VALIDE",
  dateInscription: "2026-06-01T08:00:00Z",
};

export const espacesFinanciers: EspaceFinancierInfo[] = [
  { id: "e1", nom: "Personnel", type: "PERSONNEL" },
  { id: "e2", nom: "Boutique Moussa", type: "ACTIVITE" },
];

export const categories: Categorie[] = [
  { id: "c1", nom: "Salaire", type: "REVENU", estSysteme: true, estArchive: false },
  { id: "c2", nom: "Commerce", type: "REVENU", estSysteme: true, estArchive: false },
  { id: "c3", nom: "Vente boutique", type: "REVENU", estSysteme: false, estArchive: false },
  { id: "c4", nom: "Alimentation", type: "DEPENSE", estSysteme: true, estArchive: false },
  { id: "c5", nom: "Transport", type: "DEPENSE", estSysteme: true, estArchive: false },
  { id: "c6", nom: "Logement", type: "DEPENSE", estSysteme: true, estArchive: false },
  { id: "c7", nom: "Commerce", type: "DEPENSE", estSysteme: true, estArchive: false },
  { id: "c8", nom: "Éducation", type: "DEPENSE", estSysteme: true, estArchive: false },
  { id: "c9", nom: "Épargne", type: "EPARGNE", estSysteme: true, estArchive: false },
  { id: "c10", nom: "Investissement", type: "INVESTISSEMENT", estSysteme: true, estArchive: false },
];

export const transactionsMock: Transaction[] = [
  { id: "t1", espaceId: "e1", type: "REVENU", montant: 800000, devise: "XOF", categorieId: "c1", categorieNom: "Salaire", description: "Salaire septembre", moyenPaiement: "Virement", dateOperation: "2026-09-01T08:00:00Z", statut: "ACTIVE" },
  { id: "t2", espaceId: "e1", type: "REVENU", montant: 700000, devise: "XOF", categorieId: "c2", categorieNom: "Commerce", description: "Vente produits", moyenPaiement: "Espèces", dateOperation: "2026-09-05T10:00:00Z", statut: "ACTIVE" },
  { id: "t3", espaceId: "e1", type: "DEPENSE", montant: 180000, devise: "XOF", categorieId: "c5", categorieNom: "Transport", description: "Essence et taxi", moyenPaiement: "Espèces", dateOperation: "2026-09-03T07:00:00Z", statut: "ACTIVE" },
  { id: "t4", espaceId: "e1", type: "DEPENSE", montant: 250000, devise: "XOF", categorieId: "c6", categorieNom: "Logement", description: "Loyer septembre", moyenPaiement: "Virement", dateOperation: "2026-09-02T08:00:00Z", statut: "ACTIVE" },
  { id: "t5", espaceId: "e1", type: "DEPENSE", montant: 120000, devise: "XOF", categorieId: "c4", categorieNom: "Alimentation", description: "Courses du mois", moyenPaiement: "Espèces", dateOperation: "2026-09-07T17:00:00Z", statut: "ACTIVE" },
  { id: "t6", espaceId: "e1", type: "EPARGNE", montant: 250000, devise: "XOF", categorieId: "c9", categorieNom: "Épargne", description: "Épargne mensuelle", moyenPaiement: "Virement", dateOperation: "2026-09-10T08:00:00Z", statut: "ACTIVE" },
  { id: "t7", espaceId: "e1", type: "INVESTISSEMENT", montant: 150000, devise: "XOF", categorieId: "c10", categorieNom: "Investissement", description: "Achat matériel", moyenPaiement: "Virement", dateOperation: "2026-09-12T14:00:00Z", statut: "ACTIVE" },
  { id: "t8", espaceId: "e2", type: "REVENU", montant: 450000, devise: "XOF", categorieId: "c3", categorieNom: "Vente boutique", description: "Ventes semaine", moyenPaiement: "Espèces", dateOperation: "2026-09-08T18:00:00Z", statut: "ACTIVE" },
  { id: "t9", espaceId: "e2", type: "DEPENSE", montant: 200000, devise: "XOF", categorieId: "c7", categorieNom: "Commerce", description: "Approvisionnement stock", moyenPaiement: "Espèces", dateOperation: "2026-09-06T09:00:00Z", statut: "ACTIVE" },
  { id: "t10", espaceId: "e1", type: "DEPENSE", montant: 100000, devise: "XOF", categorieId: "c5", categorieNom: "Transport", description: "Réparation moto", moyenPaiement: "Espèces", dateOperation: "2026-09-14T11:00:00Z", statut: "ANNULEE" },
];

const membresSolidarite: MembreTontine[] = [
  { id: "m1", utilisateurId: "u1", prenom: "Moussa", nom: "Traoré", telephone: "+225 07 00 00 00 00", avatarCouleur: "#237e56", statut: "APPROUVE", estCreateur: true, position: 0 },
  { id: "m2", utilisateurId: "u2", prenom: "Aïcha", nom: "Diallo", telephone: "+225 07 11 11 11 11", avatarCouleur: "#d4a017", statut: "APPROUVE", estCreateur: false, position: 1 },
  { id: "m3", utilisateurId: "u3", prenom: "Ibrahim", nom: "Koné", telephone: "+225 07 22 22 22 22", avatarCouleur: "#287397", statut: "APPROUVE", estCreateur: false, position: 2 },
  { id: "m4", utilisateurId: "u4", prenom: "Fatou", nom: "Bamba", telephone: "+225 07 33 33 33 33", avatarCouleur: "#a53d39", statut: "APPROUVE", estCreateur: false, position: 3 },
  { id: "m5", utilisateurId: "u5", prenom: "Karim", nom: "Sangaré", telephone: "+225 07 44 44 44 44", avatarCouleur: "#6b4f9a", statut: "APPROUVE", estCreateur: false, position: 4 },
  { id: "m6", utilisateurId: "u6", prenom: "Awa", nom: "Cissé", telephone: "+225 07 55 55 55 55", avatarCouleur: "#2d8a6e", statut: "APPROUVE", estCreateur: false, position: 5 },
  { id: "m7", utilisateurId: "u7", prenom: "Ousmane", nom: "Touré", telephone: "+225 07 66 66 66 66", avatarCouleur: "#c25d10", statut: "APPROUVE", estCreateur: false, position: 6 },
  { id: "m8", utilisateurId: "u8", prenom: "Mariam", nom: "Sidibé", telephone: "+225 07 77 77 77 77", avatarCouleur: "#3a6b8c", statut: "APPROUVE", estCreateur: false, position: 7 },
];

const rotationsSolidarite: Rotation[] = [
  { id: "r1", numero: 1, beneficiaireId: "m2", beneficiaireNom: "Aïcha Diallo", date: "2026-08-15T00:00:00Z", montantAttendu: 700000, montantCollecte: 700000, statut: "TERMINEE" },
  { id: "r2", numero: 2, beneficiaireId: "m3", beneficiaireNom: "Ibrahim Koné", date: "2026-09-15T00:00:00Z", montantAttendu: 700000, montantCollecte: 600000, statut: "EN_COURS" },
  { id: "r3", numero: 3, beneficiaireId: "m4", beneficiaireNom: "Fatou Bamba", date: "2026-10-15T00:00:00Z", montantAttendu: 700000, montantCollecte: 0, statut: "EN_ATTENTE" },
  { id: "r4", numero: 4, beneficiaireId: "m5", beneficiaireNom: "Karim Sangaré", date: "2026-11-15T00:00:00Z", montantAttendu: 700000, montantCollecte: 0, statut: "EN_ATTENTE" },
];

const cotisationsSolidarite: Cotisation[] = [
  { id: "cot1", rotationId: "r2", membreId: "m1", membreNom: "Moussa Traoré", montantAttendu: 100000, montantValide: 100000, statut: "PAYEE" },
  { id: "cot2", rotationId: "r2", membreId: "m3", membreNom: "Ibrahim Koné", montantAttendu: 100000, montantValide: 100000, statut: "PAYEE" },
  { id: "cot3", rotationId: "r2", membreId: "m4", membreNom: "Fatou Bamba", montantAttendu: 100000, montantValide: 100000, statut: "PAYEE" },
  { id: "cot4", rotationId: "r2", membreId: "m5", membreNom: "Karim Sangaré", montantAttendu: 100000, montantValide: 100000, statut: "PAYEE" },
  { id: "cot5", rotationId: "r2", membreId: "m6", membreNom: "Awa Cissé", montantAttendu: 100000, montantValide: 100000, statut: "PAYEE" },
  { id: "cot6", rotationId: "r2", membreId: "m7", membreNom: "Ousmane Touré", montantAttendu: 100000, montantValide: 40000, statut: "PARTIEL" },
  { id: "cot7", rotationId: "r2", membreId: "m8", membreNom: "Mariam Sidibé", montantAttendu: 100000, montantValide: 0, statut: "EN_RETARD" },
  { id: "cot8", rotationId: "r2", membreId: "m2", membreNom: "Aïcha Diallo", montantAttendu: 100000, montantValide: 0, statut: "NON_CONCERNE" },
];

const declarationsSolidarite: DeclarationCotisation[] = [
  { id: "d1", cotisationId: "cot6", montant: 40000, preuveNom: "recu-mobile-money.jpg", statut: "VALIDEE", dateDeclaration: "2026-09-10T14:00:00Z" },
  { id: "d2", cotisationId: "cot1", montant: 100000, preuveNom: "virement-banque.pdf", statut: "VALIDEE", dateDeclaration: "2026-09-05T09:00:00Z" },
];

const versementsSolidarite: Versement[] = [
  { id: "v1", rotationId: "r1", montant: 700000, preuveNom: "versement-aicha.pdf", statut: "CONFIRME", dateDeclaration: "2026-08-16T10:00:00Z" },
  { id: "v2", rotationId: "r2", montant: 600000, statut: "DECLARE", dateDeclaration: "2026-09-14T16:00:00Z", tempsRestantConfirmation: "23h 41min" },
];

const membresFamille: MembreTontine[] = [
  { id: "mf1", utilisateurId: "u1", prenom: "Moussa", nom: "Traoré", telephone: "+225 07 00 00 00 00", avatarCouleur: "#237e56", statut: "APPROUVE", estCreateur: true, position: 0 },
  { id: "mf2", utilisateurId: "u9", prenom: "Adama", nom: "Traoré", telephone: "+225 07 88 88 88 88", avatarCouleur: "#287397", statut: "APPROUVE", estCreateur: false, position: 1 },
  { id: "mf3", utilisateurId: "u10", prenom: "Sita", nom: "Traoré", telephone: "+225 07 99 99 99 99", avatarCouleur: "#d4a017", statut: "APPROUVE", estCreateur: false, position: 2 },
  { id: "mf4", utilisateurId: "u11", prenom: "Bakary", nom: "Traoré", telephone: "+225 07 12 34 56 78", avatarCouleur: "#a53d39", statut: "APPROUVE", estCreateur: false, position: 3 },
  { id: "mf5", utilisateurId: "u12", prenom: "Kadiatou", nom: "Traoré", telephone: "+225 07 87 65 43 21", avatarCouleur: "#6b4f9a", statut: "APPROUVE", estCreateur: false, position: 4 },
];

const membresProjet: MembreTontine[] = [
  { id: "mp1", utilisateurId: "u1", prenom: "Moussa", nom: "Traoré", telephone: "+225 07 00 00 00 00", avatarCouleur: "#237e56", statut: "APPROUVE", estCreateur: true, position: 0 },
  { id: "mp2", utilisateurId: "u13", prenom: "Seydou", nom: "Coulibaly", telephone: "+225 07 45 45 45 45", avatarCouleur: "#287397", statut: "APPROUVE", estCreateur: false, position: 1 },
  { id: "mp3", utilisateurId: "u14", prenom: "Rokia", nom: "Doumbia", telephone: "+225 07 56 56 56 56", avatarCouleur: "#d4a017", statut: "APPROUVE", estCreateur: false, position: 2 },
  { id: "mp4", utilisateurId: "u15", prenom: "Lassina", nom: "Bamba", telephone: "+225 07 67 67 67 67", avatarCouleur: "#a53d39", statut: "EN_ATTENTE", estCreateur: false, position: 3 },
  { id: "mp5", utilisateurId: "u16", prenom: "Hawa", nom: "Diarra", telephone: "+225 07 78 78 78 78", avatarCouleur: "#6b4f9a", statut: "EN_ATTENTE", estCreateur: false, position: 4 },
];

export const tontinesMock: Tontine[] = [
  {
    id: "tontine-1",
    nom: "Tontine Solidarité",
    mode: "TOURNANT_EXCLU",
    statut: "ACTIVE",
    montantCotisation: 100000,
    devise: "XOF",
    frequence: "MENSUELLE",
    nombreParticipantsRequis: 8,
    nombreMembresApprouves: 8,
    dateCommencement: "2026-08-15T00:00:00Z",
    fuseauHoraire: "Africa/Niamey",
    createurId: "u1",
    createurNom: "Moussa Traoré",
    membres: membresSolidarite,
    rotations: rotationsSolidarite,
    cotisations: cotisationsSolidarite,
    declarations: declarationsSolidarite,
    versements: versementsSolidarite,
    codeInvitation: "SOLID8",
    estCreateur: true,
    monStatutMembre: "APPROUVE",
  },
  {
    id: "tontine-2",
    nom: "Épargne Famille",
    mode: "TOURNANT_INCLUS",
    statut: "PRETE_A_DEMARRER",
    montantCotisation: 50000,
    devise: "XOF",
    frequence: "MENSUELLE",
    nombreParticipantsRequis: 5,
    nombreMembresApprouves: 5,
    dateCommencement: "2026-10-01T00:00:00Z",
    fuseauHoraire: "Africa/Abidjan",
    createurId: "u1",
    createurNom: "Moussa Traoré",
    membres: membresFamille,
    rotations: [],
    cotisations: [],
    declarations: [],
    versements: [],
    codeInvitation: "FAMIL5",
    estCreateur: true,
    monStatutMembre: "APPROUVE",
  },
  {
    id: "tontine-3",
    nom: "Projet Entrepreneur",
    mode: "FIXE_CREATEUR",
    statut: "EN_PREPARATION",
    montantCotisation: 250000,
    devise: "XOF",
    frequence: "MENSUELLE",
    nombreParticipantsRequis: 6,
    nombreMembresApprouves: 3,
    dateCommencement: "2026-11-01T00:00:00Z",
    fuseauHoraire: "Africa/Niamey",
    createurId: "u1",
    createurNom: "Moussa Traoré",
    membres: membresProjet,
    rotations: [],
    cotisations: [],
    declarations: [],
    versements: [],
    codeInvitation: "ENTRE6",
    estCreateur: true,
    monStatutMembre: "APPROUVE",
  },
];

export const tontineArchiveeMock: Tontine = {
  id: "tontine-4",
  nom: "Tontine Commerce 2025",
  mode: "TOURNANT_INCLUS",
  statut: "ARCHIVEE",
  montantCotisation: 75000,
  devise: "XOF",
  frequence: "MENSUELLE",
  nombreParticipantsRequis: 6,
  nombreMembresApprouves: 6,
  dateCommencement: "2025-01-15T00:00:00Z",
  fuseauHoraire: "Africa/Niamey",
  createurId: "u9",
  createurNom: "Adama Traoré",
  membres: [],
  rotations: [],
  cotisations: [],
  declarations: [],
  versements: [],
  codeInvitation: "COMMERCE",
  estCreateur: false,
  monStatutMembre: "APPROUVE",
};

export const notificationsMock: Notification[] = [
  { id: "n1", type: "DEMANDE_ADHESION", titre: "Nouvelle demande d'adhésion", message: "Lassina Bamba souhaite rejoindre Projet Entrepreneur.", date: "2026-09-15T08:30:00Z", lue: false, tontineId: "tontine-3" },
  { id: "n2", type: "DEMANDE_ADHESION", titre: "Nouvelle demande d'adhésion", message: "Hawa Diarra souhaite rejoindre Projet Entrepreneur.", date: "2026-09-14T16:20:00Z", lue: false, tontineId: "tontine-3" },
  { id: "n3", type: "COTISATION_VALIDEE", titre: "Cotisation validée", message: "Votre paiement de 40 000 XOF a été validé pour Tontine Solidarité.", date: "2026-09-14T14:30:00Z", lue: false, tontineId: "tontine-1" },
  { id: "n4", type: "CONFIRMATION_RECEPTION", titre: "Confirmation attendue", message: "Le versement du tour 2 attend votre confirmation.", date: "2026-09-14T16:05:00Z", lue: false, tontineId: "tontine-1" },
  { id: "n5", type: "NOUVELLE_ROTATION", titre: "Nouvelle rotation", message: "La rotation 2 de Tontine Solidarité a commencé. Bénéficiaire : Ibrahim Koné.", date: "2026-09-15T00:00:00Z", lue: true, tontineId: "tontine-1" },
  { id: "n6", type: "COTISATION_EN_RETARD", titre: "Cotisation en retard", message: "Mariam Sidibé est en retard pour sa cotisation de Tontine Solidarité.", date: "2026-09-13T09:00:00Z", lue: true, tontineId: "tontine-1" },
  { id: "n7", type: "TONTINE_DEMARREE", titre: "Tontine démarrée", message: "Tontine Solidarité est maintenant active.", date: "2026-08-15T00:00:00Z", lue: true, tontineId: "tontine-1" },
];

export const compteDemo = {
  email: "demo@tontitrack.local",
  motDePasse: "Demo123!",
};
