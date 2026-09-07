// Barème officiel "Relais Long 2x200m" — Bac Pro Terminale, Académie de Versailles,
// session 2021. Situation d'évaluation fin de séquence / 12 pts :
//   AFLP 1 (7 pts) = Positionnement (4 pts, saisi par l'enseignant) + Performance (3 pts, calculée)
//   AFLP 2 (5 pts) = saisi directement par l'enseignant
//
// La performance /3 pts est la moyenne de 3 notes obtenues indépendamment sur la même
// échelle de points (0 à 3) : le temps individuel au 200m, la moyenne des 2 relais, et
// l'indice de transmission (IT = somme des deux 200m individuels des coéquipiers - la
// meilleure des 2 performances de relais). Chaque échelle ci-dessous est un tableau de
// paliers { seuil, points } ; seuil = valeur maximale (ou minimale pour l'IT) à ne pas
// dépasser pour obtenir au moins ces points.

const PTS = [0, 0.1, 0.3, 0.5, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.65, 1.7, 1.75, 1.8, 1.9, 2, 2.2, 2.4, 2.6, 2.8, 3];

// Temps en secondes, du plus lent (0 pt) au plus rapide (3 pts) — seuil = temps max autorisé.
const SEUILS_200M_FILLES = [53, 52, 51, 50, 49, 48, 47, 46, 45, 44, 43, 42, 41, 40.5, 40, 39, 38, 37, 36, 35, 34.5, 34, 33.5, 33, 32.5];
// Corrigé sur confirmation de Christophe : 32,5 et 32,7 étaient inversés dans le document
// source (32,7 doit précéder 32,5 pour rester décroissant).
const SEUILS_200M_GARCONS = [44, 43, 42, 41, 40, 39, 38, 37, 36, 35, 34, 33.5, 33, 32.7, 32.5, 32, 31, 30.5, 30, 29.5, 29, 28.5, 28, 27.5, 27];

const SEUILS_RELAIS_FILLES_S = [108, 106, 104, 102, 100, 96, 95, 94, 92, 90, 88, 86, 84, 82, 80, 79, 78, 77, 76, 75, 74, 73, 72, 71, 70];
const SEUILS_RELAIS_GARCONS_S = [85, 84, 83, 82, 81, 80, 78, 76, 74, 72, 70, 68, 66, 65, 64, 63, 62, 61, 60, 59, 58, 57, 56.5, 56, 55.5];

// Indice de transmission, en secondes (peut être négatif : plus c'est petit/négatif, mieux
// c'est). Seuil = valeur maximale (le "pire" IT encore acceptable) pour ces points. Table
// unique, commune filles/garçons.
const SEUILS_IT_S = [3.5, 3.2, 3, 2.5, 2.25, 2, 1.75, 1.5, 1, 0.7, 0.5, 0.2, 0, -0.1, -0.2, -0.3, -0.4, -0.5, -0.6, -0.7, -0.8, -0.9, -1, -1.1, -1.2];

function construireBareme(seuils) {
  return PTS.map((points, i) => ({ points, seuil: seuils[i] })).sort((a, b) => b.points - a.points);
}

export const BAREME_200M_FILLES = construireBareme(SEUILS_200M_FILLES);
export const BAREME_200M_GARCONS = construireBareme(SEUILS_200M_GARCONS);
export const BAREME_RELAIS_FILLES = construireBareme(SEUILS_RELAIS_FILLES_S);
export const BAREME_RELAIS_GARCONS = construireBareme(SEUILS_RELAIS_GARCONS_S);
export const BAREME_IT = construireBareme(SEUILS_IT_S);

// Cherche, du nombre de points le plus haut au plus bas, le premier palier atteint
// (valeur <= seuil). Si aucun palier n'est atteint (valeur au-delà du pire seuil), renvoie 0.
function chercherPoints(valeur, bareme) {
  if (valeur == null || Number.isNaN(valeur)) return null;
  const trouve = bareme.find((p) => valeur <= p.seuil);
  return trouve ? trouve.points : 0;
}

