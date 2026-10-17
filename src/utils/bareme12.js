import { compositionManche, dateManche } from "./historique";
// Barèmes du protocole du lycée Georges-Brassens (référentiels établissement, session 2021),
// choisis selon le type de bac de la classe (v2.11.0) :
//
// BAC PRO — situation de fin de séquence / 12 pts :
//   AFLP 1 (7 pts) = Positionnement (4 pts, saisi par l'enseignant) + Performance (3 pts, calculée)
//   AFLP 2 (5 pts) = saisi directement par l'enseignant
//   Performance /3 = moyenne de 3 notes sur la même échelle de 16 paliers (0 à 3 pts) : meilleur
//   200m individuel, moyenne des 2 relais retenus, indice de transmission (IT) sur le meilleur.
//
// BAC GT — AFL 1 / 12 pts :
//   Élément 1 (6 pts) = moyenne des 2 meilleurs relais retenus (barème 25 paliers, 0 à 6 pts)
//   Élément 2 (6 pts) = indice de transmission sur le meilleur relais (25 paliers, 0 à 6 pts)
//   Le 200m individuel ne donne pas de points : il sert au calcul de l'IT.
//
// IT = temps du relais − somme des 200m individuels (en secondes). Négatif = la transmission
// fait gagner du temps (décision du 17/10, pour le Pro et le GT). Pour un trinôme, temps et
// somme sont ramenés à un équivalent binôme par une règle de trois (× 2/3).
// Chaque échelle est un tableau de paliers { seuil, points } ; seuil = valeur maximale à ne
// pas dépasser pour obtenir ces points. Seules les notes sont recalculées : aucun temps
// enregistré n'est modifié.

// ---------- BAC PRO (16 paliers sur 3 pts) ----------
const PTS = [0, 0.25, 0.5, 0.75, 1, 1.1, 1.2, 1.3, 1.5, 1.7, 1.8, 2, 2.25, 2.5, 2.75, 3];
const SEUILS_200M_FILLES = [51, 49, 47, 45, 43, 41, 39, 37, 35, 34.5, 34.2, 34, 33.7, 33.5, 33.2, 33];
const SEUILS_200M_GARCONS = [41, 39, 37, 35, 33, 32, 31, 30, 29.2, 28.7, 28.5, 28.3, 28, 27.5, 27, 26];
const SEUILS_RELAIS_FILLES_S = [100, 97, 94, 90, 87, 84, 81, 78, 75, 74, 73, 72, 71, 70, 69, 68];
const SEUILS_RELAIS_GARCONS_S = [82, 79, 76, 73, 70, 67, 64, 61, 58.4, 57.5, 57, 56.5, 56, 55.5, 55, 54];
const SEUILS_IT_S = [4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5, 0, -0.2, -0.4, -0.6, -0.8, -1, -1.1, -1.2];

// ---------- BAC GT (25 paliers sur 6 pts, pas de 0,25) ----------
const PTS_GT = Array.from({ length: 25 }, (_, i) => i * 0.25);
const SEUILS_GT_RELAIS_FILLES_S = [106, 104, 102, 100, 98, 96, 94, 92, 90, 88, 86, 84, 80, 79, 78, 77, 76, 75, 74, 73, 72, 71, 70, 69, 68];
const SEUILS_GT_RELAIS_GARCONS_S = [83, 82, 81, 80, 79, 78, 76, 74, 72, 70, 68, 66, 64, 63, 62, 61, 60, 59, 58, 57, 56.5, 56, 55.5, 55, 54.5];
const SEUILS_GT_IT_S = [3.5, 3, 2.75, 2.5, 2, 1.75, 1.5, 1, 0.75, 0.5, 0.25, 0, -0.1, -0.2, -0.3, -0.4, -0.5, -0.6, -0.7, -0.8, -0.9, -1, -1.1, -1.2, -1.3];
// 200m de référence du protocole GT (affichés dans l'onglet Barème, non notés)
export const REF_GT_200M_FILLES = [52, 51, 50, 49, 48, 47, 46, 45, 44, 43, 42, 41, 40, 39, 38, 37, 36, 35.5, 35, 34.5, 34, 33.5, 33, 32.5, 32];
export const REF_GT_200M_GARCONS = [42, 41, 40, 39, 38, 37, 36, 35, 34, 33.5, 33, 32.5, 32, 31.5, 31, 30.5, 30, 29.5, 29, 28.5, 28, 27.5, 27, 26.5, 26];

