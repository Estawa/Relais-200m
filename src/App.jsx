import React, { useEffect, useMemo, useState } from "react";
import { Users, Timer, ListOrdered, Gauge, UploadCloud, Award, ArrowLeft, Printer, AlertTriangle, BookOpen } from "lucide-react";
import { loadState, saveState, removeState, listerCles } from "./utils/storage";
import { classeDeEquipe } from "./utils/equipes";
import {
  loadAcces,
  saveAcces,
  chargerToutesLesClasses,
  sauverClasse,
  supprimerClasseCloud,
  chargerAncienBlocProf,
  slug,
} from "./firebase";
import Splash from "./components/Splash";
import Connexion from "./components/Connexion";
import Accueil from "./components/Accueil";
import TabEleves from "./components/TabEleves";
import TabEquipes from "./components/TabEquipes";
import TabCourse from "./components/TabCourse";
import TabResultats from "./components/TabResultats";
import TabBareme from "./components/TabBareme";
import TabRoles from "./components/TabRoles";
import RecapTab from "./components/RecapTab";
import TabSeances from "./components/TabSeances";

const ONGLETS = [
  { id: "eleves", numero: "01", label: "Élèves", icon: UploadCloud },
  { id: "equipes", numero: "02", label: "Équipes", icon: Users },
  { id: "course", numero: "03", label: "Évaluation", icon: Timer },
  { id: "resultats", numero: "04", label: "Résultats", icon: ListOrdered },
  { id: "roles", numero: "05", label: "Rôles", icon: Award },
  { id: "bareme", numero: "06", label: "Barème", icon: Gauge },
  { id: "recap", numero: "07", label: "Récap", icon: Printer },
  { id: "seances", numero: "08", label: "Séances", icon: BookOpen },
];

const CLASSE_VIDE = { eleves: [], equipes: [], classementTokens: [], series: [] };

// Reconstitue le nouveau modèle (une entrée par classe) à partir de l'ancien bloc
// "tout dans un seul document" (v2.0 à v2.0.2), pour la migration automatique.
function decouperParClasse(bloc) {
  const elevesById = {};
  (bloc.eleves || []).forEach((e) => { elevesById[e.id] = e; });
  const resultat = {};
  const assure = (nom) => {
    if (!resultat[nom]) resultat[nom] = { eleves: [], equipes: [], classementTokens: [], series: [] };
    return resultat[nom];
  };
  (bloc.eleves || []).forEach((e) => {
    if (!e.classe) return;
    assure(e.classe).eleves.push(e);
  });
  (bloc.equipes || []).forEach((eq) => {
    const nom = classeDeEquipe(eq, elevesById);
    if (!nom) return;
    assure(nom).equipes.push(eq);
  });
  Object.entries(bloc.classement || {}).forEach(([nom, tokens]) => {
    assure(nom).classementTokens = tokens || [];
  });
  const classeParEquipeId = {};
  Object.entries(resultat).forEach(([nom, d]) => {
    d.equipes.forEach((eq) => { classeParEquipeId[eq.id] = nom; });
  });
  (bloc.series || []).forEach((s) => {
    const nom = (s.equipeIds || []).map((id) => classeParEquipeId[id]).find(Boolean);
    if (!nom) return;
    assure(nom).series.push(s);
  });
  return resultat;
}

