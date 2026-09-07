import React, { useState } from "react";
import { GripVertical, Plus, X, ListChecks, RefreshCw } from "lucide-react";
import { formatChrono } from "../utils/temps";
import { construireClassement, groupesDepuisClassement, deplacerToken } from "../utils/classement";
import { uid } from "../utils/storage";

export default function Classement({ eleves, elevesById, classement, setClassement, setEquipes, equipes }) {
  const [taille, setTaille] = useState(2);
  const [dragId, setDragId] = useState(null);

  function regenerer() {
    if (
      classement.length > 0 &&
      !confirm("Reconstruire le classement depuis les temps actuels ? Les espaces placés à la main seront perdus.")
    ) {
      return;
    }
    setClassement(construireClassement(eleves, taille));
  }

  function inserer_separateur_apres(index) {
    const copie = [...classement];
    copie.splice(index + 1, 0, { id: uid(), type: "sep" });
    setClassement(copie);
  }

  function supprimerSeparateur(id) {
    setClassement(classement.filter((t) => t.id !== id));
  }

  function onDrop(index) {
    if (dragId == null) return;
    setClassement(deplacerToken(classement, dragId, index));
    setDragId(null);
  }

  function validerEquipes() {
    const groupes = groupesDepuisClassement(classement);
    if (groupes.length === 0) return;
    if (equipes.length > 0 && !confirm(`Remplacer les équipes actuelles par les ${groupes.length} groupe(s) ci-dessus ?`)) {
      return;
    }
    setEquipes(
      groupes.map((membreIds, idx) => ({ id: uid(), nom: `Équipe ${idx + 1}`, membreIds }))
    );
  }

  const nombreGroupes = groupesDepuisClassement(classement).length;

  return (
    <div className="bg-piste-panneau rounded-xl border border-white/10 p-5 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <h3 className="font-display text-xl tracking-wide">Classement &amp; construction des équipes</h3>
        <div className="flex items-center gap-2">
          <div className="flex bg-piste-nuit/60 rounded overflow-hidden text-xs">
            <button onClick={() => setTaille(2)} className={`px-2 py-1.5 ${taille === 2 ? "bg-piste-brique" : "text-piste-craie/50"}`}>
              Binômes
            </button>
            <button onClick={() => setTaille(3)} className={`px-2 py-1.5 ${taille === 3 ? "bg-piste-brique" : "text-piste-craie/50"}`}>
              Trinômes
            </button>
          </div>
          <button onClick={regenerer} className="flex items-center gap-1.5 text-xs bg-piste-nuit/60 hover:bg-piste-nuit px-2.5 py-1.5 rounded">
            <RefreshCw size={13} /> Régénérer
          </button>
        </div>
      </div>
      <p className="text-xs text-piste-craie/40 mb-4">
        Classement de tous les élèves testés, du plus rapide au plus lent. Fais glisser un élève pour ajuster son
        rang, et insère un espace pour délimiter chaque équipe.
      </p>

      {classement.length === 0 ? (
        <p className="text-sm text-piste-craie/50">
          Aucun classement pour l'instant. Renseigne d'abord les temps au 200m, puis clique sur « Régénérer ».
        </p>
      ) : (
        <>
          <div className="space-y-0.5">
            {classement.map((tok, idx) => {
              const prochainEstSep = classement[idx + 1]?.type === "sep";
              if (tok.type === "sep") {
                return (
                  <div
                    key={tok.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onDrop(idx)}
                    className="flex items-center gap-2 py-1"
                  >
                    <div className="flex-1 border-t-2 border-dashed border-piste-brique/50" />
                    <span className="text-[10px] uppercase text-piste-brique/70">nouvelle équipe</span>
                    <div className="flex-1 border-t-2 border-dashed border-piste-brique/50" />
                    <button onClick={() => supprimerSeparateur(tok.id)} className="text-piste-craie/30 hover:text-piste-brique">
                      <X size={13} />
                    </button>
                  </div>
                );
              }
              const el = elevesById[tok.eleveId];
              if (!el) return null;
              return (
                <div key={tok.id}>
                  <div
                    draggable
                    onDragStart={() => setDragId(tok.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onDrop(idx)}
                    className="flex items-center gap-2 bg-piste-nuit/40 hover:bg-piste-nuit/70 rounded px-2 py-1.5 cursor-grab active:cursor-grabbing text-sm"
                  >
                    <GripVertical size={14} className="text-piste-craie/25 shrink-0" />
                    <span className="w-6 text-piste-ambre font-display text-base shrink-0">{idx + 1}</span>
                    <span className="flex-1">
                      {el.prenom} {el.nom}
                    </span>
                    <span className="tabular text-piste-craie/40 text-xs">{(el.temps200 / 1000).toFixed(1)}s</span>
                  </div>
                  {!prochainEstSep && (
                    <button
                      onClick={() => inserer_separateur_apres(idx)}
                      title="Insérer un espace ici"
                      className="w-full flex items-center justify-center h-2 text-piste-craie/0 hover:text-piste-brique/60 hover:h-4 transition-all"
                    >
                      <Plus size={12} />
                    </button>
                  )}
                </div>
              );
            })}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(classement.length)}
              className="h-2"
            />
          </div>

          <button
            onClick={validerEquipes}
            className="mt-4 flex items-center gap-2 bg-piste-brique hover:bg-piste-briqueclair px-4 py-2 rounded font-display text-lg tracking-wide"
          >
            <ListChecks size={18} /> Valider ces {nombreGroupes} équipe{nombreGroupes > 1 ? "s" : ""}
          </button>
        </>
      )}
    </div>
  );
}
