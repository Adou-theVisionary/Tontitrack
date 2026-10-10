import { NextResponse } from "next/server";
import { z } from "zod";
import { obtenirUtilisateurAuthentifie } from "@/lib/auth/session";
import { ErreurTontine, tontinesService } from "@/services/tontines.service";
const schema = z.object({ approuver: z.boolean() });
export async function PATCH(requete: Request, { params }: { params: { demandeId: string } }) { const u = await obtenirUtilisateurAuthentifie(); if (!u) return NextResponse.json({ erreur: { code: "NON_AUTHENTIFIE", message: "Connexion requise." } }, { status: 401 }); try { return NextResponse.json({ donnees: await tontinesService.deciderDemande(params.demandeId, u.id, schema.parse(await requete.json()).approuver) }); } catch (e) { const x = e as ErreurTontine; return NextResponse.json({ erreur: { code: x.code ?? "DONNEES_INVALIDES", message: x.message ?? "Données invalides." } }, { status: x.statut ?? 400 }); } }