export default function App() {
  const [ecran, setEcran] = useState("splash"); // splash | connexion | accueil | app
  const [ongletActif, setOngletActif] = useState("eleves");

  const [acces, setAcces] = useState({ pinAdmin: "1234", nomAdmin: "Mr Guilhem", collegues: [] });
  const [profConnecte, setProfConnecte] = useState(null); // { nom, admin }
  const [vue, setVue] = useState("mes-classes"); // mes-classes | globale | acces
  const [collegueVu, setCollegueVu] = useState("");

  const [chargementDonnees, setChargementDonnees] = useState(false);
  const [syncOk, setSyncOk] = useState(true);
  // Donnees, indexees par nom de classe : { [nomClasse]: { eleves, equipes, classementTokens, series } }
  const [classesData, setClassesData] = useState({});
  const [classeActive, setClasseActive] = useState("");

  const profActif = vue === "globale" ? collegueVu : profConnecte?.nom;
  const estAdmin = !!profConnecte && profConnecte.nom === acces.nomAdmin;

  useEffect(() => { loadAcces().then(setAcces); }, []);

  // Reconstitue, à partir des copies de secours enregistrées sur l'appareil, les classes
  // d'un professeur donné (utilisé si le cloud est injoignable ou répond "vide" par erreur).
  function chargerSecoursLocal(prof) {
    const prefixe = "classeSecours:" + slug(prof) + ":";
    const resultat = {};
    listerCles(prefixe).forEach((cle) => {
      const donnees = loadState(cle, null);
      if (!donnees) return;
      const nom = donnees.eleves?.[0]?.classe || donnees.equipes?.[0]?.classe || cle.slice(prefixe.length);
      resultat[nom] = donnees;
    });
    return resultat;
  }

  // Charge toutes les classes du professeur actif (Mes classes ou Vue globale) dès qu'il change.
  // Réconciliation classe par classe : pour chaque classe, on compare ce que renvoie le cloud
  // à la dernière copie enregistrée sur cet appareil, et on garde la plus complète des deux.
  // Ça protège aussi bien contre un cloud totalement injoignable que contre une écriture
  // isolée qui aurait échoué juste avant la fermeture de l'appli (le cloud renvoie alors une
  // version plus ancienne de CETTE classe, sans que les autres classes soient affectées).
  useEffect(() => {
    if (!profActif) return;
    let annule = false;
    setChargementDonnees(true);
    (async () => {
      const { classes, ok } = await chargerToutesLesClasses(profActif);
      if (annule) return;
      const secours = chargerSecoursLocal(profActif);
      const richesse = (d) => (!d ? -1 : (d.eleves || []).length + (d.equipes || []).length + (d.series || []).length);

      let donnees = {};
      const aReSauver = [];

      if (!ok) {
        donnees = secours;
        setSyncOk(false);
      } else {
        setSyncOk(true);
        const tousLesNoms = new Set([...Object.keys(classes), ...Object.keys(secours)]);
        if (tousLesNoms.size === 0 && vue === "mes-classes" && estAdmin) {
          // Rien nulle part : migration depuis l'ancien modèle "tout dans un seul document"
          // (v2.0 à v2.0.2), puis en dernier recours depuis la version 100% locale (v1.x).
          const ancien = await chargerAncienBlocProf(profActif);
          if (!annule && ancien.ok && (ancien.data.eleves || []).length > 0) {
            donnees = decouperParClasse(ancien.data);
            aReSauver.push(...Object.keys(donnees));
          } else if (!annule) {
            const localEleves = loadState("eleves", []);
            if (localEleves.length > 0) {
              donnees = decouperParClasse({
                eleves: localEleves,
                equipes: loadState("equipes", []),
                classement: (() => {
                  const brut = loadState("classement", {});
                  return Array.isArray(brut) ? {} : brut;
                })(),
                series: loadState("series", []),
              });
              aReSauver.push(...Object.keys(donnees));
            }
          }
        } else {
          tousLesNoms.forEach((nom) => {
            const duCloud = classes[nom];
            const local = secours[nom];
            if (local && richesse(local) > richesse(duCloud)) {
              donnees[nom] = local;
              aReSauver.push(nom);
            } else if (duCloud) {
              donnees[nom] = duCloud;
            } else if (local) {
              donnees[nom] = local;
              aReSauver.push(nom);
            }
          });
        }
      }
      if (annule) return;
      setClassesData(donnees);
      setClasseActive("");
      setChargementDonnees(false);

      // Rattrape le cloud avec ce qui vient d'être retenu localement (migration ou copie plus
      // complète que celle du serveur), pour que les sauvegardes suivantes soient déjà à jour.
      aReSauver.forEach((nom) => {
        const d = donnees[nom];
        saveState("classeSecours:" + slug(profActif) + ":" + slug(nom), d);
        sauverClasse(profActif, nom, d);
      });
    })();
    return () => { annule = true; };
  }, [profActif]);

  // Sauvegarde uniquement la classe actuellement ouverte à chaque modification de son contenu.
  // Toujours doublée d'une copie locale sur l'appareil : si l'écriture cloud échoue, rien n'est
  // perdu et on peut avertir au lieu de laisser disparaître les données en silence. Comme chaque
  // classe a son propre document, un échec ne peut plus jamais affecter une autre classe.
  const donneesClasseActive = classesData[classeActive];
  useEffect(() => {
    if (!profActif || !classeActive || chargementDonnees || !donneesClasseActive) return;
    const cle = "classeSecours:" + slug(profActif) + ":" + slug(classeActive);
    saveState(cle, donneesClasseActive);
    sauverClasse(profActif, classeActive, donneesClasseActive).then(setSyncOk);
  }, [donneesClasseActive, classeActive, profActif, chargementDonnees]);

  const classeInfo = classesData[classeActive] || CLASSE_VIDE;
  const elevesClasse = classeInfo.eleves;
  const equipesClasse = classeInfo.equipes;
  const seriesClasse = classeInfo.series;
  const classementActif = classeInfo.classementTokens;

  const elevesById = useMemo(() => {
    const map = {};
    elevesClasse.forEach((e) => (map[e.id] = e));
    return map;
  }, [elevesClasse]);

  // Vue d'ensemble utilisée par l'écran "Mes classes" (liste des classes + import multi-classes)
  const eleves = useMemo(() => Object.values(classesData).flatMap((d) => d.eleves), [classesData]);
  const classesInfo = useMemo(
    () =>
      Object.entries(classesData)
        .map(([nom, d]) => ({ nom, nbEleves: d.eleves.length }))
        .sort((a, b) => a.nom.localeCompare(b.nom)),
    [classesData]
  );

  function setEleves(fnOuValeur) {
    setClassesData((prev) => {
      const actuelle = prev[classeActive] || CLASSE_VIDE;
      const suivants = typeof fnOuValeur === "function" ? fnOuValeur(actuelle.eleves) : fnOuValeur;
      return { ...prev, [classeActive]: { ...actuelle, eleves: suivants } };
    });
  }

  // Déplace un élève de la classe active vers une autre, en conservant son identifiant (donc son
  // historique de performances, indexé par id, pas par classe) — seul moyen sûr de corriger un
  // élève placé au mauvais endroit ; le supprimer puis le recréer casserait ce lien.
  function deplacerEleveVersClasse(eleveId, nouvelleClasseBrute) {
    const nouvelleClasse = nouvelleClasseBrute.trim().toUpperCase();
    if (!nouvelleClasse || nouvelleClasse === classeActive) return;
    setClassesData((prev) => {
      const source = prev[classeActive] || CLASSE_VIDE;
      const eleve = source.eleves.find((e) => e.id === eleveId);
      if (!eleve) return prev;
      const cible = prev[nouvelleClasse] || CLASSE_VIDE;
      return {
        ...prev,
        [classeActive]: { ...source, eleves: source.eleves.filter((e) => e.id !== eleveId) },
        [nouvelleClasse]: { ...cible, eleves: [...cible.eleves, { ...eleve, classe: nouvelleClasse }] }
      };
    });
  }

  function setEquipesClasse(fnOuValeur) {
    setClassesData((prev) => {
      const actuelle = prev[classeActive] || CLASSE_VIDE;
      const suivantes = typeof fnOuValeur === "function" ? fnOuValeur(actuelle.equipes) : fnOuValeur;
      return {
        ...prev,
        [classeActive]: {
          ...actuelle,
          equipes: suivantes.map((eq) => (eq.classe ? eq : { ...eq, classe: classeActive })),
        },
      };
    });
  }

  function setClassementActif(tokensOuFn) {
    setClassesData((prev) => {
      const actuelle = prev[classeActive] || CLASSE_VIDE;
      const suivant = typeof tokensOuFn === "function" ? tokensOuFn(actuelle.classementTokens) : tokensOuFn;
      return { ...prev, [classeActive]: { ...actuelle, classementTokens: suivant } };
    });
  }

  function setSeries(fnOuValeur) {
    setClassesData((prev) => {
      const actuelle = prev[classeActive] || CLASSE_VIDE;
      const suivantes = typeof fnOuValeur === "function" ? fnOuValeur(actuelle.series) : fnOuValeur;
      return { ...prev, [classeActive]: { ...actuelle, series: suivantes } };
    });
  }

  // Import depuis l'écran "Mes classes" : peut toucher plusieurs classes à la fois (fichier
  // multi-classes), en dehors de l'écran d'une classe précise — donc sauvegardé explicitement
  // ici, classe par classe, plutôt que via la sauvegarde automatique qui ne suit que la classe
  // actuellement ouverte.
  function importerDepuisAccueil(nouveaux) {
    setClassesData((prev) => {
      const copie = { ...prev };
      nouveaux.forEach((n) => {
        const actuelle = copie[n.classe] || CLASSE_VIDE;
        const elevesCopie = [...actuelle.eleves];
        const idx = elevesCopie.findIndex((e) => e.id === n.id);
        if (idx !== -1) {
          elevesCopie[idx] = { ...elevesCopie[idx], nom: n.nom, prenom: n.prenom, classe: n.classe, sexe: n.sexe || elevesCopie[idx].sexe };
        } else {
          elevesCopie.push({ id: n.id, nom: n.nom, prenom: n.prenom, classe: n.classe, sexe: n.sexe, temps200: null });
        }
        copie[n.classe] = { ...actuelle, eleves: elevesCopie };
      });
      const classesAffectees = new Set(nouveaux.map((n) => n.classe));
      classesAffectees.forEach((nom) => {
        const donnees = copie[nom];
        saveState("classeSecours:" + slug(profActif) + ":" + slug(nom), donnees);
        sauverClasse(profActif, nom, donnees).then(setSyncOk);
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
    const nbEleves = (classesData[nom]?.eleves || []).length;
    if (
      !confirm(
        `Supprimer définitivement la classe ${nom} ? Ses ${nbEleves} élève(s), leurs équipes, classement et manches enregistrées seront effacés. Cette action est irréversible.`
      )
    ) {
      return;
    }
    setClassesData((prev) => {
      const copie = { ...prev };
      delete copie[nom];
      return copie;
    });
    removeState("classeSecours:" + slug(profActif) + ":" + slug(nom));
    supprimerClasseCloud(profActif, nom);
    if (classeActive === nom) setClasseActive("");
  }

  function handleValideConnexion(p) {
    setProfConnecte(p);
    setVue("mes-classes");
    setCollegueVu("");
    setEcran("accueil");
  }

  function handleDeconnexion() {
    setProfConnecte(null);
    setEcran("connexion");
  }

  if (ecran === "splash") {
    return <Splash onTermine={() => setEcran("connexion")} />;
  }

  if (ecran === "connexion") {
    const profs = [{ nom: acces.nomAdmin, pin: acces.pinAdmin, admin: true }, ...(acces.collegues || [])];
    return <Connexion profs={profs} onValide={handleValideConnexion} />;
  }

  if (ecran === "accueil") {
    return (
      <Accueil
        profConnecte={profConnecte}
        estAdmin={estAdmin}
        acces={acces}
        onSauverAcces={(next) => { setAcces(next); saveAcces(next); }}
        vue={vue}
        setVue={setVue}
        collegueVu={collegueVu}
        setCollegueVu={setCollegueVu}
        eleves={eleves}
        classesInfo={classesInfo}
        onImporte={importerDepuisAccueil}
        onOuvrir={ouvrirClasse}
        onSupprimer={supprimerClasse}
        onDeconnexion={handleDeconnexion}
        syncOk={syncOk}
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
            <p className="text-xs text-piste-craie/50 mt-1">
              By C. Guilhem <span className="text-piste-craie/25">· v2.5.0 · {profActif}{vue === "globale" ? " (vue globale)" : ""}</span>
            </p>
          </div>
        </div>
      </header>

      {!syncOk && (
        <div className="bg-piste-brique/90 text-white text-xs sm:text-sm px-4 py-2 flex items-center gap-2 justify-center text-center">
          <AlertTriangle size={14} className="shrink-0" />
          Sauvegarde cloud impossible en ce moment (réseau ?). Tes données restent enregistrées sur cet appareil,
          la synchro reprendra automatiquement dès que la connexion reviendra.
        </div>
      )}

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
        {ongletActif === "eleves" && (
          <TabEleves eleves={elevesClasse} setEleves={setEleves} equipes={equipesClasse} series={seriesClasse} classeActive={classeActive} classesInfo={classesInfo} onDeplacerEleve={deplacerEleveVersClasse} />
        )}
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
        {ongletActif === "seances" && <TabSeances />}
      </main>
    </div>
  );
}
