import { NextResponse } from "next/server";
import { autoriserAdministration, erreurAdministration } from "@/app/api/administration/outils";
export async function GET() { try { await autoriserAdministration("plateforme.parametres.lire"); return NextResponse.json({ donnees: { parametresModifiables: [], message: "Aucun paramètre global modifiable n'est défini dans cette version. Les réglages affichés par l'application restent protégés par leur domaine métier." } }); } catch (cause) { return erreurAdministration(cause); } }
