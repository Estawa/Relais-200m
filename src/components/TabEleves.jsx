import React, { useState } from "react";
import { UploadCloud, Pencil, Trash2, RotateCcw, X, User, ArrowRightLeft, Plus, BookOpen, Timer, Users, Star } from "lucide-react";
import { formatChrono, parseTempsSaisi } from "../utils/temps";
import { uid } from "../utils/storage";
import { manchesEleve } from "../utils/equipes";
import {
  historique200,
  meilleurePerf200,
  ajouterPerf200,
  supprimerPerf200,
  archiverPerf200,
  reactiverPerf200,
  formatDateHeure,
  libelleCorrection,
} from "../utils/historique";
import { noteTemps200, detailNoteManche, calculerPerformanceEleve, libelleModeNoteRelais } from "../utils/bareme12";
import TestSerie from "./TestSerie";
import ImportEleves from "./ImportEleves";

const ELEVE_VIDE = { nom: "", prenom: "", sexe: "", classeOrigine: "", temps200: null };

// Repère de départ : nombre de pieds positifs, par rapport au coureur relayé
const OPTIONS_REPERE_DEPART = Array.from({ length: 31 }, (_, i) => i); // 0 à 30
// Repère de préparation à la course : nombre de pieds (négatif/nul/positif),
// par rapport au 1er plot de la zone de transmission
const OPTIONS_REPERE_PREPARATION = Array.from({ length: 501 }, (_, i) => i - 250); // -250 à +250

function dateAujourdhui() {
  return new Date().toISOString().slice(0, 10);
}

