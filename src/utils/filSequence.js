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

// ---------- BAC GT : AFL 2 + AFL 3 (v2.11.0) ----------
// Répartition des 8 points au choix de l'élève (2/6, 4/4, 6/2), choix effectué à l'issue de la
// 4e séance. Points FIXES par degré (protocole GT) : sur 2 -> 0,5/1/1,5/2 ; sur 4 -> 1/2/3/4 ;
// sur 6 -> 1,5/3/4,5/6. AFL 3 : l'élève est évalué dans 2 rôles parmi les 4 proposés ; la note
// d'AFL 3 est la moyenne des points des 2 rôles évalués (un seul rôle évalué -> il compte seul).
export const REPARTITIONS_GT = [
  { id: "6-2", afl2: 6, afl3: 2, label: "AFL 2 : 6 pts — AFL 3 : 2 pts" },
  { id: "4-4", afl2: 4, afl3: 4, label: "AFL 2 : 4 pts — AFL 3 : 4 pts" },
  { id: "2-6", afl2: 2, afl3: 6, label: "AFL 2 : 2 pts — AFL 3 : 6 pts" },
];

export function repartitionGTParId(id) {
  return REPARTITIONS_GT.find((r) => r.id === id) || REPARTITIONS_GT[1];
}

export function pointsFixesGT(pointsAlloues, degre) {
  if (!pointsAlloues || !degre) return null;
  return Math.round((pointsAlloues * degre) / 4 * 100) / 100;
}

export const ROLES_AFL3 = [
  {
    id: "juge",
    libelle: "Juge de zone",
    degres: [
      "Se positionne, utilise peu les drapeaux, communique de temps en temps avec le professeur.",
      "Se positionne, utilise souvent les drapeaux pour communiquer avec le professeur.",
      "Se positionne, utilise systématiquement les drapeaux pour communiquer avec le professeur.",
      "Utilise à chaque fois avec pertinence les drapeaux, reste tout le temps en communication avec le professeur.",
    ],
  },
  {
    id: "coach",
    libelle: "Coach / observateur",
    degres: [
      "N'encourage pas et ne motive pas ses camarades. Relève régulièrement des éléments importants pour son groupe.",
      "Encourage un peu mais n'est pas très entraînant. Relève les éléments et les présente à son groupe.",
      "Encourage régulièrement et motive. Relève et utilise les informations les plus pertinentes avec son groupe.",
      "Encourage quasi systématiquement, réel moteur. Utilise les informations pertinentes pour rendre les relais efficients.",
    ],
  },
  {
    id: "starter",
    libelle: "Starter",
    degres: [
      "Donne les commandements réglementaires très vite et veille à leur application.",
      "Donne les commandements lentement en contrôlant les postures des coureurs.",
      "Commandements lents, contrôle tout le temps les postures réglementaires des coureurs.",
      "Détache les mots, veille à l'installation dans l'espace de départ jusqu'à l'éventuel faux départ.",
    ],
  },
  {
    id: "chrono",
    libelle: "Chronométreur",
    degres: [
      "Pas attentif aux ordres du starter, déclenche trop tard, temps erroné, ne transmet pas immédiatement.",
      "Attentif, mais déclenche ou arrête légèrement trop tard : temps pas exact. Transmet le temps.",
      "Déclenche dans le bon timing, arrête au passage de la ligne ; léger décalage possible avec l'enseignant.",
      "Déclenche et arrête parfaitement (ligne, au niveau des épaules). Transmet le temps au professeur.",
    ],
  },
];

export const DEGRES_AFL2 = [
  "Entraînement inadapté : ne s'entraîne pas assez, préparation et récupération très aléatoires, échauffement insuffisant, pas de projet, peu de données.",
  "Entraînement partiellement adapté : préparation stéréotypée, échauffement perfectible, se met en projet mais utilise mal les données recueillies.",
  "Entraînement adapté : répétitions suffisantes, prise de marque travaillée, échauffement complet, préparation qui préserve son intégrité et celle d'autrui.",
  "Entraînement optimisé : progression significative, prise de risque dans la transmission, échauffement très varié, données utilisées pour réguler le projet.",
];

// Note d'AFL 3 à partir des degrés des rôles évalués { roleId: degre } (2 rôles retenus au plus).
export function noteAfl3(rolesDegres, pointsAlloues) {
  const valeurs = Object.values(rolesDegres || {})
    .filter((d) => typeof d === "number" && d >= 1 && d <= 4)
    .slice(0, 2)
    .map((d) => pointsFixesGT(pointsAlloues, d));
  if (valeurs.length === 0) return null;
  return Math.round((valeurs.reduce((a, b) => a + b, 0) / valeurs.length) * 100) / 100;
}
