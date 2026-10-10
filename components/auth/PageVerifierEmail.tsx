"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Mail, Check, ArrowRight } from "lucide-react";
import { tontiTrackService } from "@/services/tontitrack-service";

export function PageVerifierEmail() {
  const router = useRouter();
  const [verifie, setVerifie] = useState(false);
  const [chargement, setChargement] = useState(false);

  const handleVerifier = async () => {
    setChargement(true);
    await tontiTrackService.verifierEmail();
    setVerifie(true);
    setChargement(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f7f2] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="rounded-2xl border bg-white p-6 text-center shadow-sm sm:p-8">
          {verifie ? (
            <>
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e8f5ef] text-[#237e56]">
                <Check size={28} />
              </div>
              <h1 className="mt-5 text-xl font-semibold text-[#20392d]">Email vérifié</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Votre adresse email a été vérifiée. Vérifions maintenant votre numéro de téléphone.
              </p>
              <Button onClick={() => router.push("/verifier-telephone")} className="mt-6 h-12 w-full bg-[#237e56] hover:bg-[#1c6847]">
                Continuer <ArrowRight size={18} className="ml-1" />
              </Button>
            </>
          ) : (
            <>
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e8f2f8] text-[#24698a]">
                <Mail size={28} />
              </div>
              <h1 className="mt-5 text-xl font-semibold text-[#20392d]">Vérifiez votre email</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Nous avons envoyé un lien de vérification à votre adresse email. Cliquez sur le lien pour confirmer votre compte.
              </p>
              <Button onClick={handleVerifier} disabled={chargement} className="mt-6 h-12 w-full bg-[#237e56] hover:bg-[#1c6847]">
                {chargement ? "Vérification..." : "J'ai vérifié mon email"}
              </Button>
              <button className="mt-4 text-sm text-[#237e56] hover:underline">Renvoyer le lien</button>
            </>
          )}
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <button onClick={() => router.push("/")} className="font-semibold text-[#237e56] hover:underline">
            Retour à la connexion
          </button>
        </p>
      </div>
    </div>
  );
}
