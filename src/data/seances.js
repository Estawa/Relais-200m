// Bibliothèque de séances du cycle Relais 2x200m — contenu de référence, non modifiable
// dans l'appli (à ajuster ici dans le code si le cycle évolue).

export const THEMES = ["Échauffement", "Évaluation", "Technique", "Vitesse", "Résistance"];

export const ECHAUFFEMENT_TYPE = {
  id: "echauffement",
  titre: "Trame d'échauffement type",
  themes: ["Échauffement"],
  duree: "~20 min, à chaque séance",
  intro:
    "Cette trame est présentée en détail lors de la séance 1, puis simplement rappelée les séances suivantes.",
  sections: [
    {
      titre: "1. Deux tours de stade par équipe (binôme ou trinôme), passage de témoin dans un couloir unique",
      points: [
        "Espacement d'environ 3 m entre les coureurs, sortie de couloir interdite.",
        "Le dernier coureur porte le témoin. Il accélère quand il le souhaite, annonce « gauche » ou « droite » au moment de la transmission.",
        "Le coureur qui reçoit tend le bras annoncé (gauche ou droite) vers l'arrière, et se décale du côté opposé à ce bras : son bras se retrouve ainsi au milieu du couloir, et l'espace laissé du côté du bras tendu permet au donneur de le dépasser.",
        "Une fois le témoin donné, le donneur dépasse son camarade par le côté ainsi libéré, se replace devant, puis ralentit pour se recaler sur l'allure du groupe.",
        "Le nouveau porteur du témoin (dernier de la file) répète la manœuvre à son initiative, et ainsi de suite sur les deux tours.",
      ],
      note: "Objectif caché de cet échauffement : automatiser très tôt dans le cycle les repères de communication (annonce gauche/droite), de placement de la main, et de gestion des trajectoires — utile dès la séance 2.",
    },
    {
      titre: "2. Gammes athlétiques (~5 min)",
      points: ["Talons-fesses, montées de genoux, pas chassés, skipping, quelques lignes droites en accélération progressive."],
    },
    {
      titre: "3. Étirements courts / retour du rythme cardiaque (~5 min)",
      points: ["Avant d'attaquer le corps de séance."],
    },
  ],
};

