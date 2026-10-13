import assert from "node:assert/strict";
import test from "node:test";
import { declarationReversementSchema, decisionReceptionReversementSchema } from "../../lib/tontines/contrats";

test("reversement : montant décimal normalisé et métadonnées acceptées", () => {
  const donnees = declarationReversementSchema.parse({ montant: "1200,50", verseLe: "2026-10-12T00:00:00.000Z", moyenVersement: "Mobile money", referenceVersement: "REF-42", observation: "Transfert externe." });
  assert.equal(donnees.montant, "1200.50");
  assert.equal(donnees.moyenVersement, "Mobile money");
});

test("reversement : montant nul, négatif ou à plus de deux décimales refusé", () => {
  for (const montant of ["0", "-1", "10.123"]) {
    assert.equal(declarationReversementSchema.safeParse({ montant, verseLe: "2026-10-12T00:00:00.000Z" }).success, false);
  }
});

test("réception : confirmation partielle autorisée", () => {
  const donnees = decisionReceptionReversementSchema.parse({ decision: "CONFIRMER", montantConfirme: "15,25", observation: "Montant partiellement reçu." });

  if (donnees.decision === "CONFIRMER") {
    assert.equal(donnees.montantConfirme, "15.25");
    return;
  }

  assert.fail("La décision de réception doit être CONFIRMER.");
});

test("réception : contestation exige un motif explicite", () => {
  assert.equal(decisionReceptionReversementSchema.safeParse({ decision: "CONTESTER", motifContestation: "" }).success, false);

  const donnees = decisionReceptionReversementSchema.parse({
    decision: "CONTESTER",
    motifContestation: "Montant non reçu.",
  });

  if (donnees.decision === "CONTESTER") {
    assert.equal(donnees.motifContestation, "Montant non reçu.");
    return;
  }

  assert.fail("La décision de réception doit être CONTESTER.");
});
