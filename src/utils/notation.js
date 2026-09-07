// Le barème est construit pour des équipes de 2 (binômes) : une liste de
// paliers { tempsMaxMs, note }, du temps le plus rapide (note la plus
// haute) au plus lent. On retient le premier palier dont le temps de
// l'équipe est inférieur ou égal au plafond.
export function calculerNote(tempsMs, bareme) {
  if (tempsMs == null || !bareme || bareme.length === 0) return null;
  const trie = [...bareme].sort((a, b) => a.tempsMaxMs - b.tempsMaxMs);
  const palier = trie.find((p) => tempsMs <= p.tempsMaxMs);
  return palier ? palier.note : trie[trie.length - 1].note;
}

// Le barème n'existe que pour des binômes (2x200m). Pour un trinôme
// (3x200m), on ramène son temps à un équivalent "2 relayeurs" par une
// règle de trois (proportion du nombre de coureurs), avant de consulter
// le barème.
export function tempsEquivalentBareme(tempsMs, nombreCoureurs) {
  if (tempsMs == null) return null;
  if (nombreCoureurs === 3) return (tempsMs * 2) / 3;
  return tempsMs;
}
