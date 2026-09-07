# Relais 2×200 by C. Guilhem

Application d'évaluation EPS pour le cycle relais 2×200m : constitution des
équipes à partir d'un test individuel, chronométrage en direct de plusieurs
équipes sur une même série, classement et notation par barème.

## Fonctionnement général

1. **Élèves** — importe la fiche de classe (CSV nom/prénom/classe exporté
   depuis EPS Pro) ou saisis les élèves à la main. Pour le test individuel
   200m, lance une salve (peu importe le nombre de coureurs), pointe
   chaque arrivée, puis identifie les élèves une fois tout le monde passé.
2. **Équipes** — le classement de tous les élèves testés s'affiche en une
   colonne, du plus rapide au plus lent. Fais glisser un élève pour
   ajuster son rang si besoin, et insère des espaces pour délimiter les
   équipes (binômes, trinômes, ou un mélange). Valide pour créer les
   équipes, puis affine-les dans la grille en dessous (renommer,
   ajouter/retirer un membre).
3. **Chrono** — sélectionne les équipes qui partent ensemble dans une
   série, lance le chronomètre unique, puis touche "Arrivée" pour chaque
   équipe au moment où elle franchit la ligne.
4. **Résultats** — classement de toutes les équipes, toutes séries
   confondues, avec la note de chaque élève si le barème est renseigné.
5. **Barème** — paliers temps → note, séparés filles/garçons. Le temps de
   référence est le temps total de l'équipe (les deux 200m cumulés).

Les données sont conservées dans le navigateur (localStorage) : pas de
compte, pas de synchronisation entre appareils dans cette première version.

## Statut de ce premier jet

- Le barème (paliers temps → note) est vide par défaut : à compléter dans
  l'onglet Barème dès que tu as les valeurs.
- Pas encore de code PIN ni de synchro multi-appareils (Firebase), comme
  sur tes autres applis — à ajouter si besoin une fois la V1 validée sur
  le terrain.
- Pas encore de mode jour/nuit ni de CHANGELOG affiché dans l'app.

## Installation locale

```bash
npm install
npm run dev
```

## Déploiement (même méthode que tes autres applis)

1. Crée un nouveau dépôt sur GitHub (compte Estawa), par exemple
   `relais-2x200-pro`, et pousse ce dossier dedans.
2. Sur Vercel, importe ce dépôt (Framework preset : Vite). Aucune variable
   d'environnement n'est nécessaire pour cette V1 (pas de Firebase).
3. Vercel te donne une URL type `relais-2x200-pro.vercel.app`,
   installable comme application (PWA) depuis le navigateur mobile.

## Export CSV attendu (import Élèves)

Colonnes `nom`, `prenom` (ou `prénom`), `classe`, et optionnellement
`sexe`. Séparateur `,` ou `;`, avec ou sans ligne d'en-tête.
