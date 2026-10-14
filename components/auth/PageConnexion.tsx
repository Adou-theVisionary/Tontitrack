"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Check, AlertCircle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { destinationRetourAutorisee } from "@/lib/navigation/retour";

export function PageConnexion() {
  const { connecterUtilisateur } = useApp();
  const router = useRouter();
  const parametres = useSearchParams();
  const retour = destinationRetourAutorisee(parametres.get("retour"));
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [montrerMotDePasse, setMontrerMotDePasse] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  const handleConnexion = async (e: React.FormEvent) => {
    e.preventDefault();
    setChargement(true);
    setErreur("");
    try {
      const reponse = await fetch("/api/auth/connexion", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ email, motDePasse, retour }) });
      const corps = await reponse.json();
      if (!reponse.ok) throw new Error(corps.erreur?.message);
      connecterUtilisateur({ ...corps.donnees.utilisateur, dateInscription: "" });
      router.replace(corps.donnees.destination);
    } catch (erreur) {
      setErreur(erreur instanceof Error && erreur.message ? erreur.message : "Email ou mot de passe incorrect.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background lg:grid lg:grid-cols-2">
      {/* Panneau gauche desktop */}
      <div className="relative hidden overflow-hidden bg-[#237e56] p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border-[30px] border-white/10" />
        <div className="absolute -bottom-32 -left-10 h-80 w-80 rounded-full border-[24px] border-white/5" />
        <div className="relative">
          <div className="brand-logo-surface inline-flex rounded-xl bg-white p-3">
            <Image src="/images/logo.png" alt="TontiTrack" width={176} height={48} className="h-12 w-44 object-contain" />
          </div>
        </div>
        <div className="relative">
          <h2 className="text-3xl font-semibold leading-tight text-white">
            Gérez vos finances<br />et vos tontines<br />en toute confiance.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/70">
            Suivez vos revenus, vos dépenses et organisez vos tontines avec votre communauté. Simple, transparent, sécurisé.
          </p>
          <div className="mt-8 space-y-3">
            {["Suivi financier personnel et professionnel", "Gestion complète des tontines", "Fonctionnement hors connexion"].map((t) => (
              <div key={t} className="flex items-center gap-3 text-sm text-white/90">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/15"><Check size={14} /></span>
                {t}
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-white/50">© 2026 TontiTrack. Toutes les données de démonstration sont fictives.</p>
      </div>

      {/* Panneau droit - formulaire */}
      <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden"><Logo /></div>
          <h1 className="mt-8 text-2xl font-semibold text-foreground lg:mt-0">Bienvenue sur TontiTrack</h1>
          <p className="mt-2 text-sm text-muted-foreground">Connectez-vous pour accéder à votre espace.</p>

          {erreur && (
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle size={16} /> {erreur}
            </div>
          )}

          <form onSubmit={handleConnexion} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="h-12 w-full rounded-xl border bg-card pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Mot de passe</label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={montrerMotDePasse ? "text" : "password"}
                  required
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 w-full rounded-xl border bg-card pl-11 pr-11 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
                <button aria-label={montrerMotDePasse ? "Masquer le mot de passe" : "Afficher le mot de passe"} type="button" onClick={() => setMontrerMotDePasse(!montrerMotDePasse)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {montrerMotDePasse ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={() => router.push("/mot-de-passe-oublie")} className="text-sm font-medium text-primary hover:underline">
                Mot de passe oublié ?
              </button>
            </div>
            <Button type="submit" disabled={chargement} className="h-12 w-full text-base">
              {chargement ? "Connexion..." : "Se connecter"}
              {!chargement && <ArrowRight size={18} className="ml-1" />}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <button onClick={() => router.push(`/inscription?retour=${encodeURIComponent(retour)}`)} className="font-semibold text-primary hover:underline">
              Créer un compte
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