function construireBareme(seuils, pts = PTS) {
  return pts.map((points, i) => ({ points, seuil: seuils[i] })).sort((a, b) => b.points - a.points);
}

export const BAREME_200M_FILLES = construireBareme(SEUILS_200M_FILLES);
export const BAREME_200M_GARCONS = construireBareme(SEUILS_200M_GARCONS);
export const BAREME_RELAIS_FILLES = construireBareme(SEUILS_RELAIS_FILLES_S);
export const BAREME_RELAIS_GARCONS = construireBareme(SEUILS_RELAIS_GARCONS_S);
export const BAREME_IT = construireBareme(SEUILS_IT_S);
export const BAREME_GT_RELAIS_FILLES = construireBareme(SEUILS_GT_RELAIS_FILLES_S, PTS_GT);
export const BAREME_GT_RELAIS_GARCONS = construireBareme(SEUILS_GT_RELAIS_GARCONS_S, PTS_GT);
export const BAREME_GT_IT = construireBareme(SEUILS_GT_IT_S, PTS_GT);

// Cherche, du nombre de points le plus haut au plus bas, le premier palier atteint
// (valeur <= seuil). Si aucun palier n'est atteint (valeur au-delà du pire seuil), renvoie 0.
function chercherPoints(valeur, bareme) {
  if (valeur == null || Number.isNaN(valeur)) return null;
  const trouve = bareme.find((p) => valeur <= p.seuil);
  return trouve ? trouve.points : 0;
}

const arrondi2 = (v) => Math.round(v * 100) / 100;

// Réglages de notation d'une classe. Accepte encore l'ancienne forme (simple chaîne = mode).
//   typeBac     : "gt" | "pro" (non renseigné -> Bac Pro, comme avant la v2.10.0)
//   mode        : "meilleure" | "derniere" | "epreuve"
//   dateEpreuve : "AAAA-MM-JJ", jour marqué comme épreuve (mode "epreuve")
export function normaliserReglages(r) {
  if (!r || typeof r === "string") return { typeBac: "pro", mode: r || "meilleure", dateEpreuve: null };
  return { typeBac: r.typeBac === "gt" ? "gt" : "pro", mode: r.mode || "meilleure", dateEpreuve: r.dateEpreuve || null };
}

export function estGT(reglages) {
  return normaliserReglages(reglages).typeBac === "gt";
}

function baremesPour(eleve, typeBac) {
  const fille = eleve?.sexe === "F";
  if (typeBac === "gt") {
    return { b200: null, bRelais: fille ? BAREME_GT_RELAIS_FILLES : BAREME_GT_RELAIS_GARCONS, bIT: BAREME_GT_IT };
  }
  return {
    b200: fille ? BAREME_200M_FILLES : BAREME_200M_GARCONS,
    bRelais: fille ? BAREME_RELAIS_FILLES : BAREME_RELAIS_GARCONS,
    bIT: BAREME_IT,
  };
}

// Jour (AAAA-MM-JJ, heure locale) d'une manche — sert au mode "jour de l'épreuve".
export function jourManche(serie) {
  const d = dateManche(serie);
  if (!d) return null;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const jj = String(dt.getDate()).padStart(2, "0");
  return `${dt.getFullYear()}-${mm}-${jj}`;
}

