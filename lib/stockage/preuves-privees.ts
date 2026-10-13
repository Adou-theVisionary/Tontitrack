import "server-only";
import { randomBytes } from "crypto";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import { basename, dirname, resolve, sep } from "path";

const TAILLE_MAX_OCTETS = 5 * 1024 * 1024;
const racine = resolve(process.env.TONTITRACK_STOCKAGE_PRIVE || `${process.cwd()}/stockage-prive`);

export class ErreurJustificatif extends Error {}

export type PreuvePreparee = { nom: string; typeMime: "image/jpeg" | "image/png" | "image/webp"; tailleOctets: number; cleStockage: string; contenu: Buffer };

function typeImage(contenu: Buffer): PreuvePreparee["typeMime"] | null {
  if (contenu.length >= 3 && contenu[0] === 0xff && contenu[1] === 0xd8 && contenu[2] === 0xff) return "image/jpeg";
  if (contenu.length >= 8 && contenu.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (contenu.length >= 12 && contenu.subarray(0, 4).toString("ascii") === "RIFF" && contenu.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return null;
}

function extension(typeMime: PreuvePreparee["typeMime"]) {
  return typeMime === "image/jpeg" ? "jpg" : typeMime === "image/png" ? "png" : "webp";
}

export async function preparerPreuveImage(fichier: File, dossier: "preuves-cotisations" | "preuves-reversements" = "preuves-cotisations"): Promise<PreuvePreparee> {
  if (!fichier.size) throw new ErreurJustificatif("Le justificatif est vide.");
  if (fichier.size > TAILLE_MAX_OCTETS) throw new ErreurJustificatif("Le justificatif dépasse 5 Mo.");
  const contenu = Buffer.from(await fichier.arrayBuffer());
  const typeMime = typeImage(contenu);
  if (!typeMime) throw new ErreurJustificatif("Le justificatif doit être une image JPG, PNG ou WebP valide.");
  if (fichier.type && fichier.type !== typeMime) throw new ErreurJustificatif("Le type déclaré du justificatif ne correspond pas à son contenu.");
  const cleStockage = `${dossier}/${randomBytes(24).toString("hex")}.${extension(typeMime)}`;
  return { nom: basename(fichier.name || `justificatif.${extension(typeMime)}`).slice(0, 120), typeMime, tailleOctets: contenu.length, cleStockage, contenu };
}

function cheminPrive(cleStockage: string) {
  const chemin = resolve(racine, cleStockage);
  if (!chemin.startsWith(`${racine}${sep}`)) throw new ErreurJustificatif("Clé de stockage invalide.");
  return chemin;
}

export async function enregistrerPreuvePreparee(preuve: PreuvePreparee) {
  const chemin = cheminPrive(preuve.cleStockage);
  await mkdir(dirname(chemin), { recursive: true });
  await writeFile(chemin, preuve.contenu, { flag: "wx" });
}

export async function supprimerPreuvePrivee(cleStockage: string) {
  try { await unlink(cheminPrive(cleStockage)); } catch { /* Aucun détail de stockage ne doit remonter au client. */ }
}

export async function lirePreuvePrivee(cleStockage: string) {
  return readFile(cheminPrive(cleStockage));
}
