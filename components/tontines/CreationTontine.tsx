"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Users, Calendar, Settings2, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { ModalConfirmation } from "@/components/ModalConfirmation";
import { libelleModeTontine, calculerNombreTours } from "@/lib/format";
import { appelApi, ErreurApi } from "@/lib/api-client";
import type { ModeTontine, FrequenceTontine, Tontine, MembreTontine } from "@/types";

const etapes = [
  { numero: 1, label: "Informations", icon: Calendar },
  { numero: 2, label: "Règles", icon: Settings2 },
  { numero: 3, label: "Membres", icon: Users },
  { numero: 4, label: "Ordre", icon: ListOrdered },
  { numero: 5, label: "Confirmation", icon: Check },
];

type FormulaireCreation = {
  nom: string;
  nombreParticipantsRequis: number;
  montantCotisation: string;
  frequence: FrequenceTontine;
  mode: ModeTontine;
  dateCommencement: string;
  fuseauHoraire: string;
  visibilite: "PUBLIQUE" | "PRIVEE";
  modeDemarrage: "MANUEL" | "AUTOMATIQUE";
  strategieAdhesion: "INVITATION" | "DEMANDE" | "INVITATION_ET_DEMANDE";
  methodeOrdre: "MANUEL" | "ALEATOIRE";
  reversementsPartielsAutorises: boolean;
  rappelsActifs: boolean;
  delaiGraceJours: number;
  penaliteActive: boolean;
};

type ChampFormulaire = keyof FormulaireCreation | "description" | "penaliteMontant";
type ErreursFormulaire = Partial<Record<ChampFormulaire, string>>;

const etapeParChamp: Record<ChampFormulaire, number> = {
  nom: 1,
  nombreParticipantsRequis: 1,
  montantCotisation: 1,
  dateCommencement: 1,
  fuseauHoraire: 1,
  frequence: 1,
  mode: 2,
  visibilite: 2,
  modeDemarrage: 2,
  strategieAdhesion: 2,
  methodeOrdre: 2,
  reversementsPartielsAutorises: 2,
  rappelsActifs: 2,
  delaiGraceJours: 2,
  penaliteActive: 2,
  description: 1,
  penaliteMontant: 2,
};

function validerFormulaire(formulaire: FormulaireCreation): ErreursFormulaire {
  const erreurs: ErreursFormulaire = {};
  const montant = Number(formulaire.montantCotisation);
  const dateCommencement = new Date(formulaire.dateCommencement);

  if (formulaire.nom.trim().length < 3) erreurs.nom = "Le nom doit contenir au moins 3 caractères.";
  if (!Number.isInteger(formulaire.nombreParticipantsRequis) || formulaire.nombreParticipantsRequis < 2 || formulaire.nombreParticipantsRequis > 200) erreurs.nombreParticipantsRequis = "Saisissez un nombre entier entre 2 et 200.";
  if (!Number.isFinite(montant) || montant <= 0) erreurs.montantCotisation = "Le montant doit être supérieur à zéro.";
  if (!formulaire.dateCommencement) erreurs.dateCommencement = "La date de commencement est requise.";
  else if (Number.isNaN(dateCommencement.getTime()) || dateCommencement <= new Date()) erreurs.dateCommencement = "Choisissez une date de démarrage future.";
  if (!formulaire.fuseauHoraire.trim()) erreurs.fuseauHoraire = "Le fuseau horaire est requis.";

  return erreurs;
}

function extraireErreursValidation(erreur: ErreurApi): ErreursFormulaire {
  return erreur.details.reduce<ErreursFormulaire>((erreurs, detail) => {
    if (detail.champ in etapeParChamp) erreurs[detail.champ as ChampFormulaire] = detail.message;
    return erreurs;
  }, {});
}

