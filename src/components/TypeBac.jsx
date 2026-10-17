// Type d'évaluation d'une classe (v2.10.0) : Bac général et technologique ou Bac professionnel.
// Réglage enregistré dans le document de la classe (champ "typeBac" : "gt" | "pro").
// Une classe créée avant ce réglage n'a pas le champ : elle est affichée « à préciser » et
// toutes ses données (élèves, équipes, manches, notes) restent strictement inchangées.
export const TYPES_BAC = [
  { valeur: "gt", court: "Bac GT", long: "Bac général et technologique" },
  { valeur: "pro", court: "Bac Pro", long: "Bac professionnel" },
];

export function libelleTypeBac(valeur, long = false) {
  const t = TYPES_BAC.find((x) => x.valeur === valeur);
  if (!t) return "Type de bac à préciser";
  return long ? t.long : t.court;
}

// Sélecteur compact à deux boutons (utilisable dans la liste des classes et dans une classe ouverte)
export function ChoixTypeBac({ valeur, onChange, taille = "petit" }) {
  const pad = taille === "petit" ? "px-2.5 py-1 text-[11px]" : "px-4 py-2 text-sm";
  return (
    <div className="inline-flex rounded-lg border border-white/15 overflow-hidden" role="group" aria-label="Type d'évaluation">
      {TYPES_BAC.map((t) => (
        <button
          key={t.valeur}
          type="button"
          onClick={(e) => { e.stopPropagation(); onChange(t.valeur); }}
          className={`${pad} font-semibold tracking-wide ${valeur === t.valeur ? "bg-piste-ambre text-piste-nuit" : "bg-piste-nuit text-piste-craie/50 hover:text-piste-craie"}`}
        >
          {t.court}
        </button>
      ))}
    </div>
  );
}
