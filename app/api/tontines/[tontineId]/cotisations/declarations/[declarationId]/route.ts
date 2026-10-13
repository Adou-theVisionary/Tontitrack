import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { obtenirUtilisateurAuthentifie } from "@/lib/auth/session";
import { decisionDeclarationCotisationSchema } from "@/lib/tontines/contrats";
import { ErreurTontine, tontinesService } from "@/services/tontines.service";

function erreur(cause: unknown) {
  if (cause instanceof ZodError) return NextResponse.json({ erreur: { code: "DONNEES_INVALIDES", message: "Décision invalide.", details: cause.issues.map((issue) => ({ champ: issue.path.join("."), message: issue.message })) } }, { status: 400 });
  if (cause instanceof ErreurTontine) return NextResponse.json({ erreur: { code: cause.code, message: cause.message } }, { status: cause.statut });
  return NextResponse.json({ erreur: { code: "ERREUR_INTERNE", message: "Impossible de traiter la déclaration." } }, { status: 500 });
}

export async function PATCH(requete: Request, { params }: { params: { tontineId: string; declarationId: string } }) {
  const utilisateur = await obtenirUtilisateurAuthentifie();
  if (!utilisateur) return NextResponse.json({ erreur: { code: "NON_AUTHENTIFIE", message: "Connexion requise." } }, { status: 401 });
  try {
    const donnees = decisionDeclarationCotisationSchema.parse(await requete.json());
    return NextResponse.json({ donnees: await tontinesService.deciderDeclarationCotisation(params.tontineId, params.declarationId, utilisateur.id, donnees) });
  } catch (cause) { return erreur(cause); }
}