// Liste des jours où au moins une manche chronométrée a été courue (du plus récent au plus ancien).
export function joursAvecManches(series) {
  const jours = new Set();
  (series || []).forEach((s) => {
    if (Object.values(s.arrivals || {}).some((t) => typeof t === "number")) {
      const j = jourManche(s);
      if (j) jours.add(j);
    }
  });
  return [...jours].sort().reverse();
}

export function formatJour(jour) {
  if (!jour) return "—";
  const [a, m, j] = jour.split("-");
  return `${j}/${m}/${a}`;
}

// Notes d'UNE manche pour un·e élève, selon le type de bac. Le temps du relais et la somme des
// 200m sont ramenés à un équivalent binôme (× 2/nb). Renvoie null si le relais n'est pas noté.
//   Pro : { note200, noteRelais, noteIT, performance (/3), sur: 3 }
//   GT  : { noteRelais (/6), noteIT (/6 ou null si un 200m manque), performance (/12), sur: 12 }
export function detailNoteManche(eleve, equipe, elevesById, arriveeMs, reglages) {
  const { typeBac } = normaliserReglages(reglages);
  if (!equipe || (equipe.membreIds.length !== 2 && equipe.membreIds.length !== 3)) return null;
  if (typeof arriveeMs !== "number" || !eleve) return null;
  const nb = equipe.membreIds.length;
  const ratio = 2 / nb;
  const coequipiers = equipe.membreIds.filter((id) => id !== eleve.id).map((id) => elevesById[id]);
  const tous200 = typeof eleve.temps200 === "number" && coequipiers.every((c) => c && typeof c.temps200 === "number");
  const { b200, bRelais, bIT } = baremesPour(eleve, typeBac);
  const relaisMs = arriveeMs * ratio;
  const itSecondes = tous200
    ? ((arriveeMs - (eleve.temps200 + coequipiers.reduce((a, c) => a + c.temps200, 0))) * ratio) / 1000
    : null;
  const noteRelais = chercherPoints(relaisMs / 1000, bRelais);
  const noteIT = itSecondes == null ? null : chercherPoints(itSecondes, bIT);
  if (typeBac === "gt") {
    return {
      typeBac,
      note200: null,
      noteRelais,
      noteIT,
      itSecondes: itSecondes == null ? null : arrondi2(itSecondes),
      performance: arrondi2(noteRelais + (noteIT ?? 0)),
      sur: 12,
    };
  }
  if (!tous200) return null;
  const note200 = chercherPoints(eleve.temps200 / 1000, b200);
  return {
    typeBac,
    note200,
    noteRelais,
    noteIT,
    itSecondes: arrondi2(itSecondes),
    performance: arrondi2((note200 + noteRelais + noteIT) / 3),
    sur: 3,
  };
}

// Valeur (/3 en Pro, /12 en GT) d'une manche prise isolément — affichée dans le suivi.
export function performanceDepuisTempsRelais(eleve, equipe, elevesById, arriveeMs, reglages) {
  const d = detailNoteManche(eleve, equipe, elevesById, arriveeMs, reglages);
  return d ? d.performance : null;
}

// Texte court du détail d'une manche, pour les fiches et le suivi.
export function texteDetailManche(d) {
  if (!d) return null;
  const it = d.itSecondes == null ? "IT —" : `IT ${d.itSecondes >= 0 ? "+" : ""}${d.itSecondes}s`;
  if (d.typeBac === "gt") {
    return `Relais ${d.noteRelais}/6 · ${it} ${d.noteIT ?? "—"}/6 → ${d.performance}/12`;
  }
  return `Relais ${d.noteRelais}/3 · ${it} ${d.noteIT}/3 · 200m ${d.note200}/3 → perf. ${d.performance}/3`;
}

