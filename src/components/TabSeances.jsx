import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SEANCES, ECHAUFFEMENT_TYPE, THEMES } from "../data/seances";
import SchemaDistances from "./SchemaDistances";

function Badge({ children }) {
  return (
    <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full bg-piste-ambre/15 text-piste-ambre border border-piste-ambre/30">
      {children}
    </span>
  );
}

function FicheEchauffement({ ouverte, onToggle }) {
  return (
    <div className="rounded-lg border border-white/10 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-piste-panneau text-left"
      >
        <div>
          <div className="font-display text-lg tracking-wide">{ECHAUFFEMENT_TYPE.titre}</div>
          <div className="text-[11px] text-piste-craie/40 mt-0.5">{ECHAUFFEMENT_TYPE.duree}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge>Échauffement</Badge>
          {ouverte ? <ChevronUp size={18} className="text-piste-craie/50" /> : <ChevronDown size={18} className="text-piste-craie/50" />}
        </div>
      </button>
      {ouverte && (
        <div className="px-4 py-3 bg-piste-nuit/30 text-sm space-y-3">
          <p className="text-piste-craie/70">{ECHAUFFEMENT_TYPE.intro}</p>
          {ECHAUFFEMENT_TYPE.sections.map((s) => (
            <div key={s.titre}>
              <div className="font-semibold text-piste-craie/90 mb-1">{s.titre}</div>
              <ul className="list-disc list-inside space-y-1 text-piste-craie/70">
                {s.points.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
              {s.note && <p className="text-piste-craie/40 text-xs italic mt-1">{s.note}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FicheSeance({ seance, ouverte, onToggle }) {
  return (
    <div className="rounded-lg border border-white/10 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-piste-panneau text-left"
      >
        <div>
          <div className="font-display text-lg tracking-wide">
            Séance {seance.id} — {seance.titre}
          </div>
          <div className="text-[11px] text-piste-craie/40 mt-0.5">1h30</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {seance.themes.map((t) => <Badge key={t}>{t}</Badge>)}
          {ouverte ? <ChevronUp size={18} className="text-piste-craie/50" /> : <ChevronDown size={18} className="text-piste-craie/50" />}
        </div>
      </button>
      {ouverte && (
        <div className="px-4 py-3 bg-piste-nuit/30 text-sm space-y-3">
          <div>
            <div className="font-semibold text-piste-craie/90 mb-1">Objectifs</div>
            <p className="text-piste-craie/70">{seance.objectifs}</p>
          </div>
          <div>
            <div className="font-semibold text-piste-craie/90 mb-1">Déroulé</div>
            <ul className="list-disc list-inside space-y-1 text-piste-craie/70">
              {seance.deroule.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>
          {seance.schema && (
            <div>
              <div className="font-semibold text-piste-craie/90 mb-1">Schéma des distances (course en 3 x 50 m)</div>
              <SchemaDistances />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TabSeances() {
  const [themesActifs, setThemesActifs] = useState([]);
  const [ouvertes, setOuvertes] = useState({});

  function toggleTheme(t) {
    setThemesActifs((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }
  function toggleFiche(id) {
    setOuvertes((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const seancesFiltrees = useMemo(() => {
    if (themesActifs.length === 0) return SEANCES;
    return SEANCES.filter((s) => s.themes.some((t) => themesActifs.includes(t)));
  }, [themesActifs]);

  const afficherEchauffement = themesActifs.length === 0 || themesActifs.includes("Échauffement");

  return (
    <div>
      <h2 className="font-display text-2xl tracking-wide mb-1">Bibliothèque de séances</h2>
      <p className="text-xs text-piste-craie/40 mb-4">
        Cycle Relais 2x200m — 10 séances de 1h30, consultables hors-ligne. Contenu de référence, affichage uniquement.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {THEMES.map((t) => {
          const actif = themesActifs.includes(t);
          return (
            <button
              key={t}
              onClick={() => toggleTheme(t)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                actif
                  ? "bg-piste-brique border-piste-brique text-white"
                  : "border-white/15 text-piste-craie/60 hover:text-piste-craie hover:border-white/30"
              }`}
            >
              {t}
            </button>
          );
        })}
        {themesActifs.length > 0 && (
          <button
            onClick={() => setThemesActifs([])}
            className="text-xs px-3 py-1.5 rounded-full text-piste-craie/40 hover:text-piste-craie underline"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <div className="space-y-2">
        {afficherEchauffement && (
          <FicheEchauffement ouverte={!!ouvertes["echauffement"]} onToggle={() => toggleFiche("echauffement")} />
        )}
        {seancesFiltrees.map((s) => (
          <FicheSeance key={s.id} seance={s} ouverte={!!ouvertes[s.id]} onToggle={() => toggleFiche(s.id)} />
        ))}
      </div>

      {seancesFiltrees.length === 0 && !afficherEchauffement && (
        <p className="text-piste-craie/40 text-sm mt-4">Aucune séance ne correspond à ce filtre.</p>
      )}
    </div>
  );
}
