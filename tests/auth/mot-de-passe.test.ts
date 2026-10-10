import assert from "node:assert/strict";
import test from "node:test";
import { hasherMotDePasse, verifierMotDePasse } from "../../lib/auth/mot-de-passe";

test("hash scrypt : format et paramètres attendus", async () => {
  const hash = await hasherMotDePasse("MotDePasse9");
  const [algorithme, cout, r, p, sel, derive] = hash.split("$");
  assert.equal(algorithme, "scrypt");
  assert.equal(cout, "16384");
  assert.equal(r, "8");
  assert.equal(p, "1");
  assert.match(sel, /^[A-Za-z0-9_-]{16,}$/);
  assert.equal(Buffer.from(derive, "base64url").length, 64);
  assert.doesNotMatch(hash, /MotDePasse9/);
});

test("hash scrypt : mot de passe correct accepté", async () => {
  const hash = await hasherMotDePasse("MotDePasse9");
  assert.equal(await verifierMotDePasse("MotDePasse9", hash), true);
});

test("hash scrypt : mot de passe incorrect refusé", async () => {
  const hash = await hasherMotDePasse("MotDePasse9");
  assert.equal(await verifierMotDePasse("AutreMotDePasse9", hash), false);
});

test("hash scrypt : empreinte ou paramètres invalides refusés", async () => {
  assert.equal(await verifierMotDePasse("MotDePasse9", "invalide"), false);
  assert.equal(await verifierMotDePasse("MotDePasse9", "scrypt$1024$8$1$selInvalideLongueur$deriveInvalideLongueur"), false);
});
