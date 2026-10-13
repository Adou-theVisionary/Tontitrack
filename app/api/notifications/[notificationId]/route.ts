import { NextResponse } from "next/server";
import { obtenirUtilisateurAuthentifie } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(_: Request, { params }: { params: { notificationId: string } }) {
  const utilisateur = await obtenirUtilisateurAuthentifie();
  if (!utilisateur) return NextResponse.json({ erreur: { code: "NON_AUTHENTIFIE", message: "Connexion requise." } }, { status: 401 });
  const resultat = await prisma.notification.updateMany({ where: { id: params.notificationId, utilisateurId: utilisateur.id, lueLe: null }, data: { lueLe: new Date() } });
  if (!resultat.count) return NextResponse.json({ erreur: { code: "INTROUVABLE", message: "Notification introuvable." } }, { status: 404 });
  return NextResponse.json({ donnees: { lue: true } });
}
