import { NextResponse } from "next/server";
import { autoriserAdministration, entierParametre, erreurAdministration } from "@/app/api/administration/outils";
import { administrationService } from "@/services/administration.service";
export async function GET(requete: Request) { try { await autoriserAdministration("plateforme.incidents.lire"); const url = new URL(requete.url); return NextResponse.json({ donnees: await administrationService.listerIncidents({ page: entierParametre(url.searchParams.get("page"), 1), taille: entierParametre(url.searchParams.get("taille"), 20) }) }); } catch (cause) { return erreurAdministration(cause); } }