function FicheEleveModal({ eleves, elevesById, modeNoteRelais, onMajEleve, equipes, series, classeActive, classesInfo, idInitial, onAjouter, onModifier, onSupprimer, onDeplacer, onFermer }) {
  const [idSelectionne, setIdSelectionne] = useState(idInitial || "");
  const [brouillon, setBrouillon] = useState(() => {
    const e = eleves.find((el) => el.id === idInitial);
    return e
      ? { nom: e.nom, prenom: e.prenom, sexe: e.sexe || "", classeOrigine: e.classeOrigine || "", temps200: e.temps200 }
      : ELEVE_VIDE;
  });
  const [deplacementOuvert, setDeplacementOuvert] = useState(false);
  const [classeCible, setClasseCible] = useState("");

  const performances = idSelectionne ? manchesEleve(idSelectionne, equipes, series) : [];
  const eleveActuel = idSelectionne ? eleves.find((el) => el.id === idSelectionne) : null;
  const hist200 = eleveActuel ? historique200(eleveActuel) : [];
  const best200 = meilleurePerf200(hist200);
  const perfGlobale = eleveActuel ? calculerPerformanceEleve(eleveActuel, elevesById, equipes, series, modeNoteRelais) : null;
  const [nouveau200, setNouveau200] = useState("");

  function ajouterTemps200Fiche() {
    const t = parseTempsSaisi(nouveau200);
    if (typeof t !== "number" || !idSelectionne) return;
    onMajEleve(idSelectionne, (el) => ajouterPerf200(el, t, "saisie"));
    setNouveau200("");
  }
  const journal = eleveActuel?.journal || [];

  function ajouterEntreeJournal() {
    const nouvelle = { id: uid(), date: dateAujourdhui(), note: "", repereDepart: "", reperePreparation: "" };
    onModifier(idSelectionne, { journal: [nouvelle, ...journal] });
  }

  function modifierEntreeJournal(entreeId, champ, valeur) {
    onModifier(idSelectionne, {
      journal: journal.map((j) => (j.id === entreeId ? { ...j, [champ]: valeur } : j)),
    });
  }

  function supprimerEntreeJournal(entreeId) {
    if (!confirm("Supprimer cette entrée du journal de suivi ?")) return;
    onModifier(idSelectionne, { journal: journal.filter((j) => j.id !== entreeId) });
  }

  function choisir(id) {
    setIdSelectionne(id);
    const e = eleves.find((el) => el.id === id);
    setBrouillon(
      e ? { nom: e.nom, prenom: e.prenom, sexe: e.sexe || "", classeOrigine: e.classeOrigine || "", temps200: e.temps200 } : ELEVE_VIDE
    );
  }

  function valider() {
    // Le temps 200m n'est plus modifié ici (il est géré par l'historique ci-dessous) :
    // on n'envoie que l'identité de l'élève pour ne rien écraser.
    const { temps200, ...identite } = brouillon;
    if (idSelectionne) {
      onModifier(idSelectionne, identite);
    } else {
      onAjouter(identite, temps200);
      setBrouillon(ELEVE_VIDE);
    }
  }

  function supprimerEtFermer() {
    if (!confirm(`Supprimer ${brouillon.prenom} ${brouillon.nom} de la classe ${classeActive} ?`)) return;
    onSupprimer(idSelectionne);
    onFermer();
  }

  function deplacerEtFermer() {
    if (!classeCible.trim()) return;
    onDeplacer(idSelectionne, classeCible);
    onFermer();
  }

  return (
    <div className="fixed inset-0 z-30 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-piste-nuit border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto text-piste-craie">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="font-display text-xl tracking-wide">
            {idSelectionne ? "Fiche élève" : "Édition élève"} · {classeActive}
          </h3>
          <button onClick={onFermer} className="p-1.5 rounded-full hover:bg-white/10 text-piste-craie/60">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-piste-craie/50 block mb-1">Élève</label>
            <select
              value={idSelectionne}
              onChange={(e) => choisir(e.target.value)}
              className="w-full bg-piste-panneau border border-white/10 rounded-xl px-4 py-3 text-sm"
            >
              <option value="">+ Nouvel élève</option>
              {[...eleves]
                .sort((a, b) => (a.nom + a.prenom).localeCompare(b.nom + b.prenom))
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nom} {e.prenom}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-piste-craie/50 block mb-1">Nom</label>
              <input
                autoFocus
                value={brouillon.nom}
                onChange={(e) => setBrouillon((b) => ({ ...b, nom: e.target.value }))}
                className="w-full bg-piste-panneau border border-white/10 rounded-xl px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-piste-craie/50 block mb-1">Prénom</label>
              <input
                value={brouillon.prenom}
                onChange={(e) => setBrouillon((b) => ({ ...b, prenom: e.target.value }))}
                className="w-full bg-piste-panneau border border-white/10 rounded-xl px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-piste-craie/50 block mb-1">Sexe</label>
              <select
                value={brouillon.sexe}
                onChange={(e) => setBrouillon((b) => ({ ...b, sexe: e.target.value }))}
                className="w-full bg-piste-panneau border border-white/10 rounded-xl px-4 py-3 text-sm"
              >
                <option value="">—</option>
                <option value="F">F</option>
                <option value="M">M</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-piste-craie/50 block mb-1">
                {idSelectionne ? "Meilleur 200m (note)" : "Temps 200m (s)"}
              </label>
              {idSelectionne ? (
                <div className="w-full bg-piste-panneau/50 border border-white/10 rounded-xl px-4 py-3 text-sm tabular">
                  {best200 ? `${(best200.temps / 1000).toFixed(1)} s` : "—"}
                </div>
              ) : (
                <input
                  placeholder="ex : 32.4"
                  defaultValue=""
                  onBlur={(e) => setBrouillon((b) => ({ ...b, temps200: parseTempsSaisi(e.target.value) }))}
                  className="w-full bg-piste-panneau border border-white/10 rounded-xl px-4 py-3 text-sm"
                />
              )}
            </div>
          </div>

          <div>
            <label className="text-xs text-piste-craie/50 block mb-1">
              Classe d'origine <span className="text-piste-craie/30">(si groupe classe : d'où vient cet élève)</span>
            </label>
            <input
              placeholder="ex : 2NDE3"
              value={brouillon.classeOrigine}
              onChange={(e) => setBrouillon((b) => ({ ...b, classeOrigine: e.target.value }))}
              className="w-full bg-piste-panneau border border-white/10 rounded-xl px-4 py-3 text-sm"
            />
          </div>

          {idSelectionne && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-piste-craie/50 mb-1.5">
                <Timer size={13} /> Tests 200m individuels {hist200.length > 0 ? `(${hist200.length})` : ""}
                <span className="text-piste-craie/30">— seul le meilleur compte pour la note</span>
              </div>
              {hist200.length === 0 ? (
                <p className="text-xs text-piste-craie/30 border border-dashed border-white/10 rounded-lg px-3 py-2 mb-2">
                  Aucun test 200m enregistré.
                </p>
              ) : (
                <div className="space-y-1 mb-2">
                  {[...hist200]
                    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
                    .map((h) => {
                      const estMeilleur = best200 && h.id === best200.id;
                      const note = noteTemps200(eleveActuel, h.temps);
                      return (
                        <div
                          key={h.id}
                          className={`flex items-center justify-between text-xs rounded-lg px-3 py-1.5 border ${
                            estMeilleur
                              ? "border-piste-pelouse/40 bg-piste-pelouse/10"
                              : h.archive
                              ? "border-white/5 text-piste-craie/30"
                              : "border-white/10 bg-piste-panneau"
                          }`}
                        >
                          <span>
                            {formatDateHeure(h.date)} · <span className="tabular font-semibold">{(h.temps / 1000).toFixed(1)} s</span>
                            {note != null ? ` → ${note}/3` : ""}
                            {h.source === "saisie" ? " · saisi" : ""}
                            {estMeilleur && (
                              <span className="ml-1.5 inline-flex items-center gap-0.5 text-piste-pelouse">
                                <Star size={11} /> meilleur, compte pour la note
                              </span>
                            )}
                            {h.archive && " · archivé"}
                          </span>
                          <span className="flex items-center gap-2">
                            {h.archive && (
                              <button
                                onClick={() => onMajEleve(idSelectionne, (el) => reactiverPerf200(el, h.id))}
                                className="text-piste-ambre"
                              >
                                Réactiver
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (!confirm("Supprimer définitivement ce test 200m (erreur de saisie) ?")) return;
                                onMajEleve(idSelectionne, (el) => supprimerPerf200(el, h.id));
                              }}
                              className="text-piste-craie/30 hover:text-piste-brique"
                            >
                              <Trash2 size={13} />
                            </button>
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  value={nouveau200}
                  onChange={(e) => setNouveau200(e.target.value)}
                  placeholder="Ajouter un temps 200m (ex : 32.4)"
                  className="flex-1 bg-piste-panneau border border-white/10 rounded-xl px-3 py-2 text-xs"
                />
                <button
                  onClick={ajouterTemps200Fiche}
                  disabled={typeof parseTempsSaisi(nouveau200) !== "number"}
                  className="flex items-center gap-1 text-xs bg-piste-panneau border border-white/10 hover:border-piste-brique disabled:opacity-40 px-3 py-2 rounded-xl"
                >
                  <Plus size={13} /> Ajouter
                </button>
              </div>
            </div>
          )}

          {idSelectionne && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-piste-craie/50 mb-1.5">
                <Users size={13} /> Performances collectives sur le cycle {performances.length > 0 ? `(${performances.length})` : ""}
              </div>
              {performances.length === 0 ? (
                <p className="text-xs text-piste-craie/30 border border-dashed border-white/10 rounded-lg px-3 py-2">
                  Aucune manche courue pour l'instant avec cet élève.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {[...performances].reverse().map(({ serie, equipeId, equipe, temps, date }) => {
                    const retenue = serie.retenues?.[equipeId] !== false;
                    const choisie = (perfGlobale?.serieChoisieIds || []).includes(serie.id);
                    const d = detailNoteManche(eleveActuel, equipe, elevesById, temps);
                    const scores = (serie.temoin?.[equipeId] || []).filter((v) => typeof v === "number");
                    return (
                      <div
                        key={serie.id}
                        className={`text-xs rounded-lg px-3 py-2 border ${
                          choisie ? "border-piste-pelouse/40 bg-piste-pelouse/10" : "border-white/10 bg-piste-panneau"
                        } ${retenue ? "" : "opacity-50"}`}
                      >
                        <div className="flex justify-between gap-2">
                          <span className="font-semibold">
                            {formatDateHeure(date)} · {serie.nom}
                          </span>
                          <span className="tabular font-semibold">{formatChrono(temps)}</span>
                        </div>
                        {libelleCorrection(serie, equipeId) && (
                          <div className="text-piste-ambre">Temps {libelleCorrection(serie, equipeId)}</div>
                        )}
                        <div className="text-piste-craie/60">
                          {equipe.nom}
                          {equipe.adhoc ? " (jour)" : ""} ·{" "}
                          {equipe.membreIds
                            .map((id, i) => {
                              const m = elevesById[id];
                              const nom = m ? `${m.prenom} ${m.nom}` : "élève retiré";
                              return `${i + 1}. ${id === idSelectionne ? nom.toUpperCase() : nom}`;
                            })
                            .join(" → ")}
                        </div>
                        <div className="text-piste-craie/50">
                          {d
                            ? `Relais ${d.noteRelais}/3 · IT ${d.itSecondes >= 0 ? "+" : ""}${d.itSecondes}s ${d.noteIT}/3 · 200m ${d.note200}/3 → perf. ${d.performance}/3`
                            : "Note non calculable (temps 200m manquant pour un·e coureur·se)"}
                          {scores.length > 0 ? ` · témoin ${scores.join("/")}` : ""}
                        </div>
                        {(choisie || !retenue) && (
                          <div className={choisie ? "text-piste-pelouse" : "text-piste-craie/40"}>
                            {choisie
                              ? `★ Manche utilisée pour la note (${libelleModeNoteRelais(modeNoteRelais)})`
                              : "Écartée du calcul de la note (onglet Résultats)"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {idSelectionne && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs text-piste-craie/50">
                  <BookOpen size={13} /> Journal de suivi {journal.length > 0 ? `(${journal.length})` : ""}
                </div>
                <button
                  type="button"
                  onClick={ajouterEntreeJournal}
                  className="flex items-center gap-1 text-xs text-piste-ambre hover:text-piste-briqueclair border border-white/10 hover:border-piste-brique px-2 py-1 rounded-full"
                >
                  <Plus size={13} /> Nouvelle entrée
                </button>
              </div>

              {journal.length === 0 ? (
                <p className="text-xs text-piste-craie/30 border border-dashed border-white/10 rounded-lg px-3 py-2">
                  Aucune entrée pour l'instant. Une entrée par séance : notes, repère de départ, repère de
                  préparation.
                </p>
              ) : (
                <div className="space-y-2">
                  {[...journal]
                    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
                    .map((entree) => (
                      <div key={entree.id} className="bg-piste-panneau border border-white/10 rounded-xl p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={entree.date || ""}
                            onChange={(e) => modifierEntreeJournal(entree.id, "date", e.target.value)}
                            className="bg-piste-nuit border border-white/10 rounded-lg px-2.5 py-1.5 text-xs flex-1"
                          />
                          <button
                            onClick={() => supprimerEntreeJournal(entree.id)}
                            className="text-piste-craie/30 hover:text-piste-brique p-1"
                            title="Supprimer cette entrée"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <textarea
                          value={entree.note || ""}
                          onChange={(e) => modifierEntreeJournal(entree.id, "note", e.target.value)}
                          placeholder="Note de suivi (ressenti, consignes données, points à retravailler...)"
                          rows={2}
                          className="w-full bg-piste-nuit border border-white/10 rounded-lg px-2.5 py-2 text-xs resize-none"
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-piste-craie/40 block mb-0.5">
                              Repère départ (pieds, / coureur relayé)
                            </label>
                            <select
                              value={entree.repereDepart ?? ""}
                              onChange={(e) => modifierEntreeJournal(entree.id, "repereDepart", e.target.value === "" ? "" : Number(e.target.value))}
                              className="w-full bg-piste-nuit border border-white/10 rounded-lg px-2 py-1.5 text-xs"
                            >
                              <option value="">—</option>
                              {OPTIONS_REPERE_DEPART.map((v) => (
                                <option key={v} value={v}>
                                  {v} pied{v > 1 ? "s" : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-piste-craie/40 block mb-0.5">
                              Repère préparation (pieds, / 1er plot zone transmission)
                            </label>
                            <select
                              value={entree.reperePreparation ?? ""}
                              onChange={(e) => modifierEntreeJournal(entree.id, "reperePreparation", e.target.value === "" ? "" : Number(e.target.value))}
                              className="w-full bg-piste-nuit border border-white/10 rounded-lg px-2 py-1.5 text-xs"
                            >
                              <option value="">—</option>
                              {OPTIONS_REPERE_PREPARATION.map((v) => (
                                <option key={v} value={v}>
                                  {v > 0 ? `+${v}` : v} pied{Math.abs(v) > 1 ? "s" : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {idSelectionne && (
              <button
                onClick={supprimerEtFermer}
                className="flex items-center gap-2 border border-piste-brique/60 text-piste-briqueclair hover:bg-piste-brique/20 px-4 py-3 rounded-xl text-sm font-semibold"
              >
                <Trash2 size={16} /> Supprimer
              </button>
            )}
            {idSelectionne && onDeplacer && (
              <button
                type="button"
                onClick={() => setDeplacementOuvert((v) => !v)}
                className="flex items-center gap-2 border border-white/15 text-piste-craie/80 hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-semibold"
              >
                <ArrowRightLeft size={16} /> Déplacer
              </button>
            )}
            <button
              onClick={valider}
              disabled={!brouillon.nom && !brouillon.prenom}
              className="flex-1 flex items-center justify-center gap-2 bg-piste-brique hover:bg-piste-briqueclair disabled:opacity-40 px-4 py-3 rounded-xl text-sm font-semibold"
            >
              {idSelectionne ? "Enregistrer les modifications" : "Ajouter cet élève"}
            </button>
          </div>

          {deplacementOuvert && idSelectionne && (
            <div className="bg-piste-panneau border border-white/10 rounded-xl p-3 space-y-2">
              <p className="text-xs text-piste-craie/50">
                Actuellement dans <span className="font-semibold text-piste-craie">{classeActive}</span>. Ses
                équipes/manches déjà enregistrées le suivent, où qu'il aille.
              </p>
              <div className="flex gap-2">
                <input
                  list="classes-disponibles-deplacement"
                  value={classeCible}
                  onChange={(e) => setClasseCible(e.target.value)}
                  placeholder="Classe de destination"
                  className="flex-1 bg-piste-nuit border border-white/10 rounded-xl px-4 py-2.5 text-sm"
                />
                <datalist id="classes-disponibles-deplacement">
                  {(classesInfo || []).filter((c) => c.nom !== classeActive).map((c) => (
                    <option key={c.nom} value={c.nom} />
                  ))}
                </datalist>
                <button
                  onClick={deplacerEtFermer}
                  disabled={!classeCible.trim()}
                  className="bg-piste-brique hover:bg-piste-briqueclair disabled:opacity-40 px-4 py-2.5 rounded-xl text-sm font-semibold"
                >
                  Confirmer
                </button>
              </div>
            </div>
          )}
          {!idSelectionne && (
            <p className="text-xs text-piste-craie/40 text-center">
              L'élève ajouté apparaîtra en bas du tableau, dans la classe {classeActive}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TabEleves({ eleves, elevesById, modeNoteRelais, setEleves, equipes, series, classeActive, classesInfo, onDeplacerEleve }) {
  const [importOuvert, setImportOuvert] = useState(false);
  const [ficheOuverte, setFicheOuverte] = useState(false);
  const [idFiche, setIdFiche] = useState("");

  function importerEleves(nouveaux) {
    setEleves((prev) => {
      const copie = [...prev];
      nouveaux.forEach((n) => {
        const idx = copie.findIndex((e) => e.id === n.id);
        if (idx !== -1) {
          copie[idx] = { ...copie[idx], nom: n.nom, prenom: n.prenom, classe: n.classe, sexe: n.sexe || copie[idx].sexe };
        } else {
          copie.push({ id: n.id, nom: n.nom, prenom: n.prenom, classe: n.classe, sexe: n.sexe, temps200: null });
        }
      });
      return copie;
    });
    setImportOuvert(false);
  }

  function ajouterEleve(donnees, temps200) {
    const base = { id: uid(), classe: classeActive, ...donnees, temps200: null, historique200: [] };
    const eleve = typeof temps200 === "number" ? ajouterPerf200(base, temps200, "saisie") : base;
    setEleves((prev) => [...prev, eleve]);
  }

  // Mise à jour d'un élève par une fonction (historique 200m...), sans risque d'écraser
  // une modification concurrente.
  function majEleve(id, fn) {
    setEleves((prev) => prev.map((el) => (el.id === id ? fn(el) : el)));
  }

  // Saisie rapide d'un temps dans le tableau : AJOUTÉ à l'historique (jamais écrasé).
  function ajouterTempsTableau(id, valeurSaisie) {
    const t = parseTempsSaisi(valeurSaisie);
    if (typeof t !== "number") return;
    majEleve(id, (el) => (t === el.temps200 ? el : ajouterPerf200(el, t, "saisie")));
  }

  function modifier(id, champ, valeur) {
    setEleves((prev) => prev.map((el) => (el.id === id ? { ...el, [champ]: valeur } : el)));
  }

  function modifierPlusieursChamps(id, donnees) {
    setEleves((prev) => prev.map((el) => (el.id === id ? { ...el, ...donnees } : el)));
  }

  function supprimer(id) {
    setEleves((prev) => prev.filter((el) => el.id !== id));
  }

  function reinitialiserPerformances() {
    if (
      !confirm(
        `Repartir de zéro pour le 200m de la classe ${classeActive} ?\n\nLes tests déjà enregistrés sont ARCHIVÉS : ils restent consultables (et réactivables) dans la fiche de chaque élève, mais ne comptent plus pour la note ni pour le classement.`
      )
    )
      return;
    setEleves((prev) => prev.map((e) => (e.classe === classeActive ? archiverPerf200(e) : e)));
  }

  function ouvrirFiche(id) {
    setIdFiche(id);
    setFicheOuverte(true);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="font-display text-2xl tracking-wide">Élèves &amp; test 200m</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setImportOuvert(true)}
            className="flex items-center gap-2 bg-piste-panneau border border-white/10 hover:border-piste-brique px-3 py-2 rounded text-sm"
          >
            <UploadCloud size={16} /> Importer d'autres élèves
          </button>
          <button
            onClick={() => ouvrirFiche("")}
            className="flex items-center gap-2 bg-piste-brique hover:bg-piste-briqueclair px-3 py-2 rounded text-sm font-semibold"
          >
            <Pencil size={16} /> Édition élève
          </button>
        </div>
      </div>

      <TestSerie eleves={eleves} setEleves={setEleves} />

      {eleves.length > 0 && (
        <div className="flex justify-end mb-3">
          <button
            onClick={reinitialiserPerformances}
            title={`Effacer les temps au 200m de la classe ${classeActive}`}
            className="flex items-center gap-1.5 text-xs text-piste-craie/50 hover:text-piste-brique border border-white/10 hover:border-piste-brique px-2.5 py-1 rounded-full"
          >
            <RotateCcw size={12} /> Nouveau départ 200m (archiver les tests)
          </button>
        </div>
      )}

      {eleves.length === 0 ? (
        <div className="text-piste-craie/50 text-sm border border-dashed border-white/10 rounded-lg p-8 text-center">
          Aucun élève pour l'instant dans cette classe.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-piste-panneau text-piste-craie/50 text-xs uppercase">
              <tr>
                <th></th>
                <th className="text-left px-3 py-2">Nom</th>
                <th className="text-left px-3 py-2">Prénom</th>
                <th className="text-left px-3 py-2">Classe</th>
                <th className="text-left px-3 py-2">Sexe</th>
                <th className="text-left px-3 py-2">Meilleur 200m</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {eleves.map((e) => (
                <tr key={e.id} className="border-t border-white/5">
                  <td className="pl-2">
                    <button
                      onClick={() => ouvrirFiche(e.id)}
                      title="Voir la fiche de cet élève (performances, journal de suivi, classe d'origine...)"
                      className="text-piste-craie/30 hover:text-piste-ambre"
                    >
                      <User size={15} />
                    </button>
                  </td>
                  <td className="px-3 py-1.5">
                    <input
                      value={e.nom}
                      onChange={(ev) => modifier(e.id, "nom", ev.target.value)}
                      className="bg-transparent w-full focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <input
                      value={e.prenom}
                      onChange={(ev) => modifier(e.id, "prenom", ev.target.value)}
                      className="bg-transparent w-full focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <input
                      value={e.classe}
                      onChange={(ev) => modifier(e.id, "classe", ev.target.value)}
                      className="bg-transparent w-20 focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <select
                      value={e.sexe}
                      onChange={(ev) => modifier(e.id, "sexe", ev.target.value)}
                      className="bg-transparent focus:outline-none"
                    >
                      <option value="">—</option>
                      <option value="F">F</option>
                      <option value="M">M</option>
                    </select>
                  </td>
                  <td className="px-3 py-1.5">
                    <input
                      key={e.id + "-" + historique200(e).length + "-" + e.temps200}
                      placeholder="ex : 32.4"
                      title="Meilleur temps (compte pour la note). Taper un nouveau temps l'AJOUTE à l'historique de l'élève (fiche)."
                      defaultValue={e.temps200 != null ? (e.temps200 / 1000).toFixed(1) : ""}
                      onBlur={(ev) => ajouterTempsTableau(e.id, ev.target.value)}
                      className="bg-transparent w-20 tabular focus:outline-none placeholder:text-piste-craie/20"
                    />
                    <span className="text-piste-craie/30 ml-1">s</span>
                  </td>
                  <td className="px-2">
                    <button onClick={() => supprimer(e.id)} className="text-piste-craie/30 hover:text-piste-brique">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {importOuvert && (
        <ImportEleves
          elevesExistants={eleves}
          onImporte={importerEleves}
          onFermer={() => setImportOuvert(false)}
          classeForcee={classeActive}
        />
      )}

      {ficheOuverte && (
        <FicheEleveModal
          eleves={eleves}
          elevesById={elevesById}
          modeNoteRelais={modeNoteRelais}
          onMajEleve={majEleve}
          equipes={equipes}
          series={series}
          classeActive={classeActive}
          classesInfo={classesInfo}
          idInitial={idFiche}
          onAjouter={ajouterEleve}
          onModifier={modifierPlusieursChamps}
          onSupprimer={supprimer}
          onDeplacer={onDeplacerEleve}
          onFermer={() => setFicheOuverte(false)}
        />
      )}
    </div>
  );
}
