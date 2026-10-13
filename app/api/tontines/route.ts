import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { obtenirUtilisateurAuthentifie } from "@/lib/auth/session";
import { creationTontineSchema } from "@/lib/tontines/contrats";
import { ErreurTontine, tontinesService } from "@/services/tontines.service";

function erreur(cause: unknown) {
  if (cause instanceof ZodError) {
    const details = cause.issues.map((issue) => ({
      champ: issue.path.join("."),
      message: issue.message,
    }));
    return NextResponse.json({
      erreur: {
        code: "DONNEES_INVALIDES",
        message: "Certains champs de la tontine sont invalides.",
        details,
      },
    }, { status: 400 });
  }
  if (cause instanceof ErreurTontine) {
    return NextResponse.json({ erreur: { code: cause.code, message: cause.message } }, { status: cause.statut });
  }
  if (cause instanceof SyntaxError) {
    return NextResponse.json({ erreur: { code: "DONNEES_INVALIDES", message: "Le format des données envoyées est invalide." } }, { status: 400 });
  }
  return NextResponse.json({ erreur: { code: "ERREUR_INTERNE", message: "La création de la tontine a échoué. Réessayez plus tard." } }, { status: 500 });
}
export async function GET() { const utilisateur = await obtenirUtilisateurAuthentifie(); if (!utilisateur) return NextResponse.json({ erreur: { code: "NON_AUTHENTIFIE", message: "Connexion requise." } }, { status: 401 }); return NextResponse.json({ donnees: await tontinesService.listerMesTontines(utilisateur.id) }); }
export async function POST(requete: Request) { const utilisateur = await obtenirUtilisateurAuthentifie(); if (!utilisateur) return NextResponse.json({ erreur: { code: "NON_AUTHENTIFIE", message: "Connexion requise." } }, { status: 401 }); try { return NextResponse.json({ donnees: await tontinesService.creer(utilisateur.id, creationTontineSchema.parse(await requete.json())) }, { status: 201 }); } catch (e) { return erreur(e); } }
