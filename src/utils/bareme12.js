import { compositionManche, dateManche } from "./historique";
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
    .filter(
      (s) =>
        s.equipeIds.includes(equipe.id) &&
        typeof s.arrivals?.[equipe.id] === "number" &&
        s.retenues?.[equipe.id] !== false // retenue par défaut tant qu'elle n'a pas été décochée
    )
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

// Note de performance /3 qu'un·e élève aurait obtenue si une seule manche donnée (son
// temps de relais brut, en ms) avait servi de base au calcul — utile pour afficher, dans
// l'historique, ce que "vaut" chaque performance prise isolément. Indépendant du statut
// retenue/écartée de la manche : sert justement à décider si on la retient ou non.
export function performanceDepuisTempsRelais(eleve, equipe, elevesById, arriveeMs) {
  if (!equipe || (equipe.membreIds.length !== 2 && equipe.membreIds.length !== 3)) return null;
  const nb = equipe.membreIds.length;
  const coequipiers = equipe.membreIds.filter((id) => id !== eleve.id).map((id) => elevesById[id]);
  if (coequipiers.some((c) => !c)) return null;
  if (typeof eleve.temps200 !== "number" || coequipiers.some((c) => typeof c.temps200 !== "number")) return null;
  if (typeof arriveeMs !== "number") return null;

  const ratio = 2 / nb;
  const sommeIndivBrute = eleve.temps200 + coequipiers.reduce((a, c) => a + c.temps200, 0);
  const relaisMs = arriveeMs * ratio;
  const itSecondes = ((sommeIndivBrute - arriveeMs) * ratio) / 1000;

  const bareme200 = eleve.sexe === "F" ? BAREME_200M_FILLES : BAREME_200M_GARCONS;
  const baremeRelais = eleve.sexe === "F" ? BAREME_RELAIS_FILLES : BAREME_RELAIS_GARCONS;

  const note200 = chercherPoints(eleve.temps200 / 1000, bareme200);
  const noteRelais = chercherPoints(relaisMs / 1000, baremeRelais);
  const noteIT = chercherPoints(itSecondes, BAREME_IT);

  const performance = (note200 + noteRelais + noteIT) / 3;
  return Math.round(performance * 100) / 100;
}

// Calcule la performance /3 d'un·e élève à partir de TOUTES les manches auxquelles il/elle
// a participé sur le cycle, quelle que soit l'équipe utilisée pour chacune (son équipe
// habituelle, ou une équipe du jour formée en cas d'absence d'un·e partenaire). Pour
// chaque manche, l'équipe réellement utilisée ce jour-là (et donc ses coéquipiers et la
// taille binôme/trinôme) sert à ramener le temps à un équivalent binôme, avant d'agréger
// l'ensemble comme le fait calculerPerformance pour une équipe unique.
// `mode` (choisi par classe dans l'onglet Résultats, v2.6.0) :
//   "meilleure" -> moyenne des 2 MEILLEURES performances de relais du cycle
//   "derniere"  -> moyenne des 2 DERNIÈRES performances de relais du cycle (les plus récentes)
// (parmi les manches retenues/cochées ; s'il n'y en a qu'une, elle est utilisée seule).
// Note de relais = barème appliqué à la moyenne des 2 manches choisies ; indice de
// transmission = somme des 200m individuels - la meilleure de ces 2 manches (comme dans le
// référentiel officiel). Le 200m individuel utilise toujours le MEILLEUR temps de l'élève.
// (Les valeurs "meilleure"/"derniere" sont gardées telles quelles pour rester compatibles
// avec le réglage déjà enregistré en v2.6.0.)
export const MODES_NOTE_RELAIS = [
  { valeur: "meilleure", libelle: "Moyenne des 2 meilleures", court: "moy. des 2 meilleures" },
  { valeur: "derniere", libelle: "Moyenne des 2 dernières", court: "moy. des 2 dernières" },
];

export function libelleModeNoteRelais(mode) {
  return (MODES_NOTE_RELAIS.find((m) => m.valeur === mode) || MODES_NOTE_RELAIS[0]).court;
}

