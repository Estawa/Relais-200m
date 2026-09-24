import React from "react";
import { formatChrono } from "../utils/temps";
import { manchesEleve } from "../utils/equipes";
import {
  calculerPerformanceEleve,
  performanceDepuisTempsRelais,
  noteFinSequence12,
  noteFilSequence8,
  noteGenerale20,
  OPTIONS_POSITIONNEMENT,
  OPTIONS_AFLP2,
  MODES_NOTE_RELAIS,
  libelleModeNoteRelais,
} from "../utils/bareme12";
import { formatDateCourte, correctionManche } from "../utils/historique";

export default function TabResultats({ equipes, elevesById, series, setSeries, eleves, setEleves, modeNoteRelais = "meilleure", setModeNoteRelais }) {
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

  function manches(eleveId) {
    return manchesEleve(eleveId, equipes, series);
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
        performances sont conservées, datées, avec la composition réelle de l'équipe, dans son suivi personnel
        ci-dessous, où tu peux décocher celles à exclure du calcul de la note. Le 200m individuel retenu est
        toujours le meilleur temps de l'élève.
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-5 bg-piste-panneau rounded-lg border border-white/10 px-4 py-3">
        <span className="text-xs text-piste-craie/60">Note de relais (évaluation finale) calculée sur :</span>
        {MODES_NOTE_RELAIS.map((m) => (
          <button
            key={m.valeur}
            onClick={() => setModeNoteRelais && setModeNoteRelais(m.valeur)}
            className={`text-xs px-3 py-1.5 rounded-full border ${
              modeNoteRelais === m.valeur
                ? "border-piste-brique bg-piste-brique text-white font-semibold"
                : "border-white/15 text-piste-craie/70 hover:border-piste-brique"
            }`}
          >
            {m.libelle}
          </button>
        ))}
        <span className="text-[11px] text-piste-craie/40 w-full">
          Parmi les manches cochées de chaque élève (si une seule manche, elle compte seule). La note de relais
          porte sur la moyenne des 2 manches choisies, l'indice de transmission sur la meilleure des deux. Les
          manches utilisées sont repérées par ★ ci-dessous. Le 200m individuel : meilleur temps du cycle.
        </span>
      </div>

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
                    const perf = calculerPerformanceEleve(el, elevesById, equipes, series, modeNoteRelais);
                    const total12 = noteFinSequence12(el, perf);
                    const total8 = noteFilSequence8(el);
                    const total20 = noteGenerale20(el, perf);
                    const listeManches = manches(el.id);

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

                        {listeManches.length > 0 && (
                          <div className="mb-3">
                            <div className="text-[11px] uppercase text-piste-craie/40 mb-1.5">
                              Suivi personnel sur le cycle ({listeManches.length})
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {listeManches.map(({ serie, equipeId, equipe, date }) => {
                                const retenue = serie.retenues?.[equipeId] !== false;
                                const arriveeMs = serie.arrivals[equipeId];
                                const p = performanceDepuisTempsRelais(el, equipe, elevesById, arriveeMs);
                                const choisie = (perf?.serieChoisieIds || []).includes(serie.id);
                                const coequipiers = equipe.membreIds
                                  .filter((mid) => mid !== el.id)
                                  .map((mid) => elevesById[mid]?.prenom || "?")
                                  .join(", ");
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
                                    {choisie ? "★ " : ""}
                                    {formatDateCourte(date)} · {serie.nom}
                                    {equipe.adhoc ? " (jour)" : ""} · avec {coequipiers} · {formatChrono(arriveeMs)}
                                    {correctionManche(serie, equipeId) ? " (corrigé)" : ""}
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
                                200m (meilleur) {perf.note200}/3 · relais ({perf.nbManchesChoisies > 1 ? libelleModeNoteRelais(perf.mode) : "1 seule manche"}{" "}
                                sur {perf.nbManches} : {formatChrono(perf.relaisChoisiMs)}) {perf.noteRelais}/3 · IT {perf.itSecondes >= 0 ? "+" : ""}
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
