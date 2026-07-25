import Link from "next/link";
import Image from "next/image";
import { PLANS } from "@/lib/plans";
import ChatPreview from "@/components/ChatPreview";
import Reveal from "@/components/Reveal";
import FAQ from "@/components/FAQ";
import AuraCanvas from "@/components/AuraCanvas";
import SpotlightCard from "@/components/SpotlightCard";
import Marquee from "@/components/Marquee";
import { ZapIcon, SparkleIcon, TargetIcon, GlobeIcon, LockIcon, MessageIcon } from "@/components/icons";
import StepIllustration from "@/components/StepIllustration";
import Tilt from "@/components/Tilt";
import StatsBand from "@/components/StatsBand";
import SocialProof from "@/components/SocialProof";

const FEATURES = [
  {
    title: "Réponses instantanées",
    description:
      "Posez n'importe quelle question du quotidien — travail, santé, organisation — et obtenez une réponse claire en secondes.",
    Icon: ZapIcon,
  },
  {
    title: "Bien-être & posture",
    description:
      "Rappels intelligents pour bouger, s'étirer et corriger sa posture pendant les longues journées assis devant un écran.",
    Icon: SparkleIcon,
  },
  {
    title: "Mémoire de vos habitudes",
    description:
      "Aura apprend vos préférences pour des conseils de plus en plus personnalisés, jour après jour.",
    Icon: TargetIcon,
  },
  {
    title: "Disponible partout",
    description:
      "Web aujourd'hui, mobile demain. Une seule IA qui vous suit sur tous vos appareils.",
    Icon: GlobeIcon,
  },
  {
    title: "Confidentialité d'abord",
    description:
      "Vos conversations vous appartiennent. Aucune revente de données, contrôle total sur votre historique.",
    Icon: LockIcon,
  },
  {
    title: "Multilingue",
    description:
      "Aura comprend et répond dans votre langue, où que vous soyez sur la planète.",
    Icon: MessageIcon,
  },
];

const STEPS = [
  {
    n: "01",
    title: "Créez votre compte",
    description: "Inscription gratuite en 10 secondes, sans carte bancaire.",
    illustration: "account" as const,
  },
  {
    n: "02",
    title: "Posez votre première question",
    description: "Travail, santé, organisation — Aura répond en streaming, en temps réel.",
    illustration: "question" as const,
  },
  {
    n: "03",
    title: "Revenez chaque jour",
    description: "Aura s'améliore avec vos habitudes. Passez Plus ou Pro quand vous en avez besoin.",
    illustration: "daily" as const,
  },
];

const FAQ_ITEMS = [
  {
    question: "Aura est-elle vraiment gratuite ?",
    answer:
      "Oui. Le plan Free donne accès à 15 messages par jour sans carte bancaire. Vous pouvez aussi essayer sans compte avec 5 messages d'essai.",
  },
  {
    question: "Puis-je annuler mon abonnement à tout moment ?",
    answer:
      "Oui, en un clic depuis votre espace compte via le portail de facturation Stripe — aucun engagement, aucun frais caché.",
  },
  {
    question: "Mes conversations sont-elles privées ?",
    answer:
      "Vos échanges avec Aura ne sont ni revendus ni partagés. Vous gardez le contrôle de votre historique.",
  },
  {
    question: "Aura remplace-t-elle un avis médical ?",
    answer:
      "Non. Les conseils bien-être et posture d'Aura sont informatifs et ne remplacent pas l'avis d'un professionnel de santé.",
  },
];

const USE_CASES = [
  "Organisation",
  "Bien-être",
  "Productivité",
  "Posture",
  "Sommeil",
  "Concentration",
  "Habitudes",
  "Motivation",
];

const HEADLINE_WORDS = ["Une", "IA", "essentielle", "chaque", "jour", "de", "votre", "vie"];

const TESTIMONIALS = [
  {
    avatar: "/images/avatars/av1.png",
    name: "Léa",
    role: "Graphiste indépendante",
    quote:
      "Le rappel d'étirement toutes les 30 minutes a changé mes journées. Je ne finis plus la semaine avec la nuque en vrac.",
  },
  {
    avatar: "/images/avatars/av2.png",
    name: "Karim",
    role: "Développeur",
    quote:
      "C'est devenu mon premier réflexe le matin : je lui donne mes trois priorités et il me recadre quand je m'éparpille.",
  },
  {
    avatar: "/images/avatars/av3.png",
    name: "Awa",
    role: "Maman de deux enfants",
    quote:
      "Chacun a son profil à la maison. Les devoirs, les recettes, mes séances de sport — une seule app pour tout le monde.",
  },
];

