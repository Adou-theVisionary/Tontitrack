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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          {envoye ? (
            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
                <Check size={28} />
              </div>
              <h1 className="mt-5 text-xl font-semibold text-foreground">Email envoyé</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Si un compte existe avec cette adresse, vous recevrez un lien de réinitialisation.
              </p>
              <Button onClick={() => router.push("/")} className="mt-6 h-12 w-full">
                Retour à la connexion
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-foreground">Mot de passe oublié</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Saisissez votre email pour recevoir un code de réinitialisation.
              </p>
              {erreur && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <AlertCircle size={16} /> {erreur}
                </div>
              )}
              <form onSubmit={handleEnvoyer} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 w-full rounded-xl border bg-card pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="vous@exemple.com"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={chargement} className="h-12 w-full">
                  {chargement ? "Envoi..." : "Envoyer le code"}
                  {!chargement && <ArrowRight size={18} className="ml-1" />}
                </Button>
              </form>
            </>
          )}
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
