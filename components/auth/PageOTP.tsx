"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw, Check } from "lucide-react";
import { tontiTrackService } from "@/services/tontitrack-service";
import { useApp } from "@/contexts/AppContext";

export function PageOTP() {
  const router = useRouter();
  const { connecter } = useApp();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [compteur, setCompteur] = useState(60);
  const [renvoyerDisabled, setRenvoyerDisabled] = useState(true);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleInput = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const nouveau = [...code];
    nouveau[index] = value;
    setCode(nouveau);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifier = async (e: React.FormEvent) => {
    e.preventDefault();
    setChargement(true);
    setErreur("");
    const codeComplet = code.join("");
    try {
      await tontiTrackService.verifierTelephone(codeComplet);
      connecter();
      router.push("/tableau-de-bord");
    } catch {
      setErreur("Code invalide. Veuillez réessayer.");
    } finally {
      setChargement(false);
    }
  };

  const handleRenvoyer = async () => {
    setRenvoyerDisabled(true);
    setCompteur(60);
    await tontiTrackService.renvoyerOTP();
    const interval = setInterval(() => {
      setCompteur((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setRenvoyerDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="rounded-2xl border bg-card p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
            <RefreshCw size={26} />
          </div>
          <h1 className="mt-5 text-xl font-semibold text-foreground">Vérification du téléphone</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Nous avons envoyé un code à 6 chiffres au numéro que vous avez fourni.
          </p>

          {erreur && (
            <div className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{erreur}</div>
          )}

          <form onSubmit={handleVerifier} className="mt-6">
            <div className="flex justify-center gap-2 sm:gap-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputsRef.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInput(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="h-14 w-12 rounded-xl border-2 bg-card text-center text-xl font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-ring sm:h-16 sm:w-14"
                />
              ))}
            </div>
            <Button type="submit" disabled={chargement || code.join("").length !== 6} className="mt-6 h-12 w-full">
              {chargement ? "Vérification..." : "Vérifier"}
              {!chargement && <ArrowRight size={18} className="ml-1" />}
            </Button>
          </form>

          <div className="mt-6">
            {renvoyerDisabled ? (
              <p className="text-sm text-muted-foreground">
                Renvoyer le code dans <span className="font-semibold text-foreground">{compteur}s</span>
              </p>
            ) : (
              <button onClick={handleRenvoyer} className="text-sm font-semibold text-primary hover:underline">
                Renvoyer le code
              </button>
            )}
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <button onClick={() => router.push("/")} className="font-semibold text-primary hover:underline">
            Retour à la connexion
          </button>
        </p>
      </div>
    </div>
  );
}
