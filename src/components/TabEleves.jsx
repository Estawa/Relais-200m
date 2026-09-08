import React, { useState } from "react";
import { UploadCloud, Plus, Trash2, RotateCcw } from "lucide-react";
import { formatChrono, parseTempsSaisi } from "../utils/temps";
import { uid } from "../utils/storage";
import TestSerie from "./TestSerie";
import ImportEleves from "./ImportEleves";

export default function TabEleves({ eleves, setEleves, classeActive }) {
  const [importOuvert, setImportOuvert] = useState(false);

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
      { id: uid(), nom: "", prenom: "", classe: classeActive, sexe: "", temps200: null },
    ]);
  }

  function modifier(id, champ, valeur) {
    setEleves((prev) => prev.map((el) => (el.id === id ? { ...el, [champ]: valeur } : el)));
  }

  function supprimer(id) {
    setEleves((prev) => prev.filter((el) => el.id !== id));
  }

  function reinitialiserPerformances() {
    if (!confirm(`Effacer le temps au 200m de tous les élèves de la classe ${classeActive} ? Cette action est irréversible.`)) return;
    setEleves((prev) => prev.map((e) => (e.classe === classeActive ? { ...e, temps200: null } : e)));
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
            <UploadCloud size={16} /> Importer d'autres élèves
          </button>
          <button
            onClick={ajouterEleve}
            className="flex items-center gap-2 bg-piste-brique hover:bg-piste-briqueclair px-3 py-2 rounded text-sm font-semibold"
          >
            <Plus size={16} /> Ajouter
          </button>
        </div>
      </div>

      <TestSerie eleves={eleves} setEleves={setEleves} />

      {eleves.length > 0 && (
        <div className="flex justify-end mb-3">
          <button
            onClick={reinitialiserPerformances}
            title={`Effacer les temps au 200m de la classe ${classeActive}`}
            className="flex items-center gap-1.5 text-xs text-piste-craie/50 hover:text-piste-brique border border-white/10 hover:border-piste-brique px-2.5 py-1 rounded-full"
          >
            <RotateCcw size={12} /> Réinitialiser les temps de la classe
          </button>
        </div>
      )}

      {eleves.length === 0 ? (
        <div className="text-piste-craie/50 text-sm border border-dashed border-white/10 rounded-lg p-8 text-center">
          Aucun élève pour l'instant dans cette classe.
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
              {eleves.map((e) => (
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
                      key={e.temps200}
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
        <ImportEleves
          elevesExistants={eleves}
          onImporte={importerEleves}
          onFermer={() => setImportOuvert(false)}
          classeForcee={classeActive}
        />
      )}
    </div>
  );
}
