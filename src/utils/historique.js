import { uid } from "./storage";
import { formatChrono } from "./temps";

// =====================================================================================
// HISTORIQUE DES PERFORMANCES (v2.6.0)
// -------------------------------------------------------------------------------------
// Objectif : AUCUNE performance ne doit être écrasée ni perdue, et chacune doit rester
// consultable plus tard avec sa date, la composition réelle de l'équipe et la note
// correspondante.
//
// 1) Test 200m individuel : chaque élève garde une liste `historique200` de tous ses
//    tests ({ id, date, temps, source, archive }). Le champ `temps200` (utilisé partout
//    pour les équipes et la notation) vaut toujours son MEILLEUR temps actif.
//
// 2) Manches de relais : chaque manche fige au moment de la course la composition de
//    chaque équipe (`compositions[equipeId] = { nom, adhoc, membreIds }`, membreIds dans
//    l'ordre de passage). Le lien élève <-> manche ne dépend donc plus des équipes
//    actuelles : on peut reconstruire, modifier ou supprimer des équipes sans rien perdre.
// =====================================================================================

// ---------- 200m individuel ----------
// Règle de notation (demande de Christophe, v2.6.0) : pour la note individuelle, SEULE la
// MEILLEURE performance au 200m compte. `temps200` vaut donc toujours le meilleur temps
// parmi les tests "actifs" de l'historique. Les tests archivés (bouton "Réinitialiser les
// temps de la classe") restent visibles dans l'historique mais ne comptent plus.

// Historique 200m d'un élève. Les données antérieures à la v2.6.0 n'ont qu'un temps200 :
// il est alors présenté comme une entrée "date inconnue" (et conservé dès qu'un nouveau
// temps est ajouté).
export function historique200(eleve) {
  if (!eleve) return [];
  if (Array.isArray(eleve.historique200)) return eleve.historique200;
  if (typeof eleve.temps200 === "number") {
    return [{ id: "ancien-" + eleve.id, date: null, temps: eleve.temps200, source: "ancien", archive: false }];
  }
  return [];
}

// Meilleure entrée active (celle qui sert à la note et au classement).
export function meilleurePerf200(hist) {
  return (hist || [])
    .filter((h) => !h.archive && typeof h.temps === "number")
    .reduce((best, h) => (!best || h.temps < best.temps ? h : best), null);
}

// Recalcule temps200 à partir d'un historique.
function avecHistorique(eleve, hist) {
  const best = meilleurePerf200(hist);
  return { ...eleve, historique200: hist, temps200: best ? best.temps : null };
}

// Ajoute un nouveau temps au 200m (test chronométré ou saisie manuelle). Renvoie l'élève
// mis à jour ; temps200 devient le meilleur temps actif.
export function ajouterPerf200(eleve, tempsMs, source = "test", dateIso = new Date().toISOString()) {
  const entree = { id: uid(), date: dateIso, temps: tempsMs, source, archive: false };
  return avecHistorique(eleve, [...historique200(eleve), entree]);
}

// Suppression volontaire d'une entrée (erreur de pointage, mauvais élève attribué...).
export function supprimerPerf200(eleve, entreeId) {
  return avecHistorique(
    eleve,
    historique200(eleve).filter((h) => h.id !== entreeId)
  );
}

// Archive tous les tests actifs : ils restent consultables mais ne comptent plus
// (nouveau cycle, nouveau test de référence...).
export function archiverPerf200(eleve) {
  return avecHistorique(
    eleve,
    historique200(eleve).map((h) => ({ ...h, archive: true }))
  );
}

// Réactive un test archivé (annulation d'une réinitialisation par erreur).
export function reactiverPerf200(eleve, entreeId) {
  return avecHistorique(
    eleve,
    historique200(eleve).map((h) => (h.id === entreeId ? { ...h, archive: false } : h))
  );
}

// ---------- Manches de relais ----------

// Photo de l'équipe au moment de la manche.
export function photoEquipe(equipe, ordre) {
  return {
    nom: equipe.nom,
    adhoc: !!equipe.adhoc,
    membreIds: [...(ordre && ordre.length ? ordre : equipe.membreIds)],
  };
}

