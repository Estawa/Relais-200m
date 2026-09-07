import React from "react";
import { formatChrono } from "../utils/temps";
import {
  calculerPerformance,
  noteFinSequence12,
  OPTIONS_POSITIONNEMENT,
  OPTIONS_AFLP2,
} from "../utils/bareme12";

export default function TabResultats({ equipes, elevesById, series, eleves, setEleves }) {
  function modifier(id, champ, valeur) {
    setEleves((prev) => prev.map((e) => (e.id === id ? { ...e, [champ]: valeur === "" ? null : Number(valeur) } : e)));
  }

  const equipesTriees = [...equipes].sort((a, b) => a.nom.localeCompare(b.nom));

  return (
    <div>
      <h2 className="font-display text-2xl tracking-wide mb-2">Résultats</h2>
      <p className="text-xs text-piste-craie/40 mb-5">
        Notation officielle de la situation d'évaluation fin de séquence, sur 12 points (AFLP 1 : 7 pts — AFLP 2 : 5
        pts). Les 8 points restants (fil de séquence) se répartissent sur ce qui est déjà suivi dans l'onglet Rôles.
        Le barème officiel est calibré pour des binômes ; pour un trinôme, le temps de relais et la somme des 200m
        individuels sont ramenés à un équivalent binôme par une règle de trois (× 2/3) avant d'être comparés au
        même barème.
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
                    const perf = calculerPerformance(el, eq, elevesById, series);
                    const total = noteFinSequence12(el, perf);

                    return (
                      <div key={id} className="border-t border-white/5 pt-3 first:border-0 first:pt-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold">
                            {el.prenom} {el.nom}
                            <span className="text-piste-craie/30 font-normal ml-1.5">
                              {el.sexe ? `(${el.sexe})` : ""} · 200m {el.temps200 != null ? `${(el.temps200 / 1000).toFixed(1)}s` : "—"}
                            </span>
                          </span>
                          <span className="font-display text-2xl text-piste-ambre tabular">
                            {total != null ? `${total} / 12` : "—"}
                          </span>
                        </div>

                        <div className="text-xs text-piste-craie/50 mb-2">
                          {perf ? (
                            <>
                              Performance{perf.equivalentBinome ? " (équivalent binôme, règle de 3)" : ""} :{" "}
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