// Choix des relais retenus pour la note (réglage par classe « Relais retenus », v2.11.0) :
//   "meilleure" -> les 2 MEILLEURS relais du cycle
//   "derniere"  -> les 2 DERNIERS relais du cycle (les plus récents)
//   "epreuve"   -> les 2 meilleurs relais du JOUR DE L'ÉPREUVE (date marquée) uniquement
// Toujours parmi les manches cochées ; s'il n'y en a qu'une, elle compte seule.
// (Les valeurs "meilleure"/"derniere" sont celles déjà enregistrées depuis la v2.6.0.)
export const MODES_NOTE_RELAIS = [
  { valeur: "meilleure", libelle: "2 meilleurs du cycle", court: "2 meilleurs relais du cycle" },
  { valeur: "derniere", libelle: "2 derniers du cycle", court: "2 derniers relais du cycle" },
  { valeur: "epreuve", libelle: "Jour de l'épreuve", court: "2 meilleurs relais du jour de l'épreuve" },
];

export function libelleModeNoteRelais(reglages) {
  const r = normaliserReglages(reglages);
  const m = (MODES_NOTE_RELAIS.find((x) => x.valeur === r.mode) || MODES_NOTE_RELAIS[0]).court;
  return r.mode === "epreuve" ? `${m}${r.dateEpreuve ? ` (${formatJour(r.dateEpreuve)})` : " (date non choisie)"}` : m;
}

// Note de l'élève à partir de TOUTES les manches auxquelles il/elle a participé sur le cycle,
// quelle que soit l'équipe utilisée (habituelle ou équipe du jour, composition figée au moment
// de la manche). Les relais retenus suivent le réglage de la classe (voir ci-dessus).
//   Pro : note200 (meilleur 200m) + noteRelais (moyenne des 2 retenus) + noteIT (meilleur des 2)
//         -> performance /3 = moyenne des trois.
//   GT  : élément 1 noteRelais /6 (moyenne des 2 retenus) + élément 2 noteIT /6 (meilleur des 2)
//         -> performance /12 = AFL 1.
export function calculerPerformanceEleve(eleve, elevesById, equipes, series, reglages) {
  const { typeBac, mode, dateEpreuve } = normaliserReglages(reglages);
  const gt = typeBac === "gt";
  if (!gt && typeof eleve.temps200 !== "number") return null;

  const points = [];
  series.forEach((s) => {
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
    const tous200 = typeof eleve.temps200 === "number" && coequipiers.every((c) => c && typeof c.temps200 === "number");
    if (!gt && !tous200) return;
    const ratio = 2 / team.membreIds.length;
    points.push({
      serieId: s.id,
      date: dateManche(s),
      jour: jourManche(s),
      equipeId: teamId,
      equipeNom: team.nom,
      adhoc: !!team.adhoc,
      arriveeMs,
      relaisEquivMs: arriveeMs * ratio,
      itSecondes: tous200
        ? ((arriveeMs - (eleve.temps200 + coequipiers.reduce((a, c) => a + c.temps200, 0))) * ratio) / 1000
        : null,
    });
  });

  if (points.length === 0) return null;

  const candidates = mode === "epreuve" ? points.filter((p) => dateEpreuve && p.jour === dateEpreuve) : points;
  if (candidates.length === 0) return { typeBac, horsEpreuve: true, nbManches: points.length, mode, dateEpreuve, serieChoisieIds: [], manches: points };

  const meilleur = candidates.reduce((a, p) => (p.relaisEquivMs < a.relaisEquivMs ? p : a));
  const choisies =
    mode === "derniere"
      ? [...candidates].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 2)
      : [...candidates].sort((a, b) => a.relaisEquivMs - b.relaisEquivMs).slice(0, 2);
  const moyenneEquivMs = choisies.reduce((a, p) => a + p.relaisEquivMs, 0) / choisies.length;
  const moyenneBruteMs = choisies.reduce((a, p) => a + p.arriveeMs, 0) / choisies.length;
  // IT : sur le meilleur des relais retenus (protocole Pro ; décision P3 pour le GT)
  const meilleureChoisie = choisies.reduce((a, p) => (p.relaisEquivMs < a.relaisEquivMs ? p : a));

  const { b200, bRelais, bIT } = baremesPour(eleve, typeBac);
  const noteRelais = chercherPoints(moyenneEquivMs / 1000, bRelais);
  const noteIT = meilleureChoisie.itSecondes == null ? null : chercherPoints(meilleureChoisie.itSecondes, bIT);
  const note200 = gt ? null : chercherPoints(eleve.temps200 / 1000, b200);
  const performance = gt ? noteRelais + (noteIT ?? 0) : (note200 + noteRelais + noteIT) / 3;

  return {
    typeBac,
    sur: gt ? 12 : 3,
    note200,
    noteRelais,
    noteIT,
    performance: arrondi2(performance),
    nbManches: points.length,
    nbManchesChoisies: choisies.length,
    mode,
    dateEpreuve,
    serieChoisieIds: choisies.map((p) => p.serieId),
    relaisChoisiMs: moyenneBruteMs,
    relaisChoisiEquivMs: moyenneEquivMs,
    meilleurRelaisMs: meilleur.relaisEquivMs,
    itSecondes: meilleureChoisie.itSecondes == null ? null : arrondi2(meilleureChoisie.itSecondes),
    aUneEquipeDuJour: points.some((p) => p.adhoc),
    manches: points,
  };
}

