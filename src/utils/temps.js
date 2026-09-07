// Formate une durée en millisecondes en mm:ss.d (une décimale)
export function formatChrono(ms) {
  if (ms == null) return "—";
  const totalDixiemes = Math.floor(ms / 100);
  const dixieme = totalDixiemes % 10;
  const totalSecondes = Math.floor(totalDixiemes / 10);
  const s = totalSecondes % 60;
  const m = Math.floor(totalSecondes / 60);
  return `${m}:${String(s).padStart(2, "0")}.${dixieme}`;
}

// Parse une saisie "1:58.3", "118.3" ou "118,3" -> millisecondes
export function parseTempsSaisi(str) {
  if (!str) return null;
  const s = str.trim().replace(",", ".");
  if (s === "") return null;
  if (s.includes(":")) {
    const [m, rest] = s.split(":");
    const secondes = parseFloat(rest);
    if (Number.isNaN(secondes)) return null;
    return (parseInt(m, 10) * 60 + secondes) * 1000;
  }
  const secondes = parseFloat(s);
  if (Number.isNaN(secondes)) return null;
  return secondes * 1000;
}
