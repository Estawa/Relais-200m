import React, { useEffect, useRef, useState } from "react";
import { Play, Flag, Check, RotateCcw, Square } from "lucide-react";
import { formatChrono } from "../utils/temps";

export default function TestSerie({ eleves, setEleves }) {
  const [phase, setPhase] = useState("config"); // config | chrono | attribution
  const [arrivals, setArrivals] = useState([]);
  const [attributions, setAttributions] = useState([]);
  const [maintenant, setMaintenant] = useState(Date.now());
  const startRef = useRef(null);

  useEffect(() => {
    if (phase !== "chrono") return;
    const t = setInterval(() => setMaintenant(Date.now()), 100);
    return () => clearInterval(t);
  }, [phase]);

  function demarrer() {
    startRef.current = Date.now();
    setArrivals([]);
    setPhase("chrono");
  }

  function pointerArrivee() {
    const elapsed = Date.now() - startRef.current;
    setArrivals((prev) => [...prev, elapsed]);
  }

  function terminerSerie() {
    if (arrivals.length === 0) {
      setPhase("config");
      return;
    }
    setAttributions(new Array(arrivals.length).fill(""));
    setPhase("attribution");
  }

  function annulerSerie() {
    setPhase("config");
    setArrivals([]);
  }

  function choisir(rangIdx, eleveId) {
    setAttributions((prev) => prev.map((v, i) => (i === rangIdx ? eleveId : v)));
  }

  function validerAttribution() {
    setEleves((prev) =>
      prev.map((el) => {
        const idx = attributions.findIndex((id) => id === el.id);
        if (idx === -1) return el;
        return { ...el, temps200: arrivals[idx] };
      })
    );
    setPhase("config");
    setArrivals([]);
    setAttributions([]);
  }

  const dejaChoisis = new Set(attributions.filter(Boolean));

  if (phase === "chrono") {
    return (
      <div className="bg-piste-panneau rounded-xl border border-white/10 p-6 text-center mb-6">
        <p className="text-xs text-piste-craie/40 mb-2">
          Touche « Arrivée » à chaque fois qu'un élève franchit la ligne, peu importe combien sont partis ensemble.
          Tu attribueras les noms une fois tout le monde arrivé.
        </p>
        <div className="font-display text-6xl sm:text-7xl tabular text-piste-ambre tracking-wider mb-4">
          {formatChrono(maintenant - startRef.current)}
        </div>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={pointerArrivee}
            className="flex items-center gap-2 bg-piste-ambre text-piste-nuit font-semibold px-6 py-3 rounded-full font-display text-xl tracking-wide"
          >
            <Flag size={20} /> Arrivée ({arrivals.length})
          </button>
          <button
            onClick={terminerSerie}
            disabled={arrivals.length === 0}
            className="flex items-center gap-2 bg-piste-brique disabled:opacity-30 px-4 py-2.5 rounded-full text-sm font-semibold"
          >
            <Square size={14} /> Terminer la série
          </button>
          <button onClick={annulerSerie} className="text-piste-craie/40 hover:text-piste-brique text-sm flex items-center gap-1">
            <RotateCcw size={14} /> Annuler
          </button>
        </div>
      </div>
    );
  }

  if (phase === "attribution") {
    return (
      <div className="bg-piste-panneau rounded-xl border border-white/10 p-5 mb-6">
        <h3 className="font-display text-xl tracking-wide mb-1">Qui est arrivé à chaque place ?</h3>
        <p className="text-xs text-piste-craie/40 mb-4">
          {arrivals.length} arrivée(s) enregistrée(s) sur cette série, du plus rapide au plus lent. Choisis le nom
          de chaque élève.
        </p>
        <div className="space-y-2 mb-4">
          {arrivals.map((t, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="font-display text-lg text-piste-ambre w-6">{idx + 1}</span>
              <span className="tabular text-piste-craie/60 w-16">{formatChrono(t)}</span>
              <select
                value={attributions[idx] || ""}
                onChange={(ev) => choisir(idx, ev.target.value)}
                className="flex-1 bg-piste-nuit/60 rounded px-2 py-1.5 text-sm focus:outline-none"
              >
                <option value="">— choisir un élève —</option>
                {eleves.map((el) => (
                  <option
                    key={el.id}
                    value={el.id}
                    disabled={dejaChoisis.has(el.id) && attributions[idx] !== el.id}
                  >
                    {el.prenom} {el.nom} {el.classe ? `(${el.classe})` : ""}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={validerAttribution}
            disabled={attributions.some((a) => !a)}
            className="flex items-center gap-2 bg-piste-brique hover:bg-piste-briqueclair disabled:opacity-30 px-4 py-2 rounded font-semibold text-sm"
          >
            <Check size={16} /> Enregistrer les temps
          </button>
          <button onClick={annulerSerie} className="text-piste-craie/40 hover:text-piste-brique text-sm">
            Annuler cette série
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-piste-panneau rounded-xl border border-white/10 p-5 mb-6">
      <h3 className="font-display text-xl tracking-wide mb-1">Test individuel 200m</h3>
      <p className="text-xs text-piste-craie/40 mb-4">
        Un seul chrono, peu importe le nombre d'élèves sur la ligne de départ. Tu pointes chaque arrivée au fil de
        l'eau, et tu identifies les élèves une fois la série terminée.
      </p>
      <button
        onClick={demarrer}
        className="flex items-center gap-2 bg-piste-brique hover:bg-piste-briqueclair px-4 py-2 rounded font-display text-lg tracking-wide"
      >
        <Play size={18} /> Départ de la série
      </button>
    </div>
  );
}
