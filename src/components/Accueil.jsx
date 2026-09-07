import { useState } from "react";
import { Trash2, Plus, ChevronRight, Users } from "lucide-react";
import ImportEleves from "./ImportEleves";

export default function Accueil({ eleves, classesInfo, onImporte, onOuvrir, onSupprimer }) {
  const [importOuvert, setImportOuvert] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-piste-nuit text-piste-craie">
      <header className="px-4 pt-10 pb-4 flex flex-col items-center gap-3">
        <img src="/icons/icon-512.png" alt="" className="w-16 h-16 rounded-2xl" />
        <div className="text-center">
          <h1 className="font-display text-2xl font-800 tracking-wide uppercase leading-none">
            Relais <span className="text-piste-brique">200m</span>
          </h1>
          <p className="text-xs text-piste-craie/40 mt-1">Choisis une classe pour commencer</p>
        </div>
      </header>

      <main className="flex-1 max-w-lg w-full mx-auto px-4 pb-10">
        <button
          onClick={() => setImportOuvert(true)}
          className="w-full flex items-center justify-center gap-2 bg-piste-brique hover:bg-piste-briqueclair px-4 py-3 rounded-xl font-display text-lg tracking-wide mb-5"
        >
          <Plus size={18} /> Importer une classe
        </button>

        {classesInfo.length === 0 ? (
          <p className="text-center text-sm text-piste-craie/40 border border-dashed border-white/10 rounded-xl p-8">
            Aucune classe importée pour l'instant.
          </p>
        ) : (
          <div className="space-y-2">
            {classesInfo.map((c) => (
              <div
                key={c.nom}
                className="flex items-center gap-1 bg-piste-panneau border border-white/10 rounded-xl pr-2"
              >
                <button onClick={() => onOuvrir(c.nom)} className="flex-1 flex items-center gap-3 text-left px-4 py-3">
                  <div className="w-10 h-10 rounded-lg bg-piste-nuit flex items-center justify-center shrink-0">
                    <Users size={18} className="text-piste-craie/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-lg tracking-wide leading-none truncate">{c.nom}</div>
                    <div className="text-xs text-piste-craie/40 mt-0.5">
                      {c.nbEleves} élève{c.nbEleves > 1 ? "s" : ""}
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-piste-craie/30 shrink-0" />
                </button>
                <button
                  onClick={() => onSupprimer(c.nom)}
                  title={`Supprimer la classe ${c.nom}`}
                  className="p-2 text-piste-craie/30 hover:text-piste-brique shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {importOuvert && (
        <ImportEleves
          elevesExistants={eleves}
          onImporte={(nouveaux) => {
            onImporte(nouveaux);
            setImportOuvert(false);
          }}
          onFermer={() => setImportOuvert(false)}
        />
      )}
    </div>
  );
}