export function CreationTontine({ onRetour, onCreee }: { onRetour: () => void; onCreee: (tontineId: string) => void }) {
  const { utilisateur } = useApp();
  const [etape, setEtape] = useState(1);
  const [form, setForm] = useState<FormulaireCreation>({
    nom: "",
    nombreParticipantsRequis: 5,
    montantCotisation: "",
    frequence: "MENSUELLE",
    mode: "TOURNANT_EXCLU",
    dateCommencement: "",
    fuseauHoraire: "Africa/Niamey",
    visibilite: "PRIVEE", modeDemarrage: "MANUEL",
    strategieAdhesion: "INVITATION_ET_DEMANDE", methodeOrdre: "MANUEL",
    reversementsPartielsAutorises: false, rappelsActifs: false, delaiGraceJours: 0, penaliteActive: false,
  });
  const [erreur, setErreur] = useState("");
  const [erreursChamps, setErreursChamps] = useState<ErreursFormulaire>({});
  const [chargement, setChargement] = useState(false);
  const [showIdentite, setShowIdentite] = useState(false);
  const creationEnCours = useRef(false);

  const modifierChamp = <Champ extends keyof FormulaireCreation>(champ: Champ, valeur: FormulaireCreation[Champ]) => {
    setForm((courant) => ({ ...courant, [champ]: valeur }));
    setErreur("");
    setErreursChamps((courantes) => {
      const suivantes = { ...courantes };
      delete suivantes[champ as ChampFormulaire];
      return suivantes;
    });
  };

  const dateMinimumDemarrage = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const handleSuivant = () => {
    setErreur("");
    const erreurs = validerFormulaire(form);
    const erreursEtape = Object.fromEntries(Object.entries(erreurs).filter(([champ]) => etapeParChamp[champ as ChampFormulaire] === etape)) as ErreursFormulaire;
    setErreursChamps(erreursEtape);
    if (Object.keys(erreursEtape).length > 0) {
      setErreur(`Étape ${etape} : corrigez les champs signalés.`);
      return;
    }
    setEtape((e) => Math.min(5, e + 1));
  };

  const handleCreer = async () => {
    if (creationEnCours.current) return;
    const erreurs = validerFormulaire(form);
    if (Object.keys(erreurs).length > 0) {
      const premierChamp = Object.keys(erreurs)[0] as ChampFormulaire;
      setErreursChamps(erreurs);
      setEtape(etapeParChamp[premierChamp]);
      setErreur(`Étape ${etapeParChamp[premierChamp]} : corrigez les champs signalés.`);
      return;
    }

    creationEnCours.current = true;
    setChargement(true);
    setErreur("");
    try {
      const tontine = await appelApi<{ id: string }>("/api/tontines", { method: "POST", body: JSON.stringify({
        nom: form.nom.trim(),
        mode: form.mode,
        montantCotisation: Number(form.montantCotisation),
        frequence: form.frequence,
        nombreParticipantsRequis: form.nombreParticipantsRequis,
        dateCommencement: form.dateCommencement,
        fuseauHoraire: form.fuseauHoraire,
        visibilite: form.visibilite, modeDemarrage: form.modeDemarrage, strategieAdhesion: form.strategieAdhesion,
        methodeOrdre: form.methodeOrdre, reversementsPartielsAutorises: form.reversementsPartielsAutorises,
        rappelsActifs: form.rappelsActifs, delaiGraceJours: form.delaiGraceJours, penaliteActive: form.penaliteActive,
      }) });
      onCreee(tontine.id);
    } catch (erreur) {
      if (erreur instanceof ErreurApi) {
        const erreursValidation = extraireErreursValidation(erreur);
        const premierChamp = Object.keys(erreursValidation)[0] as ChampFormulaire | undefined;
        setErreursChamps(erreursValidation);
        if (premierChamp) {
          setEtape(etapeParChamp[premierChamp]);
          setErreur(`Étape ${etapeParChamp[premierChamp]} : corrigez les champs signalés.`);
        } else {
          setErreur(erreur.message);
        }
      } else {
        setErreur("Une erreur est survenue lors de la création.");
      }
    } finally {
      creationEnCours.current = false;
      setChargement(false);
    }
  };

  const nombreTours = calculerNombreTours(form.mode, form.nombreParticipantsRequis);

  return (
    <div className="space-y-6">
      <button onClick={onRetour} className="flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft size={16} /> Retour aux tontines
      </button>

      <div>
        <h2 className="text-xl font-semibold text-foreground">Créer une tontine</h2>
        <p className="mt-1 text-sm text-muted-foreground">Configurez votre tontine en quelques étapes.</p>
      </div>

      {/* Progression */}
      <div aria-label={`Étape ${etape} sur ${etapes.length}`} className="flex items-center gap-1 sm:gap-2">
        {etapes.map((etapeItem, index) => (
          <div key={etapeItem.numero} className="flex flex-1 items-center gap-1 sm:gap-2">
            <div className={`flex flex-col items-center gap-1.5 ${etape > index + 1 ? "text-[#237e56]" : etape === etapeItem.numero ? "text-[#237e56]" : "text-[#98a099]"}`}>
              <div className={`grid h-9 w-9 place-items-center rounded-full border-2 text-xs font-bold transition-[background-color,border-color,color,transform] duration-200 [transition-timing-function:var(--easing-naturel)] motion-reduce:transition-none ${
                etape > index + 1 ? "border-[#237e56] bg-[#237e56] text-white" :
                etape === etapeItem.numero ? "border-[#237e56] bg-white text-[#237e56]" :
                "border-[#dcdad4] bg-white text-[#98a099]"
              }`}>
                {etape > index + 1 ? <Check size={15} /> : index + 1}
              </div>
              <span className="hidden text-[10px] font-medium sm:block">{etapeItem.label}</span>
            </div>
            {index < etapes.length - 1 && (
              <div className={`h-0.5 flex-1 rounded-full ${etape > index + 1 ? "bg-[#237e56]" : "bg-[#e5e4df]"}`} />
            )}
          </div>
        ))}
      </div>

      {erreur && <div role="alert" className="retour-validation rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{erreur}</div>}

      <div className="rounded-2xl border bg-card p-4 sm:p-6">
        {/* Étape 1: Informations */}
        {etape === 1 && (
          <div className="space-y-5">
            <h3 className="font-semibold text-foreground">Informations générales</h3>
            <div>
              <label htmlFor="nom" className="mb-2 block text-sm font-medium text-[#405247]">Nom de la tontine</label>
              <input
                id="nom"
                value={form.nom}
                onChange={(e) => modifierChamp("nom", e.target.value)}
                placeholder="Ex. Tontine Solidarité"
                aria-invalid={Boolean(erreursChamps.nom)}
                aria-describedby={erreursChamps.nom ? "erreur-nom" : undefined}
                className={`h-12 w-full rounded-xl border bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring ${erreursChamps.nom ? "border-destructive" : ""}`}
              />
              {erreursChamps.nom && <p id="erreur-nom" className="retour-validation mt-1 text-xs text-[#a53d39]">{erreursChamps.nom}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="nombreParticipantsRequis" className="mb-2 block text-sm font-medium text-[#405247]">Nombre de participants requis</label>
                <input
                  id="nombreParticipantsRequis"
                  type="number"
                  min={2}
                  max={200}
                  step={1}
                  value={form.nombreParticipantsRequis}
                  onChange={(e) => modifierChamp("nombreParticipantsRequis", Number(e.target.value))}
                  aria-invalid={Boolean(erreursChamps.nombreParticipantsRequis)}
                  aria-describedby={erreursChamps.nombreParticipantsRequis ? "erreur-nombre-participants" : undefined}
                  className={`h-12 w-full rounded-xl border bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring ${erreursChamps.nombreParticipantsRequis ? "border-destructive" : ""}`}
                />
                {erreursChamps.nombreParticipantsRequis && <p id="erreur-nombre-participants" className="retour-validation mt-1 text-xs text-[#a53d39]">{erreursChamps.nombreParticipantsRequis}</p>}
              </div>
              <div>
                <label htmlFor="montantCotisation" className="mb-2 block text-sm font-medium text-[#405247]">Montant de cotisation (XOF)</label>
                <input
                  id="montantCotisation"
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  step="0.01"
                  value={form.montantCotisation}
                  onChange={(e) => modifierChamp("montantCotisation", e.target.value)}
                  placeholder="100000"
                  aria-invalid={Boolean(erreursChamps.montantCotisation)}
                  aria-describedby={erreursChamps.montantCotisation ? "erreur-montant" : undefined}
                  className={`h-12 w-full rounded-xl border bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring ${erreursChamps.montantCotisation ? "border-destructive" : ""}`}
                />
                {erreursChamps.montantCotisation && <p id="erreur-montant" className="retour-validation mt-1 text-xs text-[#a53d39]">{erreursChamps.montantCotisation}</p>}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#405247]">Fréquence</label>
                <select
                  value={form.frequence}
                  onChange={(e) => modifierChamp("frequence", e.target.value as FrequenceTontine)}
                  className="h-12 w-full rounded-xl border bg-card px-3 text-sm text-foreground outline-none"
                >
                  <option value="QUOTIDIENNE">Quotidienne</option>
                  <option value="HEBDOMADAIRE">Hebdomadaire</option>
                  <option value="MENSUELLE">Mensuelle</option>
                </select>
              </div>
              <div>
                <label htmlFor="dateCommencement" className="mb-2 block text-sm font-medium text-[#405247]">Date de commencement</label>
                <input
                  id="dateCommencement"
                  type="date"
                  min={dateMinimumDemarrage}
                  value={form.dateCommencement}
                  onChange={(e) => modifierChamp("dateCommencement", e.target.value)}
                  aria-invalid={Boolean(erreursChamps.dateCommencement)}
                  aria-describedby={erreursChamps.dateCommencement ? "erreur-date" : undefined}
                  className={`h-12 w-full rounded-xl border bg-card px-3 text-sm text-foreground outline-none ${erreursChamps.dateCommencement ? "border-destructive" : ""}`}
                />
                {erreursChamps.dateCommencement && <p id="erreur-date" className="retour-validation mt-1 text-xs text-[#a53d39]">{erreursChamps.dateCommencement}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="fuseauHoraire" className="mb-2 block text-sm font-medium text-[#405247]">Fuseau horaire</label>
              <select
                id="fuseauHoraire"
                value={form.fuseauHoraire}
                onChange={(e) => modifierChamp("fuseauHoraire", e.target.value)}
                aria-invalid={Boolean(erreursChamps.fuseauHoraire)}
                aria-describedby={erreursChamps.fuseauHoraire ? "erreur-fuseau" : undefined}
                className={`h-12 w-full rounded-xl border bg-card px-3 text-sm text-foreground outline-none ${erreursChamps.fuseauHoraire ? "border-destructive" : ""}`}
              >
                <option value="Africa/Niamey">Africa/Niamey</option>
                <option value="Africa/Abidjan">Africa/Abidjan</option>
                <option value="Africa/Dakar">Africa/Dakar</option>
                <option value="Africa/Bamako">Africa/Bamako</option>
                <option value="Europe/Paris">Europe/Paris</option>
              </select>
              {erreursChamps.fuseauHoraire && <p id="erreur-fuseau" className="retour-validation mt-1 text-xs text-[#a53d39]">{erreursChamps.fuseauHoraire}</p>}
            </div>
          </div>
        )}

        {/* Étape 2: Règles — choix du mode */}
        {etape === 2 && (
          <div className="space-y-5">
            <h3 className="font-semibold text-[#20392d]">Choisissez le mode de tontine</h3>
            <div className="space-y-3">
              {([
                { mode: "FIXE_CREATEUR" as ModeTontine, titre: "Bénéficiaire fixe — créateur", desc: "Vous êtes le bénéficiaire à chaque tour. Vous ne cotisez pas. Les autres membres cotisent à chaque tour." },
                { mode: "TOURNANT_EXCLU" as ModeTontine, titre: "Bénéficiaire tournant — exempté", desc: "Le bénéficiaire change à chaque tour. Le bénéficiaire ne cotise pas pendant son propre tour. Tous les autres membres cotisent." },
                { mode: "TOURNANT_INCLUS" as ModeTontine, titre: "Bénéficiaire tournant — tous cotisent", desc: "Le bénéficiaire change à chaque tour. Tous les membres cotisent, y compris le bénéficiaire." },
              ]).map(({ mode, titre, desc }) => (
                <button
                  key={mode}
                  onClick={() => modifierChamp("mode", mode)}
                  className={`w-full rounded-2xl border-2 p-5 text-left transition-[background-color,border-color,box-shadow,transform] duration-200 [transition-timing-function:var(--easing-naturel)] active:scale-[.99] motion-reduce:transform-none motion-reduce:transition-none ${
                    form.mode === mode ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 grid h-5 w-5 place-items-center rounded-full border-2 ${form.mode === mode ? "border-[#237e56] bg-[#237e56]" : "border-[#dcdad4]"}`}>
                      {form.mode === mode && <Check size={12} className="text-white" />}
                    </span>
                    <div>
                      <p className="font-semibold text-[#20392d]">{titre}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {/* Explication dynamique */}
            <div className="rounded-xl bg-primary/10 p-4">
              <p className="text-sm font-semibold text-foreground">Avec {form.nombreParticipantsRequis} membres :</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Nombre de tours : <b>{nombreTours}</b>
              </p>
              {form.mode === "TOURNANT_EXCLU" && (
                <div className="mt-3 space-y-1">
                  {Array.from({ length: Math.min(5, form.nombreParticipantsRequis) }).map((_, i) => (
                    <p key={i} className="text-xs text-[#537362]">
                      Tour {i + 1} → Membre {String.fromCharCode(65 + i)} reçoit, ne cotise pas
                    </p>
                  ))}
                </div>
              )}
              {form.mode === "TOURNANT_INCLUS" && (
                <div className="mt-3 space-y-1">
                  {Array.from({ length: Math.min(5, form.nombreParticipantsRequis) }).map((_, i) => (
                    <p key={i} className="text-xs text-[#537362]">
                      Tour {i + 1} → Membre {String.fromCharCode(65 + i)} reçoit, cotise aussi
                    </p>
                  ))}
                </div>
              )}
              {form.mode === "FIXE_CREATEUR" && (
                <p className="mt-2 text-xs text-[#537362]">
                  Vous (créateur) recevez à chaque tour. Les {form.nombreParticipantsRequis - 1} autres membres cotisent.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Étape 3: Membres */}
        {etape === 3 && (
          <div className="space-y-5">
            <h3 className="font-semibold text-[#20392d]">Membres et invitations</h3>
            <p className="text-sm text-muted-foreground">
              Vous êtes le créateur. Les autres membres rejoindront via un code d’invitation après approbation.
            </p>
            <div className="rounded-xl border bg-[#f8faf6] p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[#d4eadb] text-sm font-bold text-[#207b54]">
                  {utilisateur?.prenom?.[0]}{utilisateur?.nom?.[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#20392d]">{utilisateur?.prenom} {utilisateur?.nom}</p>
                  <p className="text-xs text-muted-foreground">Créateur · Vous</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border-2 border-dashed border-[#c5dcc9] p-6 text-center">
              <Users size={28} className="mx-auto text-[#9bc8aa]" />
              <p className="mt-3 text-sm font-medium text-[#405247]">Invitez des membres</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Un code d’invitation sera généré à la création. Partagez-le avec les participants.
              </p>
            </div>
            <div className="rounded-xl bg-warning/15 p-4">
              <p className="text-sm text-warning">
                Places restantes : <b>{form.nombreParticipantsRequis - 1}</b> membre(s) à inviter.
              </p>
            </div>
          </div>
        )}

        {/* Étape 4: Ordre des bénéficiaires */}
        {etape === 4 && (
          <div className="space-y-5">
            <h3 className="font-semibold text-[#20392d]">Ordre des bénéficiaires</h3>
            {form.mode === "FIXE_CREATEUR" ? (
              <div className="rounded-xl bg-[#f1f8f2] p-4 text-sm text-[#537362]">
                En mode <b>Bénéficiaire fixe</b>, vous êtes le bénéficiaire à chaque tour. L’ordre n’a pas besoin d’être configuré.
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Définissez l’ordre dans lequel les membres recevront les cotisations. Vous pourrez modifier cet ordre jusqu’au démarrage.
                </p>
                <div className="space-y-2">
                  <div className="flex min-w-0 items-center gap-3 rounded-xl border bg-white p-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#237e56] text-sm font-bold text-white">1</span>
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-[#d4eadb] text-xs font-bold text-[#207b54]">{utilisateur?.prenom?.[0]}{utilisateur?.nom?.[0]}</div>
                    <span className="min-w-0 break-words text-sm font-medium text-[#405247]">{utilisateur?.prenom} {utilisateur?.nom}</span>
                  </div>
                  {Array.from({ length: form.nombreParticipantsRequis - 1 }).map((_, i) => (
                    <div key={i} className="flex min-w-0 items-center gap-3 rounded-xl border bg-white p-3">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f0f3ed] text-sm font-bold text-[#98a099]">{i + 2}</span>
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-[#f0f3ed] text-xs text-[#98a099]">?</div>
                      <span className="text-sm text-[#98a099]">Membre à inviter</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  L’ordre sera verrouillé après le démarrage de la tontine.
                </p>
              </>
            )}
          </div>
        )}

        {/* Étape 5: Confirmation */}
        {etape === 5 && (
          <div className="space-y-5">
            <h3 className="font-semibold text-[#20392d]">Confirmation</h3>
            <div className="space-y-3 rounded-xl bg-[#f8faf6] p-5">
              <Row label="Nom" value={form.nom} />
              <Row label="Mode" value={libelleModeTontine(form.mode)} />
              <Row label="Montant" value={`${new Intl.NumberFormat("fr-FR").format(Number(form.montantCotisation) || 0)} XOF`} />
              <Row label="Fréquence" value={form.frequence} />
              <Row label="Participants requis" value={String(form.nombreParticipantsRequis)} />
              <Row label="Nombre de tours" value={String(nombreTours)} />
              <Row label="Date de commencement" value={form.dateCommencement} />
              <Row label="Fuseau horaire" value={form.fuseauHoraire} />
            </div>
            <div className="rounded-xl bg-warning/15 p-4 text-sm text-warning">
              Un code d’invitation sera généré pour permettre aux membres de demander à rejoindre la tontine.
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex gap-3">
          {etape > 1 && (
            <Button variant="outline" onClick={() => setEtape((e) => e - 1)} className="flex-1">
              <ArrowLeft size={16} /> Précédent
            </Button>
          )}
          {etape < 5 ? (
            <Button onClick={handleSuivant} className="flex-1">
              Suivant <ArrowRight size={16} className="ml-1" />
            </Button>
          ) : (
            <Button onClick={handleCreer} disabled={chargement} className="flex-1">
              {chargement ? "Création..." : "Créer la tontine"} {!chargement && <Check size={16} className="ml-1" />}
            </Button>
          )}
        </div>
      </div>

      {showIdentite && (
        <ModalConfirmation
          titre="Document d'identité requis"
          message="Vous devez fournir votre document d'identité avant de créer une tontine. Vos documents restent strictement privés."
          boutonLabel="Fournir mon identité"
          boutonTone="green"
          onConfirm={() => { setShowIdentite(false); onRetour(); }}
          onClose={() => setShowIdentite(false)}
        />
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-words font-semibold text-[#405247] sm:text-right">{value}</span>
    </div>
  );
}
