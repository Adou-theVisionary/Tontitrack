import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import type { z } from "zod";
import { creationTontineSchema, demandeSchema, invitationSchema, modificationTontineSchema } from "@/lib/tontines/contrats";

export class ErreurTontine extends Error { constructor(public code: string, message: string, public statut = 400) { super(message); } }
type Creation = z.infer<typeof creationTontineSchema>;
type DonneesTraitementInvitation = { conditionsAcceptees?: true; jeton?: string };
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
  if (tontine.reglesVerrouilleesLe || tontine.statut !== "EN_PREPARATION") throw new ErreurTontine("TONTINE_VERROUILLEE", "Ces règles ne sont plus modifiables.", 409);
  return tontine;
}

export const tontinesService = {
  async traiterInvitation(invitationId: string, utilisateurId: string, accepter: boolean, donnees: DonneesTraitementInvitation | undefined) {
    await expirerInvitations({ id: invitationId });
    try {
      return await prisma.$transaction(async (transaction) => {
      const invitation = await transaction.invitationTontine.findUnique({ where: { id: invitationId }, include: { tontine: { include: { _count: { select: { membres: { where: { statut: "APPROUVE" } } } } } } } });
      if (!invitation) throw new ErreurTontine("INVITATION_INTROUVABLE", "Invitation introuvable.", 404);
      if (invitation.expireLe <= new Date()) throw new ErreurTontine("INVITATION_EXPIREE", "Cette invitation a expiré.", 409);
      if (!invitation.estActive || invitation.statut !== "EN_ATTENTE") throw new ErreurTontine("INVITATION_INVALIDE", "Invitation invalide.", 409);
      if (invitation.inviteId && invitation.inviteId !== utilisateurId) throw new ErreurTontine("NON_AUTORISE", "Cette invitation est destinée à un autre utilisateur.", 403);
      if (!invitation.inviteId && !jetonInvitationValide(donnees?.jeton, invitation.jetonHash)) throw new ErreurTontine("NON_AUTORISE", "Jeton d'invitation invalide.", 403);
      if (!accepter) return transaction.invitationTontine.update({ where: { id: invitationId }, data: { statut: "REFUSEE", estActive: false, refuseeLe: new Date() } });
      if (!donnees?.conditionsAcceptees) throw new ErreurTontine("CONSENTEMENT_REQUIS", "Vous devez accepter les conditions.");
      if (invitation.tontine.adhesionsFermees || invitation.tontine.strategieAdhesion === "DEMANDE" || invitation.tontine._count.membres >= invitation.tontine.nombreParticipantsRequis) throw new ErreurTontine("ADHESION_FERMEE", "Aucune place disponible.", 409);
      await transaction.membreTontine.upsert({ where: { tontineId_utilisateurId: { tontineId: invitation.tontineId, utilisateurId } }, create: { tontineId: invitation.tontineId, utilisateurId, statut: "APPROUVE", approuveLe: new Date() }, update: { statut: "APPROUVE", approuveLe: new Date(), retireLe: null } });
      return transaction.invitationTontine.update({ where: { id: invitationId }, data: { statut: "ACCEPTEE", estActive: false, accepteeLe: new Date() } });
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
    const tontine = await prisma.tontine.findUnique({ where: { id: tontineId }, include: { membres: { where: { utilisateurId, statut: "APPROUVE" } }, invitations: { where: { inviteId: utilisateurId, statut: "EN_ATTENTE" } } } });
    if (!tontine || (tontine.createurId !== utilisateurId && !tontine.membres.length && !tontine.invitations.length && tontine.visibilite === "PRIVEE")) throw new ErreurTontine("INTROUVABLE", "Tontine introuvable.", 404);
    return tontine;
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
    if (tontine._count.membres >= tontine.nombreParticipantsRequis) throw new ErreurTontine("CAPACITE_ATTEINTE", "Aucune place disponible.", 409);
    const empreinteConditions = hash(JSON.stringify({ mode: tontine.mode, montant: tontine.montantCotisation.toString(), frequence: tontine.frequence, versionConditions }));
    return prisma.demandeAdhesion.upsert({ where: { tontineId_demandeurId: { tontineId, demandeurId } }, create: { tontineId, demandeurId, motif: donnees.motif, consentementAccepteLe: new Date(), versionConditions, empreinteConditions }, update: { statut: "EN_ATTENTE", motif: donnees.motif, decideLe: null, decideParId: null, consentementAccepteLe: new Date(), versionConditions, empreinteConditions } });
  },
  async deciderDemande(demandeId: string, createurId: string, approuver: boolean) {
    return prisma.$transaction(async (transaction) => {
      const demande = await transaction.demandeAdhesion.findUnique({ where: { id: demandeId }, include: { tontine: { include: { _count: { select: { membres: { where: { statut: "APPROUVE" } } } } } } } });
      if (!demande || demande.tontine.createurId !== createurId) throw new ErreurTontine("NON_AUTORISE", "Demande introuvable ou non autorisée.", 403);
      if (demande.statut !== "EN_ATTENTE") throw new ErreurTontine("DEMANDE_TRAITEE", "Cette demande a déjà été traitée.", 409);
      if (approuver && demande.tontine._count.membres >= demande.tontine.nombreParticipantsRequis) throw new ErreurTontine("CAPACITE_ATTEINTE", "Aucune place disponible.", 409);
      if (approuver) await transaction.membreTontine.upsert({ where: { tontineId_utilisateurId: { tontineId: demande.tontineId, utilisateurId: demande.demandeurId } }, create: { tontineId: demande.tontineId, utilisateurId: demande.demandeurId, statut: "APPROUVE", approuveLe: new Date() }, update: { statut: "APPROUVE", approuveLe: new Date(), retireLe: null } });
      return transaction.demandeAdhesion.update({ where: { id: demandeId }, data: { statut: approuver ? "APPROUVEE" : "REFUSEE", decideParId: createurId, decideLe: new Date() } });
    });
  },
};
