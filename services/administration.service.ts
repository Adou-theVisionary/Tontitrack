import { Prisma, RolePlateforme, StatutUtilisateur } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { modulesPlateforme, permissionsParRole, permissionsPlateforme } from "@/lib/administration/permissions";

export class ErreurServiceAdministration extends Error {
  constructor(public code: string, message: string, public statut = 400) {
    super(message);
  }
}

type Pagination = { page?: number; taille?: number };
type FiltresUtilisateurs = Pagination & { recherche?: string; statut?: StatutUtilisateur; role?: RolePlateforme };
type FiltresTontines = Pagination & { recherche?: string; statut?: string; mode?: string };

function pagination({ page = 1, taille = 20 }: Pagination) {
  const pageSecurisee = Math.max(1, Math.floor(page));
  const tailleSecurisee = Math.min(100, Math.max(1, Math.floor(taille)));
  return { page: pageSecurisee, taille: tailleSecurisee, skip: (pageSecurisee - 1) * tailleSecurisee };
}

function nomComplet(profil: { prenom: string; nom: string } | null) {
  return profil ? `${profil.prenom} ${profil.nom}`.trim() : "Profil non renseigné";
}

async function ecrireAudit(
  transaction: Prisma.TransactionClient,
  evenement: {
    acteurId?: string | null; entiteType: string; entiteId: string; action: string;
    module: string; autorisation?: string; resultat?: "SUCCES" | "REFUS" | "ECHEC";
    motif?: string; contexte?: Prisma.InputJsonValue;
  },
) {
  return transaction.evenementAudit.create({
    data: {
      acteurId: evenement.acteurId ?? null,
      entiteType: evenement.entiteType,
      entiteId: evenement.entiteId,
      action: evenement.action,
      source: "WEB",
      module: evenement.module,
      autorisation: evenement.autorisation,
      resultat: evenement.resultat ?? "SUCCES",
      motif: evenement.motif,
      contexte: evenement.contexte,
    },
  });
}

async function verifierDernierSuperAdmin(transaction: Prisma.TransactionClient, utilisateurId: string) {
  const attribution = await transaction.attributionRolePlateforme.findUnique({
    where: { utilisateurId_role: { utilisateurId, role: "SUPER_ADMIN" } },
    select: { id: true },
  });
  if (!attribution) return;
  const nombre = await transaction.attributionRolePlateforme.count({
    where: { role: "SUPER_ADMIN", utilisateur: { statut: "ACTIF" } },
  });
  if (nombre <= 1) throw new ErreurServiceAdministration("DERNIER_SUPER_ADMIN", "Le dernier Super Admin actif ne peut pas être retiré ni suspendu.", 409);
}

