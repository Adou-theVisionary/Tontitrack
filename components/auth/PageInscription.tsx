"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, AlertCircle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { destinationRetourAutorisee } from "@/lib/navigation/retour";

export function PageInscription() {
  const router = useRouter();
  const parametres = useSearchParams();
  const retour = destinationRetourAutorisee(parametres.get("retour"));
  const [form, setForm] = useState({
    prenom: "", nom: "", email: "", telephone: "", motDePasse: "", confirmationMotDePasse: "",
  });
  const [montrerMotDePasse, setMontrerMotDePasse] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.prenom) e.prenom = "Prénom requis";
    if (!form.nom) e.nom = "Nom requis";
    if (!form.email.includes("@")) e.email = "Email invalide";
    if (form.telephone.length < 8) e.telephone = "Téléphone invalide";
    if (form.motDePasse.length < 8) e.motDePasse = "Au moins 8 caractères";
    if (!/[A-Z]/.test(form.motDePasse)) e.motDePasse = "Au moins une majuscule";
    if (!/[0-9]/.test(form.motDePasse)) e.motDePasse = "Au moins un chiffre";
    if (form.motDePasse !== form.confirmationMotDePasse) e.confirmationMotDePasse = "Ne correspondent pas";
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const handleInscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setChargement(true);
    try {
      const reponse = await fetch("/api/auth/inscription", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const corps = await reponse.json();
      if (!reponse.ok) throw new Error(corps.erreur?.message);
      router.push(`/connexion?inscription=ok&retour=${encodeURIComponent(retour)}`);
    } catch (erreur) {
      setErreurs({ general: erreur instanceof Error && erreur.message ? erreur.message : "Une erreur est survenue lors de l'inscription." });
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-semibold text-foreground">Créer votre compte</h1>
          <p className="mt-1 text-sm text-muted-foreground">Rejoignez TontiTrack en quelques étapes.</p>

          {erreurs.general && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle size={16} /> {erreurs.general}
            </div>
          )}

          <form onSubmit={handleInscription} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Prénom</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={form.prenom}
                    onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                    className="h-11 w-full rounded-xl border bg-card pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Moussa"
                  />
                </div>
                {erreurs.prenom && <p className="mt-1 text-xs text-destructive">{erreurs.prenom}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Nom</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    className="h-11 w-full rounded-xl border bg-card pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Traoré"
                  />
                </div>
                {erreurs.nom && <p className="mt-1 text-xs text-destructive">{erreurs.nom}</p>}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-11 w-full rounded-xl border bg-card pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="vous@exemple.com"
                />
              </div>
              {erreurs.email && <p className="mt-1 text-xs text-destructive">{erreurs.email}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Téléphone</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  inputMode="tel"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  className="h-11 w-full rounded-xl border bg-card pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="+225 07 00 00 00 00"
                />
              </div>
              {erreurs.telephone && <p className="mt-1 text-xs text-destructive">{erreurs.telephone}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={montrerMotDePasse ? "text" : "password"}
                  value={form.motDePasse}
                  onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
                  className="h-11 w-full rounded-xl border bg-card pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••••"
                />
                <button aria-label={montrerMotDePasse ? "Masquer le mot de passe" : "Afficher le mot de passe"} type="button" onClick={() => setMontrerMotDePasse(!montrerMotDePasse)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {montrerMotDePasse ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {erreurs.motDePasse && <p className="mt-1 text-xs text-destructive">{erreurs.motDePasse}</p>}
              <div className="mt-2 space-y-1">
                <p className={`text-xs ${form.motDePasse.length >= 8 ? "text-primary" : "text-muted-foreground"}`}>• Au moins 8 caractères</p>
                <p className={`text-xs ${/[A-Z]/.test(form.motDePasse) ? "text-primary" : "text-muted-foreground"}`}>• Au moins une majuscule</p>
                <p className={`text-xs ${/[0-9]/.test(form.motDePasse) ? "text-primary" : "text-muted-foreground"}`}>• Au moins un chiffre</p>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={montrerMotDePasse ? "text" : "password"}
                  value={form.confirmationMotDePasse}
                  onChange={(e) => setForm({ ...form, confirmationMotDePasse: e.target.value })}
                  className="h-11 w-full rounded-xl border bg-card pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••••"
                />
              </div>
              {erreurs.confirmationMotDePasse && <p className="mt-1 text-xs text-destructive">{erreurs.confirmationMotDePasse}</p>}
            </div>
            <Button type="submit" disabled={chargement} className="h-12 w-full">
              {chargement ? "Création..." : "Créer mon compte"}
              {!chargement && <ArrowRight size={18} className="ml-1" />}
            </Button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <button onClick={() => router.push(`/connexion?retour=${encodeURIComponent(retour)}`)} className="font-semibold text-primary hover:underline">
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
}
