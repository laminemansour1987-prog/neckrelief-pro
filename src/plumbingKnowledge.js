'use strict';

/**
 * Base de connaissances des pannes de plomberie les plus courantes.
 * `urgency` determine la priorite de prise en charge :
 *   - "urgente"    : intervention sous 2h (degat des eaux, risque materiel)
 *   - "rapide"     : intervention sous 24h
 *   - "normale"    : intervention sous 48h
 *   - "planifiable": rendez-vous a convenance (travaux non urgents)
 */
const ISSUES = [
  {
    id: 'degat_des_eaux',
    label: "Degat des eaux / inondation",
    keywords: [
      'inond', 'degat des eaux', 'eau partout', 'plafond qui coule',
      'eau qui coule du plafond', "ca deborde", 'fuite importante', 'eau au sol',
    ],
    urgency: 'urgente',
    priceRange: [150, 400],
    advice: "Coupez immediatement l'arrivee d'eau generale au compteur. Si l'eau approche d'installations electriques, coupez aussi le disjoncteur de la zone concernee avant toute autre action.",
  },
  {
    id: 'fuite_tuyau',
    label: 'Fuite sur un tuyau',
    keywords: ['tuyau qui fuit', 'tuyau perce', 'fuite sous', 'tuyau casse', 'canalisation qui fuit'],
    urgency: 'rapide',
    priceRange: [90, 220],
    advice: "Fermez le robinet d'arret le plus proche (souvent sous l'evier ou pres du compteur) et placez un recipient sous la fuite en attendant.",
  },
  {
    id: 'fuite_robinet',
    label: 'Robinet qui fuit ou qui goutte',
    keywords: ['robinet qui fuit', 'robinet qui goutte', 'goutte a goutte', 'robinet goutte', 'mitigeur qui fuit'],
    urgency: 'normale',
    priceRange: [60, 130],
    advice: "Ce n'est pas dangereux mais cela gaspille de l'eau. Vous pouvez fermer le robinet d'arret sous l'evier si la fuite s'aggrave.",
  },
  {
    id: 'canalisation_bouchee',
    label: 'Canalisation, WC ou evier bouche',
    keywords: [
      'bouche', 'bouchee', 'bouches', 'toilettes bouchees', 'wc bouche', 'evier bouche',
      'baignoire bouchee', 'douche bouchee', "ca s'ecoule plus", 'canalisation obstruee',
    ],
    urgency: 'rapide',
    priceRange: [70, 190],
    advice: "Evitez les produits chimiques agressifs type deboucheur : ils peuvent abimer les canalisations et compliquer l'intervention.",
  },
  {
    id: 'chasse_eau',
    label: "Chasse d'eau defectueuse",
    keywords: ["chasse d'eau", 'wc qui coule sans arret', 'reservoir wc', 'chasse qui fuit'],
    urgency: 'normale',
    priceRange: [50, 130],
    advice: "Si l'eau coule en continu, vous pouvez fermer le petit robinet d'arret derriere la cuvette pour limiter le gaspillage.",
  },
  {
    id: 'chauffe_eau_panne',
    label: "Chauffe-eau / ballon d'eau chaude en panne",
    keywords: [
      "pas d'eau chaude", 'chauffe-eau en panne', 'chauffe eau', 'ballon eau chaude',
      'plus d\'eau chaude', 'chauffe-eau qui fuit',
    ],
    urgency: 'rapide',
    priceRange: [100, 380],
    advice: "Ne tentez pas de reparer vous-meme un chauffe-eau electrique. Si le chauffe-eau fuit, coupez son alimentation electrique et l'arrivee d'eau.",
  },
  {
    id: 'chaudiere_panne',
    label: 'Chaudiere en panne / pas de chauffage',
    keywords: ['chaudiere en panne', 'pas de chauffage', 'chaudiere qui fuit', 'chaudiere ne demarre plus'],
    urgency: 'rapide',
    priceRange: [120, 420],
    advice: "Verifiez la pression indiquee sur le manometre de la chaudiere (idealement entre 1 et 1.5 bar) et notez le code erreur affiche s'il y en a un.",
  },
  {
    id: 'pression_eau',
    label: "Baisse de pression d'eau",
    keywords: ['pas de pression', 'faible pression', 'peu de pression', 'pression eau faible'],
    urgency: 'normale',
    priceRange: [80, 210],
    advice: "Verifiez si le probleme touche un seul robinet (probablement un mousseur entartre) ou toute la maison (probleme sur l'arrivee generale).",
  },
  {
    id: 'odeurs_egout',
    label: "Mauvaises odeurs d'egout",
    keywords: ['odeur d\'egout', 'mauvaise odeur canalisation', 'ca sent mauvais evier', 'odeur nauseabonde'],
    urgency: 'normale',
    priceRange: [90, 230],
    advice: "Verifiez que les siphons (sous les eviers, douches) ne sont pas secs : faites couler un peu d'eau dans les canalisations peu utilisees.",
  },
  {
    id: 'installation_sanitaire',
    label: 'Installation ou renovation sanitaire',
    keywords: [
      'installer un evier', 'installation salle de bain', 'remplacer wc', 'poser une douche',
      'renovation salle de bain', 'installer une douche', 'changer robinet',
    ],
    urgency: 'planifiable',
    priceRange: [200, 1500],
    advice: "Un devis precis necessite une visite sur place ou des photos de l'installation actuelle.",
  },
];

const URGENCY_META = {
  urgente: { label: 'Urgente', delaiText: 'sous 2h', rank: 0 },
  rapide: { label: 'Rapide', delaiText: 'sous 24h', rank: 1 },
  normale: { label: 'Normale', delaiText: 'sous 48h', rank: 2 },
  planifiable: { label: 'Planifiable', delaiText: 'au creneau de votre choix', rank: 3 },
};

function normalize(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // retire les accents
    .replace(/['’ʼ-]/g, ' ') // uniformise apostrophes/tirets ("d'eau" ~ "d eau", "chauffe-eau" ~ "chauffe eau")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Analyse un texte libre et retourne la panne la plus probable, ou null si rien ne correspond.
 */
function classifyIssue(freeText) {
  const text = normalize(freeText);
  let best = null;
  let bestScore = 0;

  for (const issue of ISSUES) {
    let score = 0;
    for (const keyword of issue.keywords) {
      if (text.includes(normalize(keyword))) {
        score += keyword.split(' ').length; // les expressions plus longues comptent plus
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = issue;
    }
  }

  return bestScore > 0 ? best : null;
}

function getIssueById(id) {
  return ISSUES.find((i) => i.id === id) || null;
}

module.exports = {
  ISSUES,
  URGENCY_META,
  classifyIssue,
  getIssueById,
};
