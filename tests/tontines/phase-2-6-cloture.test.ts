import assert from "node:assert/strict";
import test from "node:test";
import { confirmationClotureTontineSchema } from "../../lib/tontines/contrats";

test("clôture : confirmation explicite obligatoire", () => {
  assert.equal(confirmationClotureTontineSchema.safeParse({ confirmation: true }).success, true);
  assert.equal(confirmationClotureTontineSchema.safeParse({}).success, false);
  assert.equal(confirmationClotureTontineSchema.safeParse({ confirmation: false }).success, false);
});

// Ces scénarios nécessitent PostgreSQL migré, comptes distincts et données réelles.
test.todo("clôture d'une tontine entièrement réglée crée un seul rapport et notifie les membres");
test.todo("clôture refuse une cotisation exigible impayée");
test.todo("clôture refuse un reversement non confirmé");
test.todo("clôture refuse une contestation ouverte");
test.todo("clôture refuse une rotation inachevée");
test.todo("clôture refuse une demande d'un membre non créateur");
test.todo("deux clôtures simultanées ne créent qu'un seul rapport");
test.todo("membre autorisé consulte rapport et archive sans pouvoir modifier finance");
test.todo("les trois modèles conservent leurs rotations réelles à la clôture");
