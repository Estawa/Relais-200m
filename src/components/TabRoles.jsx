import React from "react";
import { Minus, Plus } from "lucide-react";
import {
  REPARTITIONS_8PTS,
  repartitionParId,
  plageAflp,
  DEGRES_AFLP4,
  DEGRES_AFLP5,
} from "../utils/filSequence";

function Compteur({ valeur, onChange }) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onChange(Math.max(0, (valeur || 0) - 1))}
        className="w-6 h-6 flex items-center justify-center rounded bg-piste-nuit/60 text-piste-craie/60 hover:text-piste-brique"
      >
        <Minus size={12} />
      </button>
      <span className="tabular w-4 text-center">{valeur || 0}</span>
      <button
        onClick={() => onChange((valeur || 0) + 1)}
        className="w-6 h-6 flex items-center justify-center rounded bg-piste-nuit/60 text-piste-craie/60 hover:text-piste-pelouse"
      >
        <Plus size={12} />
      </button>
    </div>
  );
}

// Sélecteur de degré (1-4) + saisie de la note dans la plage correspondante, pour un AFLP.
function BlocAflp({ titre, pointsAlloues, degre, note, descriptions, onChoisirDegre, onChangerNote }) {
  const plage = plageAflp(pointsAlloues, degre);
  return (
    <div>
      <div className="text-xs text-piste-craie/50 mb-1">
        {titre} <span className="text-piste-craie/30">(/{pointsAlloues} pts)</span>
      </div>
      <div className="flex flex-wrap gap-1 mb-1.5">
        {[1, 2, 3, 4].map((d) => (
          <button
            key={d}
            title={descriptions[d - 1]}
            onClick={() => onChoisirDegre(d)}
            className={`px-2 py-1 rounded text-xs border ${
              degre === d
                ? "border-piste-brique bg-piste-brique/20 text-piste-craie"
                : "border-white/10 text-piste-craie/50"
            }`}
          >
            Degré {d}
          </button>
        ))}
      </div>
      {plage && (
        <div className="flex items-center gap-1.5 text-xs">
          <input
            key={`${pointsAlloues}-${degre}`}
            type="number"
            step="0.1"
            min={plage[0]}
            max={plage[1]}
            defaultValue={note ?? plage[1]}
            onBlur={(ev) => onChangerNote(ev.target.value, plage)}
            className="bg-piste-nuit/60 border border-white/10 rounded px-2 py-1 w-16 tabular focus:outline-none"
          />
          <span className="text-piste-craie/30">
            / {pointsAlloues} (plage degré {degre} : {plage[0]} à {plage[1]})
          </span>
        </div>
      )}
    </div>
  );
}

