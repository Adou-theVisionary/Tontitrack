import { randomBytes, scrypt as scryptNode, timingSafeEqual } from "crypto";

const COUT_SCRYPT = 16_384;
const R_SCRYPT = 8;
const P_SCRYPT = 1;
const MAXMEM_SCRYPT = 64 * 1024 * 1024;
const TAILLE_CLE = 64;

function deriverCle(motDePasse: string, sel: string, tailleCle: number): Promise<Buffer> {
  return new Promise((resolve, rejeter) => {
    scryptNode(motDePasse, sel, tailleCle, {
      N: COUT_SCRYPT,
      r: R_SCRYPT,
      p: P_SCRYPT,
      maxmem: MAXMEM_SCRYPT,
    }, (erreur, cle) => {
      if (erreur) rejeter(erreur);
      else resolve(cle);
    });
  });
}

function estEmpreinteValide(parties: string[]): parties is [string, string, string, string, string, string] {
  if (parties.length !== 6) return false;
  const [algorithme, cout, r, p, sel, derive] = parties;
  return algorithme === "scrypt"
    && Number(cout) === COUT_SCRYPT
    && Number(r) === R_SCRYPT
    && Number(p) === P_SCRYPT
    && /^[A-Za-z0-9_-]{16,}$/.test(sel)
    && /^[A-Za-z0-9_-]{16,}$/.test(derive);
}

/** Hash à sens unique : seul le dérivé scrypt est conservé en base. */
export async function hasherMotDePasse(motDePasse: string): Promise<string> {
  const sel = randomBytes(16).toString("base64url");
  const derive = await deriverCle(motDePasse, sel, TAILLE_CLE);
  return `scrypt$${COUT_SCRYPT}$${R_SCRYPT}$${P_SCRYPT}$${sel}$${derive.toString("base64url")}`;
}

export async function verifierMotDePasse(motDePasse: string, hash: string): Promise<boolean> {
  const parties = hash.split("$");
  if (!estEmpreinteValide(parties)) return false;

  const [, , , , sel, deriveEncode] = parties;
  try {
    const deriveAttendu = Buffer.from(deriveEncode, "base64url");
    if (deriveAttendu.length !== TAILLE_CLE) return false;
    const deriveFourni = await deriverCle(motDePasse, sel, deriveAttendu.length);
    return timingSafeEqual(deriveAttendu, deriveFourni);
  } catch {
    // Empreinte corrompue ou dérivation invalide : même réponse qu'un mot de passe incorrect.
    return false;
  }
}
