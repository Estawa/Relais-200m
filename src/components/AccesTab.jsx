import { useState } from "react";
import { UserPlus, UserX, Pencil, Check, X } from "lucide-react";

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
    </div>
  );
}
