// Lecture brute d'un fichier CSV : renvoie un tableau de lignes (tableaux de cellules texte),
// sans aucune hypothèse sur la présence ou le contenu d'une ligne d'en-tête.

function decoderTexteFichier(buffer) {
  const octets = new Uint8Array(buffer);
  const aBom = octets.length > 3 && octets[0] === 0xef && octets[1] === 0xbb && octets[2] === 0xbf;
  let texte = new TextDecoder("utf-8").decode(octets);
  const nbRemplacement = (texte.match(/\uFFFD/g) || []).length;
  if (!aBom && nbRemplacement > 0) {
    try {
      texte = new TextDecoder("windows-1252").decode(octets);
    } catch (e) {
      // Encodage windows-1252 indisponible : on garde le texte UTF-8 décodé.
    }
  }
  return texte;
}

function parseCsvTexte(texte) {
  const premiereLigne = texte.split(/\r\n|\n|\r/).find((l) => l.trim() !== "") || "";
  const nbVirgules = (premiereLigne.match(/,/g) || []).length;
  const nbPointsVirgules = (premiereLigne.match(/;/g) || []).length;
  const sep = nbPointsVirgules > nbVirgules ? ";" : ",";

  const lignes = [];
  let ligneCourante = [];
  let champ = "";
  let dansGuillemets = false;
  for (let i = 0; i < texte.length; i++) {
    const c = texte[i];
    const suivant = texte[i + 1];
    if (dansGuillemets) {
      if (c === '"' && suivant === '"') {
        champ += '"';
        i++;
      } else if (c === '"') {
        dansGuillemets = false;
      } else {
        champ += c;
      }
    } else if (c === '"') {
      dansGuillemets = true;
    } else if (c === sep) {
      ligneCourante.push(champ);
      champ = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && suivant === "\n") i++;
      ligneCourante.push(champ);
      champ = "";
      lignes.push(ligneCourante);
      ligneCourante = [];
    } else {
      champ += c;
    }
  }
  if (champ !== "" || ligneCourante.length) {
    ligneCourante.push(champ);
    lignes.push(ligneCourante);
  }
  return lignes.map((l) => l.map((c) => c.trim()));
}

// Charge un fichier .csv/.txt (File) et retourne une Promise résolue avec le tableau brut de lignes
// (chaque ligne = tableau de cellules texte), lignes vides retirées.
export function parserLignesCsv(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
    reader.onload = (evt) => {
      try {
        const texte = decoderTexteFichier(evt.target.result);
        const lignes = parseCsvTexte(texte)
          .filter((l) => l.some((c) => c !== ""))
          .map((l) => l.map((c) => c.trim()));
        resolve(lignes);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

// Normalise une chaîne pour la comparaison (accents, casse, espaces)
export function normaliser(s) {
  return (s || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

// Ramène toute variante de sexe importée ("Masculin", "Féminin", "M", "F", "H"...) à "M" ou "F".
export function normaliserSexe(valeur) {
  const t = normaliser(valeur);
  if (["m", "masculin", "garcon", "homme", "h"].includes(t)) return "M";
  if (["f", "feminin", "fille", "femme"].includes(t)) return "F";
  return "";
}

// Sépare une cellule "NOM Prénom" (convention Pronote : le nom de famille est en majuscules)
// en { nom, prenom }. Repli sur une coupure au premier mot si aucun mot n'est en majuscules.
export function separerNomPrenom(chaine) {
  const txt = (chaine || "").toString().trim().replace(/\s+/g, " ");
  if (!txt) return { nom: "", prenom: "" };
  const mots = txt.split(" ");
  const estMajuscule = (m) => m.replace(/[^A-Za-zÀ-ÿ]/g, "").length > 0 && m === m.toUpperCase();
  let i = 0;
  while (i < mots.length && estMajuscule(mots[i])) i++;
  if (i === 0 || i === mots.length) {
    return { nom: mots[0] || "", prenom: mots.slice(1).join(" ") };
  }
  return { nom: mots.slice(0, i).join(" "), prenom: mots.slice(i).join(" ") };
}
