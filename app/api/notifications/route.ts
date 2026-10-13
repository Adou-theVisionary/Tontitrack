import { NextResponse } from "next/server";
import { obtenirUtilisateurAuthentifie } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const utilisateur = await obtenirUtilisateurAuthentifie();
  if (!utilisateur) return NextResponse.json({ erreur: { code: "NON_AUTHENTIFIE", message: "Connexion requise." } }, { status: 401 });
  const notifications = await prisma.notification.findMany({ where: { utilisateurId: utilisateur.id }, select: { id: true, type: true, titre: true, message: true, cibleUrl: true, lueLe: true, creeLe: true }, orderBy: { creeLe: "desc" }, take: 100 });
  return NextResponse.json({ donnees: notifications.map((notification) => ({ ...notification, lue: Boolean(notification.lueLe), date: notification.creeLe })) });
}

export async function PATCH() {
  const utilisateur = await obtenirUtilisateurAuthentifie();
  if (!utilisateur) return NextResponse.json({ erreur: { code: "NON_AUTHENTIFIE", message: "Connexion requise." } }, { status: 401 });
  await prisma.notification.updateMany({ where: { utilisateurId: utilisateur.id, lueLe: null }, data: { lueLe: new Date() } });
  return NextResponse.json({ donnees: { lues: true } });
}