export const administrationService = {
  async tableauDeBord() {
    const [utilisateurs, tontines, cotisationsRetard, contestations, reversementsAttente, audits] = await Promise.all([
      prisma.utilisateur.groupBy({ by: ["statut"], _count: { _all: true } }),
      prisma.tontine.groupBy({ by: ["statut"], _count: { _all: true } }),
      prisma.cotisation.count({ where: { statut: "EN_RETARD" } }),
      prisma.declarationVersement.count({ where: { statut: "CONTESTE" } }),
      prisma.declarationVersement.count({ where: { statut: "DECLARE" } }),
      prisma.evenementAudit.findMany({
        take: 8, orderBy: { creeLe: "desc" },
        select: { id: true, action: true, module: true, resultat: true, creeLe: true, acteur: { select: { profil: { select: { prenom: true, nom: true } }, email: true } } },
      }),
    ]);
    const compter = (statut: string, donnees: { statut: string; _count: { _all: number } }[]) => donnees.find((ligne) => ligne.statut === statut)?._count._all ?? 0;
    return {
      utilisateurs: { actifs: compter("ACTIF", utilisateurs), suspendus: compter("SUSPENDU", utilisateurs), total: utilisateurs.reduce((total, ligne) => total + ligne._count._all, 0) },
      tontines: { actives: compter("ACTIVE", tontines), enPreparation: compter("EN_PREPARATION", tontines) + compter("PRETE_A_DEMARRER", tontines), terminees: compter("TERMINEE", tontines) + compter("ARCHIVEE", tontines) },
      alertes: { cotisationsRetard, contestations, reversementsAttente },
      activite: audits.map((audit) => ({ ...audit, acteur: audit.acteur ? nomComplet(audit.acteur.profil) : "Système" })),
    };
  },

  async listerUtilisateurs(filtres: FiltresUtilisateurs) {
    const { page, taille, skip } = pagination(filtres);
    const recherche = filtres.recherche?.trim();
    const where: Prisma.UtilisateurWhereInput = {
      ...(filtres.statut ? { statut: filtres.statut } : {}),
      ...(filtres.role ? { rolesPlateforme: { some: { role: filtres.role } } } : {}),
      ...(recherche ? { OR: [
        { email: { contains: recherche, mode: "insensitive" } },
        { telephone: { contains: recherche, mode: "insensitive" } },
        { profil: { is: { OR: [{ prenom: { contains: recherche, mode: "insensitive" } }, { nom: { contains: recherche, mode: "insensitive" } }] } } },
      ] } : {}),
    };
    const [total, utilisateurs] = await Promise.all([
      prisma.utilisateur.count({ where }),
      prisma.utilisateur.findMany({
        where, skip, take: taille, orderBy: { creeLe: "desc" },
        select: { id: true, email: true, telephone: true, statut: true, creeLe: true, derniereConnexionLe: true, profil: { select: { prenom: true, nom: true } }, rolesPlateforme: { select: { role: true, creeLe: true } } },
      }),
    ]);
    return { page, taille, total, utilisateurs: utilisateurs.map((utilisateur) => ({ ...utilisateur, nom: nomComplet(utilisateur.profil) })) };
  },

  async detailUtilisateur(utilisateurId: string) {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: utilisateurId },
      select: {
        id: true, email: true, telephone: true, statut: true, creeLe: true, derniereConnexionLe: true,
        profil: { select: { prenom: true, nom: true } }, rolesPlateforme: { select: { role: true, creeLe: true, attribueParId: true } },
        evenementsAudit: { take: 15, orderBy: { creeLe: "desc" }, select: { id: true, action: true, module: true, resultat: true, motif: true, creeLe: true } },
      },
    });
    if (!utilisateur) throw new ErreurServiceAdministration("UTILISATEUR_INTROUVABLE", "Utilisateur introuvable.", 404);
    return { ...utilisateur, nom: nomComplet(utilisateur.profil) };
  },

  async suspendreUtilisateur(utilisateurId: string, acteurId: string, motif: string) {
    if (utilisateurId === acteurId) throw new ErreurServiceAdministration("ACTION_INTERDITE", "Un administrateur ne peut pas suspendre sa propre session.", 409);
    return prisma.$transaction(async (transaction) => {
      const utilisateur = await transaction.utilisateur.findUnique({ where: { id: utilisateurId }, select: { id: true, statut: true } });
      if (!utilisateur) throw new ErreurServiceAdministration("UTILISATEUR_INTROUVABLE", "Utilisateur introuvable.", 404);
      if (utilisateur.statut === "SUSPENDU") throw new ErreurServiceAdministration("STATUT_INCHANGE", "Cet utilisateur est déjà suspendu.", 409);
      await verifierDernierSuperAdmin(transaction, utilisateurId);
      await transaction.utilisateur.update({ where: { id: utilisateurId }, data: { statut: "SUSPENDU" } });
      await transaction.session.updateMany({ where: { utilisateurId, invalideLe: null }, data: { invalideLe: new Date() } });
      await ecrireAudit(transaction, { acteurId, entiteType: "Utilisateur", entiteId: utilisateurId, action: "SUSPENSION_UTILISATEUR", module: "plateforme", autorisation: "plateforme.utilisateurs.suspendre", motif, contexte: { statutPrecedent: utilisateur.statut } });
      return { statut: "SUSPENDU" as const };
    }, { isolationLevel: "Serializable" });
  },

  async reactiverUtilisateur(utilisateurId: string, acteurId: string, motif: string) {
    return prisma.$transaction(async (transaction) => {
      const utilisateur = await transaction.utilisateur.findUnique({ where: { id: utilisateurId }, select: { id: true, statut: true } });
      if (!utilisateur) throw new ErreurServiceAdministration("UTILISATEUR_INTROUVABLE", "Utilisateur introuvable.", 404);
      if (utilisateur.statut === "SUPPRIME") throw new ErreurServiceAdministration("ACTION_INTERDITE", "Un compte supprimé ne peut pas être réactivé par cette interface.", 409);
      await transaction.utilisateur.update({ where: { id: utilisateurId }, data: { statut: "ACTIF", supprimeLe: null } });
      await ecrireAudit(transaction, { acteurId, entiteType: "Utilisateur", entiteId: utilisateurId, action: "REACTIVATION_UTILISATEUR", module: "plateforme", autorisation: "plateforme.utilisateurs.reactiver", motif, contexte: { statutPrecedent: utilisateur.statut } });
      return { statut: "ACTIF" as const };
    }, { isolationLevel: "Serializable" });
  },

  async attribuerRole(utilisateurId: string, role: RolePlateforme, acteurId: string, motif: string) {
    return prisma.$transaction(async (transaction) => {
      const utilisateur = await transaction.utilisateur.findUnique({ where: { id: utilisateurId }, select: { id: true, statut: true } });
      if (!utilisateur) throw new ErreurServiceAdministration("UTILISATEUR_INTROUVABLE", "Utilisateur introuvable.", 404);
      if (utilisateur.statut !== "ACTIF") throw new ErreurServiceAdministration("COMPTE_INACTIF", "Un rôle global exige un compte actif.", 409);
      const attribution = await transaction.attributionRolePlateforme.upsert({
        where: { utilisateurId_role: { utilisateurId, role } },
        create: { utilisateurId, role, attribueParId: acteurId }, update: {},
      });
      await ecrireAudit(transaction, { acteurId, entiteType: "AttributionRolePlateforme", entiteId: attribution.id, action: "ATTRIBUTION_ROLE", module: "plateforme", autorisation: "plateforme.roles.gerer", motif, contexte: { utilisateurId, role } });
      return attribution;
    }, { isolationLevel: "Serializable" });
  },

  async retirerRole(utilisateurId: string, role: RolePlateforme, acteurId: string, motif: string) {
    return prisma.$transaction(async (transaction) => {
      if (role === "SUPER_ADMIN") await verifierDernierSuperAdmin(transaction, utilisateurId);
      const suppression = await transaction.attributionRolePlateforme.deleteMany({ where: { utilisateurId, role } });
      if (!suppression.count) throw new ErreurServiceAdministration("ROLE_INTROUVABLE", "Cette attribution de rôle est introuvable.", 404);
      await ecrireAudit(transaction, { acteurId, entiteType: "Utilisateur", entiteId: utilisateurId, action: "RETRAIT_ROLE", module: "plateforme", autorisation: "plateforme.roles.gerer", motif, contexte: { role } });
      return { retire: true };
    }, { isolationLevel: "Serializable" });
  },

  roles() {
    return { roles: Object.entries(permissionsParRole).map(([role, permissions]) => ({ role, permissions })), permissions: permissionsPlateforme };
  },

  modules() { return modulesPlateforme; },

  async listerTontines(filtres: FiltresTontines) {
    const { page, taille, skip } = pagination(filtres);
    const recherche = filtres.recherche?.trim();
    const where: Prisma.TontineWhereInput = {
      ...(filtres.statut ? { statut: filtres.statut as Prisma.EnumStatutTontineFilter } : {}),
      ...(filtres.mode ? { mode: filtres.mode as Prisma.EnumModeTontineFilter } : {}),
      ...(recherche ? { OR: [{ nom: { contains: recherche, mode: "insensitive" } }, { createur: { email: { contains: recherche, mode: "insensitive" } } }] } : {}),
    };
    const [total, tontines] = await Promise.all([
      prisma.tontine.count({ where }),
      prisma.tontine.findMany({
        where, skip, take: taille, orderBy: { creeLe: "desc" },
        select: {
          id: true, nom: true, mode: true, statut: true, montantCotisation: true, devise: true, frequence: true, creeLe: true,
          createur: { select: { email: true, profil: { select: { prenom: true, nom: true } } } },
          _count: { select: { membres: { where: { statut: "APPROUVE" } }, rotations: true, cotisations: { where: { statut: "EN_RETARD" } }, reversements: { where: { statut: "CONTESTE" } } } },
        },
      }),
    ]);
    return { page, taille, total, tontines: tontines.map((tontine) => ({ ...tontine, createur: { nom: nomComplet(tontine.createur.profil), email: tontine.createur.email } })) };
  },

  async detailTontine(tontineId: string) {
    const tontine = await prisma.tontine.findUnique({
      where: { id: tontineId },
      select: {
        id: true, nom: true, description: true, mode: true, statut: true, montantCotisation: true, devise: true, frequence: true, dateCommencement: true,
        createur: { select: { email: true, profil: { select: { prenom: true, nom: true } } } },
        membres: { where: { statut: "APPROUVE" }, select: { role: true, utilisateur: { select: { email: true, profil: { select: { prenom: true, nom: true } } } } } },
        rotations: { select: { numero: true, statut: true, montantTheorique: true, montantValide: true, debutLe: true, echeanceLe: true, beneficiaire: { select: { utilisateur: { select: { profil: { select: { prenom: true, nom: true } } } } } } }, orderBy: { numero: "asc" } },
        cotisations: { select: { montantAttendu: true, montantValide: true, statut: true, penaliteAppliqueeMontant: true } },
        reversements: { select: { montant: true, montantConfirme: true, statut: true } },
      },
    });
    if (!tontine) throw new ErreurServiceAdministration("TONTINE_INTROUVABLE", "Tontine introuvable.", 404);
    const somme = (montants: Prisma.Decimal[]) => montants.reduce((total, montant) => total.add(montant), new Prisma.Decimal(0));
    return {
      ...tontine,
      createur: { nom: nomComplet(tontine.createur.profil), email: tontine.createur.email },
      membres: tontine.membres.map((membre) => ({ role: membre.role, nom: nomComplet(membre.utilisateur.profil), email: membre.utilisateur.email })),
      rotations: tontine.rotations.map((rotation) => ({ ...rotation, beneficiaire: nomComplet(rotation.beneficiaire.utilisateur.profil) })),
      agregats: {
        cotisationsAttendues: somme(tontine.cotisations.map((cotisation) => cotisation.montantAttendu)),
        cotisationsConfirmees: somme(tontine.cotisations.map((cotisation) => cotisation.montantValide)),
        penalites: somme(tontine.cotisations.map((cotisation) => cotisation.penaliteAppliqueeMontant)),
        reversementsConfirmes: somme(tontine.reversements.filter((versement) => versement.statut === "CONFIRME").map((versement) => versement.montantConfirme)),
        cotisationsRetard: tontine.cotisations.filter((cotisation) => cotisation.statut === "EN_RETARD").length,
        contestations: tontine.reversements.filter((versement) => versement.statut === "CONTESTE").length,
      },
    };
  },

  async listerAudit(filtres: Pagination & { module?: string; resultat?: string }) {
    const { page, taille, skip } = pagination(filtres);
    const where: Prisma.EvenementAuditWhereInput = { ...(filtres.module ? { module: filtres.module } : {}), ...(filtres.resultat ? { resultat: filtres.resultat } : {}) };
    const [total, evenements] = await Promise.all([
      prisma.evenementAudit.count({ where }),
      prisma.evenementAudit.findMany({ where, skip, take: taille, orderBy: { creeLe: "desc" }, select: { id: true, action: true, entiteType: true, entiteId: true, module: true, autorisation: true, resultat: true, motif: true, creeLe: true, acteur: { select: { email: true, profil: { select: { prenom: true, nom: true } } } } } }),
    ]);
    return { page, taille, total, evenements: evenements.map((evenement) => ({ ...evenement, acteur: evenement.acteur ? { nom: nomComplet(evenement.acteur.profil), email: evenement.acteur.email } : null })) };
  },

  async journaliserRefus(acteurId: string | undefined, permission: string, action: string) {
    await prisma.evenementAudit.create({ data: { acteurId, entiteType: "Administration", entiteId: permission, action, source: "WEB", module: "plateforme", autorisation: permission, resultat: "REFUS", motif: "Permission insuffisante" } });
  },
};
