import React from "react";
import { formatChrono } from "../utils/temps";
import { calculerNote, tempsEquivalentBareme } from "../utils/notation";

export default function TabResultats({ equipes, elevesById, series, bareme }) {
  const bonneNoteDispo = bareme.filles.length > 0 || bareme.garcons.length > 0;
  const manchesTerminees = series.filter((s) => s.statut === "terminee");

  const parEquipe = equipes
    .map((eq) => {
      const temps = [];
      const temoinScores = [];
      manchesTerminees.forEach((s) => {
        const t = s.arrivals[eq.id];
        if (t != null) temps.push(t);
        (s.temoin[eq.id] || []).forEach((sc) => {
          if (typeof sc === "number") temoinScores.push(sc);
        });
      });
      if (temps.length === 0) return null;
      const moyenne = temps.reduce((a, b) => a + b, 0) / temps.length;
      const moyenneEquivalente = tempsEquivalentBareme(moyenne, eq.membreIds.length);
      const totalTemoin = temoinScores.length > 0 ? temoinScores.reduce((a, b) => a + b, 0) : null;
      return { equipe: eq, temps, moyenne, moyenneEquivalente, totalTemoin };
    })
    .filter(Boolean)
    .sort((a, b) => a.moyenne - b.moyenne);

  return (
    <div>
      <h2 className="font-display text-2xl tracking-wide mb-2">Résultats</h2>
      <p className="text-xs text-piste-craie/40 mb-5">
        Classement par équipe, moyenne des 2 courses. Pour les trinômes, la note est calculée sur un temps ramené
        à un équivalent binôme (règle de trois).
      </p>

      {!bonneNoteDispo && (
        <div className="text-xs bg-piste-ambre/10 border border-piste-ambre/30 text-piste-ambre rounded-lg px-4 py-3 mb-5">
          Barème non configuré : les temps sont affichés sans note. Renseigne le barème dans l'onglet correspondant
          pour afficher les notes.
        </div>
      )}

      {parEquipe.length === 0 ? (
        <div className="text-piste-craie/50 text-sm border border-dashed border-white/10 rounded-lg p-8 text-center">
          Aucune arrivée enregistrée pour l'instant.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-piste-panneau text-piste-craie/50 text-xs uppercase">
              <tr>
                <th className="text-left px-3 py-2">Rang</th>
                <th className="text-left px-3 py-2">Équipe</th>
                <th className="text-left px-3 py-2">Composition &amp; note</th>
                <th className="text-left px-3 py-2">Courses</th>
                <th className="text-left px-3 py-2">Moyenne</th>
                <th className="text-left px-3 py-2">Témoin</th>
              </tr>
            </thead>
            <tbody>
              {parEquipe.map((ligne, idx) => (
                <tr key={ligne.equipe.id} className="border-t border-white/5">
                  <td className="px-3 py-2 font-display text-lg text-piste-ambre">{idx + 1}</td>
                  <td className="px-3 py-2 font-display text-lg tracking-wide">{ligne.equipe.nom}</td>
                  <td className="px-3 py-2">
                    <ul>
                      {ligne.equipe.membreIds.map((id) => {
                        const el = elevesById[id];
                        if (!el) return null;
                        const bar = el.sexe === "F" ? bareme.filles : bareme.garcons;
                        const note = calculerNote(ligne.moyenneEquivalente, bar);
                        return (
                          <li key={id} className="flex items-center gap-2">
                            <span>
                              {el.prenom} {el.nom}
                            </span>
                            {note != null && <span className="text-piste-pelouse font-semibold text-xs">{note}/20</span>}
                          </li>
                        );
                      })}
                    </ul>
                  </td>
                  <td className="px-3 py-2 tabular text-piste-craie/50">
                    {ligne.temps.map((t) => formatChrono(t)).join(" · ")}
                  </td>
                  <td className="px-3 py-2 tabular font-display text-xl">
                    {formatChrono(ligne.moyenne)}
                    {ligne.equipe.membreIds.length === 3 && (
                      <div className="text-xs text-piste-craie/30 font-body">
                        ≈ {formatChrono(ligne.moyenneEquivalente)} en équivalent binôme
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 tabular text-piste-craie/50">
                    {ligne.totalTemoin != null ? `${ligne.totalTemoin}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
