import React from "react";
import { Minus, Plus } from "lucide-react";
import {
  REPARTITIONS_8PTS,
  repartitionParId,
  plageAflp,
  DEGRES_AFLP4,
  DEGRES_AFLP5,
  REPARTITIONS_GT,
  repartitionGTParId,
  pointsFixesGT,
  ROLES_AFL3,
  DEGRES_AFL2,
  noteAfl3,
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

// ---------- Bac GT : AFL 2 + AFL 3, points fixes par degré ----------
function BoutonsDegre({ degre, descriptions, onChoisir, pointsAlloues }) {
  return (
    <div className="flex flex-wrap gap-1">
      {[1, 2, 3, 4].map((d) => (
        <button
          key={d}
          title={descriptions[d - 1]}
          onClick={() => onChoisir(degre === d ? null : d)}
          className={`px-2 py-1 rounded text-xs border ${
            degre === d
              ? "border-piste-brique bg-piste-brique/20 text-piste-craie"
              : "border-white/10 text-piste-craie/50"
          }`}
        >
          D{d} · {pointsFixesGT(pointsAlloues, d)}
        </button>
      ))}
    </div>
  );
}

function CarteEleveGT({ el, setEleves }) {
  const rep = repartitionGTParId(el.filRepartitionGTId);
  const roles = el.afl3Roles || {};
  const rolesChoisis = Object.keys(roles);

  function maj(fn) {
    setEleves((prev) => prev.map((e) => (e.id === el.id ? fn(e) : e)));
  }

  function choisirRepartition(id) {
    const r = repartitionGTParId(id);
    maj((e) => ({
      ...e,
      filRepartitionGTId: id,
      afl2Note: e.afl2Degre ? pointsFixesGT(r.afl2, e.afl2Degre) : e.afl2Note ?? null,
      afl3Note: noteAfl3(e.afl3Roles, r.afl3),
    }));
  }

  function choisirDegreAfl2(d) {
    maj((e) => ({ ...e, afl2Degre: d, afl2Note: d ? pointsFixesGT(rep.afl2, d) : null }));
  }

  function basculerRole(roleId) {
    maj((e) => {
      const r = { ...(e.afl3Roles || {}) };
      if (roleId in r) delete r[roleId];
      else if (Object.keys(r).length < 2) r[roleId] = null;
      else return e;
      return { ...e, afl3Roles: r, afl3Note: noteAfl3(r, rep.afl3) };
    });
  }

  function choisirDegreRole(roleId, d) {
    maj((e) => {
      const r = { ...(e.afl3Roles || {}), [roleId]: d };
      return { ...e, afl3Roles: r, afl3Note: noteAfl3(r, rep.afl3) };
    });
  }

  const total = (el.afl2Note ?? 0) + (el.afl3Note ?? 0);
  const totalSaisi = el.afl2Note != null || el.afl3Note != null;

  return (
    <div className="bg-piste-panneau rounded-lg border border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold">
          {el.prenom} {el.nom}
        </span>
        <span className="font-display text-xl text-piste-ambre tabular">
          {totalSaisi ? `${Math.round(total * 100) / 100} / 8` : "— / 8"}
        </span>
      </div>

      <label className="flex items-center gap-2 text-xs mb-3">
        <span className="text-piste-craie/50">Répartition choisie</span>
        <select
          value={el.filRepartitionGTId || "4-4"}
          onChange={(ev) => choisirRepartition(ev.target.value)}
          className="bg-piste-nuit/60 border border-white/10 rounded px-2 py-1"
        >
          {REPARTITIONS_GT.map((r) => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
      </label>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-piste-craie/50 mb-1">
            AFL 2 — S'entraîner (carnet, données) <span className="text-piste-craie/30">(/{rep.afl2} pts)</span>
          </div>
          <BoutonsDegre degre={el.afl2Degre} descriptions={DEGRES_AFL2} pointsAlloues={rep.afl2} onChoisir={choisirDegreAfl2} />
          <div className="text-[11px] text-piste-craie/40 mt-1">
            {el.afl2Degre ? DEGRES_AFL2[el.afl2Degre - 1] : "Choisis le degré atteint."}
          </div>
        </div>
        <div>
          <div className="text-xs text-piste-craie/50 mb-1">
            AFL 3 — 2 rôles parmi 4 <span className="text-piste-craie/30">(/{rep.afl3} pts, moyenne des 2 rôles)</span>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {ROLES_AFL3.map((r) => {
              const actif = rolesChoisis.includes(r.id);
              const bloque = !actif && rolesChoisis.length >= 2;
              return (
                <button
                  key={r.id}
                  disabled={bloque}
                  onClick={() => basculerRole(r.id)}
                  className={`px-2 py-1 rounded-full text-xs border ${
                    actif
                      ? "border-piste-pelouse bg-piste-pelouse/15 text-piste-craie"
                      : "border-white/10 text-piste-craie/50 disabled:opacity-30"
                  }`}
                >
                  {r.libelle}
                </button>
              );
            })}
          </div>
          <div className="space-y-2">
            {ROLES_AFL3.filter((r) => rolesChoisis.includes(r.id)).map((r) => (
              <div key={r.id}>
                <div className="text-[11px] text-piste-craie/60 mb-0.5">{r.libelle}</div>
                <BoutonsDegre
                  degre={roles[r.id]}
                  descriptions={r.degres}
                  pointsAlloues={rep.afl3}
                  onChoisir={(d) => choisirDegreRole(r.id, d)}
                />
                {roles[r.id] && <div className="text-[11px] text-piste-craie/40 mt-0.5">{r.degres[roles[r.id] - 1]}</div>}
              </div>
            ))}
          </div>
          {el.afl3Note != null && (
            <div className="text-xs text-piste-ambre mt-1.5 tabular">AFL 3 : {el.afl3Note} / {rep.afl3}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TabRoles({ eleves, setEleves, typeBac }) {
  const gt = typeBac === "gt";
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
        pour juger le degré atteint {gt ? "dans les rôles de l'AFL 3" : "sur l'AFLP 4"} ci-dessous.
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

          {gt ? (
            <>
              <h3 className="font-display text-xl tracking-wide mb-2">Fil de séquence Bac GT — AFL 2 &amp; AFL 3 (/8 pts)</h3>
              <p className="text-xs text-piste-craie/40 mb-4">
                Répartition des 8 points au choix de l'élève (à l'issue de la 4e séance), puis degré atteint. Points
                fixes par degré : sur 2 → 0,5 / 1 / 1,5 / 2 ; sur 4 → 1 / 2 / 3 / 4 ; sur 6 → 1,5 / 3 / 4,5 / 6.
                AFL 3 : 2 rôles parmi starter, chronométreur, juge de zone et coach-observateur.
              </p>
              <div className="space-y-4">
                {eleves.map((el) => (
                  <CarteEleveGT key={el.id} el={el} setEleves={setEleves} />
                ))}
              </div>
            </>
          ) : (
          <>
          <h3 className="font-display text-xl tracking-wide mb-2">Fil de séquence Bac Pro — AFLP 4 &amp; AFLP 5 (/8 pts)</h3>
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
        </>
      )}
    </div>
  );
}
