import { uid } from "./storage";

// Construit le classement initial : tous les élèves ayant un temps au 200m,
// du plus rapide au plus lent, avec un séparateur inséré tous les `taille`
// élèves (reste fusionné au dernier groupe, comme la formation automatique).
export function construireClassement(eleves, taille = 2) {
  const avecTemps = [...eleves]
    .filter((e) => typeof e.temps200 === "number")
    .sort((a, b) => a.temps200 - b.temps200);

  const tokens = [];
  avecTemps.forEach((el, idx) => {
    if (idx > 0 && idx % taille === 0) tokens.push({ id: uid(), type: "sep" });
    tokens.push({ id: uid(), type: "eleve", eleveId: el.id });
  });
  return tokens;
}

// Découpe le classement (tokens) en groupes d'ids élèves, en coupant à
// chaque séparateur. Les groupes vides (deux séparateurs collés, ou en
// début/fin de liste) sont ignorés.
export function groupesDepuisClassement(tokens) {
  const groupes = [[]];
  tokens.forEach((tok) => {
    if (tok.type === "sep") groupes.push([]);
    else groupes[groupes.length - 1].push(tok.eleveId);
  });
  return groupes.filter((g) => g.length > 0);
}

export function deplacerToken(tokens, idDeplace, indexCible) {
  const indexSource = tokens.findIndex((t) => t.id === idDeplace);
  if (indexSource === -1) return tokens;
  const copie = [...tokens];
  const [token] = copie.splice(indexSource, 1);
  let cible = indexCible;
  if (indexSource < indexCible) cible -= 1;
  copie.splice(cible, 0, token);
  return copie;
}
