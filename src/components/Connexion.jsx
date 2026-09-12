import { useState } from "react";
import { Lock } from "lucide-react";

// profs: [{ nom, pin, admin? }]
export default function Connexion({ profs, onValide }) {
  const [profId, setProfId] = useState("");
  const [pin, setPin] = useState("");
  const [erreur, setErreur] = useState(false);

  function valider() {
    const p = profs.find((x) => x.nom === profId);
    if (p && p.pin === pin) { onValide(p); return; }
    setErreur(true);
    setPin("");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-piste-nuit text-piste-craie px-6">
      <div className="w-14 h-14 rounded-2xl bg-piste-panneau flex items-center justify-center">
        <Lock size={22} className="text-piste-ambre" />
      </div>
      <div className="text-center">
        <h1 className="font-display text-2xl font-800 tracking-wide uppercase leading-none">
          Relais <span className="text-piste-brique">200m</span>
        </h1>
        <p className="text-xs text-piste-craie/40 mt-1">Ton nom et ton code d'accès personnel</p>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <select
          value={profId}
          onChange={(e) => { setProfId(e.target.value); setErreur(false); }}
          className="w-full bg-piste-panneau border border-white/10 rounded-xl px-4 py-3 text-sm text-piste-craie focus:outline-none focus:ring-2 focus:ring-piste-ambre"
        >
          <option value="" disabled>Sélectionne ton nom...</option>
          {profs.map((p) => <option key={p.nom} value={p.nom}>{p.nom}</option>)}
        </select>
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setErreur(false); }}
          placeholder="Code d'accès"
          className="w-full bg-piste-panneau border border-white/10 rounded-xl px-4 py-3 text-lg text-center tracking-widest text-piste-craie focus:outline-none focus:ring-2 focus:ring-piste-ambre"
        />
        {erreur && <p className="text-xs text-piste-brique text-center">Nom ou code incorrect.</p>}
        <button
          onClick={valider}
          className="w-full bg-piste-brique hover:bg-piste-briqueclair text-white font-display text-lg tracking-wide py-3 rounded-xl"
        >
          Se connecter
        </button>
      </div>
    </div>
  );
}
