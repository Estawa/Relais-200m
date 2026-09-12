import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDD8wvN7yVxmW3FhMTfJFnPdZ1QHcMcSYs",
  authDomain: "relais-200m.firebaseapp.com",
  projectId: "relais-200m",
  storageBucket: "relais-200m.firebasestorage.app",
  messagingSenderId: "531350246235",
  appId: "1:531350246235:web:56b93c913f4d9c2dab807e",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export function slug(s) {
  return (s || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "x";
}

// ---------- Accès enseignant (administrateur + collègues) ----------
// Document unique : PIN et nom de l'administrateur, plus la liste des collègues (chacun
// avec son propre nom et son propre PIN). Même principe que sur Escalade Pro / Course de
// Durée Pro / Muscu Pro / Gym Pro.
export async function loadAcces() {
  try {
    const snap = await getDoc(doc(db, "meta", "acces"));
    if (snap.exists()) {
      const d = snap.data();
      return {
        pinAdmin: d.pinAdmin || "1234",
        nomAdmin: d.nomAdmin || "Mr Guilhem",
        collegues: Array.isArray(d.collegues) ? d.collegues : [],
      };
    }
  } catch (e) {}
  return { pinAdmin: "1234", nomAdmin: "Mr Guilhem", collegues: [] };
}

export async function saveAcces(config) {
  try { await setDoc(doc(db, "meta", "acces"), config); } catch (e) {}
}

// ---------- Données d'un professeur (élèves, équipes, classement, séries) ----------
// Isolation entre professeurs : chacun a son propre document, identifié par son nom
// (slugifié). Contrairement aux autres applis, tout le bloc de données d'un professeur
// tient dans un seul document (le modèle de données de Relais 2x200 est déjà organisé en
// listes globales filtrables par classe, pas en un document par classe).
const DEFAUT = { eleves: [], equipes: [], classement: {}, series: [] };

export async function loadDonneesProf(prof) {
  try {
    const snap = await getDoc(doc(db, "profs_data", slug(prof)));
    return snap.exists() ? { ...DEFAUT, ...snap.data() } : { ...DEFAUT };
  } catch (e) {
    return { ...DEFAUT };
  }
}

export async function saveDonneesProf(prof, data) {
  try { await setDoc(doc(db, "profs_data", slug(prof)), data); } catch (e) {}
}
