"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight, Check, AlertCircle } from "lucide-react";
import { tontiTrackService } from "@/services/tontitrack-service";

export function PageMotDePasseOublie() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  const handleEnvoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    setChargement(true);
    setErreur("");
    try {
      await tontiTrackService.motDePasseOublie(email);
      setEnvoye(true);
    } catch {
      setErreur("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f7f2] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
          {envoye ? (
            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e8f5ef] text-[#237e56]">
                <Check size={28} />
              </div>
              <h1 className="mt-5 text-xl font-semibold text-[#20392d]">Email envoyé</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Si un compte existe avec cette adresse, vous recevrez un lien de réinitialisation.
              </p>
              <Button onClick={() => router.push("/")} className="mt-6 h-12 w-full bg-[#237e56] hover:bg-[#1c6847]">
                Retour à la connexion
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-[#20392d]">Mot de passe oublié</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Saisissez votre email pour recevoir un code de réinitialisation.
              </p>
              {erreur && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#fdebea] px-4 py-3 text-sm text-[#a53d39]">
                  <AlertCircle size={16} /> {erreur}
                </div>
              )}
              <form onSubmit={handleEnvoyer} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#405247]">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca8a0]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 w-full rounded-xl border bg-white pl-10 pr-4 text-sm outline-none ring-[#9ed0ae] focus:ring-2"
                      placeholder="vous@exemple.com"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={chargement} className="h-12 w-full bg-[#237e56] hover:bg-[#1c6847]">
                  {chargement ? "Envoi..." : "Envoyer le code"}
                  {!chargement && <ArrowRight size={18} className="ml-1" />}
                </Button>
              </form>
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