const MOMENTS = [
  {
    image: "/images/scene-stretch.png",
    alt: "Illustration : une personne s'étire à son bureau au lever du soleil",
    kicker: "Le matin",
    title: "Commencez la journée du bon pied",
    description:
      "Un étirement guidé, la météo de votre énergie, vos priorités du jour. Aura vous rappelle de bouger avant que la nuque ne se bloque — pas après.",
  },
  {
    image: "/images/scene-chat.png",
    alt: "Illustration : une conversation avec Aura sur un téléphone",
    kicker: "Toute la journée",
    title: "Une réponse, tout de suite",
    description:
      "Une question de travail, un mail à reformuler, un dîner à improviser. Vous demandez, Aura répond en streaming — sur web aujourd'hui, mobile demain.",
  },
  {
    image: "/images/scene-family.png",
    alt: "Illustration : plusieurs profils d'une famille reliés à Aura",
    kicker: "Pour tout le foyer",
    title: "Une IA que toute la famille partage",
    description:
      "Avec le plan Pro, jusqu'à 5 profils sous un même toit : chacun ses conversations, ses rappels et ses habitudes. Une seule facture.",
  },
];

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <section className="relative">
        <AuraCanvas className="absolute inset-x-0 top-0 -z-10 h-[640px] w-full" />
        <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 pb-24 pt-20 lg:grid-cols-[1.1fr_1fr] lg:pt-28">
          <div className="flex flex-col items-start text-left">
            <Reveal>
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-aura-300">
                <span className="h-1.5 w-1.5 rounded-full bg-aura-400" />
                L&apos;IA d&apos;usage quotidien, pour tout le monde
              </span>
            </Reveal>
            <h1 className="text-balance font-display text-5xl font-medium leading-[1.05] text-white sm:text-6xl">
              {HEADLINE_WORDS.map((word, i) => (
                <span
                  key={i}
                  className="mr-3 inline-block animate-fade-up"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  {word === "essentielle" ? (
                    <em className="text-gradient not-italic">{word}</em>
                  ) : (
                    word
                  )}
                </span>
              ))}
            </h1>
            <Reveal delay={160}>
              <p className="mt-6 max-w-lg text-balance text-lg leading-relaxed text-white/55">
                Aura combine un assistant conversationnel puissant et des
                conseils bien-être personnalisés pour devenir le compagnon IA
                que vous ouvrez tous les jours — au travail, à la maison,
                partout.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/chat"
                  className="rounded-full bg-white px-8 py-3 text-base font-semibold text-canvas shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-white/90"
                >
                  Essayer Aura gratuitement
                </Link>
                <Link
                  href="/pricing"
                  className="rounded-full border border-white/15 px-8 py-3 text-base font-semibold text-white/80 transition hover:-translate-y-0.5 hover:border-white/30 hover:text-white"
                >
                  Voir les abonnements
                </Link>
              </div>
              <p className="mt-4 text-xs text-white/30">
                Aucune carte bancaire requise pour le plan gratuit.
              </p>
              <SocialProof />
            </Reveal>
          </div>

          <Reveal delay={200} className="lg:justify-self-end">
            <Tilt>
              <ChatPreview />
            </Tilt>
          </Reveal>
        </div>
      </section>

      <Marquee items={USE_CASES} />

      <section className="relative mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-white/30">
            Comment ça marche
          </p>
        </Reveal>
        <div className="relative mt-10 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 120}>
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 backdrop-blur-sm">
                <StepIllustration variant={step.illustration} />
                <span className="mt-2 block font-display text-2xl italic text-white/15">{step.n}</span>
                <h3 className="mt-2 text-base font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <h2 className="text-center font-display text-3xl font-medium text-white sm:text-4xl">
            Pensé pour être utile, tous les jours
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-white/50">
            Pas un gadget qu&apos;on essaie une fois — un outil qu&apos;on garde ouvert.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const gradients = [
              "from-aura-500/25 to-bloom-pink/10",
              "from-bloom-pink/25 to-bloom-blue/10",
              "from-bloom-blue/25 to-aura-500/10",
            ];
            return (
              <Reveal key={f.title} delay={(i % 3) * 100}>
                <SpotlightCard className="h-full rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition duration-300 hover:border-aura-400/30">
                  <div
                    className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-aura-100 ${gradients[i % 3]}`}
                  >
                    <f.Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">{f.description}</p>
                </SpotlightCard>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <h2 className="text-center font-display text-3xl font-medium text-white sm:text-4xl">
            Aura dans votre quotidien
          </h2>
        </Reveal>
        <div className="mt-16 space-y-24">
          {MOMENTS.map((moment, i) => (
            <Reveal key={moment.title}>
              <div
                className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                  i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-aura-950/40">
                  <Image
                    src={moment.image}
                    alt={moment.alt}
                    width={1600}
                    height={1200}
                    className="h-auto w-full"
                    sizes="(min-width: 1024px) 560px, 100vw"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-aura-300">
                    {moment.kicker}
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-medium text-white sm:text-3xl">
                    {moment.title}
                  </h3>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-white/55">
                    {moment.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <Reveal>
          <StatsBand />
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <h2 className="text-center font-display text-3xl font-medium text-white sm:text-4xl">
            Ils ouvrent Aura tous les jours
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 120}>
              <figure className="flex h-full flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7">
                <div className="mb-4 flex gap-1 text-bloom-amber" aria-label="5 étoiles">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <svg key={s} viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                      <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9l-5.3 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="flex-1 text-sm leading-relaxed text-white/70">
                  « {t.quote} »
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="relative h-11 w-11 overflow-hidden rounded-full ring-1 ring-white/15">
                    <Image src={t.avatar} alt="" fill sizes="44px" className="object-cover" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">{t.name}</span>
                    <span className="block text-xs text-white/40">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-aura-900/30 via-transparent to-transparent p-10 text-center sm:p-14">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-aura-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 right-0 h-52 w-52 rounded-full bg-bloom-pink/15 blur-3xl" />
            <h2 className="font-display text-3xl font-medium text-white sm:text-4xl">
              Des abonnements simples, sans surprise
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/50">
              Commencez gratuitement. Passez à Plus ou Pro dès que vous en avez
              besoin, résiliable à tout moment.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-2xl border p-6 text-left ${
                    plan.highlighted
                      ? "border-aura-400/50 bg-aura-500/10"
                      : "border-white/[0.08] bg-white/[0.02]"
                  }`}
                >
                  <p className="text-sm font-medium text-white/50">{plan.name}</p>
                  <p className="mt-1 text-3xl font-semibold text-white">
                    {plan.priceMonthly === 0 ? "Gratuit" : `${plan.priceMonthly}€`}
                    {plan.priceMonthly > 0 && (
                      <span className="text-sm font-normal text-white/35">/mois</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
            <Link
              href="/pricing"
              className="mt-10 inline-block rounded-full bg-white px-8 py-3 text-base font-semibold text-canvas transition hover:-translate-y-0.5 hover:bg-white/90"
            >
              Voir tous les détails
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="relative mx-auto max-w-3xl px-6 py-20">
        <Reveal>
          <h2 className="text-center font-display text-3xl font-medium text-white sm:text-4xl">
            Questions fréquentes
          </h2>
        </Reveal>
        <Reveal delay={100} className="relative mt-10">
          <FAQ items={FAQ_ITEMS} />
        </Reveal>
      </section>

      <section className="relative mx-auto max-w-4xl px-6 pb-28 pt-10 text-center">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-aura-400/25 bg-gradient-to-b from-aura-500/15 via-aura-900/20 to-transparent px-8 py-16 sm:px-16">
            <div className="pointer-events-none absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-aura-500/30 blur-3xl" />
            <h2 className="text-balance font-display text-3xl font-medium text-white sm:text-5xl">
              Votre journée mérite une <em className="text-gradient not-italic">aura</em>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-white/55">
              Gratuit en 10 secondes. Sans carte bancaire. Résiliable en un clic
              si un jour vous n&apos;en voulez plus — mais on parie que non.
            </p>
            <Link
              href="/signup"
              className="mt-9 inline-block rounded-full bg-white px-10 py-3.5 text-base font-semibold text-canvas shadow-xl shadow-aura-500/20 transition hover:-translate-y-0.5 hover:bg-white/90"
            >
              Créer mon compte gratuit
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
