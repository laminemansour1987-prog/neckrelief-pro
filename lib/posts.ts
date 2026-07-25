// Blog content lives here as structured data so the article and index pages
// stay purely presentational. Each post targets a real search query to bring
// in free organic traffic that converts into Aura sign-ups.

export interface PostBlock {
  type: "p" | "h2" | "ul";
  text?: string;
  items?: string[];
}

export interface Post {
  slug: string;
  title: string;
  description: string; // used as <meta description> — keep ~150 chars, keyword-rich
  excerpt: string; // shown on the index card
  keyword: string; // the primary query this article targets
  readingMinutes: number;
  date: string; // ISO
  body: PostBlock[];
}

export const POSTS: Post[] = [
  {
    slug: "exercices-mal-de-cou-bureau",
    title: "5 exercices contre le mal de cou au bureau (en moins de 5 minutes)",
    description:
      "Mal de cou après des heures assis au bureau ? Voici 5 exercices simples et rapides pour soulager la nuque et prévenir les tensions, sans matériel.",
    excerpt:
      "Des heures devant l'écran finissent par bloquer la nuque. Voici 5 mouvements rapides à faire à votre bureau pour relâcher la tension — et comment ne plus oublier de les faire.",
    keyword: "exercices mal de cou bureau",
    readingMinutes: 4,
    date: "2026-07-20",
    body: [
      {
        type: "p",
        text: "Rester assis huit heures par jour, la tête penchée vers un écran, met vos cervicales à rude épreuve. Le résultat est familier : une nuque raide en fin de journée, des épaules nouées, parfois des maux de tête. La bonne nouvelle, c'est que quelques minutes de mouvement bien choisi suffisent à soulager et à prévenir ces tensions.",
      },
      {
        type: "p",
        text: "Voici cinq exercices que vous pouvez faire assis, sans matériel et sans quitter votre poste. Comptez moins de cinq minutes au total.",
      },
      { type: "h2", text: "1. Les rotations lentes de la nuque" },
      {
        type: "p",
        text: "Assis bien droit, tournez lentement la tête vers la gauche jusqu'à sentir un léger étirement, tenez trois secondes, puis vers la droite. Répétez cinq fois de chaque côté. Le mouvement doit rester lent et sans à-coups.",
      },
      { type: "h2", text: "2. L'étirement latéral" },
      {
        type: "p",
        text: "Inclinez l'oreille vers l'épaule, sans monter l'épaule. Posez délicatement la main sur le côté de la tête pour accentuer l'étirement. Tenez quinze secondes de chaque côté. Vous devez sentir la tension se relâcher le long du cou.",
      },
      { type: "h2", text: "3. La rétraction du menton" },
      {
        type: "p",
        text: "C'est le geste le plus efficace contre la posture « tête en avant ». Ramenez le menton vers l'arrière (comme pour faire un double menton), gardez le regard horizontal, tenez cinq secondes. Répétez dix fois. Cet exercice réaligne la tête au-dessus des épaules.",
      },
      { type: "h2", text: "4. Les cercles d'épaules" },
      {
        type: "p",
        text: "Roulez les épaules vers l'arrière, en grands cercles, dix fois, puis vers l'avant. Cela détend le haut du dos, souvent complice des tensions de nuque.",
      },
      { type: "h2", text: "5. L'ouverture de poitrine" },
      {
        type: "p",
        text: "Joignez les mains derrière le dos, redressez la poitrine et abaissez les épaules. Tenez vingt secondes. Assis toute la journée, on s'enroule vers l'avant ; ce mouvement compense.",
      },
      { type: "h2", text: "Le vrai secret : la régularité" },
      {
        type: "p",
        text: "Ces exercices ne valent que si vous les faites vraiment — idéalement une courte pause toutes les 30 à 45 minutes. Le problème, c'est qu'on les oublie dès qu'on est concentré. C'est exactement pour ça qu'Aura existe : elle vous envoie des rappels bien-être personnalisés au bon moment, et vous guide si vous ne savez pas quoi faire.",
      },
      {
        type: "p",
        text: "Quand consulter ? Si la douleur est intense, irradie dans le bras, ou persiste plusieurs jours, parlez-en à un professionnel de santé. Ces conseils sont informatifs et ne remplacent pas un avis médical.",
      },
    ],
  },
  {
    slug: "corriger-posture-devant-ecran",
    title: "Comment corriger sa posture devant l'écran (guide simple)",
    description:
      "Mauvaise posture devant l'ordinateur ? Découvrez comment régler votre écran, votre chaise et vos habitudes pour un dos et une nuque en bonne santé.",
    excerpt:
      "Écran trop bas, dos voûté, épaules en avant : la mauvaise posture s'installe sans qu'on s'en rende compte. Voici comment régler votre poste et vos habitudes, point par point.",
    keyword: "corriger posture devant écran",
    readingMinutes: 5,
    date: "2026-07-18",
    body: [
      {
        type: "p",
        text: "La posture idéale devant un écran n'a rien de compliqué : il s'agit surtout de placer votre corps de façon à ce qu'aucune partie ne travaille en permanence. Voici les réglages qui font la plus grande différence.",
      },
      { type: "h2", text: "Réglez la hauteur de l'écran" },
      {
        type: "p",
        text: "Le haut de l'écran doit être à hauteur des yeux, à environ un bras de distance. Si vous baissez la tête pour regarder, surélevez l'écran (une pile de livres suffit) ou utilisez un support. Sur un ordinateur portable, un support + un clavier externe changent tout.",
      },
      { type: "h2", text: "Ajustez votre chaise" },
      {
        type: "ul",
        items: [
          "Les pieds à plat sur le sol, genoux à angle droit.",
          "Le bas du dos soutenu par le dossier (ajoutez un coussin si besoin).",
          "Les avant-bras parallèles au sol quand vous tapez, épaules relâchées.",
        ],
      },
      { type: "h2", text: "Corrigez la « tête en avant »" },
      {
        type: "p",
        text: "C'est le défaut le plus courant : le menton qui avance vers l'écran. Chaque centimètre d'avancée multiplie la charge sur les cervicales. Le réflexe à prendre : ramener régulièrement le menton en arrière et garder les oreilles au-dessus des épaules.",
      },
      { type: "h2", text: "La meilleure posture, c'est la suivante" },
      {
        type: "p",
        text: "Aussi bien réglé soit votre poste, rester figé reste le vrai ennemi. Le corps a besoin de bouger. La règle d'or : changez de position et levez-vous régulièrement. Une micro-pause de deux minutes toutes les demi-heures vaut mieux qu'une grande pause en fin de journée.",
      },
      { type: "h2", text: "Prendre l'habitude, sans y penser" },
      {
        type: "p",
        text: "Le vrai obstacle n'est pas de savoir quoi faire, mais de s'en souvenir dans le feu de l'action. Aura s'en charge : elle vous rappelle de vous redresser et de bouger au bon moment, apprend votre rythme, et répond à vos questions du quotidien. C'est un compagnon discret qui transforme les bons conseils en habitudes.",
      },
      {
        type: "p",
        text: "Ces recommandations sont générales. En cas de douleur persistante, consultez un professionnel de santé — elles ne remplacent pas un avis médical.",
      },
    ],
  },
  {
    slug: "rester-concentre-teletravail",
    title: "Rester concentré en télétravail : 7 méthodes qui marchent vraiment",
    description:
      "Difficile de rester concentré en télétravail ? 7 méthodes concrètes pour éviter les distractions, structurer sa journée et protéger son énergie.",
    excerpt:
      "À la maison, les distractions sont partout et personne ne regarde par-dessus votre épaule. Voici 7 méthodes concrètes pour tenir votre concentration toute la journée.",
    keyword: "rester concentré télétravail",
    readingMinutes: 6,
    date: "2026-07-15",
    body: [
      {
        type: "p",
        text: "Le télétravail offre une liberté formidable — et un défi tout aussi grand : rester concentré sans le cadre du bureau. Voici sept méthodes éprouvées, à combiner selon ce qui vous convient.",
      },
      { type: "h2", text: "1. Un vrai rituel de démarrage" },
      {
        type: "p",
        text: "Le cerveau a besoin d'un signal pour passer en mode travail. Une routine courte et fixe — un café, trois priorités notées, puis on commence — crée cette bascule mentale mieux que n'importe quelle appli.",
      },
      { type: "h2", text: "2. La méthode des trois priorités" },
      {
        type: "p",
        text: "Chaque matin, choisissez trois tâches, pas plus. Une longue liste disperse ; trois objectifs clairs concentrent l'énergie sur ce qui compte vraiment.",
      },
      { type: "h2", text: "3. Le travail par blocs (Pomodoro)" },
      {
        type: "p",
        text: "Travaillez 25 minutes, faites 5 minutes de pause, et recommencez. Ces blocs rendent les grosses tâches abordables et forcent des pauses régulières — bénéfiques pour la concentration comme pour la posture.",
      },
      { type: "h2", text: "4. Neutralisez les notifications" },
      {
        type: "p",
        text: "Chaque notification coûte plusieurs minutes de reconcentration. Coupez celles qui ne sont pas essentielles pendant vos blocs de travail. Le téléphone dans une autre pièce fait des merveilles.",
      },
      { type: "h2", text: "5. Bougez pour rester vif" },
      {
        type: "p",
        text: "La concentration chute quand le corps s'engourdit. Une courte marche, quelques étirements entre deux blocs relancent l'attention. Le mouvement n'est pas une perte de temps, c'est un carburant.",
      },
      { type: "h2", text: "6. Protégez votre énergie, pas seulement votre temps" },
      {
        type: "p",
        text: "Repérez vos heures de pointe (souvent la matinée) et réservez-les aux tâches difficiles. Gardez les tâches mécaniques pour les creux d'énergie de l'après-midi.",
      },
      { type: "h2", text: "7. Un assistant qui vous garde sur les rails" },
      {
        type: "p",
        text: "Tenir toutes ces méthodes seul, jour après jour, demande de la discipline. C'est là qu'Aura aide : elle vous aide à fixer vos priorités, vous rappelle de faire des pauses, répond à vos questions sans casser votre élan, et s'adapte à votre rythme. Un compagnon qui rend la concentration plus facile, au lieu de compter dessus.",
      },
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
