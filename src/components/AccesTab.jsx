import { useState } from "react";
import { UserPlus, UserX, Pencil, Check, X, Download, Upload } from "lucide-react";
import { exporterTout, restaurerTout } from "../firebase";

function decomposeCivilite(v) {
  const m = /^(Mr|Mme)\s+(.*)$/.exec(v || "");
  return m ? { civilite: m[1], nom: m[2] } : { civilite: "Mr", nom: v || "" };
}

function ChampNomAdmin({ nomAdmin, onChanger }) {
  const [edition, setEdition] = useState(false);
  const d0 = decomposeCivilite(nomAdmin);
  const [civ, setCiv] = useState(d0.civilite);
  const [nom, setNom] = useState(d0.nom);

  function valider() {
    if (!nom.trim()) return;
    onChanger(`${civ} ${nom.trim()}`);
    setEdition(false);
  }

  if (!edition) {
    return (
      <button onClick={() => setEdition(true)} className="flex items-center gap-1.5 text-xs text-piste-craie/60 mb-2">
        <Pencil size={12} /> Nom affiché : <span className="font-medium text-piste-craie">{nomAdmin}</span>
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2 mb-2">
      <select value={civ} onChange={(e) => setCiv(e.target.value)} className="bg-piste-nuit border border-white/10 rounded-lg px-2 py-1.5 text-sm text-piste-craie">
        <option value="Mr">Mr</option><option value="Mme">Mme</option>
      </select>
      <input value={nom} onChange={(e) => setNom(e.target.value)} autoFocus className="flex-1 bg-piste-nuit border border-white/10 rounded-lg px-3 py-1.5 text-sm text-piste-craie" />
      <button onClick={valider} className="p-1.5 rounded-full bg-piste-brique text-white"><Check size={13} /></button>
      <button onClick={() => setEdition(false)} className="p-1.5 rounded-full border border-white/10 text-piste-craie/50"><X size={13} /></button>
    </div>
  );
}

function ChampPinAdmin({ pinActuel, onChanger }) {
  const [edition, setEdition] = useState(false);
  const [pin, setPin] = useState("");
  const [erreur, setErreur] = useState("");

  function valider() {
    if (!/^\d{4,6}$/.test(pin)) { setErreur("4 à 6 chiffres."); return; }
    onChanger(pin);
    setEdition(false);
    setPin("");
  }

  if (!edition) {
    return (
      <button onClick={() => setEdition(true)} className="flex items-center gap-1.5 text-xs text-piste-craie/60">
        <Pencil size={12} /> Code d'accès : <span className="font-medium text-piste-craie">{pinActuel}</span> · modifier
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} inputMode="numeric" maxLength={6} autoFocus placeholder="Nouveau code" className="w-32 bg-piste-nuit border border-white/10 rounded-lg px-3 py-1.5 text-sm text-piste-craie" />
      <button onClick={valider} className="p-1.5 rounded-full bg-piste-brique text-white"><Check size={13} /></button>
      <button onClick={() => setEdition(false)} className="p-1.5 rounded-full border border-white/10 text-piste-craie/50"><X size={13} /></button>
      {erreur && <p className="text-[11px] text-piste-brique">{erreur}</p>}
    </div>
  );
}

// accesConfig: { pinAdmin, nomAdmin, collegues: [{ nom, pin }] }
export default function AccesTab({ acces, onSauver }) {
  const [civ, setCiv] = useState("Mr");
  const [nom, setNom] = useState("");
  const [pin, setPin] = useState("");
  const [erreur, setErreur] = useState("");
  const collegues = acces.collegues || [];

  function ajouter() {
    setErreur("");
    if (!nom.trim()) { setErreur("Indique le nom du collègue."); return; }
    if (!/^\d{4,6}$/.test(pin)) { setErreur("Le code doit contenir de 4 à 6 chiffres."); return; }
    if (pin === acces.pinAdmin || collegues.some((c) => c.pin === pin)) { setErreur("Ce code est déjà utilisé."); return; }
    onSauver({ ...acces, collegues: [...collegues, { nom: `${civ} ${nom.trim()}`, pin }] });
    setNom(""); setPin("");
  }

  function retirer(c) {
    if (!confirm(`Retirer l'accès de ${c.nom} ? Ses classes et données déjà enregistrées seront conservées mais ne seront plus accessibles que depuis "Vue globale".`)) return;
    onSauver({ ...acces, collegues: collegues.filter((x) => x.nom !== c.nom) });
  }

  return (
    <div className="space-y-5">
      <div className="bg-piste-panneau border border-white/10 rounded-xl p-4">
        <p className="text-xs uppercase tracking-widest text-piste-craie/40 font-semibold mb-2">Mon accès (administrateur)</p>
        <ChampNomAdmin nomAdmin={acces.nomAdmin} onChanger={(n) => onSauver({ ...acces, nomAdmin: n })} />
        <ChampPinAdmin pinActuel={acces.pinAdmin} onChanger={(p) => onSauver({ ...acces, pinAdmin: p })} />
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest text-piste-craie/40 font-semibold mb-2">Collègues autorisés</p>
        <p className="text-xs text-piste-craie/40 mb-3">Chacun a sa propre base (classes, élèves, équipes, résultats), séparée de la tienne. Toi seul peux consulter l'espace d'un collègue, depuis "Vue globale".</p>

        <div className="bg-piste-panneau border border-white/10 rounded-xl p-3.5 mb-3">
          <div className="flex gap-2 mb-2">
            <select value={civ} onChange={(e) => setCiv(e.target.value)} className="bg-piste-nuit border border-white/10 rounded-lg px-2 py-2 text-sm text-piste-craie">
              <option value="Mr">Mr</option><option value="Mme">Mme</option>
            </select>
            <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom du collègue" className="flex-1 bg-piste-nuit border border-white/10 rounded-lg px-3 py-2 text-sm text-piste-craie" />
          </div>
          <div className="flex gap-2">
            <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} inputMode="numeric" maxLength={6} placeholder="Code PIN (4 à 6 chiffres)" className="flex-1 bg-piste-nuit border border-white/10 rounded-lg px-3 py-2 text-sm text-piste-craie" />
            <button onClick={ajouter} className="flex items-center gap-1.5 bg-piste-brique hover:bg-piste-briqueclair text-white text-sm font-medium px-3.5 py-2 rounded-lg">
              <UserPlus size={14} /> Ajouter
            </button>
          </div>
          {erreur && <p className="text-xs text-piste-brique mt-2">{erreur}</p>}
        </div>

        {collegues.length === 0 ? (
          <p className="text-sm text-piste-craie/40">Aucun collègue ajouté pour l'instant.</p>
        ) : (
          <div className="space-y-2">
            {collegues.map((c) => (
              <div key={c.nom} className="flex items-center justify-between bg-piste-panneau border border-white/10 rounded-xl px-3.5 py-2.5">
                <span className="text-sm font-medium text-piste-craie">{c.nom}</span>
                <button onClick={() => retirer(c)} className="flex items-center gap-1 text-[11px] font-medium text-piste-brique border border-piste-brique/40 rounded-full px-2.5 py-1">
                  <UserX size={12} /> Retirer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <SauvegardeComplete />
    </div>
  );
}

// Sauvegarde complète du cloud (toutes les classes de tous les professeurs) dans un fichier,
// et restauration de ce fichier. Réservé à l'administrateur.
function SauvegardeComplete() {
  const [etat, setEtat] = useState("");
  const [occupe, setOccupe] = useState(false);

  async function exporter() {
    setOccupe(true); setEtat("Lecture de toutes les données du cloud…");
    try {
      const s = await exporterTout();
      const blob = new Blob([JSON.stringify(s)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `relais-200m-sauvegarde-complete-${s.exportLe.slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      setEtat(`✅ Sauvegarde téléchargée : ${s.compte.professeurs} professeur(s), ${s.compte.classes} classe(s)${s.compte.anciensBlocs ? `, ${s.compte.anciensBlocs} ancien(s) bloc(s)` : ""}, + les accès. Garde ce fichier précieusement (Drive, mail…).`);
    } catch (e) {
      setEtat("❌ Sauvegarde impossible (réseau ?). Réessaie avec une bonne connexion.");
    }
    setOccupe(false);
  }

  async function restaurer(fichier) {
    setOccupe(true); setEtat("Lecture du fichier…");
    try {
      const s = JSON.parse(await fichier.text());
      if (s.app !== "relais-200m") throw new Error("Ce fichier n'est pas une sauvegarde Relais 200m.");
      const c = s.compte || {};
      if (!confirm(`Restaurer cette sauvegarde du ${new Date(s.exportLe).toLocaleString("fr-FR")} ?\n${c.professeurs || 0} professeur(s), ${c.classes || 0} classe(s) + les accès.\nLes classes du fichier remplaceront celles qui portent le même nom ; les autres ne sont pas touchées.`)) { setOccupe(false); setEtat(""); return; }
      setEtat("Restauration en cours…");
      const n = await restaurerTout(s);
      setEtat(`✅ Restauration terminée : ${n} document(s) écrit(s). Recharge l'appli pour voir les données.`);
    } catch (e) {
      setEtat("❌ " + (e.message || "Restauration impossible."));
    }
    setOccupe(false);
  }

  return (
    <div className="bg-piste-panneau border border-white/10 rounded-xl p-4">
      <p className="text-xs uppercase tracking-widest text-piste-craie/40 font-semibold mb-2">Sauvegarde complète</p>
      <p className="text-xs text-piste-craie/40 mb-3">Un fichier avec toutes les données du cloud : les accès, et toutes les classes de tous les professeurs (élèves, équipes, résultats, rôles, réglages).</p>
      <div className="flex flex-wrap gap-2">
        <button disabled={occupe} onClick={exporter} className="flex items-center gap-1.5 bg-piste-brique hover:bg-piste-briqueclair disabled:opacity-50 text-white text-sm font-medium px-3.5 py-2 rounded-lg">
          <Download size={14} /> Sauvegarder tout
        </button>
        <label className={`flex items-center gap-1.5 border border-white/10 text-piste-craie text-sm font-medium px-3.5 py-2 rounded-lg cursor-pointer ${occupe ? "opacity-50 pointer-events-none" : ""}`}>
          <Upload size={14} /> Restaurer un fichier
          <input type="file" accept="application/json,.json" className="hidden" onChange={(e) => { if (e.target.files?.[0]) restaurer(e.target.files[0]); e.target.value = ""; }} />
        </label>
      </div>
      {etat && <p className="text-xs text-piste-craie/70 mt-3">{etat}</p>}
    </div>
  );
}
