import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatChrono, parseTempsSaisi } from "../utils/temps";
import { uid } from "../utils/storage";

function Colonne({ titre, paliers, setPaliers }) {
  function ajouter() {
    setPaliers([...paliers, { id: uid(), tempsMaxMs: 0, note: 20 }]);
  }
  function modifier(id, champ, valeur) {
    setPaliers(paliers.map((p) => (p.id === id ? { ...p, [champ]: valeur } : p)));
  }
  function supprimer(id) {
    setPaliers(paliers.filter((p) => p.id !== id));
  }

  const tries = [...paliers].sort((a, b) => a.tempsMaxMs - b.tempsMaxMs);

  return (
    <div className="bg-piste-panneau rounded-lg border border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-xl tracking-wide">{titre}</h3>
        <button onClick={ajouter} className="flex items-center gap-1 text-xs bg-piste-brique px-2 py-1 rounded">
          <Plus size={14} /> Palier
        </button>
      </div>
      {tries.length === 0 ? (
        <p className="text-xs text-piste-craie/40">Aucun palier renseigné.</p>
      ) : (
        <div className="space-y-2">
          {tries.map((p) => (
            <div key={p.id} className="flex items-center gap-2 text-sm">
              <span className="text-piste-craie/40">≤</span>
              <input
                defaultValue={(p.tempsMaxMs / 1000).toFixed(1)}
                onBlur={(ev) => modifier(p.id, "tempsMaxMs", parseTempsSaisi(ev.target.value) || 0)}
                className="bg-piste-nuit/60 rounded px-2 py-1 w-20 tabular focus:outline-none"
              />
              <span className="text-piste-craie/40">s ({formatChrono(p.tempsMaxMs)}) →</span>
              <input
                type="number"
                step="0.25"
                min="0"
                max="20"
                value={p.note}
                onChange={(ev) => modifier(p.id, "note", parseFloat(ev.target.value))}
                className="bg-piste-nuit/60 rounded px-2 py-1 w-16 tabular focus:outline-none"
              />
              <span className="text-piste-craie/40">/20</span>
              <button onClick={() => supprimer(p.id)} className="ml-auto text-piste-craie/30 hover:text-piste-brique">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TabBareme({ bareme, setBareme }) {
  return (
    <div>
      <h2 className="font-display text-2xl tracking-wide mb-2">Barème</h2>
      <p className="text-xs text-piste-craie/40 mb-5">
        Paliers temps → note pour les filles et les garçons, prévus pour des équipes de 2 (binômes). Le temps de
        référence est la moyenne des 2 courses de l'équipe. Pour un trinôme, l'application ramène automatiquement
        le temps à un équivalent binôme (règle de trois sur le nombre de relayeurs) avant de consulter ce barème.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        <Colonne titre="Filles" paliers={bareme.filles} setPaliers={(v) => setBareme({ ...bareme, filles: v })} />
        <Colonne titre="Garçons" paliers={bareme.garcons} setPaliers={(v) => setBareme({ ...bareme, garcons: v })} />
      </div>
    </div>
  );
}
