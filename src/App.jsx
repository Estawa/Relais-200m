import React, { useEffect, useMemo, useState } from "react";
import { Users, Timer, ListOrdered, Gauge, UploadCloud, Award } from "lucide-react";
import { loadState, saveState } from "./utils/storage";
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
  const [classement, setClassement] = useState(() => loadState("classement", []));
  const [series, setSeries] = useState(() => loadState("series", []));
  const [bareme, setBareme] = useState(() => loadState("bareme", { filles: [], garcons: [] }));

  useEffect(() => saveState("eleves", eleves), [eleves]);
  useEffect(() => saveState("equipes", equipes), [equipes]);
  useEffect(() => saveState("classement", classement), [classement]);
  useEffect(() => saveState("series", series), [series]);
  useEffect(() => saveState("bareme", bareme), [bareme]);

  const elevesById = useMemo(() => {
    const map = {};
    eleves.forEach((e) => (map[e.id] = e));
    return map;
  }, [eleves]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-piste-panneau border-b-4 border-piste-brique px-4 pt-4 pb-2 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-baseline justify-between">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-800 tracking-wide uppercase leading-none">
              Relais <span className="text-piste-brique">200m</span>
            </h1>
            <p className="text-xs text-piste-craie/50 mt-1">By C. Guilhem <span className="text-piste-craie/25">· v1.4</span></p>
          </div>
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
        {ongletActif === "equipes" && (
          <TabEquipes
            eleves={eleves}
            elevesById={elevesById}
            equipes={equipes}
            setEquipes={setEquipes}
            classement={classement}
            setClassement={setClassement}
          />
        )}
        {ongletActif === "course" && (
          <TabCourse equipes={equipes} elevesById={elevesById} series={series} setSeries={setSeries} />
        )}
        {ongletActif === "resultats" && (
          <TabResultats equipes={equipes} elevesById={elevesById} series={series} bareme={bareme} />
        )}
        {ongletActif === "roles" && <TabRoles eleves={eleves} setEleves={setEleves} />}
        {ongletActif === "bareme" && <TabBareme bareme={bareme} setBareme={setBareme} />}
      </main>
    </div>
  );
}
