import React from "react";
import { Minus, Plus } from "lucide-react";

function Compteur({ valeur, onChange }) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onChange(Math.max(0, (valeur || 0) - 1))}
        className="w-6 h-6 flex items-center justify-center rounded bg-piste-nuit/60 text-piste-craie/60 hover:text-piste-brique"
      >
        <Minus size={12} />
      </button>
      <span className="tabular w-4 text-center">{valeur || 0}</span>
      <button
        onClick={() => onChange((valeur || 0) + 1)}
        className="w-6 h-6 flex items-center justify-center rounded bg-piste-nuit/60 text-piste-craie/60 hover:text-piste-pelouse"
      >
        <Plus size={12} />
      </button>
    </div>
  );
}

export default function TabRoles({ eleves, setEleves }) {
  function modifier(id, champ, valeur) {
    setEleves((prev) => prev.map((el) => (el.id === id ? { ...el, [champ]: valeur } : el)));
  }

  return (
    <div>
      <h2 className="font-display text-2xl tracking-wide mb-2">Rôles &amp; rangement</h2>
      <p className="text-xs text-piste-craie/40 mb-5">
        Sur l'ensemble du cycle, chaque élève doit être passé au moins une fois starter et une fois juge de passage
        de témoin ; le rangement du matériel est également valorisé. Le barème de points correspondant reste à
        définir — ce suivi te permet en attendant de ne pas en perdre le fil.
      </p>

      {eleves.length === 0 ? (
        <div className="text-piste-craie/50 text-sm border border-dashed border-white/10 rounded-lg p-8 text-center">
          Aucun élève pour l'instant.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-piste-panneau text-piste-craie/50 text-xs uppercase">
              <tr>
                <th className="text-left px-3 py-2">Élève</th>
                <th className="text-left px-3 py-2">Starter</th>
                <th className="text-left px-3 py-2">Juge témoin</th>
                <th className="text-left px-3 py-2">Rangement</th>
              </tr>
            </thead>
            <tbody>
              {eleves.map((el) => (
                <tr key={el.id} className="border-t border-white/5">
                  <td className="px-3 py-2">
                    {el.prenom} {el.nom}
                  </td>
                  <td className="px-3 py-2">
                    <Compteur valeur={el.nbStarter} onChange={(v) => modifier(el.id, "nbStarter", v)} />
                  </td>
                  <td className="px-3 py-2">
                    <Compteur valeur={el.nbJugeTemoin} onChange={(v) => modifier(el.id, "nbJugeTemoin", v)} />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={!!el.rangementFait}
                      onChange={(ev) => modifier(el.id, "rangementFait", ev.target.checked)}
                      className="accent-piste-pelouse w-4 h-4"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
