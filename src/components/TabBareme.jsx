import React from "react";
import {
  BAREME_200M_FILLES,
  BAREME_200M_GARCONS,
  BAREME_RELAIS_FILLES,
  BAREME_RELAIS_GARCONS,
  BAREME_IT,
  BAREME_GT_RELAIS_FILLES,
  BAREME_GT_RELAIS_GARCONS,
  BAREME_GT_IT,
  REF_GT_200M_FILLES,
  REF_GT_200M_GARCONS,
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

function LigneRef({ titre, valeurs }) {
  return (
    <tr className="border-t border-white/5 text-piste-craie/40">
      <td className="px-2 py-1.5 whitespace-nowrap sticky left-0 bg-piste-panneau">{titre}</td>
      {valeurs.map((v, i) => (
        <td key={i} className="px-2 py-1.5 text-center tabular">{fmt(v)}</td>
      ))}
    </tr>
  );
}

function Tableau({ titre, bareme200, baremeRelais, ref200 }) {
  const pointsTries = [...baremeRelais].sort((a, b) => a.points - b.points).map((p) => p.points);
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
            {bareme200 && <Ligne titre="200m" bareme={bareme200} />}
            <Ligne titre="Relais (moy.)" bareme={baremeRelais} />
            {ref200 && <LigneRef titre="200m (repère)" valeurs={ref200} />}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableauIT({ bareme, titre, texte }) {
  return (
    <div>
      <h3 className="font-display text-xl tracking-wide mb-2">{titre}</h3>
      <p className="text-xs text-piste-craie/40 mb-2">{texte}</p>
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="text-xs">
          <thead className="bg-piste-panneau text-piste-craie/50">
            <tr>
              <th className="px-2 py-1.5 text-left sticky left-0 bg-piste-panneau">Points</th>
              {[...bareme].sort((a, b) => a.points - b.points).map((p) => (
                <th key={p.points} className="px-2 py-1.5 tabular font-semibold text-piste-ambre">{p.points}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Ligne titre="I.T. max" bareme={bareme} formatter={(s) => (s > 0 ? `+${s}` : s)} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

const TEXTE_IT = "I.T. = temps du relais − somme des deux 200m individuels des coéquipiers, calculé sur le meilleur des 2 relais retenus. Négatif = le passage de témoin fait gagner du temps (plus de points).";

export default function TabBareme({ typeBac }) {
  if (typeBac === "gt") {
    return (
      <div>
        <h2 className="font-display text-2xl tracking-wide mb-2">Barème — Bac général et technologique</h2>
        <p className="text-xs text-piste-craie/40 mb-5">
          Référentiel d'évaluation du lycée Georges-Brassens, Relais long 2x200m. AFL 1 sur 12 points : élément 1
          (performance, moyenne des 2 relais retenus) sur 6 points + élément 2 (indice de transmission) sur 6
          points. Les temps de 200m sont donnés comme repères : ils ne sont pas notés. Seuil national : 1'20 (filles),
          1'04 (garçons). Affichage pour référence, utilisé automatiquement dans l'onglet Résultats.
        </p>
        <Tableau titre="Élément 1 — Filles" baremeRelais={BAREME_GT_RELAIS_FILLES} ref200={REF_GT_200M_FILLES} />
        <Tableau titre="Élément 1 — Garçons" baremeRelais={BAREME_GT_RELAIS_GARCONS} ref200={REF_GT_200M_GARCONS} />
        <TableauIT bareme={BAREME_GT_IT} titre="Élément 2 — Indice de transmission (filles et garçons)" texte={TEXTE_IT} />
      </div>
    );
  }
  return (
    <div>
      <h2 className="font-display text-2xl tracking-wide mb-2">Barème — Bac professionnel</h2>
      <p className="text-xs text-piste-craie/40 mb-5">
        Référentiel d'évaluation du lycée Georges-Brassens, Relais long 2x200m (16 paliers). Les 3 points de
        performance de l'AFLP 1 sont la moyenne de trois notes : meilleur 200m, moyenne des 2 relais retenus,
        indice de transmission. Affichage pour référence, utilisé automatiquement dans l'onglet Résultats.
      </p>

      <Tableau titre="Filles" bareme200={BAREME_200M_FILLES} baremeRelais={BAREME_RELAIS_FILLES} />
      <Tableau titre="Garçons" bareme200={BAREME_200M_GARCONS} baremeRelais={BAREME_RELAIS_GARCONS} />
      <TableauIT bareme={BAREME_IT} titre="Indice de transmission (I.T.) — commun filles/garçons" texte={TEXTE_IT} />
    </div>
  );
}
