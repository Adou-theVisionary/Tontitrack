import { NextResponse } from "next/server";
import { obtenirUtilisateurAuthentifie } from "@/lib/auth/session";
import { creationTontineSchema } from "@/lib/tontines/contrats";
import { ErreurTontine, tontinesService } from "@/services/tontines.service";

function erreur(erreur: unknown) { return erreur instanceof ErreurTontine ? NextResponse.json({ erreur: { code: erreur.code, message: erreur.message } }, { status: erreur.statut }) : NextResponse.json({ erreur: { code: "DONNEES_INVALIDES", message: "Données invalides." } }, { status: 400 }); }
export async function GET() { const utilisateur = await obtenirUtilisateurAuthentifie(); if (!utilisateur) return NextResponse.json({ erreur: { code: "NON_AUTHENTIFIE", message: "Connexion requise." } }, { status: 401 }); return NextResponse.json({ donnees: await tontinesService.listerMesTontines(utilisateur.id) }); }
export async function POST(requete: Request) { const utilisateur = await obtenirUtilisateurAuthentifie(); if (!utilisateur) return NextResponse.json({ erreur: { code: "NON_AUTHENTIFIE", message: "Connexion requise." } }, { status: 401 }); try { return NextResponse.json({ donnees: await tontinesService.creer(utilisateur.id, creationTontineSchema.parse(await requete.json())) }, { status: 201 }); } catch (e) { return erreur(e); } }
