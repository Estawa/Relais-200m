import React, { useEffect, useMemo, useState } from "react";
import { Users, Timer, ListOrdered, Gauge, UploadCloud, Award } from "lucide-react";
import { loadState, saveState } from "./utils/storage";
import { classeDeEquipe } from "./utils/equipes";
import TabEleves from "./components/TabEleves";
import TabEquipes from "./components/TabEquipes";
import TabCourse from "./components/TabCourse";
import TabResultats from "./components/TabResultats";
import TabBareme from "./components/TabBareme";
import TabRoles from "./components/TabRoles";

const ONGLETS = [
  { id: "eleves", numero: "01", label: "Élèves", icon: UploadCloud },
  { id: "equipes", numero: "02", label: "Équipes", icon: Users },
  { id: "course", numero: "03", label: "Évaluation", icon: Timer },
  { id: "resultats", numero: "04", label: "Résultats", icon: ListOrdered },
  { id: "roles", numero: "05", label: "Rôles", icon: Award },
  { id: "bareme", numero: "06", label: "Barème", icon: Gauge },
];

export default function App() {
  const [ongletActif, setOngletActif] = useState("eleves");
  const [eleves, setEleves] = useState(() => loadState("eleves", []));
  const [equipes, setEquipes] = useState(() => loadState("equipes", []));
  const [classement, setClassement] = useState(() => {
    const brut = loadState("classement", {});
    return Array.isArray(brut) ? {} : brut; // ancien format (liste unique) : repart de zéro
  });
  const [series, setSeries] = useState(() => loadState("series", []));
  const [bareme, setBareme] = useState(() => loadState("bareme", { filles: [], garcons: [] }));
  const [classeActive, setClasseActive] = useState(() => loadState("classeActive", ""));

  useEffect(() => saveState("eleves", eleves), [eleves]);
  useEffect(() => saveState("equipes", equipes), [equipes]);
  useEffect(() => saveState("classement", classement), [classement]);
  useEffect(() => saveState("series", series), [series]);
  useEffect(() => saveState("bareme", bareme), [bareme]);
  useEffect(() => saveState("classeActive", classeActive), [classeActive]);

  const elevesById = useMemo(() => {
    const map = {};
    eleves.forEach((e) => (map[e.id] = e));
    return map;
  }, [eleves]);

  const classesDisponibles = useMemo(
    () => [...new Set(eleves.map((e) => e.classe).filter(Boolean))].sort(),
    [eleves]
  );

  // Si la classe active n'existe plus (ou n'a jamais été choisie), on retombe sur la première disponible.
  useEffect(() => {
    if (classesDisponibles.length > 0 && !classesDisponibles.includes(classeActive)) {
      setClasseActive(classesDisponibles[0]);
    } else if (classesDisponibles.length === 0 && classeActive !== "") {
      setClasseActive("");
    }
  }, [classesDisponibles, classeActive]);

  const elevesClasse = useMemo(
    () => eleves.filter((e) => e.classe === classeActive),
    [eleves, classeActive]
  );

  const equipesClasse = useMemo(
    () => equipes.filter((eq) => classeDeEquipe(eq, elevesById) === classeActive),
    [equipes, elevesById, classeActive]
  );
  const equipeIdsClasse = useMemo(() => new Set(equipesClasse.map((eq) => eq.id)), [equipesClasse]);
  const seriesClasse = useMemo(
    () => series.filter((s) => s.equipeIds.some((id) => equipeIdsClasse.has(id))),
    [series, equipeIdsClasse]
  );

  const classementActif = classement[classeActive] || [];
  function setClassementActif(tokensOuFn) {
    setClassement((prev) => {
      const actuel = prev[classeActive] || [];
      const suivant = typeof tokensOuFn === "function" ? tokensOuFn(actuel) : tokensOuFn;
      return { ...prev, [classeActive]: suivant };
    });
  }

  // Les composants Équipes travaillent sur la liste "vue" (celle de la classe active) mais
  // toute écriture doit préserver les équipes des autres classes dans le stockage global.
  function setEquipesClasse(equipesOuFn) {
    setEquipes((prev) => {
      const autres = prev.filter((eq) => classeDeEquipe(eq, elevesById) !== classeActive);
      const actuelles = prev.filter((eq) => classeDeEquipe(eq, elevesById) === classeActive);
      const suivantes = typeof equipesOuFn === "function" ? equipesOuFn(actuelles) : equipesOuFn;
      return [...autres, ...suivantes.map((eq) => (eq.classe ? eq : { ...eq, classe: classeActive }))];
    });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-piste-panneau border-b-4 border-piste-brique px-4 pt-4 pb-2 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-800 tracking-wide uppercase leading-none">
              Relais <span className="text-piste-brique">200m</span>
            </h1>
            <p className="text-xs text-piste-craie/50 mt-1">By C. Guilhem <span className="text-piste-craie/25">· v1.5</span></p>
          </div>
          {classesDisponibles.length > 0 && (
            <label className="flex items-center gap-2 text-sm">
              <span className="text-piste-craie/50 text-xs uppercase tracking-wide">Classe</span>
              <select
                value={classeActive}
                onChange={(e) => setClasseActive(e.target.value)}
                className="bg-piste-nuit border border-white/15 rounded-lg px-3 py-1.5 font-display text-lg tracking-wide focus:outline-none focus:ring-2 focus:ring-piste-brique"
              >
                {classesDisponibles.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
          )}
        </div>
      </header>

      <nav className="bg-piste-panneau/60 border-b border-white/5 overflow-x-auto">
        <div className="max-w-4xl mx-auto flex">
          {ONGLETS.map((o) => {
            const actif = ongletActif === o.id;
            const Icon = o.icon;
            return (
              <button
                key={o.id}
                onClick={() => setOngletActif(o.id)}
                className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap border-b-2 transition-colors font-display text-lg tracking-wide ${
                  actif
                    ? "border-piste-brique text-piste-craie"
                    : "border-transparent text-piste-craie/40 hover:text-piste-craie/70"
                }`}
              >
                <span className={`text-xs font-body font-semibold ${actif ? "text-piste-ambre" : "text-piste-craie/30"}`}>
                  {o.numero}
                </span>
                <Icon size={16} />
                {o.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:px-6">
        {ongletActif === "eleves" && <TabEleves eleves={eleves} setEleves={setEleves} />}
        {ongletActif === "equipes" &&
          (classeActive ? (
            <TabEquipes
              eleves={elevesClasse}
              elevesById={elevesById}
              equipes={equipesClasse}
              setEquipes={setEquipesClasse}
              classement={classementActif}
              setClassement={setClassementActif}
              classeActive={classeActive}
            />
          ) : (
            <p className="text-piste-craie/50 text-sm border border-dashed border-white/10 rounded-lg p-8 text-center">
              Importe d'abord une classe dans l'onglet Élèves.
            </p>
          ))}
        {ongletActif === "course" && (
          <TabCourse equipes={equipesClasse} elevesById={elevesById} series={seriesClasse} setSeries={setSeries} />
        )}
        {ongletActif === "resultats" && (
          <TabResultats equipes={equipesClasse} elevesById={elevesById} series={seriesClasse} bareme={bareme} />
        )}
        {ongletActif === "roles" && <TabRoles eleves={eleves} setEleves={setEleves} />}
        {ongletActif === "bareme" && <TabBareme bareme={bareme} setBareme={setBareme} />}
      </main>
    </div>
  );
}
