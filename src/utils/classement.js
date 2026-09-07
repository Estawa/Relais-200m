import { uid } from "./storage";

// Construit le classement initial : tous les élèves ayant un temps au 200m,
// du plus rapide au plus lent, en insérant un séparateur selon un motif de
// tailles de groupe (ex. [3, 3, 2] -> trinôme, trinôme, binôme, puis le motif
// se répète pour le reste de la liste). Le dernier groupe incomplet est laissé
// tel quel (à ajuster à la main si besoin).
export function construireClassement(eleves, motif) {
  const avecTemps = [...eleves]
    .filter((e) => typeof e.temps200 === "number")
    .sort((a, b) => a.temps200 - b.temps200);

  const pattern = motif && motif.length ? motif : [2];
  const tokens = [];
  let motifIdx = 0;
  let compteur = 0;
  avecTemps.forEach((el, idx) => {
    if (idx > 0 && compteur === pattern[motifIdx % pattern.length]) {
      tokens.push({ id: uid(), type: "sep" });
      motifIdx++;
      compteur = 0;
    }
    tokens.push({ id: uid(), type: "eleve", eleveId: el.id });
    compteur++;
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
