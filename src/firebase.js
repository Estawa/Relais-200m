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
  collectionGroup,
  getDocsFromServer,
  writeBatch,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDqRihpVWPqmw54T6X6zx3PS3F92Wol3Bg",
  authDomain: "vma-pro-seances.firebaseapp.com",
  projectId: "vma-pro-seances",
  storageBucket: "vma-pro-seances.firebasestorage.app",
  messagingSenderId: "378967245770",
  appId: "1:378967245770:web:668b5f0f7251ec8a124533",
};

// Projet Firebase « Running » (vma-pro-seances), partagé avec VMA Pro et Course de Durée Pro.
// Les collections de Relais 200m sont toutes préfixées relais_ pour ne rien mélanger.
export const COL_META = "relais_meta";
export const COL_PROFS = "relais_profs";
export const COL_PROFS_DATA = "relais_profs_data";

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
    const snap = await getDoc(doc(db, COL_META, "acces"));
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
    await setDoc(doc(db, COL_META, "acces"), config);
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
    const snap = await getDocs(collection(db, COL_PROFS, slug(prof), "classes"));
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
    await setDoc(doc(db, COL_PROFS, slug(prof), "classes", slug(nomClasse)), {
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
    await deleteDoc(doc(db, COL_PROFS, slug(prof), "classes", slug(nomClasse)));
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
    const snap = await getDoc(doc(db, COL_PROFS_DATA, slug(prof)));
    return { data: snap.exists() ? { ...DEFAUT_ANCIEN, ...snap.data() } : { ...DEFAUT_ANCIEN }, ok: true };
  } catch (e) {
    return { data: { ...DEFAUT_ANCIEN }, ok: false };
  }
}

// ---------- Sauvegarde complète (administrateur) ----------
// Un seul fichier avec TOUTES les données du cloud : accès (admin + collègues), toutes les
// classes de tous les professeurs (y compris les collègues retirés), et l'ancien modèle v2.0.
// Le fichier ne dépend pas des noms de collections : il pourra être restauré tel quel,
// même si l'appli change de projet Firebase.
const lireServeur = async (ref) => {
  try { return await getDocsFromServer(ref); } catch (e) { return await getDocs(ref); }
};

export async function exporterTout() {
  const accesSnap = await getDoc(doc(db, COL_META, "acces"));
  const profs = {};
  let nbClasses = 0;
  // Toutes les sous-collections « classes » rangées sous profs/{prof}/classes
  let docs = [];
  try {
    docs = (await lireServeur(collectionGroup(db, "classes"))).docs
      .filter((d) => d.ref.parent.parent && d.ref.parent.parent.parent.id === COL_PROFS);
  } catch (e) {
    // repli : professeurs connus de la liste d'accès
    const a = accesSnap.exists() ? accesSnap.data() : {};
    const noms = [a.nomAdmin || "Mr Guilhem", ...((a.collegues || []).map((c) => c.nom))];
    for (const n of noms) {
      docs.push(...(await lireServeur(collection(db, COL_PROFS, slug(n), "classes"))).docs);
    }
  }
  docs.forEach((d) => {
    const prof = d.ref.parent.parent.id;
    if (!profs[prof]) profs[prof] = {};
    profs[prof][d.id] = d.data();
    nbClasses++;
  });
  const ancien = {};
  (await lireServeur(collection(db, COL_PROFS_DATA))).forEach((d) => { ancien[d.id] = d.data(); });
  return {
    app: "relais-200m",
    format: 1,
    exportLe: new Date().toISOString(),
    acces: accesSnap.exists() ? accesSnap.data() : null,
    profs,
    profsData: ancien,
    compte: { professeurs: Object.keys(profs).length, classes: nbClasses, anciensBlocs: Object.keys(ancien).length },
  };
}

export async function restaurerTout(sauvegarde) {
  if (!sauvegarde || sauvegarde.app !== "relais-200m") throw new Error("Ce fichier n'est pas une sauvegarde Relais 200m.");
  const ecritures = [];
  if (sauvegarde.acces) ecritures.push([doc(db, COL_META, "acces"), sauvegarde.acces]);
  Object.entries(sauvegarde.profs || {}).forEach(([prof, classes]) => {
    Object.entries(classes).forEach(([id, data]) => ecritures.push([doc(db, COL_PROFS, prof, "classes", id), data]));
  });
  Object.entries(sauvegarde.profsData || {}).forEach(([id, data]) => ecritures.push([doc(db, COL_PROFS_DATA, id), data]));
  for (let i = 0; i < ecritures.length; i += 400) {
    const b = writeBatch(db);
    ecritures.slice(i, i + 400).forEach(([ref, data]) => b.set(ref, data));
    await b.commit();
  }
  return ecritures.length;
}
