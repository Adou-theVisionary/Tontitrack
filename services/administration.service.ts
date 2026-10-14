import { Prisma, RolePlateforme, StatutLitigeAdministration, StatutUtilisateur } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { estPermissionConnue, modulesPlateforme, permissionsParRole, registrePermissions } from "@/lib/administration/permissions";

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
  const audit = await transaction.evenementAudit.create({
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
  if (evenement.resultat === "REFUS" || evenement.resultat === "ECHEC") {
    await transaction.incidentAdministration.create({ data: { type: "EVENEMENT_ADMINISTRATIF", priorite: evenement.resultat === "ECHEC" ? "HAUTE" : "NORMALE", titre: evenement.action, description: evenement.motif, module: evenement.module, entiteType: evenement.entiteType, entiteId: evenement.entiteId, auditId: audit.id } });
  }
  return audit;
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
        select: { id: true, email: true, telephone: true, statut: true, creeLe: true, derniereConnexionLe: true, profil: { select: { prenom: true, nom: true } }, rolesPlateforme: { select: { role: true, creeLe: true } }, rolesPersonnalises: { select: { role: { select: { code: true, nom: true } } } } },
      }),
    ]);
    return { page, taille, total, utilisateurs: utilisateurs.map((utilisateur) => ({ ...utilisateur, nom: nomComplet(utilisateur.profil) })) };
  },

  async detailUtilisateur(utilisateurId: string) {
    const [utilisateur, historiqueAdministratif] = await Promise.all([prisma.utilisateur.findUnique({
      where: { id: utilisateurId },
      select: {
        id: true, email: true, telephone: true, statut: true, creeLe: true, derniereConnexionLe: true,
        profil: { select: { prenom: true, nom: true } }, rolesPlateforme: { select: { role: true, creeLe: true, attribueParId: true } }, rolesPersonnalises: { select: { role: { select: { id: true, code: true, nom: true, permissions: { select: { permission: true } } } } } },
      },
    }), prisma.evenementAudit.findMany({ where: { entiteType: "Utilisateur", entiteId: utilisateurId }, take: 15, orderBy: { creeLe: "desc" }, select: { id: true, action: true, module: true, resultat: true, motif: true, creeLe: true, acteur: { select: { email: true, profil: { select: { prenom: true, nom: true } } } } } })]);
    if (!utilisateur) throw new ErreurServiceAdministration("UTILISATEUR_INTROUVABLE", "Utilisateur introuvable.", 404);
    return { ...utilisateur, nom: nomComplet(utilisateur.profil), historiqueAdministratif: historiqueAdministratif.map((evenement) => ({ ...evenement, acteur: evenement.acteur ? { nom: nomComplet(evenement.acteur.profil), email: evenement.acteur.email } : null })) };
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

  async revoquerSessionsUtilisateur(utilisateurId: string, acteurId: string, motif: string) {
    if (utilisateurId === acteurId) throw new ErreurServiceAdministration("ACTION_INTERDITE", "Utilisez la déconnexion pour révoquer votre session courante.", 409);
    return prisma.$transaction(async (transaction) => {
      const utilisateur = await transaction.utilisateur.findUnique({ where: { id: utilisateurId }, select: { id: true } });
      if (!utilisateur) throw new ErreurServiceAdministration("UTILISATEUR_INTROUVABLE", "Utilisateur introuvable.", 404);
      const resultat = await transaction.session.updateMany({ where: { utilisateurId, invalideLe: null }, data: { invalideLe: new Date() } });
      await ecrireAudit(transaction, { acteurId, entiteType: "Utilisateur", entiteId: utilisateurId, action: "REVOCATION_SESSIONS", module: "plateforme", autorisation: "plateforme.utilisateurs.sessions.revoquer", motif, contexte: { nombreSessions: resultat.count } });
      return { sessionsRevoquees: resultat.count };
    }, { isolationLevel: "Serializable" });
  },

  async roles() {
    const rolesPersonnalises = await prisma.rolePersonnalise.findMany({ include: { permissions: { select: { permission: true } }, _count: { select: { attributions: true } } }, orderBy: { nom: "asc" } });
    return {
      roles: Object.entries(permissionsParRole).map(([role, permissions]) => ({ id: role, role, nom: role, systeme: true, permissions, utilisateurs: null })),
      rolesPersonnalises: rolesPersonnalises.map((role) => ({ id: role.id, code: role.code, nom: role.nom, description: role.description, systeme: false, permissions: role.permissions.map((permission) => permission.permission), utilisateurs: role._count.attributions })),
      permissions: registrePermissions,
    };
  },

  async creerRolePersonnalise(donnees: { code: string; nom: string; description?: string; permissions: string[] }, acteurId: string, motif: string) {
    const permissions = Array.from(new Set(donnees.permissions));
    if (permissions.some((permission) => !estPermissionConnue(permission))) throw new ErreurServiceAdministration("PERMISSION_INVALIDE", "Une permission demandée n’est pas reconnue.", 400);
    if (permissions.includes("plateforme.roles.gerer")) throw new ErreurServiceAdministration("PERMISSION_PROTEGEE", "La gestion des rôles reste réservée à un rôle système Super Admin.", 403);
    return prisma.$transaction(async (transaction) => {
      const role = await transaction.rolePersonnalise.create({ data: { code: donnees.code.toUpperCase(), nom: donnees.nom, description: donnees.description, permissions: { createMany: { data: permissions.map((permission) => ({ permission })) } } }, include: { permissions: true } });
      await ecrireAudit(transaction, { acteurId, entiteType: "RolePersonnalise", entiteId: role.id, action: "CREATION_ROLE_PERSONNALISE", module: "plateforme", autorisation: "plateforme.roles.gerer", motif, contexte: { code: role.code, permissions } });
      return role;
    }, { isolationLevel: "Serializable" });
  },

  async modifierRolePersonnalise(roleId: string, donnees: { nom: string; description?: string; permissions: string[] }, acteurId: string, motif: string) {
    const permissions = Array.from(new Set(donnees.permissions));
    if (permissions.some((permission) => !estPermissionConnue(permission) || permission === "plateforme.roles.gerer")) throw new ErreurServiceAdministration("PERMISSION_INVALIDE", "Cette permission ne peut pas être attribuée à un rôle personnalisé.", 400);
    return prisma.$transaction(async (transaction) => {
      const existe = await transaction.rolePersonnalise.findUnique({ where: { id: roleId }, select: { id: true } });
      if (!existe) throw new ErreurServiceAdministration("ROLE_INTROUVABLE", "Rôle personnalisé introuvable.", 404);
      const role = await transaction.rolePersonnalise.update({ where: { id: roleId }, data: { nom: donnees.nom, description: donnees.description, permissions: { deleteMany: {}, createMany: { data: permissions.map((permission) => ({ permission })) } } }, include: { permissions: true } });
      await ecrireAudit(transaction, { acteurId, entiteType: "RolePersonnalise", entiteId: roleId, action: "MODIFICATION_ROLE_PERSONNALISE", module: "plateforme", autorisation: "plateforme.roles.gerer", motif, contexte: { permissions } });
      return role;
    }, { isolationLevel: "Serializable" });
  },

  async attribuerRolePersonnalise(utilisateurId: string, roleId: string, acteurId: string, motif: string) {
    return prisma.$transaction(async (transaction) => {
      const utilisateur = await transaction.utilisateur.findUnique({ where: { id: utilisateurId }, select: { statut: true } });
      if (!utilisateur || utilisateur.statut !== "ACTIF") throw new ErreurServiceAdministration("COMPTE_INACTIF", "Un rôle exige un compte actif.", 409);
      const attribution = await transaction.attributionRolePersonnalise.upsert({ where: { utilisateurId_roleId: { utilisateurId, roleId } }, create: { utilisateurId, roleId, attribueParId: acteurId }, update: {} });
      await ecrireAudit(transaction, { acteurId, entiteType: "AttributionRolePersonnalise", entiteId: attribution.id, action: "ATTRIBUTION_ROLE_PERSONNALISE", module: "plateforme", autorisation: "plateforme.roles.gerer", motif, contexte: { utilisateurId, roleId } });
      return attribution;
    }, { isolationLevel: "Serializable" });
  },

  async retirerRolePersonnalise(utilisateurId: string, roleId: string, acteurId: string, motif: string) {
    return prisma.$transaction(async (transaction) => {
      const resultat = await transaction.attributionRolePersonnalise.deleteMany({ where: { utilisateurId, roleId } });
      if (!resultat.count) throw new ErreurServiceAdministration("ROLE_INTROUVABLE", "Cette attribution de rôle est introuvable.", 404);
      await ecrireAudit(transaction, { acteurId, entiteType: "Utilisateur", entiteId: utilisateurId, action: "RETRAIT_ROLE_PERSONNALISE", module: "plateforme", autorisation: "plateforme.roles.gerer", motif, contexte: { roleId } });
      return { retire: true };
    }, { isolationLevel: "Serializable" });
  },

  async modules() {
    const configurations = await prisma.configurationModulePlateforme.findMany();
    return modulesPlateforme.map((module) => {
      const configuration = configurations.find((item) => item.moduleId === module.id);
      return { ...module, etat: configuration?.estActive === false ? "DESACTIVE" : "ACTIF", parametres: configuration?.parametres ?? null };
    });
  },

  async modifierModule(moduleId: string, estActive: boolean, acteurId: string, motif: string) {
    const module = modulesPlateforme.find((item) => item.id === moduleId);
    if (!module) throw new ErreurServiceAdministration("MODULE_INTROUVABLE", "Module non enregistré.", 404);
    if (!estActive && !module.desactivationAutorisee) throw new ErreurServiceAdministration("DESACTIVATION_INTERDITE", "Ce module contient les données métier actives et ne peut pas être désactivé ici.", 409);
    return prisma.$transaction(async (transaction) => {
      const configuration = await transaction.configurationModulePlateforme.upsert({ where: { moduleId }, create: { moduleId, estActive }, update: { estActive } });
      await ecrireAudit(transaction, { acteurId, entiteType: "ConfigurationModulePlateforme", entiteId: moduleId, action: "MODIFICATION_MODULE", module: "plateforme", autorisation: "plateforme.modules.gerer", motif, contexte: { estActive } });
      return configuration;
    }, { isolationLevel: "Serializable" });
  },

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
          id: true, nom: true, mode: true, statut: true, statutAdministration: true, montantCotisation: true, devise: true, frequence: true, creeLe: true,
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
        id: true, nom: true, description: true, mode: true, statut: true, statutAdministration: true, suspendueLe: true, motifSuspension: true, montantCotisation: true, devise: true, frequence: true, dateCommencement: true,
        createur: { select: { email: true, profil: { select: { prenom: true, nom: true } } } },
        membres: { where: { statut: "APPROUVE" }, select: { role: true, utilisateur: { select: { email: true, profil: { select: { prenom: true, nom: true } } } } } },
        rotations: { select: { numero: true, statut: true, montantTheorique: true, montantValide: true, debutLe: true, echeanceLe: true, beneficiaire: { select: { utilisateur: { select: { profil: { select: { prenom: true, nom: true } } } } } } }, orderBy: { numero: "asc" } },
        cotisations: { select: { montantAttendu: true, montantValide: true, statut: true, penaliteAppliqueeMontant: true } },
        reversements: { select: { montant: true, montantConfirme: true, statut: true } },
        _count: { select: { demandesAdhesion: { where: { statut: "EN_ATTENTE" } }, invitations: { where: { statut: "EN_ATTENTE", estActive: true } } } },
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

  async exporterAudit(filtres: Pagination & { module?: string; resultat?: string }) {
    const donnees = await this.listerAudit({ ...filtres, page: 1, taille: 100 });
    const securiser = (valeur: unknown) => {
      const texte = String(valeur ?? "").replaceAll('"', '""');
      return /^[=+\-@]/.test(texte) ? `"'${texte}"` : `"${texte}"`;
    };
    return ["date,action,module,resultat,acteur,motif", ...donnees.evenements.map((item) => [item.creeLe, item.action, item.module, item.resultat, item.acteur?.email, item.motif].map(securiser).join(","))].join("\n");
  },

  async parametres() {
    const enregistre = await prisma.parametrePlateforme.findUnique({ where: { cle: "administration.audit.export.csv.active" } });
    return { parametres: [{ cle: "administration.audit.export.csv.active", categorie: "administration", type: "booleen", description: "Autorise l’export CSV du journal d’audit.", valeur: enregistre?.valeur ?? true, sensible: false }], message: "Seuls les réglages reliés à un comportement serveur sont exposés. Les secrets, variables d’environnement et paramètres financiers restent hors de cette interface." };
  },

  async modifierParametre(cle: string, valeur: boolean, acteurId: string, motif: string) {
    if (cle !== "administration.audit.export.csv.active" || typeof valeur !== "boolean") throw new ErreurServiceAdministration("PARAMETRE_INVALIDE", "Ce paramètre n’est pas modifiable.", 400);
    return prisma.$transaction(async (transaction) => {
      const precedent = await transaction.parametrePlateforme.findUnique({ where: { cle }, select: { valeur: true } });
      const parametre = await transaction.parametrePlateforme.upsert({ where: { cle }, create: { cle, valeur, modifieParId: acteurId }, update: { valeur, modifieParId: acteurId } });
      await ecrireAudit(transaction, { acteurId, entiteType: "ParametrePlateforme", entiteId: cle, action: "MODIFICATION_PARAMETRE", module: "plateforme", autorisation: "plateforme.parametres.gerer", motif, contexte: { ancienneValeur: precedent?.valeur ?? true, nouvelleValeur: valeur } });
      return parametre;
    }, { isolationLevel: "Serializable" });
  },

  async exportAuditAutorise() {
    const parametre = await prisma.parametrePlateforme.findUnique({ where: { cle: "administration.audit.export.csv.active" }, select: { valeur: true } });
    return parametre?.valeur !== false;
  },

  async suspendreTontine(tontineId: string, acteurId: string, motif: string) {
    return prisma.$transaction(async (transaction) => {
      const tontine = await transaction.tontine.findUnique({ where: { id: tontineId }, select: { id: true, statut: true, statutAdministration: true } });
      if (!tontine) throw new ErreurServiceAdministration("TONTINE_INTROUVABLE", "Tontine introuvable.", 404);
      if (tontine.statutAdministration === "SUSPENDUE") throw new ErreurServiceAdministration("STATUT_INCHANGE", "Cette tontine est déjà suspendue.", 409);
      const resultat = await transaction.tontine.updateMany({ where: { id: tontineId, statutAdministration: "ACTIVE" }, data: { statutAdministration: "SUSPENDUE", suspendueLe: new Date(), suspendueParId: acteurId, motifSuspension: motif, statutAvantSuspension: tontine.statut } });
      if (resultat.count !== 1) throw new ErreurServiceAdministration("OPERATION_CONCURRENTE", "La tontine a changé pendant la demande.", 409);
      await ecrireAudit(transaction, { acteurId, entiteType: "Tontine", entiteId: tontineId, action: "SUSPENSION_TONTINE", module: "tontines", autorisation: "tontines.suspension.gerer", motif, contexte: { statut: tontine.statut } });
      return { statutAdministration: "SUSPENDUE" as const };
    }, { isolationLevel: "Serializable" });
  },

  async reactiverTontine(tontineId: string, acteurId: string, motif: string) {
    return prisma.$transaction(async (transaction) => {
      const resultat = await transaction.tontine.updateMany({ where: { id: tontineId, statutAdministration: "SUSPENDUE" }, data: { statutAdministration: "ACTIVE", suspendueLe: null, suspendueParId: null, motifSuspension: null, statutAvantSuspension: null } });
      if (!resultat.count) throw new ErreurServiceAdministration("TONTINE_NON_SUSPENDUE", "Cette tontine n’est pas suspendue ou est introuvable.", 409);
      await ecrireAudit(transaction, { acteurId, entiteType: "Tontine", entiteId: tontineId, action: "REACTIVATION_TONTINE", module: "tontines", autorisation: "tontines.suspension.gerer", motif });
      return { statutAdministration: "ACTIVE" as const };
    }, { isolationLevel: "Serializable" });
  },

  async listerLitiges(filtres: Pagination & { statut?: StatutLitigeAdministration; tontineId?: string }) {
    const { page, taille, skip } = pagination(filtres);
    const where = { ...(filtres.statut ? { statut: filtres.statut } : {}), ...(filtres.tontineId ? { tontineId: filtres.tontineId } : {}) };
    const [total, litiges] = await Promise.all([prisma.litigeAdministration.count({ where }), prisma.litigeAdministration.findMany({ where, skip, take: taille, orderBy: { creeLe: "desc" }, include: { tontine: { select: { nom: true } }, ouvertPar: { select: { email: true } }, prisEnChargePar: { select: { email: true } }, _count: { select: { evenements: true } } } })]);
    return { page, taille, total, litiges };
  },

  async creerLitige(donnees: { tontineId?: string; type: string; titre: string; description?: string; operationType?: string; operationId?: string }, acteurId: string) {
    return prisma.$transaction(async (transaction) => {
      if (donnees.tontineId && !await transaction.tontine.findUnique({ where: { id: donnees.tontineId }, select: { id: true } })) throw new ErreurServiceAdministration("TONTINE_INTROUVABLE", "Tontine introuvable.", 404);
      const litige = await transaction.litigeAdministration.create({ data: { ...donnees, ouvertParId: acteurId, evenements: { create: { acteurId, action: "OUVERTURE", nouveauStatut: "OUVERT", note: donnees.description } } } });
      await ecrireAudit(transaction, { acteurId, entiteType: "LitigeAdministration", entiteId: litige.id, action: "OUVERTURE_LITIGE", module: "tontines", autorisation: "tontines.litiges.gerer", motif: donnees.titre, contexte: { tontineId: donnees.tontineId } });
      return litige;
    }, { isolationLevel: "Serializable" });
  },

  async traiterLitige(litigeId: string, acteurId: string, donnees: { action: "PRISE_EN_CHARGE" | "NOTE" | "DECISION" | "CLOTURE"; statut?: StatutLitigeAdministration; note: string; fichierId?: string }) {
    return prisma.$transaction(async (transaction) => {
      const litige = await transaction.litigeAdministration.findUnique({ where: { id: litigeId }, select: { statut: true } });
      if (!litige) throw new ErreurServiceAdministration("LITIGE_INTROUVABLE", "Litige introuvable.", 404);
      const transitions: Record<StatutLitigeAdministration, StatutLitigeAdministration[]> = { OUVERT: ["EN_EXAMEN", "REJETE"], EN_EXAMEN: ["EN_ATTENTE_INFORMATION", "RESOLU", "REJETE"], EN_ATTENTE_INFORMATION: ["EN_EXAMEN", "REJETE"], RESOLU: ["CLOTURE"], REJETE: ["CLOTURE"], CLOTURE: [] };
      const nouveauStatut = donnees.statut;
      if (nouveauStatut && !transitions[litige.statut].includes(nouveauStatut)) throw new ErreurServiceAdministration("TRANSITION_LITIGE_INVALIDE", "Cette transition de litige est interdite.", 409);
      if (donnees.fichierId && !await transaction.fichier.findUnique({ where: { id: donnees.fichierId }, select: { id: true } })) throw new ErreurServiceAdministration("PREUVE_INTROUVABLE", "Référence de preuve introuvable.", 404);
      const misAJour = await transaction.litigeAdministration.update({ where: { id: litigeId }, data: { ...(donnees.action === "PRISE_EN_CHARGE" ? { prisEnChargeParId: acteurId } : {}), ...(nouveauStatut ? { statut: nouveauStatut, fermeLe: nouveauStatut === "CLOTURE" ? new Date() : null } : {}) } });
      await transaction.evenementLitigeAdministration.create({ data: { litigeId, acteurId, action: donnees.action, ancienStatut: litige.statut, nouveauStatut, note: donnees.note, fichierId: donnees.fichierId } });
      await ecrireAudit(transaction, { acteurId, entiteType: "LitigeAdministration", entiteId: litigeId, action: `LITIGE_${donnees.action}`, module: "tontines", autorisation: "tontines.litiges.gerer", motif: donnees.note, contexte: { ancienStatut: litige.statut, nouveauStatut } });
      return misAJour;
    }, { isolationLevel: "Serializable" });
  },

  async listerIncidents(filtres: Pagination) {
    const { page, taille, skip } = pagination(filtres);
    const [total, incidents] = await Promise.all([prisma.incidentAdministration.count(), prisma.incidentAdministration.findMany({ skip, take: taille, orderBy: [{ priorite: "desc" }, { creeLe: "desc" }], include: { assigneA: { select: { email: true } } } })]);
    return { page, taille, total, incidents };
  },

  async journaliserRefus(acteurId: string | undefined, permission: string, action: string) {
    await prisma.evenementAudit.create({ data: { acteurId, entiteType: "Administration", entiteId: permission, action, source: "WEB", module: "plateforme", autorisation: permission, resultat: "REFUS", motif: "Permission insuffisante" } });
  },
};
