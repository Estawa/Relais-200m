import { useRef, useState } from "react";
import { Upload, AlertTriangle, X, ChevronLeft } from "lucide-react";
import { parserLignesCsv, separerNomPrenom, normaliserSexe, normaliser } from "../utils/csv";
import { uid } from "../utils/storage";

const CIBLES = [
  { id: "nomComplet", label: "Nom + Prénom (colonne unique)" },
  { id: "nom", label: "Nom" },
  { id: "prenom", label: "Prénom" },
  { id: "classe", label: "Classe" },
  { id: "sexe", label: "Sexe" },
];

const NB_EXEMPLES = 3;

export default function ImportEleves({ elevesExistants, onImporte, onFermer, classeForcee }) {
  const [etape, setEtape] = useState("choix"); // choix | colonnes | apercu
  const [nomFichier, setNomFichier] = useState("");
  const [toutesLignes, setToutesLignes] = useState([]);
  const [premiereLigneEntete, setPremiereLigneEntete] = useState(true);
  const [cibles, setCibles] = useState({}); // { indexColonne: 'nom' | 'prenom' | ... }
  const [cochees, setCochees] = useState([]);
  const [classeParDefaut, setClasseParDefaut] = useState("");
  const [erreur, setErreur] = useState("");
  const inputRef = useRef(null);

  const ciblesDisponibles = classeForcee ? CIBLES.filter((c) => c.id !== "classe") : CIBLES;
  const lignesDonnees = premiereLigneEntete ? toutesLignes.slice(1) : toutesLignes;
  const nbColonnes = toutesLignes.reduce((max, l) => Math.max(max, l.length), 0);

  const indexPour = (cible) => {
    const trouve = Object.entries(cibles).find(([, c]) => c === cible);
    return trouve ? Number(trouve[0]) : undefined;
  };

  async function handleFichier(file) {
    setErreur("");
    setNomFichier(file.name);
    try {
      const lignes = await parserLignesCsv(file);
      if (lignes.length === 0) {
        setErreur("Le fichier semble vide.");
        return;
      }
      setToutesLignes(lignes);
      const nbData = premiereLigneEntete ? lignes.length - 1 : lignes.length;
      setCochees(Array.from({ length: Math.max(nbData, 0) }, () => true));
      setCibles({});
      setEtape("colonnes");
    } catch (e) {
      setErreur("Impossible de lire ce fichier. Formats acceptés : .csv, .xlsx, .xls, .ods");
    }
  }

  function toggleEntete(v) {
    setPremiereLigneEntete(v);
    const nbData = v ? toutesLignes.length - 1 : toutesLignes.length;
    setCochees(Array.from({ length: Math.max(nbData, 0) }, () => true));
  }

  const mappingValide = indexPour("nomComplet") !== undefined || indexPour("nom") !== undefined;
  const classeMappee = classeForcee ? true : indexPour("classe") !== undefined;

  function toggleLigne(i) {
    setCochees((c) => c.map((v, idx) => (idx === i ? !v : v)));
  }
  function toutCocher(v) {
    setCochees((c) => c.map(() => v));
  }

  function construireLigne(ligne) {
    const iNom = indexPour("nom");
    const iPrenom = indexPour("prenom");
    const iNomComplet = indexPour("nomComplet");
    const iClasse = indexPour("classe");
    const iSexe = indexPour("sexe");

    let nom = iNom !== undefined ? String(ligne[iNom] || "").trim() : "";
    let prenom = iPrenom !== undefined ? String(ligne[iPrenom] || "").trim() : "";
    if (iNomComplet !== undefined && !nom && !prenom) {
      const sep = separerNomPrenom(ligne[iNomComplet]);
      nom = sep.nom;
      prenom = sep.prenom;
    }
    const classeBrute = iClasse !== undefined ? String(ligne[iClasse] || "").trim() : "";
    const classe = classeForcee || classeBrute || classeParDefaut.trim();
    const sexeBrut = iSexe !== undefined ? normaliserSexe(ligne[iSexe]) : "";
    const existant = elevesExistants.find(
      (e) => normaliser(e.nom) === normaliser(nom) && normaliser(e.prenom) === normaliser(prenom) && normaliser(e.classe) === normaliser(classe)
    );
    return { id: existant ? existant.id : uid(), nom, prenom, classe, sexe: sexeBrut, dejaPresent: !!existant };
  }

  function valider() {
    const nouveaux = lignesDonnees
      .filter((_, i) => cochees[i])
      .map(construireLigne)
      .filter((e) => (e.nom || e.prenom) && e.classe);
    if (nouveaux.length === 0) {
      setErreur("Aucun élève sélectionné.");
      return;
    }
    onImporte(nouveaux);
  }

  function recommencer() {
    setToutesLignes([]);
    setCibles({});
    setCochees([]);
    setErreur("");
    setEtape("choix");
  }

  const lignesConstruites = etape === "apercu" ? lignesDonnees.map(construireLigne) : [];

  return (
    <div className="fixed inset-0 z-30 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-piste-nuit border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto text-piste-craie">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="font-display text-xl tracking-wide">Importer une classe</h3>
          <button onClick={onFermer} className="p-1.5 rounded-full hover:bg-white/10 text-piste-craie/60">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {erreur && (
            <p className="text-sm flex items-center gap-1.5 bg-piste-brique/20 text-piste-briqueclair rounded-lg px-3 py-2">
              <AlertTriangle size={14} /> {erreur}
            </p>
          )}

          {etape === "choix" && (
            <>
              <p className="text-sm text-piste-craie/60">Formats acceptés : .csv, .xlsx, .xls, .ods (exports Pronote inclus).</p>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.txt,.xlsx,.xls,.ods"
                onChange={(e) => e.target.files[0] && handleFichier(e.target.files[0])}
                className="hidden"
              />
              <button
                onClick={() => inputRef.current?.click()}
                className="w-full flex flex-col items-center gap-2 border-2 border-dashed border-white/15 rounded-xl py-8 text-piste-craie/70 hover:border-piste-brique hover:bg-white/5 transition"
              >
                <Upload size={22} />
                <span className="text-sm font-medium">Toucher pour choisir un fichier</span>
              </button>
            </>
          )}

          {etape === "colonnes" && (
            <>
              <p className="text-xs text-piste-craie/50">
                {nomFichier} · {nbColonnes} colonne(s) · {lignesDonnees.length} ligne(s)
              </p>

              <label className="flex items-center gap-2 text-sm text-piste-craie/80">
                <input
                  type="checkbox"
                  checked={premiereLigneEntete}
                  onChange={(e) => toggleEntete(e.target.checked)}
                  className="rounded"
                />
                La première ligne du fichier est une ligne de titres (à ne pas importer)
              </label>

              <p className="text-sm text-piste-craie/80">
                Choisis, pour chaque colonne, ce qu'elle représente (les colonnes non choisies sont ignorées) :
              </p>

              <div className="space-y-2.5">
                {Array.from({ length: nbColonnes }, (_, i) => i).map((i) => (
                  <div key={i} className="border border-white/10 rounded-xl p-3 bg-piste-panneau/60">
                    <p className="text-[11px] text-piste-craie/40 mb-1.5">
                      {lignesDonnees
                        .slice(0, NB_EXEMPLES)
                        .map((l) => l[i] || "—")
                        .join(" · ")}
                    </p>
                    <select
                      value={cibles[i] ?? ""}
                      onChange={(e) =>
                        setCibles((m) => {
                          const suivant = { ...m };
                          if (e.target.value === "") delete suivant[i];
                          else suivant[i] = e.target.value;
                          return suivant;
                        })
                      }
                      className="w-full rounded-lg border border-white/15 bg-piste-nuit px-3 py-2 text-sm"
                    >
                      <option value="">— Colonne ignorée —</option>
                      {ciblesDisponibles.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {!classeMappee && (
                <div>
                  <label className="block text-sm font-medium text-piste-craie/80 mb-1">
                    Aucune colonne "Classe" choisie : classe à appliquer à tous ces élèves
                  </label>
                  <input
                    value={classeParDefaut}
                    onChange={(e) => setClasseParDefaut(e.target.value)}
                    placeholder="Ex : 2NDE4"
                    className="w-full rounded-lg border border-white/15 bg-piste-nuit px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-piste-brique"
                  />
                </div>
              )}
              <div className="flex items-center justify-between pt-1">
                <button onClick={recommencer} className="flex items-center gap-1 text-sm text-piste-craie/60">
                  <ChevronLeft size={16} /> Changer de fichier
                </button>
                <button
                  onClick={() => {
                    if (!mappingValide) {
                      setErreur('Choisis au minimum une colonne "Nom" (ou "Nom + Prénom").');
                      return;
                    }
                    if (!classeMappee && !classeParDefaut.trim()) {
                      setErreur('Choisis une colonne "Classe", ou indique une classe par défaut.');
                      return;
                    }
                    setErreur("");
                    setEtape("apercu");
                  }}
                  className="bg-piste-brique hover:bg-piste-briqueclair px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                  Aperçu →
                </button>
              </div>
            </>
          )}

          {etape === "apercu" && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs text-piste-craie/50">
                  {cochees.filter(Boolean).length} / {lignesDonnees.length} sélectionné(s)
                </p>
                <div className="flex gap-3">
                  <button onClick={() => toutCocher(true)} className="text-[11px] font-medium text-piste-craie/70">
                    Tout cocher
                  </button>
                  <button onClick={() => toutCocher(false)} className="text-[11px] font-medium text-piste-craie/40">
                    Tout décocher
                  </button>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto border border-white/10 rounded-xl divide-y divide-white/5">
                {lignesConstruites.map((e, i) => (
                  <label key={i} className={`flex items-center gap-2.5 px-3 py-2 ${cochees[i] ? "" : "opacity-40"}`}>
                    <input type="checkbox" checked={cochees[i]} onChange={() => toggleLigne(i)} className="rounded" />
                    <span className="text-sm flex-1">
                      {e.prenom} {e.nom} <span className="text-piste-craie/40 text-xs">· {e.classe}</span>
                      {e.sexe && <span className="text-piste-craie/40 text-xs"> · {e.sexe}</span>}
                    </span>
                    {(e.nom || e.prenom) && e.dejaPresent && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-piste-brique/20 text-piste-briqueclair">
                        déjà présent
                      </span>
                    )}
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button onClick={() => setEtape("colonnes")} className="flex items-center gap-1 text-sm text-piste-craie/60">
                  <ChevronLeft size={16} /> Revenir aux colonnes
                </button>
                <button
                  onClick={valider}
                  className="bg-piste-brique hover:bg-piste-briqueclair px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                  Importer
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
