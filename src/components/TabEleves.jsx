import React, { useState } from "react";
import { UploadCloud, Pencil, Trash2, RotateCcw, X, IdCard } from "lucide-react";
import { formatChrono, parseTempsSaisi } from "../utils/temps";
import { uid } from "../utils/storage";
import { manchesEleve } from "../utils/equipes";
import TestSerie from "./TestSerie";
import ImportEleves from "./ImportEleves";

const ELEVE_VIDE = { nom: "", prenom: "", sexe: "", classeOrigine: "", temps200: null };

function FicheEleveModal({ eleves, equipes, series, classeActive, idInitial, onAjouter, onModifier, onSupprimer, onFermer }) {
  const [idSelectionne, setIdSelectionne] = useState(idInitial || "");
  const [brouillon, setBrouillon] = useState(() => {
    const e = eleves.find((el) => el.id === idInitial);
    return e
      ? { nom: e.nom, prenom: e.prenom, sexe: e.sexe || "", classeOrigine: e.classeOrigine || "", temps200: e.temps200 }
      : ELEVE_VIDE;
  });

  const performances = idSelectionne ? manchesEleve(idSelectionne, equipes, series) : [];

  function choisir(id) {
    setIdSelectionne(id);
    const e = eleves.find((el) => el.id === id);
    setBrouillon(
      e ? { nom: e.nom, prenom: e.prenom, sexe: e.sexe || "", classeOrigine: e.classeOrigine || "", temps200: e.temps200 } : ELEVE_VIDE
    );
  }

  function valider() {
    if (idSelectionne) {
      onModifier(idSelectionne, brouillon);
    } else {
      onAjouter(brouillon);
      setBrouillon(ELEVE_VIDE);
    }
  }

  function supprimerEtFermer() {
    if (!confirm(`Supprimer ${brouillon.prenom} ${brouillon.nom} de la classe ${classeActive} ?`)) return;
    onSupprimer(idSelectionne);
    onFermer();
  }

  return (
    <div className="fixed inset-0 z-30 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-piste-nuit border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto text-piste-craie">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="font-display text-xl tracking-wide">
            {idSelectionne ? "Fiche élève" : "Édition élève"} · {classeActive}
          </h3>
          <button onClick={onFermer} className="p-1.5 rounded-full hover:bg-white/10 text-piste-craie/60">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-piste-craie/50 block mb-1">Élève</label>
            <select
              value={idSelectionne}
              onChange={(e) => choisir(e.target.value)}
              className="w-full bg-piste-panneau border border-white/10 rounded-xl px-4 py-3 text-sm"
            >
              <option value="">+ Nouvel élève</option>
              {[...eleves]
                .sort((a, b) => (a.nom + a.prenom).localeCompare(b.nom + b.prenom))
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nom} {e.prenom}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-piste-craie/50 block mb-1">Nom</label>
              <input
                autoFocus
                value={brouillon.nom}
                onChange={(e) => setBrouillon((b) => ({ ...b, nom: e.target.value }))}
                className="w-full bg-piste-panneau border border-white/10 rounded-xl px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-piste-craie/50 block mb-1">Prénom</label>
              <input
                value={brouillon.prenom}
                onChange={(e) => setBrouillon((b) => ({ ...b, prenom: e.target.value }))}
                className="w-full bg-piste-panneau border border-white/10 rounded-xl px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-piste-craie/50 block mb-1">Sexe</label>
              <select
                value={brouillon.sexe}
                onChange={(e) => setBrouillon((b) => ({ ...b, sexe: e.target.value }))}
                className="w-full bg-piste-panneau border border-white/10 rounded-xl px-4 py-3 text-sm"
              >
                <option value="">—</option>
                <option value="F">F</option>
                <option value="M">M</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-piste-craie/50 block mb-1">Temps 200m (s)</label>
              <input
                key={idSelectionne + "-" + brouillon.temps200}
                placeholder="ex : 32.4"
                defaultValue={brouillon.temps200 != null ? (brouillon.temps200 / 1000).toFixed(1) : ""}
                onBlur={(e) => setBrouillon((b) => ({ ...b, temps200: parseTempsSaisi(e.target.value) }))}
                className="w-full bg-piste-panneau border border-white/10 rounded-xl px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-piste-craie/50 block mb-1">
              Classe d'origine <span className="text-piste-craie/30">(si groupe classe : d'où vient cet élève)</span>
            </label>
            <input
              placeholder="ex : 2NDE3"
              value={brouillon.classeOrigine}
              onChange={(e) => setBrouillon((b) => ({ ...b, classeOrigine: e.target.value }))}
              className="w-full bg-piste-panneau border border-white/10 rounded-xl px-4 py-3 text-sm"
            />
          </div>

          {idSelectionne && (
            <div>
              <div className="text-xs text-piste-craie/50 mb-1.5">
                Performances collectives sur ce cycle {performances.length > 0 ? `(${performances.length})` : ""}
              </div>
              {performances.length === 0 ? (
                <p className="text-xs text-piste-craie/30 border border-dashed border-white/10 rounded-lg px-3 py-2">
                  Aucune manche courue pour l'instant avec cet élève.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {performances.map(({ serie, equipeId, equipe, temps }) => (
                    <span
                      key={serie.id}
                      className="text-xs rounded-full px-2.5 py-1 border border-white/10 bg-piste-panneau text-piste-craie/70"
                    >
                      {equipe.nom}
                      {equipe.adhoc ? " (jour)" : ""} · {serie.nom} · {formatChrono(temps)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {idSelectionne && (
              <button
                onClick={supprimerEtFermer}
                className="flex items-center gap-2 border border-piste-brique/60 text-piste-briqueclair hover:bg-piste-brique/20 px-4 py-3 rounded-xl text-sm font-semibold"
              >
                <Trash2 size={16} /> Supprimer
              </button>
            )}
            <button
              onClick={valider}
              disabled={!brouillon.nom && !brouillon.prenom}
              className="flex-1 flex items-center justify-center gap-2 bg-piste-brique hover:bg-piste-briqueclair disabled:opacity-40 px-4 py-3 rounded-xl text-sm font-semibold"
            >
              {idSelectionne ? "Enregistrer les modifications" : "Ajouter cet élève"}
            </button>
          </div>
          {!idSelectionne && (
            <p className="text-xs text-piste-craie/40 text-center">
              L'élève ajouté apparaîtra en bas du tableau, dans la classe {classeActive}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TabEleves({ eleves, setEleves, equipes, series, classeActive }) {
  const [importOuvert, setImportOuvert] = useState(false);
  const [ficheOuverte, setFicheOuverte] = useState(false);
  const [idFiche, setIdFiche] = useState("");

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

  function ajouterEleve(donnees) {
    setEleves((prev) => [
      ...prev,
      { id: uid(), classe: classeActive, ...donnees },
    ]);
  }

  function modifier(id, champ, valeur) {
    setEleves((prev) => prev.map((el) => (el.id === id ? { ...el, [champ]: valeur } : el)));
  }

  function modifierPlusieursChamps(id, donnees) {
    setEleves((prev) => prev.map((el) => (el.id === id ? { ...el, ...donnees } : el)));
  }

  function supprimer(id) {
    setEleves((prev) => prev.filter((el) => el.id !== id));
  }

  function reinitialiserPerformances() {
    if (!confirm(`Effacer le temps au 200m de tous les élèves de la classe ${classeActive} ? Cette action est irréversible.`)) return;
    setEleves((prev) => prev.map((e) => (e.classe === classeActive ? { ...e, temps200: null } : e)));
  }

  function ouvrirFiche(id) {
    setIdFiche(id);
    setFicheOuverte(true);
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
            onClick={() => ouvrirFiche("")}
            className="flex items-center gap-2 bg-piste-brique hover:bg-piste-briqueclair px-3 py-2 rounded text-sm font-semibold"
          >
            <Pencil size={16} /> Édition élève
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
                <th></th>
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
                  <td className="pl-2">
                    <button
                      onClick={() => ouvrirFiche(e.id)}
                      title="Voir la fiche de cet élève (performances, classe d'origine...)"
                      className="text-piste-craie/30 hover:text-piste-ambre"
                    >
                      <IdCard size={15} />
                    </button>
                  </td>
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

      {ficheOuverte && (
        <FicheEleveModal
          eleves={eleves}
          equipes={equipes}
          series={series}
          classeActive={classeActive}
          idInitial={idFiche}
          onAjouter={ajouterEleve}
          onModifier={modifierPlusieursChamps}
          onSupprimer={supprimer}
          onFermer={() => setFicheOuverte(false)}
        />
      )}
    </div>
  );
}
