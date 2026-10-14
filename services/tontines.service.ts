import { createHash, randomBytes, randomInt, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { confirmationClotureTontineSchema, creationTontineSchema, declarationCotisationSchema, declarationReversementSchema, decisionDeclarationCotisationSchema, decisionReceptionReversementSchema, demandeSchema, invitationSchema, modificationTontineSchema, ordreBeneficiairesSchema } from "@/lib/tontines/contrats";

export class ErreurTontine extends Error { constructor(public code: string, message: string, public statut = 400) { super(message); } }
type Creation = z.infer<typeof creationTontineSchema>;
type DonneesTraitementInvitation = { conditionsAcceptees?: true; jeton?: string };
type Transaction = Prisma.TransactionClient;
type MethodeDemarrage = "MANUEL" | "AUTOMATIQUE";
type OrdreBeneficiaires = z.infer<typeof ordreBeneficiairesSchema>;
type DeclarationCotisation = z.infer<typeof declarationCotisationSchema>;
type PreuveCotisation = { nom: string; typeMime: string; tailleOctets: number; cleStockage: string };
type DecisionDeclarationCotisation = z.infer<typeof decisionDeclarationCotisationSchema>;
type DeclarationReversement = z.infer<typeof declarationReversementSchema>;
type DecisionReceptionReversement = z.infer<typeof decisionReceptionReversementSchema>;
type PreuveReversement = { nom: string; typeMime: string; tailleOctets: number; cleStockage: string };
type ConfirmationCloture = z.infer<typeof confirmationClotureTontineSchema>;
const hash = (valeur: string) => createHash("sha256").update(valeur).digest("base64url");
const versionConditions = "tontine-v1";

function jetonInvitationValide(jeton: string | undefined, empreinte: string) {
  if (!jeton) return false;
  const empreinteFournie = Buffer.from(hash(jeton));
  const empreinteAttendue = Buffer.from(empreinte);
  return empreinteFournie.length === empreinteAttendue.length && timingSafeEqual(empreinteFournie, empreinteAttendue);
}

async function expirerInvitations(filtre: { id?: string; tontineId?: string; inviteId?: string }) {
  await prisma.invitationTontine.updateMany({
    where: { ...filtre, statut: "EN_ATTENTE", estActive: true, expireLe: { lte: new Date() } },
    data: { statut: "EXPIREE", estActive: false },
  });
}

async function exigerCreateur(tontineId: string, utilisateurId: string) {
  const tontine = await prisma.tontine.findFirst({ where: { id: tontineId, createurId: utilisateurId } });
  if (!tontine) throw new ErreurTontine("NON_AUTORISE", "Cette action est réservée au créateur.", 403);
  if (tontine.statutAdministration === "SUSPENDUE") throw new ErreurTontine("TONTINE_SUSPENDUE", "Cette tontine est suspendue administrativement.", 409);
  if (tontine.reglesVerrouilleesLe || tontine.statut !== "EN_PREPARATION") throw new ErreurTontine("TONTINE_VERROUILLEE", "Ces règles ne sont plus modifiables.", 409);
  return tontine;
}

function melangerSecurise<T>(elements: readonly T[]) {
  const resultat = [...elements];
  for (let index = resultat.length - 1; index > 0; index -= 1) {
    const autreIndex = randomInt(index + 1);
    [resultat[index], resultat[autreIndex]] = [resultat[autreIndex], resultat[index]];
  }
  return resultat;
}

function ajouterFrequence(date: Date, frequence: "QUOTIDIENNE" | "HEBDOMADAIRE" | "MENSUELLE") {
  const suivante = new Date(date);
  if (frequence === "QUOTIDIENNE") suivante.setUTCDate(suivante.getUTCDate() + 1);
  if (frequence === "HEBDOMADAIRE") suivante.setUTCDate(suivante.getUTCDate() + 7);
  if (frequence === "MENSUELLE") {
    const jour = suivante.getUTCDate();
    suivante.setUTCDate(1);
    suivante.setUTCMonth(suivante.getUTCMonth() + 1);
    const dernierJour = new Date(Date.UTC(suivante.getUTCFullYear(), suivante.getUTCMonth() + 1, 0)).getUTCDate();
    suivante.setUTCDate(Math.min(jour, dernierJour));
  }
  return suivante;
}

function montantTheorique(mode: "FIXE_CREATEUR" | "TOURNANT_EXCLU" | "TOURNANT_INCLUS", montantCotisation: Prisma.Decimal, nombreMembres: number) {
  const cotisants = mode === "TOURNANT_INCLUS" ? nombreMembres : nombreMembres - 1;
  return montantCotisation.mul(cotisants);
}

function limiteGrace(echeanceLe: Date, delaiGraceJours: number) {
  const limite = new Date(echeanceLe);
  limite.setUTCDate(limite.getUTCDate() + delaiGraceJours);
  return limite;
}

function estCotisant(mode: "FIXE_CREATEUR" | "TOURNANT_EXCLU" | "TOURNANT_INCLUS", membre: { id: string; role: "CREATEUR" | "MEMBRE" }, beneficiaireId: string) {
  if (mode === "FIXE_CREATEUR") return membre.role !== "CREATEUR";
  if (mode === "TOURNANT_EXCLU") return membre.id !== beneficiaireId;
  return true;
}

function statutCotisation(montantAttendu: Prisma.Decimal, montantValide: Prisma.Decimal, echeanceLe: Date, delaiGraceJours: number, maintenant = new Date()) {
  if (montantValide.greaterThanOrEqualTo(montantAttendu)) return "PAYEE" as const;
  if (maintenant > limiteGrace(echeanceLe, delaiGraceJours)) return "EN_RETARD" as const;
  return montantValide.greaterThan(0) ? "PARTIEL" as const : "A_PAYER" as const;
}

function sommeMontants(elements: Array<{ montant: Prisma.Decimal }>) {
  return elements.reduce((somme, element) => somme.add(element.montant), new Prisma.Decimal(0));
}

function sommeMontantsConfirmes(elements: Array<{ montantConfirme: Prisma.Decimal }>) {
  return elements.reduce((somme, element) => somme.add(element.montantConfirme), new Prisma.Decimal(0));
}

function montantNonNegatif(montant: Prisma.Decimal) {
  return montant.lessThan(0) ? new Prisma.Decimal(0) : montant;
}

async function membresEligibles(transaction: Transaction, tontineId: string) {
  return transaction.membreTontine.findMany({
    where: { tontineId, statut: "APPROUVE", utilisateur: { statut: "ACTIF" } },
    select: { id: true, utilisateurId: true, role: true, utilisateur: { select: { profil: { select: { prenom: true, nom: true } } } } },
    orderBy: { rejointLe: "asc" },
  });
}

async function sauvegarderOrdre(transaction: Transaction, tontineId: string, membreIds: string[]) {
  await transaction.ordreBeneficiaire.deleteMany({ where: { tontineId } });
  await transaction.ordreBeneficiaire.createMany({ data: membreIds.map((membreId, index) => ({ tontineId, membreId, version: 1, position: index + 1 })) });
}

function conditionsDemarrage(tontine: {
  statut: string; montantCotisation: Prisma.Decimal; frequence: string; nombreParticipantsRequis: number; mode: "FIXE_CREATEUR" | "TOURNANT_EXCLU" | "TOURNANT_INCLUS"; nombreTours: number | null;
}, membres: Array<{ id: string; role: "CREATEUR" | "MEMBRE" }>, ordre: Array<{ membreId: string; position: number }>) {
  const conditions = [
    { cle: "statut", libelle: "La tontine n'a pas déjà démarré.", remplie: tontine.statut === "EN_PREPARATION" || tontine.statut === "PRETE_A_DEMARRER" },
    { cle: "capacite", libelle: "Le nombre requis de participants actifs est atteint.", remplie: membres.length === tontine.nombreParticipantsRequis },
    { cle: "createur", libelle: "Le créateur est un participant approuvé et actif.", remplie: membres.some((membre) => membre.role === "CREATEUR") },
    { cle: "finances", libelle: "Les paramètres financiers et la fréquence sont valides.", remplie: tontine.montantCotisation.greaterThan(0) && ["QUOTIDIENNE", "HEBDOMADAIRE", "MENSUELLE"].includes(tontine.frequence) && (tontine.mode === "FIXE_CREATEUR" ? tontine.nombreTours === membres.length - 1 : tontine.nombreTours === membres.length) },
  ];
  if (tontine.mode !== "FIXE_CREATEUR") {
    const idsEligibles = new Set(membres.map((membre) => membre.id));
    const ordreComplet = ordre.length === membres.length && new Set(ordre.map((item) => item.membreId)).size === ordre.length && ordre.every((item) => idsEligibles.has(item.membreId));
    conditions.push({ cle: "ordre", libelle: "L'ordre des bénéficiaires est complet et ne contient aucun doublon.", remplie: ordreComplet });
  }
  return conditions;
}

async function obtenirDonneesDemarrage(transaction: Transaction, tontineId: string) {
  const tontine = await transaction.tontine.findUnique({
    where: { id: tontineId },
    select: { id: true, createurId: true, statut: true, statutAdministration: true, mode: true, montantCotisation: true, frequence: true, nombreParticipantsRequis: true, nombreTours: true, modeDemarrage: true, methodeOrdre: true, dateCommencement: true },
  });
  if (!tontine) throw new ErreurTontine("INTROUVABLE", "Tontine introuvable.", 404);
  const [membres, ordre, rotations] = await Promise.all([
    membresEligibles(transaction, tontineId),
    transaction.ordreBeneficiaire.findMany({ where: { tontineId, version: 1 }, select: { membreId: true, position: true }, orderBy: { position: "asc" } }),
    transaction.rotation.count({ where: { tontineId } }),
  ]);
  return { tontine, membres, ordre, rotations };
}

/** Données réelles uniquement ; aucun montant de clôture n'est reconstruit par l'interface. */
async function obtenirContexteCloture(transaction: Transaction, tontineId: string) {
  const tontine = await transaction.tontine.findUnique({
    where: { id: tontineId },
    include: {
      rapportCloture: true,
      membres: {
        // Les membres approuvés gardent leur droit de lecture après clôture,
        // même si leur compte n'est plus actif pour de nouvelles opérations.
        where: { statut: "APPROUVE" },
        select: { id: true, utilisateurId: true },
      },
      rotations: {
        orderBy: { numero: "asc" },
        include: {
          beneficiaire: { select: { id: true, utilisateurId: true, utilisateur: { select: { profil: { select: { prenom: true, nom: true } } } } } },
          cotisations: {
            select: {
              membreId: true,
              montantAttendu: true,
              montantValide: true,
              statut: true,
              penaliteAppliqueeMontant: true,
              penaliteAppliqueeLe: true,
              membre: { select: { utilisateurId: true } },
            },
          },
          versements: {
            select: {
              statut: true,
              montant: true,
              montantConfirme: true,
              confirmationReception: { select: { statut: true } },
            },
          },
        },
      },
    },
  });
  if (!tontine) throw new ErreurTontine("INTROUVABLE", "Tontine introuvable.", 404);
  return tontine;
}

type ContexteCloture = Awaited<ReturnType<typeof obtenirContexteCloture>>;

function analyserCloture(contexte: ContexteCloture, operationsSynchronisationEnAttente: number, declarationsCotisationEnAttente: number) {
  const cotisations = contexte.rotations.flatMap((rotation) => rotation.cotisations);
  const cotisationsNonReglees = cotisations.filter((cotisation) => !["PAYEE", "NON_CONCERNE"].includes(cotisation.statut));
  const penalitesAppliquees = cotisations.reduce((somme, cotisation) => somme.add(cotisation.penaliteAppliqueeMontant), new Prisma.Decimal(0));
  const declarationsEnAttente = contexte.rotations.flatMap((rotation) => rotation.versements).filter((versement) => versement.statut === "DECLARE");
  const contestationsOuvertes = contexte.rotations.flatMap((rotation) => rotation.versements).filter((versement) => versement.statut === "CONTESTE" || versement.confirmationReception?.statut === "NON_RECUE");
  const rotationsInachevees = contexte.rotations.filter((rotation) => rotation.statut !== "TERMINEE");
  const reversementsNonConfirmes = contexte.rotations.filter((rotation) => {
    const totalConfirme = sommeMontantsConfirmes(rotation.versements.filter((versement) => versement.statut === "CONFIRME"));
    return rotation.montantValide.lessThan(rotation.montantTheorique) || totalConfirme.lessThan(rotation.montantTheorique);
  });
  const montantCotisationsAttendu = cotisations.reduce((somme, cotisation) => somme.add(cotisation.montantAttendu), new Prisma.Decimal(0));
  const montantCotisationsConfirme = cotisations.reduce((somme, cotisation) => somme.add(cotisation.montantValide), new Prisma.Decimal(0));
  const montantReversementsConfirmes = contexte.rotations.reduce((somme, rotation) => somme.add(sommeMontantsConfirmes(rotation.versements.filter((versement) => versement.statut === "CONFIRME"))), new Prisma.Decimal(0));
  const conditions = [
    { cle: "demarrage", libelle: "La tontine a démarré.", remplie: Boolean(contexte.demarreeLe) && ["ACTIVE", "TERMINEE", "ARCHIVEE"].includes(contexte.statut), detail: contexte.demarreeLe ? "Démarrage enregistré." : "La tontine n'a pas démarré." },
    { cle: "rotations", libelle: "Toutes les rotations applicables sont terminées.", remplie: contexte.rotations.length > 0 && rotationsInachevees.length === 0, detail: rotationsInachevees.length ? `${rotationsInachevees.length} rotation(s) non terminée(s).` : "Toutes les rotations sont terminées." },
    { cle: "cotisations", libelle: "Toutes les cotisations exigibles sont régularisées.", remplie: cotisationsNonReglees.length === 0, detail: cotisationsNonReglees.length ? `${cotisationsNonReglees.length} cotisation(s) non réglée(s).` : "Aucune cotisation exigible impayée." },
    { cle: "penalites", libelle: "Les pénalités dues suivent la règle existante.", remplie: cotisationsNonReglees.length === 0, detail: penalitesAppliquees.greaterThan(0) ? `${penalitesAppliquees.toString()} de pénalités historiques, distinctes du principal.` : "Aucune pénalité appliquée." },
    { cle: "reversements", libelle: "Tous les reversements attendus sont confirmés.", remplie: reversementsNonConfirmes.length === 0, detail: reversementsNonConfirmes.length ? `${reversementsNonConfirmes.length} reversement(s) final(aux) non confirmé(s).` : "Tous les montants attendus sont confirmés." },
    { cle: "contestations", libelle: "Aucune contestation financière n'est ouverte.", remplie: contestationsOuvertes.length === 0, detail: contestationsOuvertes.length ? `${contestationsOuvertes.length} contestation(s) bloque(nt) la clôture.` : "Aucune contestation ouverte." },
    { cle: "operations", libelle: "Aucune opération financière n'est en attente.", remplie: declarationsEnAttente.length === 0 && declarationsCotisationEnAttente === 0 && operationsSynchronisationEnAttente === 0, detail: declarationsEnAttente.length || declarationsCotisationEnAttente || operationsSynchronisationEnAttente ? `${declarationsEnAttente.length + declarationsCotisationEnAttente + operationsSynchronisationEnAttente} opération(s) en attente.` : "Aucune opération en attente." },
  ];
  return {
    conditions,
    cotisationsNonReglees,
    reversementsNonConfirmes,
    contestationsOuvertes,
    operationsFinancieresEnAttente: declarationsEnAttente.length + declarationsCotisationEnAttente + operationsSynchronisationEnAttente,
    montantCotisationsAttendu,
    montantCotisationsConfirme,
    montantPenalitesAppliquees: penalitesAppliquees,
    montantReversementsConfirmes,
  };
}

export const tontinesService = {
  async etatDemarrage(tontineId: string, utilisateurId: string) {
    return prisma.$transaction(async (transaction) => {
      const donnees = await obtenirDonneesDemarrage(transaction, tontineId);
      if (donnees.tontine.createurId !== utilisateurId) throw new ErreurTontine("NON_AUTORISE", "Cette action est réservée au créateur.", 403);
      const conditions = conditionsDemarrage(donnees.tontine, donnees.membres, donnees.ordre);
      if (donnees.tontine.modeDemarrage === "AUTOMATIQUE") conditions.push({ cle: "date", libelle: "La date prévue de démarrage est atteinte.", remplie: donnees.tontine.dateCommencement <= new Date() });
      return { conditions, peutDemarrer: conditions.every((condition) => condition.remplie), modeDemarrage: donnees.tontine.modeDemarrage, datePrevue: donnees.tontine.dateCommencement };
    });
  },
  async configurerOrdre(tontineId: string, createurId: string, donnees: OrdreBeneficiaires) {
    return prisma.$transaction(async (transaction) => {
      const contexte = await obtenirDonneesDemarrage(transaction, tontineId);
      if (contexte.tontine.createurId !== createurId) throw new ErreurTontine("NON_AUTORISE", "Cette action est réservée au créateur.", 403);
      if (contexte.tontine.statut !== "EN_PREPARATION" && contexte.tontine.statut !== "PRETE_A_DEMARRER") throw new ErreurTontine("TONTINE_VERROUILLEE", "L'ordre est verrouillé après le démarrage.", 409);
      if (contexte.tontine.mode === "FIXE_CREATEUR") throw new ErreurTontine("ORDRE_NON_REQUIS", "Le créateur est bénéficiaire de chaque tour pour ce modèle.", 409);
      const idsEligibles = contexte.membres.map((membre) => membre.id);
      const membreIds = donnees.methodeOrdre === "ALEATOIRE" ? melangerSecurise(idsEligibles) : donnees.membreIds;
      if (membreIds.length !== idsEligibles.length || new Set(membreIds).size !== membreIds.length || membreIds.some((membreId) => !idsEligibles.includes(membreId))) {
        throw new ErreurTontine("ORDRE_INVALIDE", "L'ordre doit contenir chaque membre actif une seule fois.", 422);
      }
      await sauvegarderOrdre(transaction, tontineId, membreIds);
      await transaction.tontine.update({ where: { id: tontineId }, data: { methodeOrdre: donnees.methodeOrdre } });
      return { methodeOrdre: donnees.methodeOrdre, membreIds };
    }, { isolationLevel: "Serializable" });
  },
  async listerOrdre(tontineId: string, utilisateurId: string) {
    const acces = await prisma.tontine.findFirst({ where: { id: tontineId, OR: [{ createurId: utilisateurId }, { membres: { some: { utilisateurId, statut: "APPROUVE" } } }] }, select: { id: true, mode: true, methodeOrdre: true, reglesVerrouilleesLe: true } });
    if (!acces) throw new ErreurTontine("NON_AUTORISE", "Accès à l'ordre des bénéficiaires refusé.", 403);
    const [membres, ordre] = await Promise.all([
      prisma.membreTontine.findMany({ where: { tontineId, statut: "APPROUVE", utilisateur: { statut: "ACTIF" } }, select: { id: true, role: true, utilisateur: { select: { profil: { select: { prenom: true, nom: true } } } } }, orderBy: { rejointLe: "asc" } }),
      prisma.ordreBeneficiaire.findMany({ where: { tontineId, version: 1 }, select: { membreId: true, position: true }, orderBy: { position: "asc" } }),
    ]);
    return { ...acces, verrouille: Boolean(acces.reglesVerrouilleesLe), membres, ordre };
  },
  async demarrer(tontineId: string, createurId: string, declencheur: MethodeDemarrage) {
    return prisma.$transaction(async (transaction) => {
      let contexte = await obtenirDonneesDemarrage(transaction, tontineId);
      if (contexte.tontine.createurId !== createurId) throw new ErreurTontine("NON_AUTORISE", "Cette action est réservée au créateur.", 403);
      if (contexte.tontine.statutAdministration === "SUSPENDUE") throw new ErreurTontine("TONTINE_SUSPENDUE", "Le démarrage est bloqué tant que la suspension administrative est active.", 409);
      if (contexte.tontine.modeDemarrage !== declencheur) throw new ErreurTontine("MODE_DEMARRAGE_INCOMPATIBLE", "Le mode de démarrage configuré ne permet pas cette action.", 409);
      if (declencheur === "AUTOMATIQUE" && contexte.tontine.dateCommencement > new Date()) throw new ErreurTontine("DATE_DEMARRAGE_NON_ATTEINTE", "La date de démarrage automatique n'est pas encore atteinte.", 409);
      if (contexte.tontine.mode !== "FIXE_CREATEUR" && contexte.tontine.methodeOrdre === "ALEATOIRE" && contexte.ordre.length === 0 && contexte.membres.length === contexte.tontine.nombreParticipantsRequis) {
        await sauvegarderOrdre(transaction, tontineId, melangerSecurise(contexte.membres.map((membre) => membre.id)));
        contexte = await obtenirDonneesDemarrage(transaction, tontineId);
      }
      const conditions = conditionsDemarrage(contexte.tontine, contexte.membres, contexte.ordre);
      if (!conditions.every((condition) => condition.remplie)) throw new ErreurTontine("CONDITIONS_DEMARRAGE_INCOMPLETES", "Les conditions de démarrage ne sont pas toutes remplies.", 422);
      if (contexte.rotations > 0) throw new ErreurTontine("ROTATIONS_EXISTANTES", "Des rotations existent déjà pour cette tontine.", 409);

      const demarreeLe = new Date();
      const membresParId = new Map(contexte.membres.map((membre) => [membre.id, membre]));
      const createur = contexte.membres.find((membre) => membre.role === "CREATEUR");
      const beneficiaires = contexte.tontine.mode === "FIXE_CREATEUR"
        ? Array.from({ length: contexte.tontine.nombreTours ?? 0 }, () => createur?.id)
        : contexte.ordre.map((item) => item.membreId);
      if (beneficiaires.some((beneficiaireId) => !beneficiaireId || !membresParId.has(beneficiaireId))) throw new ErreurTontine("BENEFICIAIRES_INVALIDES", "La configuration des bénéficiaires est invalide.", 422);

      const verrouillage = await transaction.tontine.updateMany({
        where: { id: tontineId, statut: { in: ["EN_PREPARATION", "PRETE_A_DEMARRER"] }, reglesVerrouilleesLe: null },
        data: { statut: "ACTIVE", demarreeLe, reglesVerrouilleesLe: demarreeLe, adhesionsFermees: true },
      });
      if (verrouillage.count !== 1) throw new ErreurTontine("DEMARRAGE_CONCURRENT", "La tontine vient d'être démarrée par une autre demande.", 409);

      let debutLe = demarreeLe;
      const rotations = [];
      for (let index = 0; index < beneficiaires.length; index += 1) {
        const beneficiaireId = beneficiaires[index];
        const debutRotation = debutLe;
        const debutSuivant = ajouterFrequence(debutRotation, contexte.tontine.frequence);
        debutLe = debutSuivant;
        rotations.push(await transaction.rotation.create({ data: {
          tontineId,
          numero: index + 1,
          beneficiaireId: beneficiaireId as string,
          statut: index === 0 ? "EN_COURS" : "A_VENIR",
          debutLe: debutRotation,
          echeanceLe: new Date(debutSuivant.getTime() - 1),
          montantTheorique: montantTheorique(contexte.tontine.mode, contexte.tontine.montantCotisation, contexte.membres.length),
        } }));
      }
      await transaction.cotisation.createMany({
        data: rotations.flatMap((rotation) => contexte.membres.map((membre) => {
          const cotisant = estCotisant(contexte.tontine.mode, membre, rotation.beneficiaireId);
          return {
            tontineId,
            rotationId: rotation.id,
            membreId: membre.id,
            montantAttendu: cotisant ? contexte.tontine.montantCotisation : new Prisma.Decimal(0),
            echeanceLe: rotation.echeanceLe,
            statut: cotisant ? "A_PAYER" : "NON_CONCERNE",
          };
        })),
      });
      return transaction.tontine.findUniqueOrThrow({ where: { id: tontineId }, select: { id: true, statut: true, demarreeLe: true, reglesVerrouilleesLe: true } });
    }, { isolationLevel: "Serializable" });
  },
  async demarrerAutomatiques() {
    const tontines = await prisma.tontine.findMany({ where: { modeDemarrage: "AUTOMATIQUE", statut: { in: ["EN_PREPARATION", "PRETE_A_DEMARRER"] }, dateCommencement: { lte: new Date() } }, select: { id: true, createurId: true } });
    const resultats = await Promise.all(tontines.map(async (tontine) => {
      try { await tontinesService.demarrer(tontine.id, tontine.createurId, "AUTOMATIQUE"); return { tontineId: tontine.id, demarree: true }; }
      catch (erreur) { return { tontineId: tontine.id, demarree: false, raison: erreur instanceof Error ? erreur.message : "Erreur inconnue." }; }
    }));
    return { examinees: tontines.length, resultats };
  },
  async listerRotations(tontineId: string, utilisateurId: string) {
    const acces = await prisma.tontine.findFirst({ where: { id: tontineId, OR: [{ createurId: utilisateurId }, { membres: { some: { utilisateurId, statut: "APPROUVE" } } }] }, select: { id: true } });
    if (!acces) throw new ErreurTontine("NON_AUTORISE", "Accès aux rotations refusé.", 403);
    return prisma.rotation.findMany({ where: { tontineId }, select: { id: true, numero: true, statut: true, debutLe: true, echeanceLe: true, montantTheorique: true, montantValide: true, beneficiaire: { select: { id: true, utilisateur: { select: { profil: { select: { prenom: true, nom: true } } } } } } }, orderBy: { numero: "asc" } });
  },
  async listerCotisations(tontineId: string, utilisateurId: string) {
    const acces = await prisma.tontine.findFirst({
      where: { id: tontineId, OR: [{ createurId: utilisateurId }, { membres: { some: { utilisateurId, statut: "APPROUVE" } } }] },
      select: { createurId: true },
    });
    if (!acces) throw new ErreurTontine("NON_AUTORISE", "Accès aux cotisations refusé.", 403);
    const estCreateur = acces.createurId === utilisateurId;
    return prisma.cotisation.findMany({
      where: { tontineId },
      select: {
        id: true, montantAttendu: true, montantDeclare: true, montantValide: true, echeanceLe: true, statut: true, penaliteAppliqueeMontant: true, penaliteAppliqueeLe: true,
        rotation: { select: { id: true, numero: true, statut: true } },
        membre: { select: { id: true, utilisateurId: true, utilisateur: { select: { profil: { select: { prenom: true, nom: true } } } } } },
        declarations: {
          where: estCreateur ? {} : { declarantId: utilisateurId },
          select: { id: true, montant: true, verseLe: true, referenceVersement: true, moyenVersement: true, statut: true, motifRejet: true, observationDecision: true, declareLe: true, decideLe: true, declarantId: true, preuves: { select: { id: true, fichier: { select: { nom: true, typeMime: true, tailleOctets: true } } } } },
          orderBy: { declareLe: "desc" },
        },
      },
      orderBy: [{ rotation: { numero: "asc" } }, { creeLe: "asc" }],
    });
  },
  async declarerCotisation(tontineId: string, cotisationId: string, declarantId: string, donnees: DeclarationCotisation, preuve?: PreuveCotisation) {
    if (donnees.verseLe > new Date()) throw new ErreurTontine("DATE_VERSEMENT_INVALIDE", "La date de versement ne peut pas être future.", 422);
    return prisma.$transaction(async (transaction) => {
      const cotisation = await transaction.cotisation.findFirst({
        where: { id: cotisationId, tontineId },
        include: { membre: { select: { utilisateurId: true } }, rotation: { select: { statut: true, tontine: { select: { statut: true, statutAdministration: true } } } } },
      });
      if (!cotisation) throw new ErreurTontine("COTISATION_INTROUVABLE", "Cotisation introuvable.", 404);
      if (cotisation.membre.utilisateurId !== declarantId) throw new ErreurTontine("NON_AUTORISE", "Vous ne pouvez déclarer que votre propre cotisation.", 403);
      if (cotisation.rotation.tontine.statut !== "ACTIVE") throw new ErreurTontine("TONTINE_CLOTUREE", "Les opérations financières sont verrouillées après clôture.", 409);
      if (cotisation.rotation.tontine.statutAdministration === "SUSPENDUE") throw new ErreurTontine("TONTINE_SUSPENDUE", "Les opérations financières sont suspendues par l’administration.", 409);
      if (cotisation.rotation.statut !== "EN_COURS") throw new ErreurTontine("ROTATION_INACTIVE", "Cette rotation n'accepte pas encore de déclaration.", 409);
      if (cotisation.statut === "NON_CONCERNE" || cotisation.statut === "PAYEE") throw new ErreurTontine("COTISATION_NON_DUE", "Cette cotisation ne peut pas être déclarée.", 409);
      const montant = new Prisma.Decimal(donnees.montant);
      const resteDeclaration = cotisation.montantAttendu.sub(cotisation.montantDeclare);
      if (montant.greaterThan(resteDeclaration)) throw new ErreurTontine("MONTANT_DEPASSE", "Le montant déclaré dépasse le reste de la cotisation.", 422);
      const declaration = await transaction.declarationCotisation.create({
        data: {
          cotisationId,
          declarantId,
          montant,
          verseLe: donnees.verseLe,
          referenceVersement: donnees.referenceVersement || null,
          moyenVersement: donnees.moyenVersement || null,
        },
        select: { id: true, statut: true, montant: true, verseLe: true, declareLe: true },
      });
      if (preuve) {
        const fichier = await transaction.fichier.create({ data: { proprietaireId: declarantId, nom: preuve.nom, typeMime: preuve.typeMime, tailleOctets: preuve.tailleOctets, cleStockage: preuve.cleStockage }, select: { id: true } });
        await transaction.preuveCotisation.create({ data: { declarationId: declaration.id, fichierId: fichier.id, creeParId: declarantId } });
      }
      await transaction.cotisation.update({ where: { id: cotisationId }, data: { montantDeclare: { increment: montant } } });
      return declaration;
    }, { isolationLevel: "Serializable" });
  },
  async obtenirPreuveCotisation(tontineId: string, cotisationId: string, declarationId: string, preuveId: string, utilisateurId: string) {
    const preuve = await prisma.preuveCotisation.findFirst({
      where: { id: preuveId, declarationId, declaration: { cotisationId, cotisation: { tontineId } } },
      select: { fichier: { select: { nom: true, typeMime: true, cleStockage: true } }, declaration: { select: { declarantId: true, cotisation: { select: { tontine: { select: { createurId: true } } } } } } },
    });
    if (!preuve || (preuve.declaration.declarantId !== utilisateurId && preuve.declaration.cotisation.tontine.createurId !== utilisateurId)) throw new ErreurTontine("NON_AUTORISE", "Accès au justificatif refusé.", 403);
    return preuve.fichier;
  },
  async deciderDeclarationCotisation(tontineId: string, declarationId: string, createurId: string, donnees: DecisionDeclarationCotisation) {
    return prisma.$transaction(async (transaction) => {
      const declaration = await transaction.declarationCotisation.findFirst({
        where: { id: declarationId, cotisation: { tontineId, tontine: { createurId } } },
        include: { cotisation: { include: { rotation: { include: { tontine: { select: { delaiGraceJours: true, statut: true, statutAdministration: true } } } } } } },
      });
      if (!declaration) throw new ErreurTontine("NON_AUTORISE", "Déclaration introuvable ou non autorisée.", 403);
      if (declaration.cotisation.rotation.tontine.statut !== "ACTIVE") throw new ErreurTontine("TONTINE_CLOTUREE", "Les opérations financières sont verrouillées après clôture.", 409);
      if (declaration.cotisation.rotation.tontine.statutAdministration === "SUSPENDUE") throw new ErreurTontine("TONTINE_SUSPENDUE", "Les opérations financières sont suspendues par l’administration.", 409);
      if (declaration.statut !== "EN_ATTENTE_VALIDATION") throw new ErreurTontine("DECLARATION_TRAITEE", "Cette déclaration a déjà été traitée.", 409);
      const decision = await transaction.declarationCotisation.updateMany({
        where: { id: declarationId, statut: "EN_ATTENTE_VALIDATION" },
        data: {
          statut: donnees.decision === "CONFIRMER" ? "VALIDEE" : "REJETEE",
          motifRejet: donnees.decision === "REJETER" ? donnees.motifRejet : null,
          observationDecision: donnees.observation || null,
          decideParId: createurId,
          decideLe: new Date(),
        },
      });
      if (decision.count !== 1) throw new ErreurTontine("DECLARATION_CONCURRENTE", "Cette déclaration vient d'être traitée par une autre demande.", 409);
      if (donnees.decision === "REJETER") {
        await transaction.cotisation.update({ where: { id: declaration.cotisationId }, data: { montantDeclare: { decrement: declaration.montant } } });
        await transaction.notification.create({ data: { utilisateurId: declaration.declarantId, type: "COTISATION_REJETEE", titre: "Cotisation rejetée", message: "Votre déclaration de cotisation a été rejetée. Consultez le motif dans votre historique.", cibleUrl: `/tontines/${tontineId}/cotisations` } });
        return { declarationId, statut: "REJETEE" as const };
      }
      const nouveauMontantValide = declaration.cotisation.montantValide.add(declaration.montant);
      if (nouveauMontantValide.greaterThan(declaration.cotisation.montantAttendu)) throw new ErreurTontine("MONTANT_DEPASSE", "La confirmation dépasserait le montant attendu.", 422);
      const statut = statutCotisation(declaration.cotisation.montantAttendu, nouveauMontantValide, declaration.cotisation.echeanceLe, declaration.cotisation.rotation.tontine.delaiGraceJours);
      await transaction.cotisation.update({ where: { id: declaration.cotisationId }, data: { montantValide: nouveauMontantValide, statut } });
      await transaction.rotation.update({ where: { id: declaration.cotisation.rotationId }, data: { montantValide: { increment: declaration.montant } } });
      await transaction.notification.create({ data: { utilisateurId: declaration.declarantId, type: "COTISATION_VALIDEE", titre: "Cotisation confirmée", message: "Le créateur a confirmé votre déclaration de cotisation.", cibleUrl: `/tontines/${tontineId}/cotisations` } });
      return { declarationId, statut: "VALIDEE" as const };
    }, { isolationLevel: "Serializable" });
  },
  async listerReversements(tontineId: string, utilisateurId: string) {
    const acces = await prisma.tontine.findFirst({
      where: { id: tontineId, OR: [{ createurId: utilisateurId }, { membres: { some: { utilisateurId, statut: "APPROUVE" } } }] },
      select: { id: true, createurId: true, devise: true },
    });
    if (!acces) throw new ErreurTontine("NON_AUTORISE", "Accès aux reversements refusé.", 403);

    const rotations = await prisma.rotation.findMany({
      where: { tontineId },
      select: {
        id: true, numero: true, statut: true, montantTheorique: true, montantValide: true, versementEffectueLe: true, termineeLe: true,
        beneficiaire: { select: { utilisateurId: true, utilisateur: { select: { profil: { select: { prenom: true, nom: true } } } } } },
        versements: {
          select: {
            id: true, montant: true, montantConfirme: true, verseLe: true, referenceVersement: true, moyenVersement: true, observation: true,
            statut: true, motifContestation: true, declareLe: true, confirmeLe: true, contesteLe: true,
            preuves: { select: { id: true, fichier: { select: { nom: true, typeMime: true, tailleOctets: true } } } },
            confirmationReception: { select: { id: true, statut: true, montantConfirme: true, motifContestation: true, observation: true, confirmeLe: true } },
            evenements: { select: { id: true, type: true, donnees: true, creeLe: true, acteur: { select: { profil: { select: { prenom: true, nom: true } } } } }, orderBy: { creeLe: "asc" } },
          },
          orderBy: { declareLe: "desc" },
        },
      },
      orderBy: { numero: "asc" },
    });

    const estCreateur = acces.createurId === utilisateurId;
    return rotations.map((rotation) => {
      const estBeneficiaire = rotation.beneficiaire.utilisateurId === utilisateurId;
      const reversementsActifs = rotation.versements.filter((versement) => versement.statut !== "CONTESTE");
      const montantDeclare = sommeMontants(reversementsActifs);
      const montantConfirme = sommeMontantsConfirmes(rotation.versements.filter((versement) => versement.statut === "CONFIRME"));
      const montantRestantAReverser = montantNonNegatif(rotation.montantValide.sub(montantDeclare));
      const montantRestantAConfirmer = montantNonNegatif(montantDeclare.sub(montantConfirme));
      const contestations = rotation.versements.filter((versement) => versement.statut === "CONTESTE").length;
      const attenteConfirmation = rotation.versements.filter((versement) => versement.statut === "DECLARE").length;
      const etatCollectif = contestations > 0
        ? "CONTESTE"
        : attenteConfirmation > 0
          ? "EN_ATTENTE_CONFIRMATION"
          : montantConfirme.greaterThan(0)
            ? "CONFIRME"
            : "A_DECLARER";
      const peutVoirDetailsPrives = estCreateur || estBeneficiaire;

      return {
        id: rotation.id,
        numero: rotation.numero,
        statut: rotation.statut,
        beneficiaireNom: rotation.beneficiaire.utilisateur.profil
          ? `${rotation.beneficiaire.utilisateur.profil.prenom} ${rotation.beneficiaire.utilisateur.profil.nom}`
          : "Bénéficiaire",
        montantAttendu: rotation.montantTheorique,
        montantDisponible: rotation.montantValide,
        montantDeclare,
        montantConfirme,
        montantRestantAReverser,
        montantRestantAConfirmer,
        attenteConfirmation,
        contestations,
        etatCollectif,
        peutDeclarer: estCreateur && ["EN_COURS", "EN_ATTENTE_VERSEMENT", "EN_ATTENTE_CONFIRMATION"].includes(rotation.statut),
        peutConfirmer: estBeneficiaire,
        reversements: peutVoirDetailsPrives
          ? rotation.versements.map((versement) => ({
              id: versement.id,
              montant: versement.montant,
              montantConfirme: versement.montantConfirme,
              verseLe: versement.verseLe,
              statut: versement.statut,
              motifContestation: versement.motifContestation,
              declareLe: versement.declareLe,
              confirmeLe: versement.confirmeLe,
              contesteLe: versement.contesteLe,
              referenceVersement: versement.referenceVersement,
              moyenVersement: versement.moyenVersement,
              observation: versement.observation,
              preuves: versement.preuves,
              confirmation: versement.confirmationReception,
              historique: versement.evenements.map((evenement) => ({
                id: evenement.id,
                type: evenement.type,
                donnees: evenement.donnees,
                creeLe: evenement.creeLe,
                acteurNom: evenement.acteur?.profil ? `${evenement.acteur.profil.prenom} ${evenement.acteur.profil.nom}` : null,
              })),
            }))
          : [],
      };
    });
  },
  async declarerReversement(tontineId: string, rotationId: string, createurId: string, donnees: DeclarationReversement, preuve?: PreuveReversement, cleIdempotence?: string) {
    if (donnees.verseLe > new Date()) throw new ErreurTontine("DATE_REVERSEMENT_INVALIDE", "La date de reversement ne peut pas être future.", 422);
    const executer = () => prisma.$transaction(async (transaction) => {
      if (cleIdempotence) {
        const operationExistante = await transaction.operationSynchronisation.findUnique({ where: { utilisateurId_idempotencyKey: { utilisateurId: createurId, idempotencyKey: cleIdempotence } } });
        if (operationExistante?.statut === "SYNCHRONISEE" && operationExistante.resultat) return { ...(operationExistante.resultat as { declarationId: string; statut: "DECLARE" }), rejouee: true };
        if (operationExistante) throw new ErreurTontine("OPERATION_EN_COURS", "Cette déclaration est déjà en cours de traitement.", 409);
        await transaction.operationSynchronisation.create({ data: { utilisateurId: createurId, idempotencyKey: cleIdempotence, typeOperation: "DECLARATION_REVERSEMENT", entiteType: "Rotation", entiteId: rotationId, requete: { tontineId, rotationId, montant: donnees.montant } } });
      }

      const rotation = await transaction.rotation.findFirst({
        where: { id: rotationId, tontineId },
        include: { tontine: { select: { createurId: true, reversementsPartielsAutorises: true, statut: true, statutAdministration: true } }, versements: { select: { montant: true, statut: true } }, beneficiaire: { select: { utilisateurId: true } } },
      });
      if (!rotation) throw new ErreurTontine("ROTATION_INTROUVABLE", "Rotation introuvable.", 404);
      if (rotation.tontine.createurId !== createurId) throw new ErreurTontine("NON_AUTORISE", "Seul le créateur peut déclarer un reversement.", 403);
      if (rotation.tontine.statut !== "ACTIVE" || !["EN_COURS", "EN_ATTENTE_VERSEMENT", "EN_ATTENTE_CONFIRMATION"].includes(rotation.statut)) throw new ErreurTontine("ROTATION_INELIGIBLE", "Cette rotation n'accepte pas de reversement.", 409);
      if (rotation.tontine.statutAdministration === "SUSPENDUE") throw new ErreurTontine("TONTINE_SUSPENDUE", "Les reversements sont suspendus par l’administration.", 409);
      const montant = new Prisma.Decimal(donnees.montant);
      const montantDejaReserve = sommeMontants(rotation.versements.filter((versement) => versement.statut !== "CONTESTE"));
      const disponible = rotation.montantValide.sub(montantDejaReserve);
      if (disponible.lessThanOrEqualTo(0) || montant.greaterThan(disponible)) throw new ErreurTontine("MONTANT_INDISPONIBLE", "Le reversement dépasse les cotisations confirmées disponibles.", 422);
      if (!rotation.tontine.reversementsPartielsAutorises && montant.lessThan(disponible)) throw new ErreurTontine("REVERSEMENT_PARTIEL_INTERDIT", "Les reversements partiels ne sont pas autorisés pour cette tontine.", 422);

      const declaration = await transaction.declarationVersement.create({
        data: {
          tontineId,
          rotationId,
          declarantId: createurId,
          montant,
          verseLe: donnees.verseLe,
          referenceVersement: donnees.referenceVersement || null,
          moyenVersement: donnees.moyenVersement || null,
          observation: donnees.observation || null,
        },
        select: { id: true, statut: true, montant: true, rotation: { select: { beneficiaire: { select: { utilisateurId: true } } } } },
      });
      if (preuve) {
        const fichier = await transaction.fichier.create({ data: { proprietaireId: createurId, nom: preuve.nom, typeMime: preuve.typeMime, tailleOctets: preuve.tailleOctets, cleStockage: preuve.cleStockage }, select: { id: true } });
        await transaction.preuveVersement.create({ data: { declarationId: declaration.id, fichierId: fichier.id, creeParId: createurId } });
      }
      const etaitConteste = rotation.versements.some((versement) => versement.statut === "CONTESTE");
      await transaction.evenementReversement.create({ data: { declarationId: declaration.id, acteurId: createurId, type: etaitConteste ? "REGULARISATION_DECLAREE" : "REVERSEMENT_DECLARE", donnees: { montant: montant.toString() } } });
      await transaction.notification.create({ data: { utilisateurId: declaration.rotation.beneficiaire.utilisateurId, type: etaitConteste ? "VERSEMENT_REGULARISE" : "VERSEMENT_DECLARE", titre: etaitConteste ? "Régularisation déclarée" : "Reversement déclaré", message: etaitConteste ? "Le créateur a déclaré un reversement de régularisation. Confirmez ou contestez sa réception." : "Le créateur a déclaré un reversement. Confirmez ou contestez sa réception.", cibleUrl: `/tontines/${tontineId}/reversements` } });
      const resultat = { declarationId: declaration.id, statut: "DECLARE" as const, rejouee: false };
      if (cleIdempotence) await transaction.operationSynchronisation.update({ where: { utilisateurId_idempotencyKey: { utilisateurId: createurId, idempotencyKey: cleIdempotence } }, data: { statut: "SYNCHRONISEE", resultat, traiteeLe: new Date() } });
      return resultat;
    }, { isolationLevel: "Serializable" });
    try { return await executer(); }
    catch (cause) {
      if (cleIdempotence && cause instanceof Prisma.PrismaClientKnownRequestError && cause.code === "P2002") {
        const operation = await prisma.operationSynchronisation.findUnique({ where: { utilisateurId_idempotencyKey: { utilisateurId: createurId, idempotencyKey: cleIdempotence } } });
        if (operation?.statut === "SYNCHRONISEE" && operation.resultat) return { ...(operation.resultat as { declarationId: string; statut: "DECLARE" }), rejouee: true };
      }
      throw cause;
    }
  },
  async deciderReceptionReversement(tontineId: string, declarationId: string, beneficiaireId: string, donnees: DecisionReceptionReversement, cleIdempotence?: string) {
    const executer = () => prisma.$transaction(async (transaction) => {
      if (cleIdempotence) {
        const operationExistante = await transaction.operationSynchronisation.findUnique({ where: { utilisateurId_idempotencyKey: { utilisateurId: beneficiaireId, idempotencyKey: cleIdempotence } } });
        if (operationExistante?.statut === "SYNCHRONISEE" && operationExistante.resultat) return { ...(operationExistante.resultat as { declarationId: string; statut: "CONFIRME" | "CONTESTE" }), rejouee: true };
        if (operationExistante) throw new ErreurTontine("OPERATION_EN_COURS", "Cette décision est déjà en cours de traitement.", 409);
        await transaction.operationSynchronisation.create({ data: { utilisateurId: beneficiaireId, idempotencyKey: cleIdempotence, typeOperation: "DECISION_RECEPTION_REVERSEMENT", entiteType: "DeclarationVersement", entiteId: declarationId, requete: { tontineId, declarationId, decision: donnees.decision } } });
      }

      const declaration = await transaction.declarationVersement.findFirst({
        where: { id: declarationId, tontineId },
        include: { confirmationReception: true, rotation: { include: { beneficiaire: { select: { utilisateurId: true } }, tontine: { select: { createurId: true, statut: true, statutAdministration: true } } } } },
      });
      if (!declaration) throw new ErreurTontine("REVERSEMENT_INTROUVABLE", "Reversement introuvable.", 404);
      if (declaration.rotation.beneficiaire.utilisateurId !== beneficiaireId) throw new ErreurTontine("NON_AUTORISE", "Seul le bénéficiaire de cette rotation peut confirmer la réception.", 403);
      if (declaration.rotation.tontine.statut !== "ACTIVE") throw new ErreurTontine("TONTINE_CLOTUREE", "Les opérations financières sont verrouillées après clôture.", 409);
      if (declaration.rotation.tontine.statutAdministration === "SUSPENDUE") throw new ErreurTontine("TONTINE_SUSPENDUE", "Les reversements sont suspendus par l’administration.", 409);
      if (declaration.statut !== "DECLARE" || declaration.confirmationReception) throw new ErreurTontine("REVERSEMENT_DEJA_TRAITE", "Ce reversement a déjà reçu une décision.", 409);

      if (donnees.decision === "CONTESTER") {
        const miseAJour = await transaction.declarationVersement.updateMany({ where: { id: declarationId, statut: "DECLARE" }, data: { statut: "CONTESTE", contesteLe: new Date(), motifContestation: donnees.motifContestation } });
        if (miseAJour.count !== 1) throw new ErreurTontine("REVERSEMENT_CONCURRENT", "Ce reversement vient d'être traité par une autre demande.", 409);
        await transaction.confirmationReception.create({ data: { rotationId: declaration.rotationId, declarationId, beneficiaireId, statut: "NON_RECUE", motifContestation: donnees.motifContestation, observation: donnees.observation || null, confirmeLe: new Date() } });
        await transaction.evenementReversement.create({ data: { declarationId, acteurId: beneficiaireId, type: "REVERSEMENT_CONTESTE", donnees: { motif: donnees.motifContestation } } });
        await transaction.notification.create({ data: { utilisateurId: declaration.rotation.tontine.createurId, type: "VERSEMENT_CONTESTE", titre: "Reversement contesté", message: "Le bénéficiaire a contesté un reversement. Consultez le détail et régularisez hors application si nécessaire.", cibleUrl: `/tontines/${tontineId}/reversements` } });
        const resultat = { declarationId, statut: "CONTESTE" as const, rejouee: false };
        if (cleIdempotence) await transaction.operationSynchronisation.update({ where: { utilisateurId_idempotencyKey: { utilisateurId: beneficiaireId, idempotencyKey: cleIdempotence } }, data: { statut: "SYNCHRONISEE", resultat, traiteeLe: new Date() } });
        return resultat;
      }

      const montantConfirme = new Prisma.Decimal(donnees.montantConfirme);
      if (montantConfirme.greaterThan(declaration.montant)) throw new ErreurTontine("MONTANT_CONFIRME_DEPASSE", "Le montant confirmé ne peut pas dépasser le reversement déclaré.", 422);
      const miseAJour = await transaction.declarationVersement.updateMany({ where: { id: declarationId, statut: "DECLARE" }, data: { statut: "CONFIRME", montantConfirme, confirmeLe: new Date() } });
      if (miseAJour.count !== 1) throw new ErreurTontine("REVERSEMENT_CONCURRENT", "Ce reversement vient d'être traité par une autre demande.", 409);
      await transaction.confirmationReception.create({ data: { rotationId: declaration.rotationId, declarationId, beneficiaireId, montantConfirme, statut: "CONFIRMEE", observation: donnees.observation || null, confirmeLe: new Date() } });
      const partiel = montantConfirme.lessThan(declaration.montant);
      await transaction.evenementReversement.create({ data: { declarationId, acteurId: beneficiaireId, type: partiel ? "RECEPTION_PARTIELLE_CONFIRMEE" : "RECEPTION_CONFIRMEE", donnees: { montantConfirme: montantConfirme.toString() } } });
      await transaction.notification.create({ data: { utilisateurId: declaration.rotation.tontine.createurId, type: partiel ? "RECEPTION_PARTIELLE" : "CONFIRMATION_RECEPTION", titre: partiel ? "Réception partielle confirmée" : "Réception confirmée", message: partiel ? "Le bénéficiaire a signalé une réception partielle du reversement." : "Le bénéficiaire a confirmé la réception du reversement.", cibleUrl: `/tontines/${tontineId}/reversements` } });

      const reversementsConfirmes = await transaction.declarationVersement.findMany({ where: { rotationId: declaration.rotationId, statut: "CONFIRME" }, select: { montantConfirme: true } });
      const totalConfirme = sommeMontantsConfirmes(reversementsConfirmes);
      if (declaration.rotation.montantValide.greaterThanOrEqualTo(declaration.rotation.montantTheorique) && totalConfirme.greaterThanOrEqualTo(declaration.rotation.montantTheorique)) {
        const termineLe = new Date();
        await transaction.rotation.update({ where: { id: declaration.rotationId }, data: { statut: "TERMINEE", versementEffectueLe: termineLe, termineeLe: termineLe } });
        const suivante = await transaction.rotation.findFirst({ where: { tontineId, statut: "A_VENIR" }, orderBy: { numero: "asc" }, select: { id: true } });
        if (suivante) await transaction.rotation.update({ where: { id: suivante.id }, data: { statut: "EN_COURS" } });
      }
      const resultat = { declarationId, statut: "CONFIRME" as const, rejouee: false };
      if (cleIdempotence) await transaction.operationSynchronisation.update({ where: { utilisateurId_idempotencyKey: { utilisateurId: beneficiaireId, idempotencyKey: cleIdempotence } }, data: { statut: "SYNCHRONISEE", resultat, traiteeLe: new Date() } });
      return resultat;
    }, { isolationLevel: "Serializable" });
    try { return await executer(); }
    catch (cause) {
      if (cleIdempotence && cause instanceof Prisma.PrismaClientKnownRequestError && cause.code === "P2002") {
        const operation = await prisma.operationSynchronisation.findUnique({ where: { utilisateurId_idempotencyKey: { utilisateurId: beneficiaireId, idempotencyKey: cleIdempotence } } });
        if (operation?.statut === "SYNCHRONISEE" && operation.resultat) return { ...(operation.resultat as { declarationId: string; statut: "CONFIRME" | "CONTESTE" }), rejouee: true };
      }
      throw cause;
    }
  },
  async obtenirPreuveReversement(tontineId: string, declarationId: string, preuveId: string, utilisateurId: string) {
    const preuve = await prisma.preuveVersement.findFirst({
      where: { id: preuveId, declarationId, declaration: { tontineId } },
      select: { fichier: { select: { nom: true, typeMime: true, cleStockage: true } }, declaration: { select: { declarantId: true, rotation: { select: { beneficiaire: { select: { utilisateurId: true } } } } } } },
    });
    if (!preuve || (preuve.declaration.declarantId !== utilisateurId && preuve.declaration.rotation.beneficiaire.utilisateurId !== utilisateurId)) throw new ErreurTontine("NON_AUTORISE", "Accès au justificatif de reversement refusé.", 403);
    return preuve.fichier;
  },
  async etatCloture(tontineId: string, utilisateurId: string) {
    return prisma.$transaction(async (transaction) => {
      const contexte = await obtenirContexteCloture(transaction, tontineId);
      const estCreateur = contexte.createurId === utilisateurId;
      const estMembre = contexte.membres.some((membre) => membre.utilisateurId === utilisateurId);
      if (!estCreateur && !estMembre) throw new ErreurTontine("NON_AUTORISE", "Accès à la clôture refusé.", 403);
      const operationsSynchronisationEnAttente = await transaction.operationSynchronisation.count({
        where: {
          statut: { in: ["EN_ATTENTE", "EN_COURS"] },
          requete: { path: ["tontineId"], equals: tontineId },
        },
      });
      const declarationsCotisationEnAttente = await transaction.declarationCotisation.count({ where: { statut: "EN_ATTENTE_VALIDATION", cotisation: { tontineId } } });
      const analyse = analyserCloture(contexte, operationsSynchronisationEnAttente, declarationsCotisationEnAttente);
      const mesCotisations = contexte.rotations.flatMap((rotation) => rotation.cotisations).filter((cotisation) => cotisation.membre.utilisateurId === utilisateurId);
      const mesRotations = contexte.rotations.filter((rotation) => rotation.beneficiaire.utilisateurId === utilisateurId);
      const mesCotisationsConfirmees = mesCotisations.reduce((somme, cotisation) => somme.add(cotisation.montantValide), new Prisma.Decimal(0));
      const mesCotisationsAttendues = mesCotisations.reduce((somme, cotisation) => somme.add(cotisation.montantAttendu), new Prisma.Decimal(0));
      const mesReversementsRecus = mesRotations.reduce((somme, rotation) => somme.add(sommeMontantsConfirmes(rotation.versements.filter((versement) => versement.statut === "CONFIRME"))), new Prisma.Decimal(0));
      return {
        statut: contexte.statut,
        termineeLe: contexte.termineeLe,
        archiveeLe: contexte.archiveeLe,
        estCreateur,
        peutCloturer: estCreateur && contexte.statut === "ACTIVE" && analyse.conditions.every((condition) => condition.remplie),
        peutArchiver: estCreateur && contexte.statut === "TERMINEE" && Boolean(contexte.rapportCloture),
        conditions: analyse.conditions,
        blocages: {
          cotisationsNonReglees: analyse.cotisationsNonReglees.length,
          reversementsNonConfirmes: analyse.reversementsNonConfirmes.length,
          contestationsOuvertes: analyse.contestationsOuvertes.length,
          operationsSynchronisationEnAttente: analyse.operationsFinancieresEnAttente,
        },
        totaux: {
          montantCotisationsAttendu: analyse.montantCotisationsAttendu,
          montantCotisationsConfirme: analyse.montantCotisationsConfirme,
          montantPenalitesAppliquees: analyse.montantPenalitesAppliquees,
          montantReversementsConfirmes: analyse.montantReversementsConfirmes,
          nombreRotations: contexte.rotations.length,
        },
        monResultat: {
          cotisationsAttendues: mesCotisationsAttendues,
          cotisationsConfirmees: mesCotisationsConfirmees,
          penalitesHistoriques: mesCotisations.reduce((somme, cotisation) => somme.add(cotisation.penaliteAppliqueeMontant), new Prisma.Decimal(0)),
          reversementsRecus: mesReversementsRecus,
          nombreCotisations: mesCotisations.length,
          nombreRotationsBeneficiees: mesRotations.length,
        },
        rapport: contexte.rapportCloture,
      };
    }, { isolationLevel: "Serializable" });
  },
  async cloturer(tontineId: string, createurId: string, _: ConfirmationCloture) {
    try {
      return await prisma.$transaction(async (transaction) => {
      const contexte = await obtenirContexteCloture(transaction, tontineId);
      if (contexte.createurId !== createurId) throw new ErreurTontine("NON_AUTORISE", "Seul le créateur peut clôturer cette tontine.", 403);
      if (contexte.statut !== "ACTIVE") throw new ErreurTontine("CLOTURE_INDISPONIBLE", "Seule une tontine active peut être clôturée.", 409);
      if (contexte.rapportCloture) throw new ErreurTontine("CLOTURE_DEJA_EFFECTUEE", "Un rapport de clôture existe déjà.", 409);
      const operationsSynchronisationEnAttente = await transaction.operationSynchronisation.count({
        where: { statut: { in: ["EN_ATTENTE", "EN_COURS"] }, requete: { path: ["tontineId"], equals: tontineId } },
      });
      const declarationsCotisationEnAttente = await transaction.declarationCotisation.count({ where: { statut: "EN_ATTENTE_VALIDATION", cotisation: { tontineId } } });
      const analyse = analyserCloture(contexte, operationsSynchronisationEnAttente, declarationsCotisationEnAttente);
      if (!analyse.conditions.every((condition) => condition.remplie)) throw new ErreurTontine("CONDITIONS_CLOTURE_INCOMPLETES", "Toutes les conditions financières et de rotation doivent être satisfaites avant la clôture.", 422);

      const clotureeLe = new Date();
      const verrouillage = await transaction.tontine.updateMany({
        where: { id: tontineId, createurId, statut: "ACTIVE", termineeLe: null },
        data: { statut: "TERMINEE", termineeLe: clotureeLe, adhesionsFermees: true },
      });
      if (verrouillage.count !== 1) throw new ErreurTontine("CLOTURE_CONCURRENTE", "La tontine vient d'être clôturée par une autre demande.", 409);

      const donneesRapport = {
        mode: contexte.mode,
        rotations: contexte.rotations.map((rotation) => ({
          numero: rotation.numero,
          beneficiaireMembreId: rotation.beneficiaireId,
          montantTheorique: rotation.montantTheorique.toString(),
          montantCotisationsConfirme: rotation.montantValide.toString(),
          montantReversementsConfirmes: sommeMontantsConfirmes(rotation.versements.filter((versement) => versement.statut === "CONFIRME")).toString(),
          termineeLe: rotation.termineeLe?.toISOString() ?? null,
        })),
      };
      const rapport = await transaction.rapportClotureTontine.create({
        data: {
          tontineId,
          creeParId: createurId,
          clotureeLe,
          montantCotisationsAttendu: analyse.montantCotisationsAttendu,
          montantCotisationsConfirme: analyse.montantCotisationsConfirme,
          montantPenalitesAppliquees: analyse.montantPenalitesAppliquees,
          montantReversementsConfirmes: analyse.montantReversementsConfirmes,
          nombreRotations: contexte.rotations.length,
          donnees: donneesRapport,
        },
      });
      await transaction.notification.createMany({
        data: contexte.membres.map((membre) => ({
          utilisateurId: membre.utilisateurId,
          type: "TONTINE_TERMINEE",
          titre: "Tontine clôturée",
          message: "Toutes les opérations ont été confirmées. Le rapport de clôture est disponible en lecture seule.",
          cibleUrl: `/tontines/${tontineId}/cloture`,
        })),
      });
        return { statut: "TERMINEE" as const, termineeLe: clotureeLe, rapportId: rapport.id };
      }, { isolationLevel: "Serializable" });
    } catch (cause) {
      if (cause instanceof Prisma.PrismaClientKnownRequestError && cause.code === "P2034") throw new ErreurTontine("CLOTURE_CONCURRENTE", "La clôture est en concurrence avec une autre opération. Réessayez après actualisation.", 409);
      throw cause;
    }
  },
  async archiver(tontineId: string, createurId: string) {
    return prisma.$transaction(async (transaction) => {
      const tontine = await transaction.tontine.findFirst({ where: { id: tontineId, createurId }, select: { id: true, statut: true, rapportCloture: { select: { id: true } } } });
      if (!tontine) throw new ErreurTontine("NON_AUTORISE", "Seul le créateur peut archiver cette tontine.", 403);
      if (tontine.statut !== "TERMINEE" || !tontine.rapportCloture) throw new ErreurTontine("ARCHIVAGE_INDISPONIBLE", "Seule une tontine clôturée avec rapport peut être archivée.", 409);
      const archiveeLe = new Date();
      const miseAJour = await transaction.tontine.updateMany({ where: { id: tontineId, createurId, statut: "TERMINEE", archiveeLe: null }, data: { statut: "ARCHIVEE", archiveeLe } });
      if (miseAJour.count !== 1) throw new ErreurTontine("ARCHIVAGE_CONCURRENT", "La tontine vient d'être archivée par une autre demande.", 409);
      return { statut: "ARCHIVEE" as const, archiveeLe };
    }, { isolationLevel: "Serializable" });
  },
  async traiterRetardsEtRappels() {
    const maintenant = new Date();
    const cotisations = await prisma.cotisation.findMany({
      where: { statut: { in: ["A_PAYER", "PARTIEL", "EN_RETARD"] }, rotation: { statut: "EN_COURS", tontine: { statut: "ACTIVE" } } },
      select: { id: true, montantAttendu: true, montantValide: true, echeanceLe: true, penaliteAppliqueeLe: true, rappelAvantEcheanceEnvoyeLe: true, rappelRetardEnvoyeLe: true, membre: { select: { utilisateurId: true } }, rotation: { select: { tontine: { select: { id: true, delaiGraceJours: true, penaliteActive: true, penaliteMontant: true, rappelsActifs: true } } } } },
    });
    let retards = 0;
    let penalites = 0;
    let rappelsAvantEcheance = 0;
    let rappels = 0;
    for (const cotisation of cotisations) {
      if (cotisation.montantValide.greaterThanOrEqualTo(cotisation.montantAttendu)) continue;
      if (maintenant < cotisation.echeanceLe) {
        const rappelAvantEcheance = cotisation.rotation.tontine.rappelsActifs && !cotisation.rappelAvantEcheanceEnvoyeLe
          ? await prisma.$transaction(async (transaction) => {
            const miseAJour = await transaction.cotisation.updateMany({ where: { id: cotisation.id, rappelAvantEcheanceEnvoyeLe: null }, data: { rappelAvantEcheanceEnvoyeLe: maintenant } });
            if (miseAJour.count) await transaction.notification.create({ data: { utilisateurId: cotisation.membre.utilisateurId, type: "COTISATION_A_PAYER", titre: "Cotisation à régler", message: "Votre cotisation est attendue avant l'échéance de la rotation en cours.", cibleUrl: `/tontines/${cotisation.rotation.tontine.id}/cotisations` } });
            return Boolean(miseAJour.count);
          }, { isolationLevel: "Serializable" })
          : false;
        if (rappelAvantEcheance) rappelsAvantEcheance += 1;
        continue;
      }
      if (maintenant <= limiteGrace(cotisation.echeanceLe, cotisation.rotation.tontine.delaiGraceJours)) continue;
      const resultat = await prisma.$transaction(async (transaction) => {
        const miseAJour = await transaction.cotisation.updateMany({ where: { id: cotisation.id, statut: { in: ["A_PAYER", "PARTIEL", "EN_RETARD"] } }, data: { statut: "EN_RETARD" } });
        if (!miseAJour.count) return { retard: false, penalite: false, rappel: false };
        const penalite = cotisation.rotation.tontine.penaliteActive && Boolean(cotisation.rotation.tontine.penaliteMontant) && !cotisation.penaliteAppliqueeLe
          ? await transaction.cotisation.updateMany({ where: { id: cotisation.id, penaliteAppliqueeLe: null }, data: { penaliteAppliqueeLe: maintenant, penaliteAppliqueeMontant: cotisation.rotation.tontine.penaliteMontant! } })
          : { count: 0 };
        const rappel = cotisation.rotation.tontine.rappelsActifs && !cotisation.rappelRetardEnvoyeLe
          ? await transaction.cotisation.updateMany({ where: { id: cotisation.id, rappelRetardEnvoyeLe: null }, data: { rappelRetardEnvoyeLe: maintenant } })
          : { count: 0 };
        if (rappel.count) await transaction.notification.create({ data: { utilisateurId: cotisation.membre.utilisateurId, type: "COTISATION_EN_RETARD", titre: "Cotisation en retard", message: "Votre cotisation reste due après expiration du délai de grâce.", cibleUrl: `/tontines/${cotisation.rotation.tontine.id}/cotisations` } });
        return { retard: true, penalite: Boolean(penalite.count), rappel: Boolean(rappel.count) };
      }, { isolationLevel: "Serializable" });
      if (resultat.retard) retards += 1;
      if (resultat.penalite) penalites += 1;
      if (resultat.rappel) rappels += 1;
    }
    return { examinees: cotisations.length, retards, penalites, rappelsAvantEcheance, rappels };
  },
  async traiterInvitation(invitationId: string, utilisateurId: string, accepter: boolean, donnees: DonneesTraitementInvitation | undefined) {
    await expirerInvitations({ id: invitationId });
    try {
      return await prisma.$transaction(async (transaction) => {
      const invitation = await transaction.invitationTontine.findUnique({ where: { id: invitationId }, include: { tontine: { include: { _count: { select: { membres: { where: { statut: "APPROUVE" } } } } } } } });
      if (!invitation) throw new ErreurTontine("INVITATION_INTROUVABLE", "Invitation introuvable.", 404);
      if (invitation.expireLe <= new Date()) throw new ErreurTontine("INVITATION_EXPIREE", "Cette invitation a expiré.", 409);
      if (!invitation.estActive || invitation.statut !== "EN_ATTENTE") throw new ErreurTontine("INVITATION_INVALIDE", "Invitation invalide.", 409);
      if (invitation.tontine.statutAdministration === "SUSPENDUE") throw new ErreurTontine("TONTINE_SUSPENDUE", "Les adhésions sont suspendues par l’administration.", 409);
      if (invitation.inviteId && invitation.inviteId !== utilisateurId) throw new ErreurTontine("NON_AUTORISE", "Cette invitation est destinée à un autre utilisateur.", 403);
      if (!invitation.inviteId && !jetonInvitationValide(donnees?.jeton, invitation.jetonHash)) throw new ErreurTontine("NON_AUTORISE", "Jeton d'invitation invalide.", 403);
      if (!accepter) {
        await transaction.invitationTontine.update({ where: { id: invitationId }, data: { statut: "REFUSEE", estActive: false, refuseeLe: new Date() } });
        return { tontineId: invitation.tontineId, statut: "REFUSEE" as const };
      }
      if (!donnees?.conditionsAcceptees) throw new ErreurTontine("CONSENTEMENT_REQUIS", "Vous devez accepter les conditions.");
      if (invitation.tontine.adhesionsFermees || invitation.tontine.strategieAdhesion === "DEMANDE" || invitation.tontine._count.membres >= invitation.tontine.nombreParticipantsRequis) throw new ErreurTontine("ADHESION_FERMEE", "Aucune place disponible.", 409);
      await transaction.membreTontine.upsert({ where: { tontineId_utilisateurId: { tontineId: invitation.tontineId, utilisateurId } }, create: { tontineId: invitation.tontineId, utilisateurId, statut: "APPROUVE", approuveLe: new Date() }, update: { statut: "APPROUVE", approuveLe: new Date(), retireLe: null } });
      await transaction.invitationTontine.update({ where: { id: invitationId }, data: { statut: "ACCEPTEE", estActive: false, accepteeLe: new Date() } });
      return { tontineId: invitation.tontineId, statut: "ACCEPTEE" as const };
      }, { isolationLevel: "Serializable" });
    } catch (erreur) {
      if (erreur instanceof ErreurTontine && erreur.code === "INVITATION_EXPIREE") await expirerInvitations({ id: invitationId });
      throw erreur;
    }
  },
  async listerInvitations(tontineId: string, createurId: string) {
    const tontine = await prisma.tontine.findFirst({ where: { id: tontineId, createurId }, select: { id: true } });
    if (!tontine) throw new ErreurTontine("NON_AUTORISE", "Accès aux invitations refusé.", 403);
    await expirerInvitations({ tontineId });
    return prisma.invitationTontine.findMany({ where: { tontineId }, select: { id: true, code: true, inviteId: true, expireLe: true, statut: true, estActive: true, creeLe: true }, orderBy: { creeLe: "desc" } });
  },
  async listerInvitationsRecues(utilisateurId: string) { await expirerInvitations({ inviteId: utilisateurId }); return prisma.invitationTontine.findMany({ where: { inviteId: utilisateurId, statut: "EN_ATTENTE", estActive: true }, select: { id: true, expireLe: true, tontine: { select: { id: true, nom: true, mode: true, montantCotisation: true, frequence: true } } } }); },
  async modifier(tontineId: string, createurId: string, donnees: z.infer<typeof modificationTontineSchema>) {
    const tontine = await exigerCreateur(tontineId, createurId);
    const configurationFinale = creationTontineSchema.parse({
      nom: tontine.nom,
      description: tontine.description ?? undefined,
      mode: tontine.mode,
      montantCotisation: Number(tontine.montantCotisation),
      frequence: tontine.frequence,
      nombreParticipantsRequis: tontine.nombreParticipantsRequis,
      dateCommencement: tontine.dateCommencement,
      fuseauHoraire: tontine.fuseauHoraire,
      visibilite: tontine.visibilite,
      modeDemarrage: tontine.modeDemarrage,
      strategieAdhesion: tontine.strategieAdhesion,
      methodeOrdre: tontine.methodeOrdre,
      reversementsPartielsAutorises: tontine.reversementsPartielsAutorises,
      rappelsActifs: tontine.rappelsActifs,
      delaiGraceJours: tontine.delaiGraceJours,
      penaliteActive: tontine.penaliteActive,
      penaliteMontant: tontine.penaliteMontant ? Number(tontine.penaliteMontant) : undefined,
      ...donnees,
    });
    return prisma.tontine.update({
      where: { id: tontineId },
      data: {
        ...donnees,
        penaliteMontant: configurationFinale.penaliteActive ? configurationFinale.penaliteMontant : null,
      },
    });
  },
  async listerMembres(tontineId: string, utilisateurId: string) {
    const acces = await prisma.tontine.findFirst({ where: { id: tontineId, OR: [{ createurId: utilisateurId }, { membres: { some: { utilisateurId, statut: "APPROUVE" } } }] }, select: { id: true } });
    if (!acces) throw new ErreurTontine("NON_AUTORISE", "Accès aux membres refusé.", 403);
    return prisma.membreTontine.findMany({ where: { tontineId }, select: { id: true, role: true, statut: true, rejointLe: true, approuveLe: true, utilisateur: { select: { profil: { select: { prenom: true, nom: true } } } } }, orderBy: { rejointLe: "asc" } });
  },
  async listerDemandes(tontineId: string, createurId: string) {
    const tontine = await prisma.tontine.findFirst({ where: { id: tontineId, createurId }, select: { id: true } });
    if (!tontine) throw new ErreurTontine("NON_AUTORISE", "Accès aux demandes refusé.", 403);
    return prisma.demandeAdhesion.findMany({ where: { tontineId }, select: { id: true, statut: true, motif: true, creeLe: true, decideLe: true, demandeur: { select: { profil: { select: { prenom: true, nom: true } } } } }, orderBy: { creeLe: "desc" } });
  },
  creer(utilisateurId: string, donnees: Creation) {
    const nombreTours = donnees.mode === "FIXE_CREATEUR" ? donnees.nombreParticipantsRequis - 1 : donnees.nombreParticipantsRequis;
    return prisma.$transaction(async (transaction) => {
      const tontine = await transaction.tontine.create({ data: { ...donnees, createurId: utilisateurId, devise: "XOF", nombreTours, dateCommencement: donnees.dateCommencement, penaliteMontant: donnees.penaliteActive ? donnees.penaliteMontant : null } });
      await transaction.membreTontine.create({ data: { tontineId: tontine.id, utilisateurId, role: "CREATEUR", statut: "APPROUVE", position: 1, approuveLe: new Date() } });
      return tontine;
    });
  },
  listerMesTontines(utilisateurId: string) { return prisma.tontine.findMany({ where: { membres: { some: { utilisateurId, statut: "APPROUVE" } } }, include: { membres: true }, orderBy: { creeLe: "desc" } }); },
  catalogue() { return prisma.tontine.findMany({ where: { visibilite: "PUBLIQUE", adhesionsFermees: false, statut: { in: ["EN_PREPARATION", "PRETE_A_DEMARRER"] } }, select: { id: true, nom: true, description: true, createurId: true, statut: true, mode: true, montantCotisation: true, devise: true, frequence: true, nombreParticipantsRequis: true, dateCommencement: true, createur: { select: { profil: { select: { prenom: true, nom: true } } } }, _count: { select: { membres: { where: { statut: "APPROUVE" } } } } } }); },
  async detail(tontineId: string, utilisateurId: string) {
    const tontine = await prisma.tontine.findUnique({
      where: { id: tontineId },
      include: {
        membres: {
          where: { utilisateurId, statut: "APPROUVE" },
        },
        invitations: {
          where: { inviteId: utilisateurId, statut: "EN_ATTENTE" },
        },
        _count: {
          select: {
            membres: {
              where: {
                statut: "APPROUVE",
                utilisateur: { statut: "ACTIF" },
              },
            },
          },
        },
      },
    });
    if (!tontine || (tontine.createurId !== utilisateurId && !tontine.membres.length && !tontine.invitations.length && tontine.visibilite === "PRIVEE")) throw new ErreurTontine("INTROUVABLE", "Tontine introuvable.", 404);
    const { _count, ...detail } = tontine;
    return { ...detail, nombreMembresApprouves: _count.membres };
  },
  async creerInvitation(tontineId: string, createurId: string, donnees: z.infer<typeof invitationSchema>) {
    await exigerCreateur(tontineId, createurId);
    if (donnees.expireLe <= new Date()) throw new ErreurTontine("EXPIRATION_INVALIDE", "Expiration future requise.");
    if (donnees.inviteId) {
      const [membre, invitationActive] = await Promise.all([
        prisma.membreTontine.findFirst({ where: { tontineId, utilisateurId: donnees.inviteId, statut: "APPROUVE" }, select: { id: true } }),
        prisma.invitationTontine.findFirst({ where: { tontineId, inviteId: donnees.inviteId, statut: "EN_ATTENTE", estActive: true, expireLe: { gt: new Date() } }, select: { id: true } }),
      ]);
      if (membre || invitationActive) throw new ErreurTontine("INVITATION_EXISTANTE", "Cet utilisateur est déjà membre ou invité.", 409);
    }
    const jeton = randomBytes(32).toString("base64url");
    const code = randomBytes(5).toString("hex").toUpperCase();
    const invitation = await prisma.invitationTontine.create({ data: { tontineId, createurId, inviteId: donnees.inviteId, code, jetonHash: hash(jeton), expireLe: donnees.expireLe } });
    return { invitation: { id: invitation.id, code: invitation.code, inviteId: invitation.inviteId, expireLe: invitation.expireLe, statut: invitation.statut }, jeton };
  },
  async revoquerInvitation(invitationId: string, createurId: string) { const invitation = await prisma.invitationTontine.findFirst({ where: { id: invitationId, createurId } }); if (!invitation) throw new ErreurTontine("NON_AUTORISE", "Invitation introuvable.", 404); if (invitation.expireLe <= new Date() && invitation.statut === "EN_ATTENTE") return prisma.invitationTontine.update({ where: { id: invitationId }, data: { statut: "EXPIREE", estActive: false } }); if (!invitation.estActive || invitation.statut !== "EN_ATTENTE") throw new ErreurTontine("INVITATION_INVALIDE", "Cette invitation ne peut plus être révoquée.", 409); return prisma.invitationTontine.update({ where: { id: invitationId }, data: { statut: "REVOQUEE", estActive: false, revoqueeLe: new Date() } }); },
  async demanderAdhesion(tontineId: string, demandeurId: string, donnees: z.infer<typeof demandeSchema>) {
    const tontine = await prisma.tontine.findUnique({ where: { id: tontineId }, include: { _count: { select: { membres: { where: { statut: "APPROUVE" } } } } } });
    if (!tontine || tontine.visibilite !== "PUBLIQUE" || tontine.adhesionsFermees || tontine.strategieAdhesion === "INVITATION") throw new ErreurTontine("ADHESION_FERMEE", "Cette tontine n'accepte pas les demandes.", 409);
    if (tontine.statutAdministration === "SUSPENDUE") throw new ErreurTontine("TONTINE_SUSPENDUE", "Les adhésions sont suspendues par l’administration.", 409);
    if (tontine._count.membres >= tontine.nombreParticipantsRequis) throw new ErreurTontine("CAPACITE_ATTEINTE", "Aucune place disponible.", 409);
    const empreinteConditions = hash(JSON.stringify({ mode: tontine.mode, montant: tontine.montantCotisation.toString(), frequence: tontine.frequence, versionConditions }));
    return prisma.demandeAdhesion.upsert({ where: { tontineId_demandeurId: { tontineId, demandeurId } }, create: { tontineId, demandeurId, motif: donnees.motif, consentementAccepteLe: new Date(), versionConditions, empreinteConditions }, update: { statut: "EN_ATTENTE", motif: donnees.motif, decideLe: null, decideParId: null, consentementAccepteLe: new Date(), versionConditions, empreinteConditions } });
  },
  async deciderDemande(demandeId: string, createurId: string, approuver: boolean) {
    return prisma.$transaction(async (transaction) => {
      const demande = await transaction.demandeAdhesion.findUnique({ where: { id: demandeId }, include: { tontine: { include: { _count: { select: { membres: { where: { statut: "APPROUVE" } } } } } } } });
      if (!demande || demande.tontine.createurId !== createurId) throw new ErreurTontine("NON_AUTORISE", "Demande introuvable ou non autorisée.", 403);
      if (demande.tontine.statutAdministration === "SUSPENDUE") throw new ErreurTontine("TONTINE_SUSPENDUE", "Les adhésions sont suspendues par l’administration.", 409);
      if (demande.statut !== "EN_ATTENTE") throw new ErreurTontine("DEMANDE_TRAITEE", "Cette demande a déjà été traitée.", 409);
      if (approuver && demande.tontine._count.membres >= demande.tontine.nombreParticipantsRequis) throw new ErreurTontine("CAPACITE_ATTEINTE", "Aucune place disponible.", 409);
      if (approuver) await transaction.membreTontine.upsert({ where: { tontineId_utilisateurId: { tontineId: demande.tontineId, utilisateurId: demande.demandeurId } }, create: { tontineId: demande.tontineId, utilisateurId: demande.demandeurId, statut: "APPROUVE", approuveLe: new Date() }, update: { statut: "APPROUVE", approuveLe: new Date(), retireLe: null } });
      return transaction.demandeAdhesion.update({ where: { id: demandeId }, data: { statut: approuver ? "APPROUVEE" : "REFUSEE", decideParId: createurId, decideLe: new Date() } });
    });
  },
};
