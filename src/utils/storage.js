const PREFIX = "relais2x200:";

export function loadState(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveState(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // stockage plein ou indisponible : on ignore silencieusement
  }
}

export function removeState(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // indisponible : on ignore silencieusement
  }
}

// Liste les clés locales commençant par un préfixe donné (sans le préfixe interne
// "relais2x200:"). Utilisé pour retrouver, classe par classe, les copies de secours
// enregistrées sur l'appareil quand le cloud est injoignable.
export function listerCles(prefixe) {
  try {
    const resultat = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX + prefixe)) resultat.push(k.slice(PREFIX.length));
    }
    return resultat;
  } catch {
    return [];
  }
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
