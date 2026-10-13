"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CreditCard, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { useRafraichissementActif } from "@/hooks/useRafraichissementActif";
import { appelApi } from "@/lib/api-client";
import { formaterDateCourte, formaterMontant } from "@/lib/format";

type Cotisation = {
  id: string;
  montantAttendu: string | number;
  montantValide: string | number;
  echeanceLe: string;
  statut: "A_PAYER" | "PARTIEL" | "PAYEE" | "EN_RETARD" | "NON_CONCERNE";
  penaliteAppliqueeMontant: string | number;
  rotation: {
    numero: number;
    statut: string;
  };
  membre: {
    utilisateurId: string;
  };
  declarations: {
    statut: string;
  }[];
};

type ApercuCotisationsTontineProps = {
  tontineId: string;
  estCreateur: boolean;
  prochainTour?: {
    numero: number;
    beneficiaireNom: string;
    date: string;
  };
  allerCotisations: () => void;
  allerMembres: () => void;
  allerRotations: () => void;
};

export function ApercuCotisationsTontine({
  tontineId,
  estCreateur,
  prochainTour,
  allerCotisations,
  allerMembres,
  allerRotations,
}: ApercuCotisationsTontineProps) {
  const { utilisateur } = useApp();
  const [cotisations, setCotisations] = useState<Cotisation[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  const charger = useCallback(
    async (silencieux = false) => {
      if (!silencieux) {
        setChargement(true);
      }

      try {
        const donnees = await appelApi<Cotisation[]>(
          `/api/tontines/${tontineId}/cotisations`,
        );
        setCotisations(donnees);
        setErreur("");
      } catch (cause) {
        setErreur(
          cause instanceof Error ? cause.message : "Suivi indisponible.",
        );
      } finally {
        if (!silencieux) {
          setChargement(false);
        }
      }
    },
    [tontineId],
  );

  useEffect(() => {
    void charger();
  }, [charger]);

  useRafraichissementActif(() => charger(true));

  const cotisationsEnCours = useMemo(
    () =>
      cotisations.filter(
        (item) =>
          item.rotation.statut === "EN_COURS" &&
          item.statut !== "NON_CONCERNE",
      ),
    [cotisations],
  );

  const totalAttendu = cotisationsEnCours.reduce(
    (somme, item) => somme + Number(item.montantAttendu),
    0,
  );
  const totalConfirme = cotisationsEnCours.reduce(
    (somme, item) => somme + Number(item.montantValide),
    0,
  );
  const retards = cotisationsEnCours.filter(
    (item) => item.statut === "EN_RETARD",
  ).length;
  const aVerifier = cotisationsEnCours
    .flatMap((item) => item.declarations)
    .filter((item) => item.statut === "EN_ATTENTE_VALIDATION").length;
  const maCotisation = cotisationsEnCours.find(
    (item) => item.membre.utilisateurId === utilisateur?.id,
  );
  const restant = maCotisation
    ? Math.max(
        0,
        Number(maCotisation.montantAttendu) - Number(maCotisation.montantValide),
      )
    : 0;

  return (
    <section className="rounded-2xl border bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="font-semibold text-[#20392d]">Suivi du tour en cours</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Données actualisées depuis les cotisations déclarées et confirmées.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={allerCotisations}
          className="border-[#c5dcc9] text-[#237e56]"
        >
          Voir les cotisations
        </Button>
      </div>

      {chargement ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Chargement du suivi des cotisations…
        </p>
      ) : erreur ? (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-[#fdebea] p-3 text-sm text-[#a53d39]"
        >
          {erreur}
        </p>
      ) : (
        <>
          {estCreateur ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <Carte libelle="Attendu" valeur={formaterMontant(totalAttendu)} />
              <Carte
                libelle="Collecté confirmé"
                valeur={formaterMontant(totalConfirme)}
              />
              <Carte
                libelle="Déclarations à vérifier"
                valeur={String(aVerifier)}
                action={allerCotisations}
              />
              <Carte
                libelle="Membres en retard"
                valeur={String(retards)}
                action={allerCotisations}
              />
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Carte
                libelle="Ma cotisation attendue"
                valeur={
                  maCotisation
                    ? formaterMontant(Number(maCotisation.montantAttendu))
                    : "Non concerné"
                }
              />
              <Carte
                libelle="Montant confirmé"
                valeur={
                  maCotisation
                    ? formaterMontant(Number(maCotisation.montantValide))
                    : "—"
                }
              />
              <Carte
                libelle="Montant restant"
                valeur={maCotisation ? formaterMontant(restant) : "—"}
                action={allerCotisations}
              />
            </div>
          )}

          {prochainTour && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#f8faf6] p-3 text-sm">
              <span>
                Prochain tour :{" "}
                <b>
                  #{prochainTour.numero} · {prochainTour.beneficiaireNom}
                </b>{" "}
                · {formaterDateCourte(prochainTour.date)}
              </span>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={allerRotations}
                  className="text-xs"
                >
                  Voir rotations
                </Button>
                {estCreateur && (
                  <Button
                    variant="outline"
                    onClick={allerMembres}
                    className="text-xs"
                  >
                    <Users size={14} />
                    Membres
                  </Button>
                )}
              </div>
            </div>
          )}

          {estCreateur &&
            cotisationsEnCours.some(
              (item) => Number(item.penaliteAppliqueeMontant) > 0,
            ) && (
              <p className="mt-3 flex items-center gap-2 text-xs text-[#8a6300]">
                <AlertCircle size={14} />
                Des pénalités distinctes sont enregistrées dans les cotisations.
              </p>
            )}

          {!estCreateur && maCotisation && restant > 0 && (
            <Button
              onClick={allerCotisations}
              className="mt-4 bg-[#237e56] hover:bg-[#1c6847]"
            >
              <CreditCard size={15} />
              Déclarer un paiement
            </Button>
          )}
        </>
      )}
    </section>
  );
}

function Carte({
  libelle,
  valeur,
  action,
}: {
  libelle: string;
  valeur: string;
  action?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={action}
      disabled={!action}
      className="rounded-xl bg-[#f8faf6] p-4 text-left disabled:cursor-default"
    >
      <p className="text-xs text-muted-foreground">{libelle}</p>
      <p className="mt-2 font-semibold text-[#294237]">{valeur}</p>
    </button>
  );
}
