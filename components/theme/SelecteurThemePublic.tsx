"use client";

import { usePathname } from "next/navigation";
import { SelecteurTheme } from "@/components/theme/SelecteurTheme";

const prefixesProteges = [
  "/administration-plateforme",
  "/tableau-de-bord",
  "/finances",
  "/tontines",
  "/notifications",
  "/profil",
  "/parametres",
];

/** Évite un doublon avec les sélecteurs intégrés aux deux coques authentifiées. */
export function SelecteurThemePublic() {
  const pathname = usePathname();
  if (prefixesProteges.some((prefixe) => pathname.startsWith(prefixe))) return null;

  return (
    <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
      <SelecteurTheme />
    </div>
  );
}
