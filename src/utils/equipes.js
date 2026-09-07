import { uid } from "./storage";

// Constitue des équipes par tranches consécutives de niveau : les `taille`
// élèves les plus rapides ensemble, puis les `taille` suivants, etc.,
// jusqu'aux plus lents. C'est volontairement l'inverse d'un équilibrage :
// chaque équipe est homogène en niveau, pas la classe entière.
// `taille` vaut 2 (binômes) ou 3 (trinômes). En cas de reste non divisible,
// le dernier groupe incomplet est fusionné avec le groupe précédent plutôt
// que laissé seul.
export function formerEquipesAutomatiquement(eleves, taille = 2) {
  const avecTemps = eleves
    .filter((e) => typeof e.temps200 === "number")
    .sort((a, b) => a.temps200 - b.temps200);
  const sansTemps = eleves.filter((e) => typeof e.temps200 !== "number");

  const groupes = [];
  for (let i = 0; i < avecTemps.length; i += taille) {
    groupes.push(avecTemps.slice(i, i + taille));
  }
  if (groupes.length > 1 && groupes[groupes.length - 1].length < taille) {
    const reste = groupes.pop();
    groupes[groupes.length - 1].push(...reste);
  }

  // Élèves sans temps enregistré : répartis en équipes complémentaires à la fin
  while (sansTemps.length > 0) {
    if (sansTemps.length >= taille) groupes.push(sansTemps.splice(0, taille));
    else groupes.push(sansTemps.splice(0, sansTemps.length));
  }

  return groupes.map((membres, idx) => ({
    id: uid(),
    nom: `Équipe ${idx + 1}`,
    membreIds: membres.map((m) => m.id),
  }));
}

export function tempsEquipe(equipe, elevesById) {
  const temps = equipe.membreIds
    .map((id) => elevesById[id]?.temps200)
    .filter((t) => typeof t === "number");
  if (temps.length === 0) return null;
  return temps.reduce((a, b) => a + b, 0);
}

// Fait tourner l'ordre des coureurs d'une équipe (qui part, qui relaye, qui
// termine) d'un cran par manche déjà disputée, pour que chacun change de
// position d'une course à l'autre.
export function ordreCoureursPourManche(membreIds, nombreManchesDejaFaites) {
  const n = membreIds.length;
  if (n === 0) return [];
  const decalage = nombreManchesDejaFaites % n;
  return [...membreIds.slice(decalage), ...membreIds.slice(0, decalage)];
}
