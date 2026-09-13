import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDD8wvN7yVxmW3FhMTfJFnPdZ1QHcMcSYs",
  authDomain: "relais-200m.firebaseapp.com",
  projectId: "relais-200m",
  storageBucket: "relais-200m.firebasestorage.app",
  messagingSenderId: "531350246235",
  appId: "1:531350246235:web:56b93c913f4d9c2dab807e",
};

const app = initializeApp(firebaseConfig);
// Cache local persistant (IndexedDB) : les écritures faites hors-ligne ou interrompues
// (réseau coupé, appli mise en arrière-plan sur mobile...) sont conservées sur l'appareil
// et renvoyées automatiquement au serveur dès que la connexion revient.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentSingleTabManager() }),
});

export function slug(s) {
  return (
    (s || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "x"
  );
}

// ---------- Accès enseignant (administrateur + collègues) ----------
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
  try {
    await setDoc(doc(db, "meta", "acces"), config);
  } catch (e) {}
}

// ---------- Classes d'un professeur (v2.1 : un document Firestore par classe) ----------
// Avant (v2.0 à v2.0.2), toutes les classes d'un professeur tenaient dans un seul document :
// une écriture ratée ou interrompue (réseau coupé, appli mise en arrière-plan...) pouvait
// faire perdre TOUTES ses classes d'un coup. Désormais, chaque classe a son propre document
// (profs/{prof}/classes/{classe}) : une classe ne peut plus jamais en affecter une autre, et
// une écriture qui échoue ne met en risque que la classe en cours de modification.
const CLASSE_DEFAUT = { eleves: [], equipes: [], classementTokens: [], series: [] };

export async function chargerToutesLesClasses(prof) {
  try {
    const snap = await getDocs(collection(db, "profs", slug(prof), "classes"));
    const classes = {};
    snap.forEach((d) => {
      const data = d.data();
      classes[data.nom || d.id] = { ...CLASSE_DEFAUT, ...data };
    });
    return { classes, ok: true };
  } catch (e) {
    return { classes: {}, ok: false };
  }
}

export async function sauverClasse(prof, nomClasse, donnees) {
  try {
    await setDoc(doc(db, "profs", slug(prof), "classes", slug(nomClasse)), {
      nom: nomClasse,
      ...donnees,
    });
    return true;
  } catch (e) {
    return false;
  }
}

export async function supprimerClasseCloud(prof, nomClasse) {
  try {
    await deleteDoc(doc(db, "profs", slug(prof), "classes", slug(nomClasse)));
    return true;
  } catch (e) {
    return false;
  }
}

// ---------- Ancien modèle (v2.0 à v2.0.2) ----------
// Conservé uniquement pour permettre la migration automatique, unique, vers le nouveau
// modèle ci-dessus. N'est plus jamais écrit par l'appli à partir de la v2.1.
const DEFAUT_ANCIEN = { eleves: [], equipes: [], classement: {}, series: [] };

export async function chargerAncienBlocProf(prof) {
  try {
    const snap = await getDoc(doc(db, "profs_data", slug(prof)));
    return { data: snap.exists() ? { ...DEFAUT_ANCIEN, ...snap.data() } : { ...DEFAUT_ANCIEN }, ok: true };
  } catch (e) {
    return { data: { ...DEFAUT_ANCIEN }, ok: false };
  }
}