// Calcule la performance /3 pts d'un élève au sein de son équipe. Le barème officiel est
// calibré pour des binômes ; pour un trinôme, le temps de relais (moyenne et meilleur) et
// la somme des 200m individuels sont ramenés à un équivalent binôme par une règle de trois
// sur le nombre de coureurs (× 2/nb) avant d'être comparés au même barème — comme le
// faisait l'ancien système de paliers personnalisés pour les temps de relais.
// Nécessite : le temps 200m de l'élève et de tous ses coéquipiers, et au moins une manche
// chronométrée pour l'équipe. Renvoie null si le calcul n'est pas possible.
export function calculerPerformance(eleve, equipe, elevesById, series) {
  if (!equipe || (equipe.membreIds.length !== 2 && equipe.membreIds.length !== 3)) return null;
  const nb = equipe.membreIds.length;
  const coequipiers = equipe.membreIds.filter((id) => id !== eleve.id).map((id) => elevesById[id]);
  if (coequipiers.some((c) => !c)) return null;
  if (typeof eleve.temps200 !== "number" || coequipiers.some((c) => typeof c.temps200 !== "number")) return null;

  const manches = series
    .filter((s) => s.equipeIds.includes(equipe.id) && typeof s.arrivals?.[equipe.id] === "number")
    .map((s) => s.arrivals[equipe.id]);
  if (manches.length === 0) return null;

  const ratio = 2 / nb; // règle de trois : ramène un trinôme (nb=3) à un équivalent binôme
  const sommeIndivBrute = eleve.temps200 + coequipiers.reduce((a, c) => a + c.temps200, 0);

  const moyenneRelaisBruteMs = manches.reduce((a, b) => a + b, 0) / manches.length;
  const meilleurRelaisBrutMs = Math.min(...manches);
  const moyenneRelaisMs = moyenneRelaisBruteMs * ratio;
  const meilleurRelaisMs = meilleurRelaisBrutMs * ratio;
  const itSecondes = ((sommeIndivBrute - meilleurRelaisBrutMs) * ratio) / 1000;

  const bareme200 = eleve.sexe === "F" ? BAREME_200M_FILLES : BAREME_200M_GARCONS;
  const baremeRelais = eleve.sexe === "F" ? BAREME_RELAIS_FILLES : BAREME_RELAIS_GARCONS;

  const note200 = chercherPoints(eleve.temps200 / 1000, bareme200);
  const noteRelais = chercherPoints(moyenneRelaisMs / 1000, baremeRelais);
  const noteIT = chercherPoints(itSecondes, BAREME_IT);

  const performance = (note200 + noteRelais + noteIT) / 3;

  return {
    note200,
    noteRelais,
    noteIT,
    performance: Math.round(performance * 100) / 100,
    nbManches: manches.length,
    moyenneRelaisMs,
    meilleurRelaisMs,
    itSecondes: Math.round(itSecondes * 100) / 100,
    equivalentBinome: nb === 3,
  };
}

// Options de saisie directe (l'enseignant lit la description du degré atteint et choisit
// la valeur correspondante).
export const OPTIONS_POSITIONNEMENT = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4];
export const OPTIONS_AFLP2 = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

// Note /12 de la situation d'évaluation fin de séquence pour un élève.
export function noteFinSequence12(eleve, performance) {
  const positionnement = typeof eleve.aflp1Position === "number" ? eleve.aflp1Position : null;
  const aflp2 = typeof eleve.aflp2Note === "number" ? eleve.aflp2Note : null;
  const perf = performance?.performance ?? null;
  if (positionnement == null && perf == null && aflp2 == null) return null;
  const aflp1 = (positionnement ?? 0) + (perf ?? 0);
  return Math.round((aflp1 + (aflp2 ?? 0)) * 100) / 100;
}

// Note /8 du fil de séquence (AFLP4 + AFLP5), telle que saisie dans l'onglet Rôles.
export function noteFilSequence8(eleve) {
  const a4 = typeof eleve.aflp4Note === "number" ? eleve.aflp4Note : null;
  const a5 = typeof eleve.aflp5Note === "number" ? eleve.aflp5Note : null;
  if (a4 == null && a5 == null) return null;
  return Math.round(((a4 ?? 0) + (a5 ?? 0)) * 100) / 100;
}

// Note générale /20 = fin de séquence /12 + fil de séquence /8. Renvoie null si aucune des
// deux parties n'a encore été renseignée.
export function noteGenerale20(eleve, performance) {
  const note12 = noteFinSequence12(eleve, performance);
  const note8 = noteFilSequence8(eleve);
  if (note12 == null && note8 == null) return null;
  return Math.round(((note12 ?? 0) + (note8 ?? 0)) * 100) / 100;
}
