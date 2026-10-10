import { NextResponse } from "next/server";
import { obtenirUtilisateurAuthentifie } from "@/lib/auth/session";
import { ErreurTontine, tontinesService } from "@/services/tontines.service";
export async function GET(_: Request, { params }: { params: { tontineId: string } }) { const u = await obtenirUtilisateurAuthentifie(); if (!u) return NextResponse.json({ erreur: { code: "NON_AUTHENTIFIE", message: "Connexion requise." } }, { status: 401 }); try { return NextResponse.json({ donnees: await tontinesService.listerMembres(params.tontineId, u.id) }); } catch (e) { const x = e as ErreurTontine; return NextResponse.json({ erreur: { code: x.code, message: x.message } }, { status: x.statut }); } }
