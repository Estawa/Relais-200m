import React from "react";
import { formatChrono } from "../utils/temps";
import {
  calculerPerformanceEleve,
  performanceDepuisTempsRelais,
  noteFinSequence12,
  noteFilSequence8,
  noteGenerale20,
  OPTIONS_POSITIONNEMENT,
  OPTIONS_AFLP2,
} from "../utils/bareme12";

export default function TabResultats({ equipes, elevesById, series, setSeries, eleves, setEleves }) {
  function modifier(id, champ, valeur) {
    setEleves((prev) => prev.map((e) => (e.id === id ? { ...e, [champ]: valeur === "" ? null : Number(valeur) } : e)));
  }

  function toggleRetenue(serieId, equipeId) {
    setSeries((prev) =>
      prev.map((s) => {
        if (s.id !== serieId) return s;
        const retenueActuelle = s.retenues?.[equipeId] !== false;
        return { ...s, retenues: { ...s.retenues, [equipeId]: !retenueActuelle } };
      })
    );
  }

  // Toutes les manches auxquelles un·e élève a participé, quelle que soit l'équipe
  // utilisée ce jour-là (équipe habituelle ou équipe du jour formée en cas d'absence).
  function manchesEleve(eleveId) {
    return series
      .map((s) => {
        const equipeId = (s.equipeIds || []).find((id) => {
          const t = equipes.find((e) => e.id === id);
          return t && t.membreIds.includes(eleveId);
        });
        if (!equipeId || typeof s.arrivals?.[equipeId] !== "number") return null;
        const equipe = equipes.find((e) => e.id === equipeId);
        if (!equipe) return null;
        return { serie: s, equipeId, equipe };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.serie.creeLe) - new Date(b.serie.creeLe));
  }

  const equipesTriees = [...equipes].filter((eq) => !eq.adhoc).sort((a, b) => a.nom.localeCompare(b.nom));

  return (
    <div>
      <h2 className="font-display text-2xl tracking-wide mb-2">Résultats</h2>
      <p className="text-xs text-piste-craie/40 mb-5">
        Notation officielle de la situation d'évaluation fin de séquence, sur 12 points (AFLP 1 : 7 pts — AFLP 2 : 5
        pts). Les 8 points restants (fil de séquence) se répartissent sur ce qui est déjà suivi dans l'onglet Rôles.
        Le barème officiel est calibré pour des binômes ; pour un trinôme, le temps de relais et la somme des 200m
        individuels sont ramenés à un équivalent binôme par une règle de trois (× 2/3) avant d'être comparés au
        même barème. Chaque élève peut être chronométré·e autant de fois que nécessaire sur l'ensemble du cycle,
        avec son équipe habituelle ou une équipe du jour (en cas d'absence d'un·e partenaire) : toutes ses
        performances sont conservées dans son suivi personnel ci-dessous, où tu peux décocher celles à exclure du
        calcul de la note.
      </p>

      {equipesTriees.length === 0 ? (
        <div className="text-piste-craie/50 text-sm border border-dashed border-white/10 rounded-lg p-8 text-center">
          Aucune équipe pour l'instant.
        </div>
      ) : (
        <div className="space-y-4">
          {equipesTriees.map((eq) => {
            return (
              <div key={eq.id} className="bg-piste-panneau rounded-lg border border-white/10 p-4">
                <div className="font-display text-lg tracking-wide mb-3">{eq.nom}</div>

                <div className="space-y-3">
                  {eq.membreIds.map((id) => {
                    const el = elevesById[id];
                    if (!el) return null;
                    const perf = calculerPerformanceEleve(el, elevesById, equipes, series);
                    const total12 = noteFinSequence12(el, perf);
                    const total8 = noteFilSequence8(el);
                    const total20 = noteGenerale20(el, perf);
                    const manches = manchesEleve(el.id);

                    return (
                      <div key={id} className="border-t border-white/5 pt-3 first:border-0 first:pt-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold">
                            {el.prenom} {el.nom}
                            <span className="text-piste-craie/30 font-normal ml-1.5">
                              {el.sexe ? `(${el.sexe})` : ""} · 200m {el.temps200 != null ? `${(el.temps200 / 1000).toFixed(1)}s` : "—"}
                            </span>
                          </span>
                          <div className="text-right">
                            <div className="font-display text-2xl text-piste-ambre tabular leading-none">
                              {total20 != null ? `${total20} / 20` : "— / 20"}
                            </div>
                            <div className="text-[10px] text-piste-craie/30 tabular">
                              {total12 != null ? `${total12}/12` : "—/12"} + {total8 != null ? `${total8}/8` : "—/8"}
                            </div>
                          </div>
                        </div>

                        {manches.length > 0 && (
                          <div className="mb-3">
                            <div className="text-[11px] uppercase text-piste-craie/40 mb-1.5">
                              Suivi personnel sur le cycle ({manches.length})
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {manches.map(({ serie, equipeId, equipe }) => {
                                const retenue = serie.retenues?.[equipeId] !== false;
                                const arriveeMs = serie.arrivals[equipeId];
                                const p = performanceDepuisTempsRelais(el, equipe, elevesById, arriveeMs);
                                return (
                                  <label
                                    key={serie.id}
                                    title="Décocher pour exclure cette performance du calcul de la note"
                                    className={`flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1 border cursor-pointer ${
                                      retenue
                                        ? "border-piste-pelouse/40 bg-piste-pelouse/10 text-piste-craie/80"
                                        : "border-white/10 bg-piste-nuit/40 text-piste-craie/30 line-through"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={retenue}
                                      onChange={() => toggleRetenue(serie.id, equipeId)}
                                      className="accent-piste-pelouse"
                                    />
                                    {serie.nom}
                                    {equipe.adhoc ? " (jour)" : ""} · {formatChrono(arriveeMs)}
                                    {p != null ? ` → ${p}/3` : ""}
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-piste-craie/50 mb-2">
                          {perf ? (
                            <>
                              Performance{perf.aUneEquipeDuJour ? " (dont au moins une manche en équipe du jour)" : ""} :{" "}
                              <span className="text-piste-craie/80">
                                200m {perf.note200}/3 · relais (moy. {formatChrono(perf.moyenneRelaisMs)}, {perf.nbManches}{" "}
                                manche{perf.nbManches > 1 ? "s" : ""}) {perf.noteRelais}/3 · IT {perf.itSecondes >= 0 ? "+" : ""}
                                {perf.itSecondes}s {perf.noteIT}/3
                              </span>{" "}
                              → moyenne {perf.performance}/3
                            </>
                          ) : (
                            "Performance non calculable (temps 200m manquant pour l'élève ou un·e coéquipier·e, ou aucune manche chronométrée)."
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs">
                          <label className="flex items-center gap-1.5">
                            <span className="text-piste-craie/50">AFLP 1 — Positionnement (/4)</span>
                            <select
                              value={el.aflp1Position ?? ""}
                              onChange={(ev) => modifier(el.id, "aflp1Position", ev.target.value)}
                              className="bg-piste-nuit/60 border border-white/10 rounded px-2 py-1 tabular"
                            >
                              <option value="">—</option>
                              {OPTIONS_POSITIONNEMENT.map((v) => (
                                <option key={v} value={v}>{v}</option>
                              ))}
                            </select>
                          </label>
                          <label className="flex items-center gap-1.5">
                            <span className="text-piste-craie/50">AFLP 2 (/5)</span>
                            <select
                              value={el.aflp2Note ?? ""}
                              onChange={(ev) => modifier(el.id, "aflp2Note", ev.target.value)}
                              className="bg-piste-nuit/60 border border-white/10 rounded px-2 py-1 tabular"
                            >
                              <option value="">—</option>
                              {OPTIONS_AFLP2.map((v) => (
                                <option key={v} value={v}>{v}</option>
                              ))}
                            </select>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
