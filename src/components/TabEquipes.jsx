import React, { useEffect, useState } from "react";
import { Plus, X, Trash2, Users } from "lucide-react";
import { tempsEquipe, formerEquipesAutomatiquement } from "../utils/equipes";
import { formatChrono } from "../utils/temps";
import { uid } from "../utils/storage";
import Classement from "./Classement";

export default function TabEquipes({ eleves, elevesById, equipes, setEquipes, classement, setClassement, classeActive }) {
  const equipesHabituelles = equipes.filter((eq) => !eq.adhoc);
  const equipesJour = equipes.filter((eq) => eq.adhoc);

  const affectes = new Set(equipesHabituelles.flatMap((eq) => eq.membreIds));
  const nonAffectes = eleves.filter((e) => !affectes.has(e.id));

  // Présences du jour, pour générer rapidement des équipes de remplacement (absences,
  // dispenses). Réinitialisé à "tout le monde présent" à chaque changement de classe.
  const [presentIds, setPresentIds] = useState(() => new Set(eleves.map((e) => e.id)));
  const [tailleJour, setTailleJour] = useState(2);

  useEffect(() => {
    setPresentIds(new Set(eleves.map((e) => e.id)));
  }, [classeActive]);

  function basculerPresence(eleveId) {
    setPresentIds((prev) => {
      const copie = new Set(prev);
      if (copie.has(eleveId)) copie.delete(eleveId);
      else copie.add(eleveId);
      return copie;
    });
  }

  function genererEquipesJour() {
    const presents = eleves.filter((e) => presentIds.has(e.id));
    if (presents.length < 2) return;
    const groupes = formerEquipesAutomatiquement(presents, tailleJour);
    const dateStr = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
    const dejaJour = equipesJour.length;
    const nouvelles = groupes.map((g, i) => ({
      ...g,
      nom: `Équipe du jour ${dateStr} · ${dejaJour + i + 1}`,
      classe: classeActive,
      adhoc: true,
    }));
    setEquipes((prev) => [...prev, ...nouvelles]);
  }

  function supprimerEquipeJour(id) {
    if (
      !confirm(
        "Supprimer cette équipe du jour ? Les manches déjà chronométrées avec cette équipe resteront enregistrées, mais ne pourront plus être rattachées à un·e élève pour le calcul de sa note. Continuer ?"
      )
    ) {
      return;
    }
    setEquipes((prev) => prev.filter((eq) => eq.id !== id));
  }

  function nouvelleEquipeVide() {
    setEquipes((prev) => [...prev, { id: uid(), nom: `Équipe ${prev.filter((e) => !e.adhoc).length + 1}`, membreIds: [], classe: classeActive }]);
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
        equipes={equipesHabituelles}
        setEquipes={(equipesOuFn) =>
          setEquipes((prev) => {
            const jour = prev.filter((eq) => eq.adhoc);
            const habituelles = prev.filter((eq) => !eq.adhoc);
            const suivantes = typeof equipesOuFn === "function" ? equipesOuFn(habituelles) : equipesOuFn;
            return [...suivantes, ...jour];
          })
        }
      />

      <div className="bg-piste-panneau/60 rounded-lg border border-dashed border-piste-ambre/40 p-4 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Users size={16} className="text-piste-ambre" />
          <h3 className="font-display text-xl tracking-wide">Équipes du jour</h3>
        </div>
        <p className="text-xs text-piste-craie/40 mb-3">
          Pour un jour où des élèves sont absents ou dispensés : décoche qui manque aujourd'hui, puis génère des
          binômes/trinômes du jour à partir des présents. Ces équipes s'ajoutent aux équipes habituelles sans les
          modifier, sont utilisables dans Évaluation, et leurs performances comptent dans l'historique personnel de
          chaque élève.
        </p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {eleves.map((el) => {
            const present = presentIds.has(el.id);
            return (
              <button
                key={el.id}
                type="button"
                onClick={() => basculerPresence(el.id)}
                className={`text-xs px-2.5 py-1 rounded-full border ${
                  present
                    ? "border-piste-pelouse/40 bg-piste-pelouse/10 text-piste-craie/80"
                    : "border-white/10 bg-piste-nuit/40 text-piste-craie/30 line-through"
                }`}
              >
                {el.prenom}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={tailleJour}
            onChange={(ev) => setTailleJour(Number(ev.target.value))}
            className="bg-piste-nuit/60 border border-white/10 rounded px-2 py-1.5 text-xs"
          >
            <option value={2}>Binômes</option>
            <option value={3}>Trinômes</option>
          </select>
          <button
            onClick={genererEquipesJour}
            disabled={presentIds.size < 2}
            className="flex items-center gap-2 bg-piste-ambre disabled:opacity-30 text-piste-nuit font-semibold px-3 py-2 rounded text-sm"
          >
            <Plus size={15} /> Générer les équipes du jour
          </button>
        </div>

        {equipesJour.length > 0 && (
          <div className="mt-4 space-y-1.5">
            {equipesJour.map((eq) => (
              <div key={eq.id} className="flex items-center justify-between text-sm bg-piste-nuit/30 rounded px-3 py-2">
                <span>
                  <span className="text-piste-ambre">{eq.nom}</span> ·{" "}
                  {eq.membreIds.map((id) => elevesById[id]?.prenom).filter(Boolean).join(", ")}
                </span>
                <button onClick={() => supprimerEquipeJour(eq.id)} className="text-piste-craie/30 hover:text-piste-brique">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-xl tracking-wide">Équipes actuelles</h3>
        <button
          onClick={nouvelleEquipeVide}
          className="flex items-center gap-2 bg-piste-panneau border border-white/10 hover:border-piste-brique px-3 py-2 rounded text-sm"
        >
          <Plus size={16} /> Équipe vide
        </button>
      </div>

      {equipesHabituelles.length === 0 ? (
        <div className="text-piste-craie/50 text-sm border border-dashed border-white/10 rounded-lg p-8 text-center">
          Aucune équipe pour l'instant. Utilise le classement ci-dessus pour en construire, ou ajoute une équipe
          vide.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {equipesHabituelles.map((eq) => {
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

      {nonAffectes.length > 0 && equipesHabituelles.length > 0 && (
        <div className="mt-5 text-sm text-piste-craie/50">
          <span className="font-semibold text-piste-craie/70">Non affectés : </span>
          {nonAffectes.map((e) => `${e.prenom} ${e.nom}`).join(", ")}
        </div>
      )}
    </div>
  );
}
