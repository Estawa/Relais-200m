import React, { useEffect, useRef, useState } from "react";
import { Play, Flag, Square, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { formatChrono } from "../utils/temps";
import { uid } from "../utils/storage";
import { ordreCoureursPourManche } from "../utils/equipes";
import { photoEquipe, compositionManche, dateManche, formatDateHeure } from "../utils/historique";

export default function TabCourse({ equipes, elevesById, series, setSeries }) {
  const [selection, setSelection] = useState([]);
  const [couloirs, setCouloirs] = useState({});
  const [serieActiveId, setSerieActiveId] = useState(null);
  const [serieDepliee, setSerieDepliee] = useState(null);
  const [enCours, setEnCours] = useState(false);
  const [maintenant, setMaintenant] = useState(Date.now());
  const startRef = useRef(null);

  const serieActive = series.find((s) => s.id === serieActiveId) || null;

  useEffect(() => {
    if (!enCours) return;
    const t = setInterval(() => setMaintenant(Date.now()), 100);
    return () => clearInterval(t);
  }, [enCours]);

  // Couloir déjà utilisé par cette équipe sur une manche précédente (elle le garde)
  function dernierCouloirConnu(eqId) {
    for (let i = series.length - 1; i >= 0; i--) {
      if (series[i].couloirs?.[eqId] != null) return series[i].couloirs[eqId];
    }
    return null;
  }

  function toggleSelection(id) {
    setSelection((prev) => {
      const dejaCoche = prev.includes(id);
      const next = dejaCoche ? prev.filter((x) => x !== id) : [...prev, id];
      setCouloirs((c) => {
        const copie = { ...c };
        if (!dejaCoche) {
          const connu = dernierCouloirConnu(id);
          if (connu != null) copie[id] = connu;
          else {
            const utilises = new Set(Object.values(copie));
            let n = 1;
            while (utilises.has(n)) n++;
            copie[id] = n;
          }
        } else {
          delete copie[id];
        }
        return copie;
      });
      return next;
    });
  }

  function changerCouloir(eqId, val) {
    setCouloirs((c) => ({ ...c, [eqId]: parseInt(val, 10) || 0 }));
  }

  function creerSerie() {
    if (selection.length === 0) return;
    const ordreCoureurs = {};
    const compositions = {};
    selection.forEach((eqId) => {
      const eq = equipes.find((e) => e.id === eqId);
      if (!eq) return;
      const nbManchesDejaFaites = series.filter((s) => s.equipeIds.includes(eqId)).length;
      ordreCoureurs[eqId] = ordreCoureursPourManche(eq.membreIds, nbManchesDejaFaites);
      // Photo figée de l'équipe (nom + coureurs dans l'ordre de passage) : c'est elle qui
      // rattache durablement cette performance aux élèves, même si l'équipe change ensuite.
      compositions[eqId] = photoEquipe(eq, ordreCoureurs[eqId]);
    });
    const nouvelle = {
      id: uid(),
      nom: `Manche ${series.length + 1}`,
      creeLe: new Date().toISOString(),
      equipeIds: [...selection],
      couloirs: { ...couloirs },
      ordreCoureurs,
      compositions,
      arrivals: {},
      temoin: {},
      statut: "prete",
    };
    setSeries((prev) => [...prev, nouvelle]);
    setSerieActiveId(nouvelle.id);
    setSelection([]);
    setCouloirs({});
  }

  function demarrer() {
    startRef.current = Date.now();
    setMaintenant(Date.now());
    setEnCours(true);
    const courueLe = new Date().toISOString();
    setSeries((prev) =>
      prev.map((s) => {
        if (s.id !== serieActiveId) return s;
        // Si la composition d'une équipe a été modifiée entre la préparation de la manche et
        // le départ, la photo est remise à jour une dernière fois (sauf si déjà chronométrée).
        const compositions = { ...(s.compositions || {}) };
        const ordreCoureurs = { ...(s.ordreCoureurs || {}) };
        if (s.statut === "prete") {
          s.equipeIds.forEach((eqId) => {
            const eq = equipes.find((e) => e.id === eqId);
            if (!eq) return;
            const ancien = ordreCoureurs[eqId] || [];
            const memeMembres =
              ancien.length === eq.membreIds.length && eq.membreIds.every((id) => ancien.includes(id));
            if (!memeMembres) ordreCoureurs[eqId] = [...eq.membreIds];
            compositions[eqId] = photoEquipe(eq, ordreCoureurs[eqId]);
          });
        }
        return { ...s, statut: "en_cours", courueLe: s.courueLe || courueLe, compositions, ordreCoureurs };
      })
    );
  }

  function pointerArrivee(equipeId) {
    if (!enCours) return;
    const elapsed = Date.now() - startRef.current;
    setSeries((prev) =>
      prev.map((s) => (s.id === serieActiveId ? { ...s, arrivals: { ...s.arrivals, [equipeId]: elapsed } } : s))
    );
  }

  function noterTemoin(equipeId, exchangeIdx, valeur) {
    setSeries((prev) =>
      prev.map((s) => {
        if (s.id !== serieActiveId) return s;
        const scoresActuels = s.temoin[equipeId] || [];
        const scores = [...scoresActuels];
        scores[exchangeIdx] = valeur === "" ? null : parseFloat(valeur);
        return { ...s, temoin: { ...s.temoin, [equipeId]: scores } };
      })
    );
  }

  function terminerSerie() {
    setEnCours(false);
    setSeries((prev) => prev.map((s) => (s.id === serieActiveId ? { ...s, statut: "terminee" } : s)));
    setSerieActiveId(null);
  }

  function supprimerSerie(id) {
    if (!confirm("Supprimer DÉFINITIVEMENT cette manche et ses temps enregistrés ? Elle disparaîtra de l'historique de tous les élèves concernés.")) return;
    setSeries((prev) => prev.filter((s) => s.id !== id));
  }

  const chronoMs = enCours ? maintenant - startRef.current : 0;

  if (serieActive) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl tracking-wide">{serieActive.nom}</h2>
          <button onClick={terminerSerie} className="flex items-center gap-2 text-sm text-piste-craie/50 hover:text-piste-brique">
            <Square size={14} /> Terminer la manche
          </button>
        </div>

        <div className="bg-piste-panneau rounded-xl border border-white/10 p-6 text-center mb-6">
          <div className="font-display text-6xl sm:text-7xl tabular text-piste-ambre tracking-wider">
            {formatChrono(enCours ? chronoMs : 0)}
          </div>
          {!enCours && serieActive.statut !== "terminee" && (
            <button
              onClick={demarrer}
              className="mt-4 inline-flex items-center gap-2 bg-piste-brique hover:bg-piste-briqueclair px-6 py-3 rounded-full font-display text-xl tracking-wide"
            >
              <Play size={20} /> Départ
            </button>
          )}
        </div>

        <div className="space-y-3">
          {[...serieActive.equipeIds]
            .sort((a, b) => (serieActive.couloirs?.[a] || 0) - (serieActive.couloirs?.[b] || 0))
            .map((eqId) => {
              const eq = compositionManche(serieActive, eqId, equipes);
              if (!eq) return null;
              const ordre = eq.membreIds;
              const arrivee = serieActive.arrivals[eqId];
              const nbEchanges = Math.max(ordre.length - 1, 0);
              const scores = serieActive.temoin[eqId] || [];
              return (
                <div key={eqId} className="bg-piste-panneau/60 rounded-lg border border-white/5 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-display text-lg tracking-wide">
                        <span className="text-piste-ambre">Couloir {serieActive.couloirs?.[eqId] ?? "?"}</span> ·{" "}
                        {eq.nom}
                        {eq.adhoc && <span className="ml-1.5 text-[10px] text-piste-ambre align-middle">(jour)</span>}
                      </div>
                      <div className="text-xs text-piste-craie/40">
                        {ordre
                          .map((id, i) => `${i === 0 ? "Départ" : i === ordre.length - 1 ? "Arrivée" : "Relais"} : ${elevesById[id]?.prenom || "?"}`)
                          .join(" → ")}
                      </div>
                    </div>
                    {arrivee != null ? (
                      <span className="font-display text-2xl tabular text-piste-pelouse">{formatChrono(arrivee)}</span>
                    ) : (
                      <button
                        onClick={() => pointerArrivee(eqId)}
                        disabled={!enCours}
                        className="flex items-center gap-2 bg-piste-ambre disabled:opacity-30 text-piste-nuit font-semibold px-4 py-2 rounded-full text-sm"
                      >
                        <Flag size={15} /> Arrivée
                      </button>
                    )}
                  </div>
                  {arrivee != null && nbEchanges > 0 && (
                    <div className="flex flex-wrap gap-3 mt-2 pt-2 border-t border-white/5">
                      {Array.from({ length: nbEchanges }).map((_, i) => (
                        <label key={i} className="text-xs text-piste-craie/40 flex items-center gap-1.5">
                          Passage {i + 1} (note /4) :
                          <input
                            type="number"
                            min="0"
                            max="4"
                            step="0.5"
                            defaultValue={scores[i] ?? ""}
                            onBlur={(ev) => noterTemoin(eqId, i, ev.target.value)}
                            className="bg-piste-nuit/60 rounded px-2 py-1 w-14 tabular focus:outline-none"
                          />
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl tracking-wide mb-2">Évaluation</h2>
      <p className="text-xs text-piste-craie/40 mb-5">
        Sélectionne les équipes de niveau proche qui courent ensemble dans cette manche. Chaque équipe garde le
        même couloir d'une course à l'autre ; en revanche l'ordre de passage de ses coureurs (qui part, qui
        relaye, qui termine) tourne automatiquement à chaque nouvelle manche.
      </p>

      {equipes.length === 0 ? (
        <div className="text-piste-craie/50 text-sm border border-dashed border-white/10 rounded-lg p-8 text-center">
          Constitue d'abord les équipes dans l'onglet Équipes.
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-2 mb-5">
            {equipes.map((eq) => {
              const coche = selection.includes(eq.id);
              const nbManchesDejaFaites = series.filter((s) => s.equipeIds.includes(eq.id)).length;
              const ordreApercu = ordreCoureursPourManche(eq.membreIds, nbManchesDejaFaites);
              const noms = ordreApercu.map((id) => elevesById[id]?.prenom).filter(Boolean).join(" → ");
              return (
                <label
                  key={eq.id}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer ${
                    coche ? "border-piste-brique bg-piste-panneau" : "border-white/10 bg-piste-panneau/40"
                  }`}
                >
                  <input type="checkbox" checked={coche} onChange={() => toggleSelection(eq.id)} className="accent-piste-brique" />
                  <div className="flex-1">
                    <div className="font-display text-lg tracking-wide leading-none">
                      {eq.nom}
                      {eq.adhoc && <span className="ml-1.5 text-[10px] text-piste-ambre align-middle">(jour)</span>}
                    </div>
                    <div className="text-xs text-piste-craie/40">{noms}</div>
                  </div>
                  {coche && (
                    <label className="flex items-center gap-1 text-xs text-piste-craie/50" onClick={(e) => e.stopPropagation()}>
                      Couloir
                      <input
                        type="number"
                        min="1"
                        value={couloirs[eq.id] ?? ""}
                        onChange={(ev) => changerCouloir(eq.id, ev.target.value)}
                        className="bg-piste-nuit/60 rounded px-2 py-1 w-12 tabular focus:outline-none"
                      />
                    </label>
                  )}
                </label>
              );
            })}
          </div>

          <button
            onClick={creerSerie}
            disabled={selection.length === 0}
            className="flex items-center gap-2 bg-piste-brique hover:bg-piste-briqueclair disabled:opacity-30 px-4 py-2 rounded font-display text-lg tracking-wide"
          >
            <Play size={18} /> Lancer cette manche ({selection.length} équipe{selection.length > 1 ? "s" : ""})
          </button>
        </>
      )}

      {series.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xs uppercase text-piste-craie/40 mb-2">
            Historique des manches ({series.length}) — toutes conservées
          </h3>
          <div className="space-y-1">
            {[...series]
              .sort((a, b) => new Date(dateManche(b) || 0) - new Date(dateManche(a) || 0))
              .map((s) => {
                const ouverte = serieDepliee === s.id;
                return (
                  <div key={s.id} className="bg-piste-panneau/40 rounded">
                    <div className="flex items-center justify-between text-sm px-3 py-2">
                      <button
                        onClick={() => setSerieDepliee(ouverte ? null : s.id)}
                        className="flex items-center gap-1.5 text-left"
                      >
                        {ouverte ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        <span>
                          {s.nom} · <span className="text-piste-craie/60">{formatDateHeure(dateManche(s))}</span> ·{" "}
                          {s.equipeIds.length} équipe(s) ·{" "}
                          <span className="text-piste-craie/40">{s.statut === "terminee" ? "terminée" : "en attente"}</span>
                        </span>
                      </button>
                      <div className="flex items-center gap-3">
                        {s.statut !== "terminee" && (
                          <button onClick={() => setSerieActiveId(s.id)} className="text-piste-ambre text-xs font-semibold">
                            Reprendre
                          </button>
                        )}
                        <button onClick={() => supprimerSerie(s.id)} className="text-piste-craie/30 hover:text-piste-brique">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {ouverte && (
                      <div className="px-3 pb-3 space-y-1.5">
                        {[...s.equipeIds]
                          .sort((a, b) => (s.couloirs?.[a] || 0) - (s.couloirs?.[b] || 0))
                          .map((eqId) => {
                            const c = compositionManche(s, eqId, equipes);
                            if (!c) return null;
                            const t = s.arrivals?.[eqId];
                            const scores = (s.temoin?.[eqId] || []).filter((v) => typeof v === "number");
                            return (
                              <div key={eqId} className="text-xs border-t border-white/5 pt-1.5">
                                <div className="flex justify-between">
                                  <span className="font-semibold">
                                    Couloir {s.couloirs?.[eqId] ?? "?"} · {c.nom}
                                    {c.adhoc ? " (jour)" : ""}
                                  </span>
                                  <span className="tabular text-piste-pelouse">{typeof t === "number" ? formatChrono(t) : "—"}</span>
                                </div>
                                <div className="text-piste-craie/50">
                                  {c.membreIds
                                    .map((id, i) => `${i + 1}. ${elevesById[id] ? `${elevesById[id].prenom} ${elevesById[id].nom}` : "élève retiré"}`)
                                    .join(" → ")}
                                </div>
                                {scores.length > 0 && (
                                  <div className="text-piste-craie/40">Témoin : {scores.join(" / ")} (sur 4 par passage)</div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
