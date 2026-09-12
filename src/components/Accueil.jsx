import { useState } from "react";
import { Trash2, Plus, ChevronRight, Users, Share2, Copy, Check, LogOut } from "lucide-react";
import ImportEleves from "./ImportEleves";
import AccesTab from "./AccesTab";

function PartagerApp() {
  const [ouvert, setOuvert] = useState(false);
  const [copie, setCopie] = useState(false);
  const url = typeof window !== "undefined" ? window.location.origin : "";
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(url)}`;

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch (e) {}
  };

  const partager = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "Relais 200m", text: "Application d'évaluation du relais 2x200m", url }); } catch (e) { /* annulé */ }
    } else {
      copier();
    }
  };

  return (
    <div className="bg-piste-panneau border border-white/10 rounded-xl p-3.5 mb-5">
      <button onClick={() => setOuvert((o) => !o)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-piste-nuit flex items-center justify-center">
            <Share2 size={14} className="text-piste-craie/50" />
          </div>
          <p className="text-sm font-medium text-piste-craie">Partager l'appli</p>
        </div>
        <ChevronRight size={16} className={`text-piste-craie/30 transition ${ouvert ? "rotate-90" : ""}`} />
      </button>

      {ouvert && (
        <div className="mt-4 flex flex-col items-center gap-3">
          <div className="bg-white p-2.5 rounded-xl">
            <img src={qrSrc} alt="QR code de l'appli" width={160} height={160} />
          </div>
          <p className="text-xs text-piste-craie/40 text-center break-all px-2">{url || "Adresse disponible une fois l'appli déployée"}</p>
          <button onClick={partager} className="w-full bg-piste-brique text-white text-xs font-medium rounded-lg py-2.5 flex items-center justify-center gap-1.5">
            <Share2 size={13} /> Partager le lien
          </button>
          <button onClick={copier} className="w-full bg-piste-nuit text-piste-craie/80 text-xs font-medium rounded-lg py-2.5 flex items-center justify-center gap-1.5">
            {copie ? <><Check size={13} /> Lien copié</> : <><Copy size={13} /> Copier le lien</>}
          </button>
          <p className="text-[10px] text-piste-craie/30 text-center">Fais scanner ce code, partage le lien via ta messagerie préférée, ou transmets-le pour partager l'appli avec un collègue.</p>
        </div>
      )}
    </div>
  );
}

// profConnecte: { nom, admin }
// vue: "mes-classes" | "globale" | "acces"
export default function Accueil({
  profConnecte, estAdmin, acces, onSauverAcces,
  vue, setVue, collegueVu, setCollegueVu,
  eleves, classesInfo, onImporte, onOuvrir, onSupprimer, onDeconnexion,
}) {
  const [importOuvert, setImportOuvert] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-piste-nuit text-piste-craie">
      <header className="px-4 pt-8 pb-4 flex flex-col items-center gap-2">
        <img src="/icons/icon-512.png" alt="" className="w-14 h-14 rounded-2xl" />
        <div className="text-center">
          <h1 className="font-display text-2xl font-800 tracking-wide uppercase leading-none">
            Relais <span className="text-piste-brique">200m</span>
          </h1>
          <p className="text-xs text-piste-craie/40 mt-1">{profConnecte.nom}</p>
        </div>
        <button onClick={onDeconnexion} className="flex items-center gap-1.5 text-[11px] text-piste-craie/40 hover:text-piste-craie">
          <LogOut size={12} /> Se déconnecter
        </button>
      </header>

      <main className="flex-1 max-w-lg w-full mx-auto px-4 pb-10">
        {estAdmin && (
          <div className="flex gap-2 mb-5 overflow-x-auto">
            {[
              { id: "mes-classes", label: "Mes classes" },
              { id: "globale", label: "Vue globale" },
              { id: "acces", label: "Accès" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setVue(t.id)}
                className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition ${vue === t.id ? "bg-piste-brique border-piste-brique text-white" : "border-white/10 text-piste-craie/50"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {vue === "globale" && (
          <select
            value={collegueVu}
            onChange={(e) => setCollegueVu(e.target.value)}
            className="w-full bg-piste-panneau border border-white/10 rounded-xl px-4 py-3 text-sm text-piste-craie mb-5"
          >
            <option value="" disabled>Choisir un collègue...</option>
            {(acces.collegues || []).map((c) => <option key={c.nom} value={c.nom}>{c.nom}</option>)}
          </select>
        )}

        {vue === "acces" ? (
          <AccesTab acces={acces} onSauver={onSauverAcces} />
        ) : vue === "globale" && !collegueVu ? (
          <p className="text-center text-sm text-piste-craie/40 border border-dashed border-white/10 rounded-xl p-8">
            Choisis un collègue pour voir ses classes.
          </p>
        ) : (
          <>
            <PartagerApp />

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
                  <div key={c.nom} className="flex items-center gap-1 bg-piste-panneau border border-white/10 rounded-xl pr-2">
                    <button onClick={() => onOuvrir(c.nom)} className="flex-1 flex items-center gap-3 text-left px-4 py-3">
                      <div className="w-10 h-10 rounded-lg bg-piste-nuit flex items-center justify-center shrink-0">
                        <Users size={18} className="text-piste-craie/50" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-display text-lg tracking-wide leading-none truncate">{c.nom}</div>
                        <div className="text-xs text-piste-craie/40 mt-0.5">{c.nbEleves} élève{c.nbEleves > 1 ? "s" : ""}</div>
                      </div>
                      <ChevronRight size={18} className="text-piste-craie/30 shrink-0" />
                    </button>
                    <button onClick={() => onSupprimer(c.nom)} title={`Supprimer la classe ${c.nom}`} className="p-2 text-piste-craie/30 hover:text-piste-brique shrink-0">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {importOuvert && (
        <ImportEleves
          elevesExistants={eleves}
          onImporte={(nouveaux) => { onImporte(nouveaux); setImportOuvert(false); }}
          onFermer={() => setImportOuvert(false)}
        />
      )}
    </div>
  );
}
