import React from "react";
import { Printer } from "lucide-react";
import { formatChrono } from "../utils/temps";
import { compositionManche, dateManche, formatDateHeure, historique200, meilleurePerf200 } from "../utils/historique";
import {
  detailNoteManche,
  noteTemps200,
  calculerPerformanceEleve,
  libelleModeNoteRelais,
  noteFinSequence12,
  noteFilSequence8,
  noteGenerale20,
} from "../utils/bareme12";

function fmt(v, decimales = 1) {
  return v == null ? "—" : v.toFixed ? v.toFixed(decimales) : v;
}

export default function RecapTab({ eleves, elevesById, equipes, series, classeActive, modeNoteRelais = "meilleure" }) {
  const equipesHabituelles = equipes.filter((eq) => !eq.adhoc);
  const lignes = [];
  [...equipesHabituelles]
    .sort((a, b) => a.nom.localeCompare(b.nom))
    .forEach((eq) => {
      eq.membreIds.forEach((id) => {
        const el = elevesById[id];
        if (!el) return;
        const perf = calculerPerformanceEleve(el, elevesById, equipes, series, modeNoteRelais);
        lignes.push({
          equipe: eq.nom,
          el,
          perf,
          total12: noteFinSequence12(el, perf),
          total8: noteFilSequence8(el),
          total20: noteGenerale20(el, perf),
        });
      });
    });

  // Élèves non affectés à une équipe habituelle : inclus quand même, en bas, pour ne
  // perdre personne (leur note, s'ils/elles ont couru en équipe du jour, reste calculée).
  const idsAffectes = new Set(equipesHabituelles.flatMap((eq) => eq.membreIds));
  eleves
    .filter((e) => !idsAffectes.has(e.id))
    .forEach((el) => {
      const perf = calculerPerformanceEleve(el, elevesById, equipes, series, modeNoteRelais);
      lignes.push({
        equipe: "—",
        el,
        perf,
        total12: noteFinSequence12(el, perf),
        total8: noteFilSequence8(el),
        total20: noteGenerale20(el, perf),
      });
    });

  return (
    <div>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .recap-impression, .recap-impression * { visibility: visible; }
          .recap-impression { position: absolute; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
          .recap-table { font-size: 9px; }
          .recap-table tr { break-inside: avoid; page-break-inside: avoid; }
          .recap-table thead { display: table-header-group; }
          @page { size: landscape; margin: 10mm; }
        }
      `}</style>

      <div className="no-print flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-2xl tracking-wide">Récapitulatif</h2>
          <p className="text-xs text-piste-craie/40 mt-1">
            Détail complet de la notation pour {classeActive} — prêt à imprimer (format paysage).
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-piste-brique hover:bg-piste-briqueclair px-4 py-2 rounded font-display text-lg tracking-wide shrink-0"
        >
          <Printer size={18} /> Imprimer
        </button>
      </div>

      {lignes.length === 0 ? (
        <div className="no-print text-piste-craie/50 text-sm border border-dashed border-white/10 rounded-lg p-8 text-center">
          Aucun élève pour l'instant.
        </div>
      ) : (
        <div className="recap-impression bg-white text-black rounded-lg overflow-x-auto p-4">
          <h3 className="font-bold text-base mb-2">
            Relais Long 2x200m — Classe {classeActive} — Récapitulatif de notation
          </h3>
          <p className="text-[10px] mb-2">
            200m : meilleur temps de l'élève. Relais : {libelleModeNoteRelais(modeNoteRelais)} performances
            du cycle (manches retenues) ; IT : meilleure de ces 2 manches.
          </p>
          <table className="recap-table w-full text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left px-1.5 py-1">Équipe</th>
                <th className="text-left px-1.5 py-1">Élève</th>
                <th className="text-center px-1.5 py-1">Sexe</th>
                <th className="text-center px-1.5 py-1">Meill. 200m</th>
                <th className="text-center px-1.5 py-1">200m/3</th>
                <th className="text-center px-1.5 py-1">Relais (moy.)</th>
                <th className="text-center px-1.5 py-1">Relais/3</th>
                <th className="text-center px-1.5 py-1">IT/3</th>
                <th className="text-center px-1.5 py-1">Perf/3</th>
                <th className="text-center px-1.5 py-1">Posit./4</th>
                <th className="text-center px-1.5 py-1 font-bold">AFLP1/7</th>
                <th className="text-center px-1.5 py-1 font-bold">AFLP2/5</th>
                <th className="text-center px-1.5 py-1 font-bold border-r-2 border-black">Fin séq./12</th>
                <th className="text-center px-1.5 py-1">AFLP4</th>
                <th className="text-center px-1.5 py-1">AFLP5</th>
                <th className="text-center px-1.5 py-1 font-bold">Fil séq./8</th>
                <th className="text-center px-1.5 py-1 font-bold border-l-2 border-black">TOTAL /20</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map(({ equipe, el, perf, total12, total8, total20 }, i) => (
                <tr key={el.id} className="border-b border-black/30">
                  <td className="px-1.5 py-1">{equipe}</td>
                  <td className="px-1.5 py-1 whitespace-nowrap">{el.prenom} {el.nom}</td>
                  <td className="text-center px-1.5 py-1">{el.sexe || "—"}</td>
                  <td className="text-center px-1.5 py-1 tabular">{el.temps200 != null ? (el.temps200 / 1000).toFixed(1) : "—"}</td>
                  <td className="text-center px-1.5 py-1 tabular">{fmt(perf?.note200)}</td>
                  <td className="text-center px-1.5 py-1 tabular">{perf ? formatChrono(perf.relaisChoisiMs) : "—"}</td>
                  <td className="text-center px-1.5 py-1 tabular">{fmt(perf?.noteRelais)}</td>
                  <td className="text-center px-1.5 py-1 tabular">{fmt(perf?.noteIT)}</td>
                  <td className="text-center px-1.5 py-1 tabular">{fmt(perf?.performance, 2)}</td>
                  <td className="text-center px-1.5 py-1 tabular">{fmt(el.aflp1Position)}</td>
                  <td className="text-center px-1.5 py-1 tabular font-bold">
                    {el.aflp1Position != null || perf ? fmt((el.aflp1Position ?? 0) + (perf?.performance ?? 0), 2) : "—"}
                  </td>
                  <td className="text-center px-1.5 py-1 tabular font-bold">{fmt(el.aflp2Note)}</td>
                  <td className="text-center px-1.5 py-1 tabular font-bold border-r-2 border-black">{fmt(total12)}</td>
                  <td className="text-center px-1.5 py-1 tabular">{fmt(el.aflp4Note)}</td>
                  <td className="text-center px-1.5 py-1 tabular">{fmt(el.aflp5Note)}</td>
                  <td className="text-center px-1.5 py-1 tabular font-bold">{fmt(total8)}</td>
                  <td className="text-center px-1.5 py-1 tabular font-bold border-l-2 border-black">{fmt(total20)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="font-bold text-sm mt-6 mb-1">Historique des manches de relais (toutes conservées)</h3>
          <table className="recap-table w-full text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left px-1.5 py-1">Date</th>
                <th className="text-left px-1.5 py-1">Manche</th>
                <th className="text-left px-1.5 py-1">Équipe</th>
                <th className="text-left px-1.5 py-1">Coureurs (ordre de passage) — perf./3 de chacun</th>
                <th className="text-center px-1.5 py-1">Temps</th>
                <th className="text-center px-1.5 py-1">Retenue</th>
              </tr>
            </thead>
            <tbody>
              {[...series]
                .sort((a, b) => new Date(dateManche(a) || 0) - new Date(dateManche(b) || 0))
                .flatMap((s) =>
                  (s.equipeIds || []).map((eqId) => {
                    const c = compositionManche(s, eqId, equipes);
                    const t = s.arrivals?.[eqId];
                    if (!c || typeof t !== "number") return null;
                    return (
                      <tr key={s.id + eqId} className="border-b border-black/30">
                        <td className="px-1.5 py-1 whitespace-nowrap">{formatDateHeure(dateManche(s))}</td>
                        <td className="px-1.5 py-1 whitespace-nowrap">{s.nom}</td>
                        <td className="px-1.5 py-1 whitespace-nowrap">{c.nom}{c.adhoc ? " (jour)" : ""}</td>
                        <td className="px-1.5 py-1">
                          {c.membreIds
                            .map((id, i) => {
                              const m = elevesById[id];
                              if (!m) return `${i + 1}. élève retiré`;
                              const d = detailNoteManche(m, c, elevesById, t);
                              return `${i + 1}. ${m.prenom} ${m.nom}${d ? ` (${d.performance})` : ""}`;
                            })
                            .join(" → ")}
                        </td>
                        <td className="text-center px-1.5 py-1 tabular">{formatChrono(t)}</td>
                        <td className="text-center px-1.5 py-1">{s.retenues?.[eqId] === false ? "non" : "oui"}</td>
                      </tr>
                    );
                  })
                )}
            </tbody>
          </table>

          <h3 className="font-bold text-sm mt-6 mb-1">Historique des tests 200m individuels (meilleur = *)</h3>
          <table className="recap-table w-full text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left px-1.5 py-1">Élève</th>
                <th className="text-left px-1.5 py-1">Tests (date — temps — note /3)</th>
              </tr>
            </thead>
            <tbody>
              {[...eleves]
                .sort((a, b) => (a.nom + a.prenom).localeCompare(b.nom + b.prenom))
                .map((el) => {
                  const hist = historique200(el);
                  const best = meilleurePerf200(hist);
                  return (
                    <tr key={el.id} className="border-b border-black/30">
                      <td className="px-1.5 py-1 whitespace-nowrap">{el.prenom} {el.nom}</td>
                      <td className="px-1.5 py-1">
                        {hist.length === 0
                          ? "—"
                          : [...hist]
                              .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))
                              .map(
                                (h) =>
                                  `${best && h.id === best.id ? "* " : ""}${formatDateHeure(h.date)} — ${(h.temps / 1000).toFixed(1)}s — ${noteTemps200(el, h.temps)}/3${h.archive ? " (archivé)" : ""}`
                              )
                              .join(" ; ")}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
