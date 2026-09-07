import React, { useRef, useState } from "react";
import { UploadCloud, Plus, Trash2 } from "lucide-react";
import { formatChrono, parseTempsSaisi } from "../utils/temps";
import { uid } from "../utils/storage";
import TestSalve from "./TestSalve";
import ImportEleves from "./ImportEleves";

export default function TabEleves({ eleves, setEleves }) {
  const [classeFiltre, setClasseFiltre] = useState("");
  const [importOuvert, setImportOuvert] = useState(false);

  const classes = [...new Set(eleves.map((e) => e.classe).filter(Boolean))].sort();
  const visibles = classeFiltre ? eleves.filter((e) => e.classe === classeFiltre) : eleves;

  function importerEleves(nouveaux) {
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
    setImportOuvert(false);
  }

  function ajouterEleve() {
    setEleves((prev) => [
      ...prev,
      { id: uid(), nom: "", prenom: "", classe: classeFiltre || "", sexe: "", temps200: null },
    ]);
  }

  function modifier(id, champ, valeur) {
    setEleves((prev) => prev.map((el) => (el.id === id ? { ...el, [champ]: valeur } : el)));
  }

  function supprimer(id) {
    setEleves((prev) => prev.filter((el) => el.id !== id));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="font-display text-2xl tracking-wide">Élèves &amp; test 200m</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setImportOuvert(true)}
            className="flex items-center gap-2 bg-piste-panneau border border-white/10 hover:border-piste-brique px-3 py-2 rounded text-sm"
          >
            <UploadCloud size={16} /> Importer une classe (CSV)
          </button>
          <button
            onClick={ajouterEleve}
            className="flex items-center gap-2 bg-piste-brique hover:bg-piste-briqueclair px-3 py-2 rounded text-sm font-semibold"
          >
            <Plus size={16} /> Ajouter
          </button>
        </div>
      </div>

      <TestSalve eleves={eleves} setEleves={setEleves} />

      {classes.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setClasseFiltre("")}
            className={`px-3 py-1 rounded-full text-sm border ${
              classeFiltre === "" ? "border-piste-brique text-piste-craie" : "border-white/10 text-piste-craie/50"
            }`}
          >
            Toutes
          </button>
          {classes.map((c) => (
            <button
              key={c}
              onClick={() => setClasseFiltre(c)}
              className={`px-3 py-1 rounded-full text-sm border ${
                classeFiltre === c ? "border-piste-brique text-piste-craie" : "border-white/10 text-piste-craie/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {visibles.length === 0 ? (
        <div className="text-piste-craie/50 text-sm border border-dashed border-white/10 rounded-lg p-8 text-center">
          Aucun élève pour l'instant. Importe la fiche de classe exportée depuis EPS Pro, ou ajoute les élèves un par un.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-piste-panneau text-piste-craie/50 text-xs uppercase">
              <tr>
                <th className="text-left px-3 py-2">Nom</th>
                <th className="text-left px-3 py-2">Prénom</th>
                <th className="text-left px-3 py-2">Classe</th>
                <th className="text-left px-3 py-2">Sexe</th>
                <th className="text-left px-3 py-2">Temps 200m</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((e) => (
                <tr key={e.id} className="border-t border-white/5">
                  <td className="px-3 py-1.5">
                    <input
                      value={e.nom}
                      onChange={(ev) => modifier(e.id, "nom", ev.target.value)}
                      className="bg-transparent w-full focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <input
                      value={e.prenom}
                      onChange={(ev) => modifier(e.id, "prenom", ev.target.value)}
                      className="bg-transparent w-full focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <input
                      value={e.classe}
                      onChange={(ev) => modifier(e.id, "classe", ev.target.value)}
                      className="bg-transparent w-20 focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <select
                      value={e.sexe}
                      onChange={(ev) => modifier(e.id, "sexe", ev.target.value)}
                      className="bg-transparent focus:outline-none"
                    >
                      <option value="">—</option>
                      <option value="F">F</option>
                      <option value="M">M</option>
                    </select>
                  </td>
                  <td className="px-3 py-1.5">
                    <input
                      placeholder="ex : 32.4"
                      defaultValue={e.temps200 != null ? (e.temps200 / 1000).toFixed(1) : ""}
                      onBlur={(ev) => modifier(e.id, "temps200", parseTempsSaisi(ev.target.value))}
                      className="bg-transparent w-20 tabular focus:outline-none placeholder:text-piste-craie/20"
                    />
                    <span className="text-piste-craie/30 ml-1">s</span>
                  </td>
                  <td className="px-2">
                    <button onClick={() => supprimer(e.id)} className="text-piste-craie/30 hover:text-piste-brique">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {importOuvert && (
        <ImportEleves elevesExistants={eleves} onImporte={importerEleves} onFermer={() => setImportOuvert(false)} />
      )}
    </div>
  );
}
