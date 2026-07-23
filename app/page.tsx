import Link from "next/link";
import { PLANS } from "@/lib/plans";
import ChatPreview from "@/components/ChatPreview";
import Reveal from "@/components/Reveal";
import FAQ from "@/components/FAQ";
import AuraOrb from "@/components/AuraOrb";
import SpotlightCard from "@/components/SpotlightCard";
import Marquee from "@/components/Marquee";
import { ZapIcon, SparkleIcon, TargetIcon, GlobeIcon, LockIcon, MessageIcon } from "@/components/icons";

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
  },
  {
    n: "02",
    title: "Posez votre première question",
    description: "Travail, santé, organisation — Aura répond en streaming, en temps réel.",
  },
  {
    n: "03",
    title: "Revenez chaque jour",
    description: "Aura s'améliore avec vos habitudes. Passez Plus ou Pro quand vous en avez besoin.",
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

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <section className="relative">
        <AuraOrb className="left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2" />
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
            </Reveal>
          </div>

          <Reveal delay={200} className="lg:justify-self-end">
            <ChatPreview />
          </Reveal>
        </div>
      </section>

      <Marquee items={USE_CASES} />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-white/30">
            Comment ça marche
          </p>
        </Reveal>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 120}>
              <div className="relative rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
                <span className="font-display text-3xl italic text-white/15">{step.n}</span>
                <h3 className="mt-4 text-base font-semibold text-white">{step.title}</h3>
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
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 100}>
              <SpotlightCard className="h-full rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition duration-300 hover:border-aura-400/30">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-aura-500/20 to-bloom-pink/10 text-aura-200">
                  <f.Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{f.description}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-aura-900/30 via-transparent to-transparent p-10 text-center sm:p-14">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-aura-500/20 blur-3xl" />
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

      <section className="mx-auto max-w-3xl px-6 py-20">
        <Reveal>
          <h2 className="text-center font-display text-3xl font-medium text-white sm:text-4xl">
            Questions fréquentes
          </h2>
        </Reveal>
        <Reveal delay={100} className="mt-10">
          <FAQ items={FAQ_ITEMS} />
        </Reveal>
      </section>
    </div>
  );
}