export function calculerPerformanceEleve(eleve, elevesById, equipes, series, mode = "meilleure") {
  if (typeof eleve.temps200 !== "number") return null;

  const points = [];
  series.forEach((s) => {
    // Composition figée au moment de la manche (v2.6.0) : indépendante des équipes actuelles.
    let team = null;
    for (const id of s.equipeIds || []) {
      const c = compositionManche(s, id, equipes);
      if (c && c.membreIds.includes(eleve.id)) {
        team = c;
        break;
      }
    }
    if (!team) return;
    const teamId = team.id;
    if (s.retenues?.[teamId] === false) return;
    const arriveeMs = s.arrivals?.[teamId];
    if (typeof arriveeMs !== "number") return;
    if (team.membreIds.length !== 2 && team.membreIds.length !== 3) return;
    const coequipiers = team.membreIds.filter((id) => id !== eleve.id).map((id) => elevesById[id]);
    if (coequipiers.some((c) => !c || typeof c.temps200 !== "number")) return;
    const nb = team.membreIds.length;
    const ratio = 2 / nb;
    const sommeIndivBrute = eleve.temps200 + coequipiers.reduce((a, c) => a + c.temps200, 0);
    points.push({
      serieId: s.id,
      date: dateManche(s),
      equipeId: teamId,
      equipeNom: team.nom,
      adhoc: !!team.adhoc,
      arriveeMs,
      relaisEquivMs: arriveeMs * ratio,
      itSecondes: ((sommeIndivBrute - arriveeMs) * ratio) / 1000,
    });
  });

  if (points.length === 0) return null;

  const meilleur = points.reduce((a, p) => (p.relaisEquivMs < a.relaisEquivMs ? p : a));
  const choisies =
    mode === "derniere"
      ? [...points].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 2)
      : [...points].sort((a, b) => a.relaisEquivMs - b.relaisEquivMs).slice(0, 2);
  const moyenneEquivMs = choisies.reduce((a, p) => a + p.relaisEquivMs, 0) / choisies.length;
  const moyenneBruteMs = choisies.reduce((a, p) => a + p.arriveeMs, 0) / choisies.length;
  // IT : calculé sur la meilleure des manches choisies (référentiel : "la meilleure des 2")
  const meilleureChoisie = choisies.reduce((a, p) => (p.relaisEquivMs < a.relaisEquivMs ? p : a));

  const bareme200 = eleve.sexe === "F" ? BAREME_200M_FILLES : BAREME_200M_GARCONS;
  const baremeRelais = eleve.sexe === "F" ? BAREME_RELAIS_FILLES : BAREME_RELAIS_GARCONS;

  const note200 = chercherPoints(eleve.temps200 / 1000, bareme200);
  const noteRelais = chercherPoints(moyenneEquivMs / 1000, baremeRelais);
  const noteIT = chercherPoints(meilleureChoisie.itSecondes, BAREME_IT);

  const performance = (note200 + noteRelais + noteIT) / 3;

  return {
    note200,
    noteRelais,
    noteIT,
    performance: Math.round(performance * 100) / 100,
    nbManches: points.length,
    nbManchesChoisies: choisies.length,
    mode,
    serieChoisieIds: choisies.map((p) => p.serieId),
    relaisChoisiMs: moyenneBruteMs,
    relaisChoisiEquivMs: moyenneEquivMs,
    meilleurRelaisMs: meilleur.relaisEquivMs,
    itSecondes: Math.round(meilleureChoisie.itSecondes * 100) / 100,
    aUneEquipeDuJour: points.some((p) => p.adhoc),
    manches: points,
  };
}

// Note /3 (barème 200m individuel) d'un temps donné, selon le sexe de l'élève.
export function noteTemps200(eleve, tempsMs) {
  if (typeof tempsMs !== "number") return null;
  const bareme200 = eleve?.sexe === "F" ? BAREME_200M_FILLES : BAREME_200M_GARCONS;
  return chercherPoints(tempsMs / 1000, bareme200);
}

// Détail des notes d'UNE manche pour un·e élève (relais, IT, 200m retenu, moyenne /3).
// Renvoie null si le calcul n'est pas possible (temps 200m manquant...).
export function detailNoteManche(eleve, equipe, elevesById, arriveeMs) {
  if (!equipe || (equipe.membreIds.length !== 2 && equipe.membreIds.length !== 3)) return null;
  if (typeof arriveeMs !== "number" || typeof eleve?.temps200 !== "number") return null;
  const coequipiers = equipe.membreIds.filter((id) => id !== eleve.id).map((id) => elevesById[id]);
  if (coequipiers.some((c) => !c || typeof c.temps200 !== "number")) return null;
  const nb = equipe.membreIds.length;
  const ratio = 2 / nb;
  const sommeIndivBrute = eleve.temps200 + coequipiers.reduce((a, c) => a + c.temps200, 0);
  const relaisMs = arriveeMs * ratio;
  const itSecondes = ((sommeIndivBrute - arriveeMs) * ratio) / 1000;
  const bareme200 = eleve.sexe === "F" ? BAREME_200M_FILLES : BAREME_200M_GARCONS;
  const baremeRelais = eleve.sexe === "F" ? BAREME_RELAIS_FILLES : BAREME_RELAIS_GARCONS;
  const note200 = chercherPoints(eleve.temps200 / 1000, bareme200);
  const noteRelais = chercherPoints(relaisMs / 1000, baremeRelais);
  const noteIT = chercherPoints(itSecondes, BAREME_IT);
  return {
    note200,
    noteRelais,
    noteIT,
    itSecondes: Math.round(itSecondes * 100) / 100,
    performance: Math.round(((note200 + noteRelais + noteIT) / 3) * 100) / 100,
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