// Note /3 (barème 200m individuel Bac Pro) d'un temps donné. En Bac GT, le 200m n'est pas noté.
export function noteTemps200(eleve, tempsMs, reglages) {
  if (typeof tempsMs !== "number") return null;
  const { typeBac } = normaliserReglages(reglages);
  if (typeBac === "gt") return null;
  return chercherPoints(tempsMs / 1000, baremesPour(eleve, "pro").b200);
}

// Options de saisie directe (Bac Pro : l'enseignant lit la description du degré atteint et
// choisit la valeur correspondante).
export const OPTIONS_POSITIONNEMENT = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4];
export const OPTIONS_AFLP2 = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

// Note /12 de la situation de fin de séquence.
//   Pro : positionnement /4 + performance /3 + AFLP 2 /5
//   GT  : élément 1 /6 + élément 2 /6 (calculés)
export function noteFinSequence12(eleve, performance, reglages) {
  if (estGT(reglages)) {
    if (!performance || performance.horsEpreuve || performance.performance == null) return null;
    return performance.performance;
  }
  const positionnement = typeof eleve.aflp1Position === "number" ? eleve.aflp1Position : null;
  const aflp2 = typeof eleve.aflp2Note === "number" ? eleve.aflp2Note : null;
  const perf = performance?.performance ?? null;
  if (positionnement == null && perf == null && aflp2 == null) return null;
  const aflp1 = (positionnement ?? 0) + (perf ?? 0);
  return arrondi2(aflp1 + (aflp2 ?? 0));
}

// Note /8 du fil de séquence, telle que saisie dans l'onglet Rôles.
//   Pro : AFLP 4 + AFLP 5 (champs aflp4Note / aflp5Note)
//   GT  : AFL 2 + AFL 3 (champs afl2Note / afl3Note) — champs distincts : passer une classe
//         de Pro à GT (ou l'inverse) n'efface rien.
export function noteFilSequence8(eleve, reglages) {
  const gt = estGT(reglages);
  const a = gt ? eleve.afl2Note : eleve.aflp4Note;
  const b = gt ? eleve.afl3Note : eleve.aflp5Note;
  const va = typeof a === "number" ? a : null;
  const vb = typeof b === "number" ? b : null;
  if (va == null && vb == null) return null;
  return arrondi2((va ?? 0) + (vb ?? 0));
}

// Note générale /20 = fin de séquence /12 + fil de séquence /8.
export function noteGenerale20(eleve, performance, reglages) {
  const note12 = noteFinSequence12(eleve, performance, reglages);
  const note8 = noteFilSequence8(eleve, reglages);
  if (note12 == null && note8 == null) return null;
  return arrondi2((note12 ?? 0) + (note8 ?? 0));
}
