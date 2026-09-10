import React, { useEffect, useMemo, useState } from "react";
import { Users, Timer, ListOrdered, Gauge, UploadCloud, Award, ArrowLeft, Printer } from "lucide-react";
import { loadState, saveState } from "./utils/storage";
import { classeDeEquipe } from "./utils/equipes";
import Splash from "./components/Splash";
import Accueil from "./components/Accueil";
import TabEleves from "./components/TabEleves";
import TabEquipes from "./components/TabEquipes";
import TabCourse from "./components/TabCourse";
import TabResultats from "./components/TabResultats";
import TabBareme from "./components/TabBareme";
import TabRoles from "./components/TabRoles";
import RecapTab from "./components/RecapTab";

const ONGLETS = [
  { id: "eleves", numero: "01", label: "Élèves", icon: UploadCloud },
  { id: "equipes", numero: "02", label: "Équipes", icon: Users },
  { id: "course", numero: "03", label: "Évaluation", icon: Timer },
  { id: "resultats", numero: "04", label: "Résultats", icon: ListOrdered },
  { id: "roles", numero: "05", label: "Rôles", icon: Award },
  { id: "bareme", numero: "06", label: "Barème", icon: Gauge },
  { id: "recap", numero: "07", label: "Récap", icon: Printer },
];

export default function App() {
  const [ecran, setEcran] = useState("splash"); // splash | accueil | app
  const [ongletActif, setOngletActif] = useState("eleves");
  const [eleves, setEleves] = useState(() => loadState("eleves", []));
  const [equipes, setEquipes] = useState(() => loadState("equipes", []));
  const [classement, setClassement] = useState(() => {
    const brut = loadState("classement", {});
    return Array.isArray(brut) ? {} : brut; // ancien format (liste unique) : repart de zéro
  });
  const [series, setSeries] = useState(() => loadState("series", []));
  const [classeActive, setClasseActive] = useState(() => loadState("classeActive", ""));

  useEffect(() => saveState("eleves", eleves), [eleves]);
  useEffect(() => saveState("equipes", equipes), [equipes]);
  useEffect(() => saveState("classement", classement), [classement]);
  useEffect(() => saveState("series", series), [series]);
  useEffect(() => saveState("classeActive", classeActive), [classeActive]);

  const elevesById = useMemo(() => {
    const map = {};
    eleves.forEach((e) => (map[e.id] = e));
    return map;
  }, [eleves]);

  const classesInfo = useMemo(() => {
    const compte = {};
    eleves.forEach((e) => {
      if (!e.classe) return;
      compte[e.classe] = (compte[e.classe] || 0) + 1;
    });
    return Object.entries(compte)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([nom, nbEleves]) => ({ nom, nbEleves }));
  }, [eleves]);

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

  function importerDepuisAccueil(nouveaux) {
    setEleves((prev) => {
      const copie = [...prev];
      nouveaux.forEach((n) => {
        const idx = copie.findIndex((e) => e.id === n.id);
        if (idx !== -1) {
          copie[idx] = { ...copie[idx], nom: n.nom, prenom: n.prenom, classe: n.classe, sexe: n.sexe || copie[idx].sexe };
        } else {
          copie.push({ id: n.id, nom: n.nom, prenom: n.prenom, classe: n.classe, sexe: n.sexe, temps200: null });
        }
      });
      return copie;
    });
  }

  function ouvrirClasse(nom) {
    setClasseActive(nom);
    setOngletActif("eleves");
    setEcran("app");
  }

  function supprimerClasse(nom) {
    const nbEleves = eleves.filter((e) => e.classe === nom).length;
    if (
      !confirm(
        `Supprimer définitivement la classe ${nom} ? Ses ${nbEleves} élève(s), leurs équipes, classement et manches enregistrées seront effacés. Cette action est irréversible.`
      )
    ) {
      return;
    }
    const idsEquipesASupprimer = new Set(
      equipes.filter((eq) => classeDeEquipe(eq, elevesById) === nom).map((eq) => eq.id)
    );
    setEleves((prev) => prev.filter((e) => e.classe !== nom));
    setEquipes((prev) => prev.filter((eq) => !idsEquipesASupprimer.has(eq.id)));
    setSeries((prev) => prev.filter((s) => !s.equipeIds.some((id) => idsEquipesASupprimer.has(id))));
    setClassement((prev) => {
      const copie = { ...prev };
      delete copie[nom];
      return copie;
    });
    if (classeActive === nom) setClasseActive("");
  }

  if (ecran === "splash") {
    return <Splash onTermine={() => setEcran("accueil")} />;
  }

  if (ecran === "accueil") {
    return (
      <Accueil
        eleves={eleves}
        classesInfo={classesInfo}
        onImporte={importerDepuisAccueil}
        onOuvrir={ouvrirClasse}
        onSupprimer={supprimerClasse}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-piste-panneau border-b-4 border-piste-brique px-4 pt-4 pb-2 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => setEcran("accueil")}
            title="Changer de classe"
            className="flex items-center gap-1.5 text-piste-craie/50 hover:text-piste-craie text-sm shrink-0"
          >
            <ArrowLeft size={16} /> Classes
          </button>
          <div className="text-right">
            <h1 className="font-display text-2xl sm:text-3xl font-800 tracking-wide uppercase leading-none">
              Relais <span className="text-piste-brique">200m</span> <span className="text-piste-ambre">· {classeActive}</span>
            </h1>
            <p className="text-xs text-piste-craie/50 mt-1">By C. Guilhem <span className="text-piste-craie/25">· v1.15</span></p>
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
        {ongletActif === "eleves" && <TabEleves eleves={elevesClasse} setEleves={setEleves} classeActive={classeActive} />}
        {ongletActif === "equipes" && (
          <TabEquipes
            eleves={elevesClasse}
            elevesById={elevesById}
            equipes={equipesClasse}
            setEquipes={setEquipesClasse}
            classement={classementActif}
            setClassement={setClassementActif}
            classeActive={classeActive}
          />
        )}
        {ongletActif === "course" && (
          <TabCourse equipes={equipesClasse} elevesById={elevesById} series={seriesClasse} setSeries={setSeries} />
        )}
        {ongletActif === "resultats" && (
          <TabResultats
            equipes={equipesClasse}
            elevesById={elevesById}
            series={seriesClasse}
            setSeries={setSeries}
            eleves={elevesClasse}
            setEleves={setEleves}
          />
        )}
        {ongletActif === "roles" && <TabRoles eleves={elevesClasse} setEleves={setEleves} />}
        {ongletActif === "bareme" && <TabBareme />}
        {ongletActif === "recap" && (
          <RecapTab eleves={elevesClasse} elevesById={elevesById} equipes={equipesClasse} series={seriesClasse} classeActive={classeActive} />
        )}
      </main>
    </div>
  );
}