export const SEANCES = [
  {
    id: 1,
    titre: "Évaluation initiale et découverte",
    themes: ["Évaluation"],
    objectifs:
      "Prendre en main le protocole d'échauffement, réaliser le test 200m individuel, constituer les équipes, découvrir les règles de passage de témoin, première prise de performance en relais.",
    deroule: [
      "Échauffement type — présentation pas à pas, avec essais lents avant la version rapide (~20 min, un peu plus long que d'habitude car première fois)",
      "Test de performance individuel sur 200m par salves (1 à 7 élèves, un seul chrono par salve, identification des élèves après coup selon l'ordre d'arrivée) (~25 min)",
      "Constitution des équipes (binômes/trinômes) via l'application, à partir du classement (~10 min)",
      "Présentation des zones de transmission et des plots sur la piste, rappel des règles essentielles (~5 min)",
      "Quelques passages de témoin statiques puis en marche, par équipe (~10 min)",
      "Première prise de performance en relais (2x200m ou 3x200m selon la taille des équipes), dans les zones de transmission prévues — objectif : niveau initial (~15 min avec temps de récupération entre équipes)",
      "Retour au calme, étirements, bilan oral (~5 min)",
    ],
  },
  {
    id: 2,
    titre: "Fluidité du passage de témoin",
    themes: ["Technique"],
    objectifs:
      "Automatiser la transmission en ligne droite avec plusieurs zones, alterner donneur/receveur, varier les positions, deuxième prise de performance en relais classique.",
    deroule: [
      "Échauffement type (~15 min)",
      "Passages de témoin en ligne droite, plusieurs zones de transmission matérialisées (nombre adapté selon binôme ou trinôme) : chaque coureur doit être tour à tour donneur et receveur (~20 min)",
      "Une fois les transmissions fluides, variation des positions dans l'équipe (~10 min)",
      "Deuxième prise de performance sur le relais 200m (2x200m ou 3x200m) une fois la fluidité stabilisée (~25 min avec récupération)",
      "Retour au calme, étirements, bilan (~10 min)",
    ],
  },
  {
    id: 3,
    titre: "Vitesse et technique : départ et prise de témoin à pleine vitesse",
    themes: ["Vitesse", "Technique"],
    objectifs:
      "Partir le plus rapidement possible à vitesse maximale sur 200m, faire en sorte que la transmission se fasse en pleine course, fiabiliser la prise d'informations du receveur qui voit arriver son partenaire.",
    deroule: [
      "Échauffement type (~15 min)",
      "Calcul individuel du temps cible sur le 50m d'élan : à partir de la performance 200m de chaque élève, vitesse moyenne = 200 / temps200m, puis temps cible sur 50m = 50 / vitesse moyenne — c'est le temps que l'élève doit viser sur son élan pour arriver à sa vitesse de course au moment de la transmission (~10 min)",
      "Ateliers de départ lancé : le receveur démarre son élan au bon moment pour être à pleine vitesse à l'entrée de la zone de transmission, élan chronométré sur 50m pour vérifier l'atteinte du temps cible calculé et ajuster le point de départ d'élan si besoin (~20 min)",
      "Répétitions de transmission à vitesse quasi maximale, par binôme/trinôme, avec régulation du signal (gauche/droite) donné plus tôt pour laisser le temps de réagir à vitesse élevée (~15 min)",
      "1 à 2 relais 200m complets en conditions proches du réel pour valider les automatismes à vitesse élevée (~15 min)",
      "Retour au calme, étirements (~5-10 min)",
    ],
    schema: true,
  },
  {
    id: 4,
    titre: "Résistance sur 200m",
    themes: ["Résistance"],
    objectifs:
      "Développer la capacité à maintenir une vitesse élevée sur l'ensemble du 200m (résistance à la vitesse), préparer physiquement la répétition d'efforts du relais.",
    deroule: [
      "Échauffement type (~20 min)",
      "Répétitions de 150-200m à allure sub-maximale soutenue, récupération courte à moyenne entre répétitions (travail individuel, ~4-6 répétitions) (~35 min)",
      "Un ou deux relais 200m en fin de séance pour réintégrer la fatigue dans le geste technique de transmission (~20 min)",
      "Retour au calme, étirements (~10-15 min)",
    ],
  },
  {
    id: 5,
    titre: "Vitesse et technique : perfectionnement individualisé",
    themes: ["Vitesse", "Technique"],
    objectifs:
      "Affiner la zone d'élan de chaque élève en fonction de sa vitesse propre, consolider la lecture de l'arrivée du partenaire.",
    deroule: [
      "Échauffement type (~15 min)",
      "Prise de marques au sol pour chaque relayeur/relayé : la marque de départ d'élan se prend en comptant le nombre de pieds (pas talon-pointe) entre le relayeur et sa marque — méthode reproductible d'une séance à l'autre, sans mètre (~15 min)",
      "Choix collectif du placement dans la zone de transmission (début ou fin de zone) selon les qualités athlétiques respectives du donneur et du receveur : viser un échange en début de zone si le receveur est plus rapide que le donneur (pour lui laisser davantage de distance à pleine vitesse), en fin de zone si c'est l'inverse (pour profiter plus longtemps de la vitesse du donneur) (~15 min)",
      "Répétitions de transmission à vitesse élevée avec ces marques et ce placement (~15 min)",
      "Relais 200m complets, focus sur la fluidité et la vitesse de transmission (~15 min)",
      "Retour au calme, étirements (~10 min)",
    ],
  },
  {
    id: 6,
    titre: "Résistance et technique combinées",
    themes: ["Résistance", "Technique"],
    objectifs:
      "Maintenir la qualité technique du passage de témoin en état de fatigue, condition proche de la réalité de la course.",
    deroule: [
      "Échauffement type (~20 min)",
      "Répétitions de 200m à allure soutenue suivies immédiatement d'un passage de témoin technique (transmission en fin d'effort) (~35 min)",
      "Relais 200m complets pour valider le maintien de la qualité technique sous fatigue (~20 min)",
      "Retour au calme, étirements (~10-15 min)",
    ],
  },
  {
    id: 7,
    titre: "Évaluation intermédiaire",
    themes: ["Évaluation"],
    objectifs:
      "Réaliser deux prises de performance officielles en relais, dans des conditions d'évaluation, avec échauffement complet et récupération suffisante entre les deux passages.",
    deroule: [
      "Échauffement type complet (~20-25 min, pas de raccourci ici)",
      "Rappel rapide des règles et des zones/plots (~5 min)",
      "Travail sur les rôles de starter-chronométreur (départ propre, déclenchement et arrêt du chrono, annonce du temps) et de juge de zone de transmission (vérifie que l'échange du témoin a bien lieu dans la zone autorisée) : rotation des élèves non coureurs sur ces rôles avant les prises de performance (~10 min)",
      "1ère prise de performance officielle (2x200m ou 3x200m), rôles tenus par les élèves formés ci-dessus (~10-15 min)",
      "Récupération complète entre les deux prises (marche, hydratation, étirements légers) (~10-15 min)",
      "2de prise de performance officielle, changement de couloir/place, rotation de l'ordre des coureurs dans l'équipe et rotation des rôles starter/juge de zone entre les deux manches (~10-15 min)",
      "Retour au calme, étirements, bilan oral avec les élèves sur les points à travailler d'ici la fin du cycle (~10 min)",
    ],
  },
  {
    id: 8,
    titre: "Multiplication des courses en relais sur 50 m",
    themes: ["Vitesse", "Technique"],
    objectifs:
      "Multiplier les répétitions de transmission en situation de course courte (50 m) pour que chaque élève vive les trois positions de course (départ, intermédiaire, arrivée), tout en réinvestissant les ajustements identifiés lors de l'évaluation intermédiaire.",
    deroule: [
      "Échauffement type, raccourci pour laisser plus de temps aux courses (~15 min)",
      "Organisation de 6 relais sur 50 m par équipe (binôme ou trinôme) sur l'heure, formule courte pour multiplier les répétitions (~5 min d'installation et de rappel des règles)",
      "Rotation systématique des positions : chaque élève occupe tour à tour les 3 positions de course — 1er relayeur (départ, donneur uniquement), relayeur intermédiaire (receveur puis donneur), dernier relayeur (receveur uniquement, arrivée) (~50 min pour les 6 relais, récupération courte entre chaque course)",
      "Retour au calme, étirements, bilan (~10-15 min)",
    ],
    schema: true,
  },
  {
    id: 9,
    titre: "Résistance et simulation de conditions de compétition",
    themes: ["Résistance"],
    objectifs:
      "Se rapprocher des conditions de l'évaluation finale (enchaînement de deux manches, rotation des coureurs, changement de couloir), consolider la résistance.",
    deroule: [
      "Échauffement type (~20 min)",
      "Répétitions de 200m à allure soutenue avec passage de témoin (rappel du travail de résistance) (~20 min)",
      "Simulation complète d'une séance d'évaluation : 2 manches de relais avec récupération entre les deux, rotation de l'ordre des coureurs, changement de couloir (~35 min)",
      "Retour au calme, étirements, dernier rappel des règles avant l'évaluation finale (~10-15 min)",
    ],
  },
  {
    id: 10,
    titre: "Évaluation finale",
    themes: ["Évaluation"],
    objectifs:
      "Réaliser les deux prises de performance officielles qui serviront à la notation finale du cycle (/20 via l'application), dans des conditions d'évaluation rigoureuses.",
    deroule: [
      "Échauffement type complet (~20-25 min)",
      "Rappel bref des règles, vérification des couloirs/plots (~5 min)",
      "1ère manche officielle (2x200m ou 3x200m) (~10-15 min)",
      "Récupération complète entre les deux manches (~10-15 min)",
      "2de manche officielle, changement de couloir et rotation de l'ordre des coureurs (~10-15 min)",
      "Retour au calme, étirements (~10 min)",
      "Bilan de cycle avec les élèves, annonce que la notation intègre aussi le fil de séquence (rôles, AFLP) (~5-10 min)",
    ],
  },
];

// Distances communes aux fiches avec schéma (séances 3 et 8) : course en 3 x 50 m
export const DISTANCES_SCHEMA = {
  segments: "Départ → milieu ZT1 = 50 m · Milieu ZT1 → milieu ZT2 = 50 m · Milieu ZT2 → arrivée = 50 m",
  zoneTransmission: "Début de zone = 10 m avant le milieu · Fin de zone = 10 m après le milieu (20 m au total)",
  zoneElan: "Début de la zone d'élan = 5 m avant le début de la zone de transmission",
};
