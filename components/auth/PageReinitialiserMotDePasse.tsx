"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff, Check, ArrowRight } from "lucide-react";
import { tontiTrackService } from "@/services/tontitrack-service";

export function PageReinitialiserMotDePasse() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [montrer, setMontrer] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  const handleReinitialiser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    if (code.length !== 6) { setErreur("Code invalide."); return; }
    if (motDePasse.length < 8) { setErreur("Mot de passe trop court."); return; }
    if (motDePasse !== confirmation) { setErreur("Les mots de passe ne correspondent pas."); return; }
    setChargement(true);
    try {
      await tontiTrackService.reinitialiserMotDePasse();
      router.push("/");
    } catch {
      setErreur("Une erreur est survenue.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f7f2] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-semibold text-[#20392d]">Réinitialiser le mot de passe</h1>
          <p className="mt-1 text-sm text-muted-foreground">Saisissez le code reçu et votre nouveau mot de passe.</p>
          {erreur && <div className="mt-4 rounded-xl bg-[#fdebea] px-4 py-3 text-sm text-[#a53d39]">{erreur}</div>}
          <form onSubmit={handleReinitialiser} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#405247]">Code de vérification</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-12 w-full rounded-xl border bg-white px-4 text-center text-lg font-semibold outline-none ring-[#9ed0ae] focus:ring-2"
                placeholder="______"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#405247]">Nouveau mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca8a0]" />
                <input
                  type={montrer ? "text" : "password"}
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  className="h-12 w-full rounded-xl border bg-white pl-10 pr-10 text-sm outline-none ring-[#9ed0ae] focus:ring-2"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setMontrer(!montrer)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca8a0]">
                  {montrer ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#405247]">Confirmer</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca8a0]" />
                <input
                  type={montrer ? "text" : "password"}
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  className="h-12 w-full rounded-xl border bg-white pl-10 pr-3 text-sm outline-none ring-[#9ed0ae] focus:ring-2"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <Button type="submit" disabled={chargement} className="h-12 w-full bg-[#237e56] hover:bg-[#1c6847]">
              {chargement ? "Réinitialisation..." : "Réinitialiser"}
              {!chargement && <ArrowRight size={18} className="ml-1" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
