import type {
  Utilisateur,
  EspaceFinancierInfo,
  Transaction,
  Categorie,
  Tontine,
  Notification,
  ModeTontine,
  FrequenceTontine,
  StatutTontine,
  MembreTontine,
  Rotation,
  Cotisation,
  DeclarationCotisation,
  Versement,
} from "@/types";
import {
  utilisateurMock,
  espacesFinanciers,
  categories,
  transactionsMock,
  tontinesMock,
  notificationsMock,
  compteDemo,
} from "@/lib/donnees-mock";
import {
  genererId,
  genererCodeInvitation,
  calculerNombreTours,
  calculerResteAPayer,
} from "@/lib/format";

// Couche de données mockée isolée.
// Toutes les fonctions simulent les appels API avec un délai réaliste.
// Le remplacement par l'API réelle se fera dans services/api/ sans toucher aux composants.

function delai(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cloner<T>(valeur: T): T {
  return JSON.parse(JSON.stringify(valeur)) as T;
}

function estAvantDemarrage(statut: StatutTontine): boolean {
  return statut === "EN_PREPARATION" || statut === "PRETE_A_DEMARRER";
}

function erreurOperationInterdite(): never {
  throw { code: "OPERATION_NON_AUTORISEE", message: "Cette action n’est plus disponible car la tontine a démarré ou est clôturée." };
}

const donneesDemoInitiales = cloner({
  utilisateur: utilisateurMock,
  transactions: transactionsMock,
  tontines: tontinesMock,
  notifications: notificationsMock,
});

type EtatDemo = typeof donneesDemoInitiales;

export const mockApi = {
  async connexion(email: string, motDePasse: string): Promise<Utilisateur> {
    await delai();
    if (email === compteDemo.email && motDePasse === compteDemo.motDePasse) {
      return { ...utilisateurMock };
    }
    throw { code: "IDENTIFIANTS_INVALIDES", message: "Email ou mot de passe incorrect." };
  },

  async inscription(donnees: {
    prenom: string;
    nom: string;
    email: string;
    telephone: string;
    motDePasse: string;
  }): Promise<Utilisateur> {
    await delai(500);
    return {
      id: genererId(),
      prenom: donnees.prenom,
      nom: donnees.nom,
      email: donnees.email,
      telephone: donnees.telephone,
      statutIdentite: "NON_FOURNI",
      dateInscription: new Date().toISOString(),
    };
  },

  async verifierEmail(): Promise<{ valide: boolean }> {
    await delai(400);
    return { valide: true };
  },

  async verifierTelephone(code: string): Promise<{ verifie: boolean }> {
    await delai(400);
    if (code.length !== 6) throw { code: "OTP_INVALIDE", message: "Code invalide." };
    return { verifie: true };
  },

  async renvoyerOTP(): Promise<{ envoye: boolean }> {
    await delai(300);
    return { envoye: true };
  },

  async motDePasseOublie(email: string): Promise<{ envoye: boolean }> {
    await delai(400);
    return { envoye: true };
  },

  async reinitialiserMotDePasse(): Promise<{ reinitialise: boolean }> {
    await delai(400);
    return { reinitialise: true };
  },

  async obtenirUtilisateur(): Promise<Utilisateur> {
    await delai(200);
    return { ...utilisateurMock };
  },

  async mettreAJourProfil(donnees: Partial<Utilisateur>): Promise<Utilisateur> {
    await delai(400);
    Object.assign(utilisateurMock, donnees);
    return { ...utilisateurMock };
  },

  async supprimerCompte(): Promise<{ supprime: boolean }> {
    await delai(500);
    throw { code: "COMPTE_NON_SUPPRIMABLE", message: "Vous participez à une tontine active. Votre compte ne peut pas être supprimé avant la fin de vos engagements." };
  },

  async listerEspaces(): Promise<EspaceFinancierInfo[]> {
    await delai(200);
    return [...espacesFinanciers];
  },

  async listerCategories(): Promise<Categorie[]> {
    await delai(200);
    return categories.filter((c) => !c.estArchive);
  },

  async listerTransactions(espaceId?: string): Promise<Transaction[]> {
    await delai(300);
    if (espaceId) return transactionsMock.filter((t) => t.espaceId === espaceId);
    return [...transactionsMock];
  },

  async creerTransaction(donnees: Omit<Transaction, "id" | "statut">): Promise<Transaction> {
    await delai(400);
    const transaction: Transaction = {
      ...donnees,
      id: genererId(),
      statut: "ACTIVE",
    };
    transactionsMock.unshift(transaction);
    return { ...transaction };
  },

  async annulerTransaction(id: string): Promise<Transaction> {
    await delai(300);
    const transaction = transactionsMock.find((t) => t.id === id);
    if (!transaction) throw { code: "INTROUVABLE", message: "Transaction introuvable." };
    transaction.statut = "ANNULEE";
    return { ...transaction };
  },

  async listerTontines(): Promise<Tontine[]> {
    await delai(300);
    return [...tontinesMock];
  },

  async obtenirTontine(id: string): Promise<Tontine | null> {
    await delai(300);
    const tontine = tontinesMock.find((t) => t.id === id);
    return tontine ? { ...tontine } : null;
  },

  async creerTontine(donnees: {
    nom: string;
    mode: ModeTontine;
    montantCotisation: number;
    devise: string;
    frequence: FrequenceTontine;
    nombreParticipantsRequis: number;
    dateCommencement: string;
    fuseauHoraire: string;
  }): Promise<Tontine> {
    await delai(500);
    const createur: MembreTontine = {
      id: genererId(),
      utilisateurId: utilisateurMock.id,
      prenom: utilisateurMock.prenom,
      nom: utilisateurMock.nom,
      telephone: utilisateurMock.telephone,
      avatarCouleur: "#237e56",
      statut: "APPROUVE",
      estCreateur: true,
      position: 0,
    };
    const tontine: Tontine = {
      id: genererId(),
      nom: donnees.nom,
      mode: donnees.mode,
      statut: "EN_PREPARATION" as StatutTontine,
      montantCotisation: donnees.montantCotisation,
      devise: donnees.devise,
      frequence: donnees.frequence,
      nombreParticipantsRequis: donnees.nombreParticipantsRequis,
      nombreMembresApprouves: 1,
      dateCommencement: donnees.dateCommencement,
      fuseauHoraire: donnees.fuseauHoraire,
      createurId: utilisateurMock.id,
      createurNom: `${utilisateurMock.prenom} ${utilisateurMock.nom}`,
      membres: [createur],
      rotations: [],
      cotisations: [],
      declarations: [],
      versements: [],
      codeInvitation: genererCodeInvitation(),
      estCreateur: true,
      monStatutMembre: "APPROUVE",
    };
    tontinesMock.unshift(tontine);
    return { ...tontine };
  },

  async annulerTontine(id: string): Promise<Tontine> {
    await delai(400);
    const tontine = tontinesMock.find((t) => t.id === id);
    if (!tontine) throw { code: "INTROUVABLE", message: "Tontine introuvable." };
    if (tontine.statut !== "EN_PREPARATION") erreurOperationInterdite();
    tontine.statut = "ANNULEE";
    return { ...tontine };
  },

  async archiverTontine(id: string): Promise<Tontine> {
    await delai(400);
    const tontine = tontinesMock.find((t) => t.id === id);
    if (!tontine) throw { code: "INTROUVABLE", message: "Tontine introuvable." };
    tontine.statut = "ARCHIVEE";
    return { ...tontine };
  },

  async rejoindreTontine(code: string): Promise<Tontine> {
    await delai(500);
    const tontine = tontinesMock.find((t) => t.codeInvitation === code.toUpperCase());
    if (!tontine) throw { code: "CODE_INVALIDE", message: "Aucune tontine trouvée avec ce code." };
    return { ...tontine };
  },

  async demanderAdhesion(tontineId: string): Promise<{ statut: "EN_ATTENTE" }> {
    await delai(400);
    return { statut: "EN_ATTENTE" };
  },

  async approuverDemande(tontineId: string, membreId: string): Promise<MembreTontine> {
    await delai(400);
    const tontine = tontinesMock.find((t) => t.id === tontineId);
    const membre = tontine?.membres.find((m) => m.id === membreId);
    if (!membre) throw { code: "INTROUVABLE", message: "Membre introuvable." };
    if (!estAvantDemarrage(tontine!.statut)) erreurOperationInterdite();
    if (membre.statut !== "APPROUVE") {
      membre.statut = "APPROUVE";
      tontine!.nombreMembresApprouves += 1;
    }
    return { ...membre };
  },

  async refuserDemande(tontineId: string, membreId: string): Promise<MembreTontine> {
    await delai(400);
    const tontine = tontinesMock.find((t) => t.id === tontineId);
    const membre = tontine?.membres.find((m) => m.id === membreId);
    if (!membre) throw { code: "INTROUVABLE", message: "Membre introuvable." };
    if (!estAvantDemarrage(tontine!.statut)) erreurOperationInterdite();
    membre.statut = "REFUSE";
    return { ...membre };
  },

  async retirerMembre(tontineId: string, membreId: string): Promise<{ retire: boolean }> {
    await delai(400);
    const tontine = tontinesMock.find((item) => item.id === tontineId);
    if (!tontine) throw { code: "INTROUVABLE", message: "Tontine introuvable." };
    if (tontine.statut !== "EN_PREPARATION") throw { code: "OPERATION_NON_AUTORISEE", message: "Un membre ne peut plus être retiré après le démarrage." };
    const index = tontine.membres.findIndex((membre) => membre.id === membreId && !membre.estCreateur);
    if (index < 0) throw { code: "INTROUVABLE", message: "Membre introuvable." };
    const [membre] = tontine.membres.splice(index, 1);
    if (membre.statut === "APPROUVE") tontine.nombreMembresApprouves -= 1;
    return { retire: true };
  },

  async modifierOrdreBeneficiaires(tontineId: string, ordre: string[]): Promise<Tontine> {
    await delai(400);
    const tontine = tontinesMock.find((t) => t.id === tontineId);
    if (!tontine) throw { code: "INTROUVABLE", message: "Tontine introuvable." };
    if (tontine.statut !== "EN_PREPARATION" && tontine.statut !== "PRETE_A_DEMARRER") {
      throw { code: "TONTINE_NON_MODIFIABLE", message: "L'ordre est verrouillé après le démarrage." };
    }
    tontine.membres.forEach((membre, index) => {
      membre.position = ordre.indexOf(membre.id) >= 0 ? ordre.indexOf(membre.id) : index;
    });
    return { ...tontine, membres: [...tontine.membres] };
  },

  async declarerCotisation(cotisationId: string, montant: number, preuveNom?: string): Promise<DeclarationCotisation> {
    await delai(500);
    const tontine = tontinesMock.find((item) => item.cotisations.some((cotisation) => cotisation.id === cotisationId));
    const cotisation = tontine?.cotisations.find((item) => item.id === cotisationId);
    if (!tontine || !cotisation) throw { code: "INTROUVABLE", message: "Cotisation introuvable." };
    if (tontine.statut !== "ACTIVE" || cotisation.statut === "NON_CONCERNE") erreurOperationInterdite();
    const declarationsEnAttente = tontine.declarations
      .filter((declaration) => declaration.cotisationId === cotisationId && declaration.statut === "EN_ATTENTE")
      .reduce((total, declaration) => total + declaration.montant, 0);
    if (montant > calculerResteAPayer(cotisation.montantAttendu, cotisation.montantValide) - declarationsEnAttente) {
      throw { code: "COTISATION_EXCEEDS_RESTE", message: "Le montant dépasse le montant restant à payer." };
    }
    const declaration: DeclarationCotisation = {
      id: genererId(),
      cotisationId,
      montant,
      preuveNom,
      statut: "EN_ATTENTE",
      dateDeclaration: new Date().toISOString(),
    };
    tontine.declarations.unshift(declaration);
    return { ...declaration };
  },

  async validerCotisation(declarationId: string): Promise<DeclarationCotisation> {
    await delai(400);
    const tontine = tontinesMock.find((item) => item.declarations.some((declaration) => declaration.id === declarationId));
    const declaration = tontine?.declarations.find((item) => item.id === declarationId);
    const cotisation = tontine?.cotisations.find((item) => item.id === declaration?.cotisationId);
    if (!declaration || !cotisation) throw { code: "INTROUVABLE", message: "Déclaration introuvable." };
    if (tontine!.statut !== "ACTIVE") erreurOperationInterdite();
    if (declaration.statut !== "EN_ATTENTE") throw { code: "OPERATION_NON_AUTORISEE", message: "Cette déclaration a déjà été traitée." };
    if (declaration.montant > calculerResteAPayer(cotisation.montantAttendu, cotisation.montantValide)) {
      throw { code: "COTISATION_EXCEEDS_RESTE", message: "Le montant dépasse le reste à payer." };
    }
    declaration.statut = "VALIDEE";
    cotisation.montantValide += declaration.montant;
    cotisation.statut = cotisation.montantValide === cotisation.montantAttendu ? "PAYEE" : "PARTIEL";
    return { ...declaration };
  },

  async rejeterCotisation(declarationId: string, motif: string): Promise<DeclarationCotisation> {
    await delai(400);
    const declaration = tontinesMock.flatMap((tontine) => tontine.declarations).find((item) => item.id === declarationId);
    if (!declaration) throw { code: "INTROUVABLE", message: "Déclaration introuvable." };
    const tontine = tontinesMock.find((item) => item.declarations.some((declarationItem) => declarationItem.id === declarationId));
    if (!tontine || tontine.statut !== "ACTIVE" || declaration.statut !== "EN_ATTENTE") erreurOperationInterdite();
    declaration.statut = "REJETEE";
    declaration.motifRejet = motif;
    return { ...declaration };
  },

  async declarerVersement(rotationId: string, montant: number, preuveNom?: string): Promise<Versement> {
    await delai(500);
    const versement: Versement = {
      id: genererId(),
      rotationId,
      montant,
      preuveNom,
      statut: "DECLARE",
      dateDeclaration: new Date().toISOString(),
      tempsRestantConfirmation: "48h 00min",
    };
    const tontine = tontinesMock.find((item) => item.rotations.some((rotation) => rotation.id === rotationId));
    if (!tontine) throw { code: "INTROUVABLE", message: "Rotation introuvable." };
    if (tontine.statut !== "ACTIVE") erreurOperationInterdite();
    tontine.versements.unshift(versement);
    return { ...versement };
  },

  async confirmerVersement(versementId: string): Promise<Versement> {
    await delai(400);
    const versement = tontinesMock.flatMap((tontine) => tontine.versements).find((item) => item.id === versementId);
    if (!versement) throw { code: "INTROUVABLE", message: "Versement introuvable." };
    if (versement.statut !== "DECLARE") erreurOperationInterdite();
    versement.statut = "CONFIRME";
    return { ...versement };
  },

  async contesterVersement(versementId: string): Promise<Versement> {
    await delai(400);
    const versement = tontinesMock.flatMap((tontine) => tontine.versements).find((item) => item.id === versementId);
    if (!versement) throw { code: "INTROUVABLE", message: "Versement introuvable." };
    if (versement.statut !== "DECLARE") erreurOperationInterdite();
    versement.statut = "LITIGE";
    return { ...versement };
  },

  async listerNotifications(): Promise<Notification[]> {
    await delai(200);
    return [...notificationsMock];
  },

  async marquerNotificationLue(id: string): Promise<Notification> {
    await delai(200);
    const notif = notificationsMock.find((n) => n.id === id);
    const notification = notif || notificationsMock[0];
    notification.lue = true;
    return { ...notification };
  },

  async marquerToutesLues(): Promise<{ marquees: boolean }> {
    await delai(300);
    return { marquees: true };
  },

  async soumettreDocumentIdentite(typeDocument: string, rectoNom?: string, versoNom?: string): Promise<{ statut: "EN_ATTENTE" }> {
    await delai(500);
    return { statut: "EN_ATTENTE" };
  },

  async calculerNombreTours(mode: ModeTontine, nombreMembres: number): Promise<number> {
    await delai(100);
    return calculerNombreTours(mode, nombreMembres);
  },

  reinitialiserDemo(): void {
    Object.assign(utilisateurMock, cloner(donneesDemoInitiales.utilisateur));
    transactionsMock.splice(0, transactionsMock.length, ...cloner(donneesDemoInitiales.transactions));
    tontinesMock.splice(0, tontinesMock.length, ...cloner(donneesDemoInitiales.tontines));
    notificationsMock.splice(0, notificationsMock.length, ...cloner(donneesDemoInitiales.notifications));
  },

  obtenirEtatDemo(): EtatDemo {
    return cloner({
      utilisateur: utilisateurMock,
      transactions: transactionsMock,
      tontines: tontinesMock,
      notifications: notificationsMock,
    });
  },

  restaurerEtatDemo(etat: EtatDemo): void {
    Object.assign(utilisateurMock, cloner(etat.utilisateur));
    transactionsMock.splice(0, transactionsMock.length, ...cloner(etat.transactions));
    tontinesMock.splice(0, tontinesMock.length, ...cloner(etat.tontines));
    notificationsMock.splice(0, notificationsMock.length, ...cloner(etat.notifications));
  },
};