export default function TabRoles({ eleves, setEleves }) {
  function modifier(id, champ, valeur) {
    setEleves((prev) => prev.map((el) => (el.id === id ? { ...el, [champ]: valeur } : el)));
  }

  function choisirRepartition(id, repartitionId) {
    const rep = repartitionParId(repartitionId);
    setEleves((prev) =>
      prev.map((el) => {
        if (el.id !== id) return el;
        const plage4 = plageAflp(rep.aflp4, el.aflp4Degre);
        const plage5 = plageAflp(rep.aflp5, el.aflp5Degre);
        return {
          ...el,
          filRepartitionId: repartitionId,
          aflp4Note: plage4 ? Math.min(el.aflp4Note ?? plage4[1], plage4[1]) : el.aflp4Note,
          aflp5Note: plage5 ? Math.min(el.aflp5Note ?? plage5[1], plage5[1]) : el.aflp5Note,
        };
      })
    );
  }

  function choisirDegre(id, prefix, degre, pointsAlloues) {
    const plage = plageAflp(pointsAlloues, degre);
    setEleves((prev) =>
      prev.map((el) =>
        el.id === id ? { ...el, [`${prefix}Degre`]: degre, [`${prefix}Note`]: plage ? plage[1] : el[`${prefix}Note`] } : el
      )
    );
  }

  function changerNote(id, champ, valeurBrute, plage) {
    let v = parseFloat(String(valeurBrute).replace(",", "."));
    if (Number.isNaN(v)) v = null;
    else if (plage) v = Math.round(Math.min(plage[1], Math.max(plage[0], v)) * 10) / 10;
    modifier(id, champ, v);
  }

  return (
    <div>
      <h2 className="font-display text-2xl tracking-wide mb-2">Rôles &amp; rangement</h2>
      <p className="text-xs text-piste-craie/40 mb-5">
        Sur l'ensemble du cycle, chaque élève doit être passé au moins une fois starter et une fois juge de passage
        de témoin ; le rangement du matériel est également valorisé. Ce suivi te permet de ne pas en perdre le fil
        pour juger le degré atteint sur l'AFLP 4 ci-dessous.
      </p>

      {eleves.length === 0 ? (
        <div className="text-piste-craie/50 text-sm border border-dashed border-white/10 rounded-lg p-8 text-center">
          Aucun élève pour l'instant.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-white/10 mb-6">
            <table className="w-full text-sm">
              <thead className="bg-piste-panneau text-piste-craie/50 text-xs uppercase">
                <tr>
                  <th className="text-left px-3 py-2">Élève</th>
                  <th className="text-left px-3 py-2">Starter</th>
                  <th className="text-left px-3 py-2">Juge témoin</th>
                  <th className="text-left px-3 py-2">Rangement</th>
                </tr>
              </thead>
              <tbody>
                {eleves.map((el) => (
                  <tr key={el.id} className="border-t border-white/5">
                    <td className="px-3 py-2">
                      {el.prenom} {el.nom}
                    </td>
                    <td className="px-3 py-2">
                      <Compteur valeur={el.nbStarter} onChange={(v) => modifier(el.id, "nbStarter", v)} />
                    </td>
                    <td className="px-3 py-2">
                      <Compteur valeur={el.nbJugeTemoin} onChange={(v) => modifier(el.id, "nbJugeTemoin", v)} />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={!!el.rangementFait}
                        onChange={(ev) => modifier(el.id, "rangementFait", ev.target.checked)}
                        className="accent-piste-pelouse w-4 h-4"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="font-display text-xl tracking-wide mb-2">Fil de séquence — AFLP 4 &amp; AFLP 5 (/8 pts)</h3>
          <p className="text-xs text-piste-craie/40 mb-4">
            Répartition des 8 points au choix de l'élève, puis degré atteint (1 à 4) pour chacun des 2 AFLP, dans la
            plage de points correspondante.
          </p>

          <div className="space-y-4">
            {eleves.map((el) => {
              const rep = repartitionParId(el.filRepartitionId);
              const total = (el.aflp4Note ?? 0) + (el.aflp5Note ?? 0);
              const totalSaisi = el.aflp4Note != null || el.aflp5Note != null;
              return (
                <div key={el.id} className="bg-piste-panneau rounded-lg border border-white/10 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold">
                      {el.prenom} {el.nom}
                    </span>
                    <span className="font-display text-xl text-piste-ambre tabular">
                      {totalSaisi ? `${Math.round(total * 10) / 10} / 8` : "— / 8"}
                    </span>
                  </div>

                  <label className="flex items-center gap-2 text-xs mb-3">
                    <span className="text-piste-craie/50">Répartition choisie</span>
                    <select
                      value={el.filRepartitionId || "4-4"}
                      onChange={(ev) => choisirRepartition(el.id, ev.target.value)}
                      className="bg-piste-nuit/60 border border-white/10 rounded px-2 py-1"
                    >
                      {REPARTITIONS_8PTS.map((r) => (
                        <option key={r.id} value={r.id}>{r.label}</option>
                      ))}
                    </select>
                  </label>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <BlocAflp
                      titre="AFLP 4 — Rôles sociaux"
                      pointsAlloues={rep.aflp4}
                      degre={el.aflp4Degre}
                      note={el.aflp4Note}
                      descriptions={DEGRES_AFLP4}
                      onChoisirDegre={(d) => choisirDegre(el.id, "aflp4", d, rep.aflp4)}
                      onChangerNote={(v, plage) => changerNote(el.id, "aflp4Note", v, plage)}
                    />
                    <BlocAflp
                      titre="AFLP 5 — Préparation autonome"
                      pointsAlloues={rep.aflp5}
                      degre={el.aflp5Degre}
                      note={el.aflp5Note}
                      descriptions={DEGRES_AFLP5}
                      onChoisirDegre={(d) => choisirDegre(el.id, "aflp5", d, rep.aflp5)}
                      onChangerNote={(v, plage) => changerNote(el.id, "aflp5Note", v, plage)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
