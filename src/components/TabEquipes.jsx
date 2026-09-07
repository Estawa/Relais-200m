import React from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { tempsEquipe } from "../utils/equipes";
import { formatChrono } from "../utils/temps";
import { uid } from "../utils/storage";
import Classement from "./Classement";

export default function TabEquipes({ eleves, elevesById, equipes, setEquipes, classement, setClassement }) {
  const affectes = new Set(equipes.flatMap((eq) => eq.membreIds));
  const nonAffectes = eleves.filter((e) => !affectes.has(e.id));

  function nouvelleEquipeVide() {
    setEquipes((prev) => [...prev, { id: uid(), nom: `Équipe ${prev.length + 1}`, membreIds: [] }]);
  }

  function renommer(id, nom) {
    setEquipes((prev) => prev.map((eq) => (eq.id === id ? { ...eq, nom } : eq)));
  }

  function retirerMembre(equipeId, eleveId) {
    setEquipes((prev) =>
      prev.map((eq) => (eq.id === equipeId ? { ...eq, membreIds: eq.membreIds.filter((id) => id !== eleveId) } : eq))
    );
  }

  function ajouterMembre(equipeId, eleveId) {
    if (!eleveId) return;
    setEquipes((prev) => prev.map((eq) => (eq.id === equipeId ? { ...eq, membreIds: [...eq.membreIds, eleveId] } : eq)));
  }

  function supprimerEquipe(id) {
    setEquipes((prev) => prev.filter((eq) => eq.id !== id));
  }

  return (
    <div>
      <h2 className="font-display text-2xl tracking-wide mb-4">Équipes</h2>

      <Classement
        eleves={eleves}
        elevesById={elevesById}
        classement={classement}
        setClassement={setClassement}
        equipes={equipes}
        setEquipes={setEquipes}
      />

      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-xl tracking-wide">Équipes actuelles</h3>
        <button
          onClick={nouvelleEquipeVide}
          className="flex items-center gap-2 bg-piste-panneau border border-white/10 hover:border-piste-brique px-3 py-2 rounded text-sm"
        >
          <Plus size={16} /> Équipe vide
        </button>
      </div>

      {equipes.length === 0 ? (
        <div className="text-piste-craie/50 text-sm border border-dashed border-white/10 rounded-lg p-8 text-center">
          Aucune équipe pour l'instant. Utilise le classement ci-dessus pour en construire, ou ajoute une équipe
          vide.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {equipes.map((eq) => {
            const t = tempsEquipe(eq, elevesById);
            return (
              <div key={eq.id} className="bg-piste-panneau rounded-lg border border-white/10 p-4">
                <div className="flex items-center justify-between mb-2">
                  <input
                    value={eq.nom}
                    onChange={(ev) => renommer(eq.id, ev.target.value)}
                    className="bg-transparent font-display text-lg tracking-wide focus:outline-none"
                  />
                  <button onClick={() => supprimerEquipe(eq.id)} className="text-piste-craie/30 hover:text-piste-brique">
                    <Trash2 size={15} />
                  </button>
                </div>

                <ul className="space-y-1 mb-2">
                  {eq.membreIds.map((id) => {
                    const el = elevesById[id];
                    if (!el) return null;
                    return (
                      <li key={id} className="flex items-center justify-between text-sm">
                        <span>
                          {el.prenom} {el.nom}
                          <span className="text-piste-craie/30 ml-2 tabular">
                            {el.temps200 != null ? `${(el.temps200 / 1000).toFixed(1)}s` : "—"}
                          </span>
                        </span>
                        <button onClick={() => retirerMembre(eq.id, id)} className="text-piste-craie/30 hover:text-piste-brique">
                          <X size={14} />
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <div className="flex items-center justify-between border-t border-white/5 pt-2">
                  <select
                    onChange={(ev) => {
                      ajouterMembre(eq.id, ev.target.value);
                      ev.target.value = "";
                    }}
                    defaultValue=""
                    className="bg-transparent text-xs text-piste-craie/50 focus:outline-none"
                  >
                    <option value="">+ Ajouter un élève…</option>
                    {nonAffectes.map((el) => (
                      <option key={el.id} value={el.id} className="text-black">
                        {el.prenom} {el.nom}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-piste-ambre tabular font-semibold">
                    {t != null ? `Repère : ${formatChrono(t)}` : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {nonAffectes.length > 0 && equipes.length > 0 && (
        <div className="mt-5 text-sm text-piste-craie/50">
          <span className="font-semibold text-piste-craie/70">Non affectés : </span>
          {nonAffectes.map((e) => `${e.prenom} ${e.nom}`).join(", ")}
        </div>
      )}
    </div>
  );
}
