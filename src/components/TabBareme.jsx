import React from "react";
import {
  BAREME_200M_FILLES,
  BAREME_200M_GARCONS,
  BAREME_RELAIS_FILLES,
  BAREME_RELAIS_GARCONS,
  BAREME_IT,
} from "../utils/bareme12";

function fmt(s) {
  if (s < 0) return `-${fmt(-s)}`;
  if (s < 60) return Number.isInteger(s) ? `${s}''` : `${s}s`;
  const m = Math.floor(s / 60);
  const sec = s - m * 60;
  return `${m}'${Number.isInteger(sec) ? String(sec).padStart(2, "0") : sec}`;
}

function Ligne({ titre, bareme, formatter = fmt }) {
  const croissant = [...bareme].sort((a, b) => a.points - b.points);
  return (
    <tr className="border-t border-white/5">
      <td className="px-2 py-1.5 text-piste-craie/60 whitespace-nowrap sticky left-0 bg-piste-panneau">{titre}</td>
      {croissant.map((p) => (
        <td key={p.points} className="px-2 py-1.5 text-center tabular">
          {formatter(p.seuil)}
        </td>
      ))}
    </tr>
  );
}

function Tableau({ titre, bareme200, baremeRelais }) {
  const pointsTries = [...bareme200].sort((a, b) => a.points - b.points).map((p) => p.points);
  return (
    <div className="mb-6">
      <h3 className="font-display text-xl tracking-wide mb-2">{titre}</h3>
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="text-xs">
          <thead className="bg-piste-panneau text-piste-craie/50">
            <tr>
              <th className="px-2 py-1.5 text-left sticky left-0 bg-piste-panneau">Points</th>
              {pointsTries.map((pt) => (
                <th key={pt} className="px-2 py-1.5 tabular font-semibold text-piste-ambre">{pt}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Ligne titre="200m" bareme={bareme200} />
            <Ligne titre="Relais (moy.)" bareme={baremeRelais} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function TabBareme() {
  return (
    <div>
      <h2 className="font-display text-2xl tracking-wide mb-2">Barème officiel — Bac Pro Terminale</h2>
      <p className="text-xs text-piste-craie/40 mb-5">
        Référentiel d'évaluation établissement, Académie de Versailles, session 2021 — Relais Long 2x200m. Grille
        utilisée automatiquement dans l'onglet Résultats pour calculer les 3 pts de performance (200m + moyenne des
        2 relais + indice de transmission, moyenne des trois notes). Affichage pour référence uniquement — non
        modifiable ici.
      </p>

      <Tableau titre="Filles" bareme200={BAREME_200M_FILLES} baremeRelais={BAREME_RELAIS_FILLES} />
      <Tableau titre="Garçons" bareme200={BAREME_200M_GARCONS} baremeRelais={BAREME_RELAIS_GARCONS} />

      <div>
        <h3 className="font-display text-xl tracking-wide mb-2">
          Indice de transmission (I.T.) — commun filles/garçons
        </h3>
        <p className="text-xs text-piste-craie/40 mb-2">
          I.T. = somme des deux 200m individuels des coéquipiers − meilleure des 2 performances de relais.
        </p>
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="text-xs">
            <thead className="bg-piste-panneau text-piste-craie/50">
              <tr>
                <th className="px-2 py-1.5 text-left sticky left-0 bg-piste-panneau">Points</th>
                {[...BAREME_IT].sort((a, b) => a.points - b.points).map((p) => (
                  <th key={p.points} className="px-2 py-1.5 tabular font-semibold text-piste-ambre">{p.points}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Ligne titre="I.T. max" bareme={BAREME_IT} formatter={(s) => (s > 0 ? `+${s}` : s)} />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
