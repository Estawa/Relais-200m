// Parse un CSV simple exporté depuis EPS Pro : colonnes nom, prenom, classe
// (insensible à la casse et à l'ordre des colonnes, séparateur , ou ;)
export function parseElevesCsv(text) {
  const sep = text.includes(";") && !text.includes(",") ? ";" : ",";
  const lignes = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lignes.length === 0) return [];

  const entetes = lignes[0].split(sep).map((h) => h.trim().toLowerCase());
  const idxNom = entetes.findIndex((h) => h.includes("nom") && !h.includes("prenom") && !h.includes("prénom"));
  const idxPrenom = entetes.findIndex((h) => h.includes("prenom") || h.includes("prénom"));
  const idxClasse = entetes.findIndex((h) => h.includes("classe"));
  const idxSexe = entetes.findIndex((h) => h.includes("sexe") || h.includes("genre"));

  const corpsDepart = idxNom === -1 && idxPrenom === -1 ? 0 : 1;

  return lignes.slice(corpsDepart).map((ligne, i) => {
    const cols = ligne.split(sep).map((c) => c.trim());
    return {
      nom: idxNom !== -1 ? cols[idxNom] || "" : cols[0] || "",
      prenom: idxPrenom !== -1 ? cols[idxPrenom] || "" : cols[1] || "",
      classe: idxClasse !== -1 ? cols[idxClasse] || "" : cols[2] || "",
      sexe: idxSexe !== -1 ? (cols[idxSexe] || "").toUpperCase().slice(0, 1) : "",
      ordre: i,
    };
  });
}
