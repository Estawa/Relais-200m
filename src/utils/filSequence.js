// Évaluation au fil de la séquence / 8 pts — AFLP 4 (rôles sociaux) et AFLP 5 (préparation
// autonome), retenus par l'équipe pédagogique. La répartition des 8 points entre les deux
// AFLP est au choix de l'élève (4/4, 6/2 ou 2/6 — minimum 2 pts par AFLP). Pour chaque AFLP,
// le degré atteint (1 à 4) donne une plage de points ; le passage du degré 2 au degré 3
// correspond à la moitié des points dévolus à l'AFLP.

export const REPARTITIONS_8PTS = [
  { id: "6-2", aflp4: 6, aflp5: 2, label: "AFLP 4 : 6 pts — AFLP 5 : 2 pts" },
  { id: "4-4", aflp4: 4, aflp5: 4, label: "AFLP 4 : 4 pts — AFLP 5 : 4 pts" },
  { id: "2-6", aflp4: 2, aflp5: 6, label: "AFLP 4 : 2 pts — AFLP 5 : 6 pts" },
];

const PLAGES = {
  2: [[0, 0.4], [0.5, 0.9], [1, 1.4], [1.5, 2]],
  4: [[0, 0.9], [1, 1.9], [2, 2.9], [3, 4]],
  6: [[0, 1.4], [1.5, 2.9], [3, 4.4], [4.5, 6]],
};

// Plage [min, max] de points pour un degré (1 à 4) et un nombre de points alloués à l'AFLP
// (2, 4 ou 6). Renvoie null si les points alloués ne correspondent à aucune des 3 colonnes.
export function plageAflp(pointsAlloues, degre) {
  const plages = PLAGES[pointsAlloues];
  if (!plages || !degre) return null;
  return plages[degre - 1] || null;
}

export function repartitionParId(id) {
  return REPARTITIONS_8PTS.find((r) => r.id === id) || REPARTITIONS_8PTS[1]; // 4-4 par défaut
}

// Descriptions courtes des 4 degrés, affichées comme aide à la saisie.
export const DEGRES_AFLP4 = [
  "S'investit épisodiquement dans un des 4 rôles sociaux possibles.",
  "S'investit dans un rôle choisi (souvent juge de zone ou starter, les plus abordables).",
  "Assure un rôle de façon totalement autonome et efficace, un deuxième ponctuellement avec de l'aide.",
  "Assume avec efficacité au moins deux rôles durant la séquence et aide ses camarades.",
];

export const DEGRES_AFLP5 = [
  "Échauffement insuffisant. Entraînement insuffisant : ne s'entraîne pas assez pour progresser. Centré sur lui-même.",
  "Échauffement largement perfectible. Entraînement partiellement adapté mais approximatif. Guide sans aide réelle.",
  "Échauffement complet, performance adéquate. Entraînement adapté, répétitions suffisantes. Guide un groupe réduit.",
  "Échauffement varié, complet et adapté. Entraînement optimisé, progression significative. Motive et corrige un groupe.",
];