// Composition réelle d'une équipe dans une manche : la photo figée si elle existe ; sinon
// (manches antérieures à la v2.6.0) l'ordre des coureurs mémorisé dans la manche, qui
// contient déjà les vrais coureurs ; en dernier recours, l'équipe actuelle.
export function compositionManche(serie, equipeId, equipes) {
  const photo = serie?.compositions?.[equipeId];
  if (photo && Array.isArray(photo.membreIds)) return { id: equipeId, ...photo };
  const actuelle = (equipes || []).find((e) => e.id === equipeId);
  const ordre = serie?.ordreCoureurs?.[equipeId];
  if (Array.isArray(ordre) && ordre.length) {
    return {
      id: equipeId,
      nom: actuelle ? actuelle.nom : "Équipe (supprimée depuis)",
      adhoc: actuelle ? !!actuelle.adhoc : false,
      membreIds: [...ordre],
    };
  }
  if (actuelle) return { id: equipeId, nom: actuelle.nom, adhoc: !!actuelle.adhoc, membreIds: [...actuelle.membreIds] };
  return null;
}

// Date d'une manche : moment du départ si connu, sinon création.
export function dateManche(serie) {
  return serie?.courueLe || serie?.creeLe || null;
}

// Migration douce : ajoute la photo des compositions aux manches qui n'en ont pas encore
// (à partir de l'ordre des coureurs déjà mémorisé). Ne supprime et ne modifie rien d'autre.
export function completerCompositions(series, equipes) {
  let change = false;
  const res = (series || []).map((s) => {
    const manquants = (s.equipeIds || []).filter((id) => !s.compositions?.[id]);
    if (manquants.length === 0) return s;
    const compositions = { ...(s.compositions || {}) };
    manquants.forEach((id) => {
      const c = compositionManche(s, id, equipes);
      if (c) {
        compositions[id] = { nom: c.nom, adhoc: c.adhoc, membreIds: c.membreIds };
        change = true;
      }
    });
    return { ...s, compositions };
  });
  return change ? res : series;
}

// ---------- Correction manuelle d'un temps de manche (v2.8.0) ----------
// Après la course, un temps mal pointé peut être remplacé par un temps tapé à la main.
// Le chrono d'origine n'est jamais perdu : il est gardé dans `serie.corrections[equipeId]`
// = { origine: ms ou null (aucun pointage), le: date ISO de la correction }.
// `serie.arrivals[equipeId]` contient le temps corrigé : toutes les notes (Résultats,
// fiche élève, Récap) se recalculent donc automatiquement.

export function correctionManche(serie, equipeId) {
  return serie?.corrections?.[equipeId] || null;
}

export function corrigerTempsManche(serie, equipeId, tempsMs) {
  const corrections = { ...(serie.corrections || {}) };
  const deja = corrections[equipeId];
  const actuel = serie.arrivals?.[equipeId];
  const origine = deja ? deja.origine : typeof actuel === "number" ? actuel : null;
  if (origine != null && Math.round(origine) === Math.round(tempsMs)) {
    delete corrections[equipeId]; // on revient exactement au chrono d'origine
  } else {
    corrections[equipeId] = { origine, le: new Date().toISOString() };
  }
  return { ...serie, arrivals: { ...(serie.arrivals || {}), [equipeId]: tempsMs }, corrections };
}

export function retablirTempsManche(serie, equipeId) {
  const c = serie?.corrections?.[equipeId];
  if (!c) return serie;
  const arrivals = { ...(serie.arrivals || {}) };
  if (typeof c.origine === "number") arrivals[equipeId] = c.origine;
  else delete arrivals[equipeId];
  const corrections = { ...serie.corrections };
  delete corrections[equipeId];
  return { ...serie, arrivals, corrections };
}

// Texte court à afficher à côté d'un temps corrigé (null si pas de correction).
export function libelleCorrection(serie, equipeId) {
  const c = correctionManche(serie, equipeId);
  if (!c) return null;
  return typeof c.origine === "number"
    ? `corrigé, chrono initial ${formatChrono(c.origine)}`
    : "saisi à la main, pas de chrono initial";
}

// ---------- Formatage des dates ----------

export function formatDateCourte(iso) {
  if (!iso) return "date inconnue";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "date inconnue";
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit", year: "2-digit" });
}

export function formatDateHeure(iso) {
  if (!iso) return "date inconnue";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "date inconnue";
  return (
    d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit", year: "2-digit" }) +
    " " +
    d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  );
}
