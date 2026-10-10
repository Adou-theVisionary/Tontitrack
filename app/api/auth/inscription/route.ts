import { NextResponse } from "next/server";
import { inscriptionSchema } from "@/lib/auth/contrats";
import { ErreurAuthentification, inscrireUtilisateur } from "@/services/authentification.service";

export async function POST(requete: Request) {
  try {
    const donnees = inscriptionSchema.parse(await requete.json());
    const utilisateur = await inscrireUtilisateur(donnees);
    return NextResponse.json({ donnees: { utilisateur } }, { status: 201 });
  } catch (erreur) {
    if (erreur instanceof ErreurAuthentification) return NextResponse.json({ erreur: { code: erreur.code, message: erreur.message } }, { status: erreur.statutHttp });
    return NextResponse.json({ erreur: { code: "DONNEES_INVALIDES", message: "Les informations fournies sont invalides." } }, { status: 400 });
  }
}
