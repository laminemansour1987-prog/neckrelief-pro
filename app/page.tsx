import Link from "next/link";
import { PLANS } from "@/lib/plans";

const FEATURES = [
  {
    title: "Réponses instantanées",
    description:
      "Posez n'importe quelle question du quotidien — travail, santé, organisation — et obtenez une réponse claire en secondes.",
    icon: "⚡",
  },
  {
    title: "Bien-être & posture",
    description:
      "Rappels intelligents pour bouger, s'étirer et corriger sa posture pendant les longues journées assis devant un écran.",
    icon: "🧘",
  },
  {
    title: "Mémoire de vos habitudes",
    description:
      "Aura apprend vos préférences pour des conseils de plus en plus personnalisés, jour après jour.",
    icon: "🧠",
  },
  {
    title: "Disponible partout",
    description:
      "Web aujourd'hui, mobile demain. Une seule IA qui vous suit sur tous vos appareils.",
    icon: "🌍",
  },
  {
    title: "Confidentialité d'abord",
    description:
      "Vos conversations vous appartiennent. Aucune revente de données, contrôle total sur votre historique.",
    icon: "🔒",
  },
  {
    title: "Multilingue",
    description:
      "Aura comprend et répond dans votre langue, où que vous soyez sur la planète.",
    icon: "🗣️",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 pb-20 pt-24 text-center sm:pt-32">
        <span className="mb-6 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-medium uppercase tracking-wide text-aura-300">
          L&apos;IA d&apos;usage quotidien, pour tout le monde
        </span>
        <h1 className="text-balance text-4xl font-bold leading-tight text-white sm:text-6xl">
          Une intelligence artificielle
          <span className="bg-gradient-to-r from-aura-300 to-aura-500 bg-clip-text text-transparent">
            {" "}essentielle chaque jour
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-balance text-lg text-white/60">
          Aura combine un assistant conversationnel puissant et des conseils
          bien-être personnalisés pour devenir le compagnon IA que vous
          ouvrez tous les jours — au travail, à la maison, partout.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/chat"
            className="rounded-full bg-aura-500 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-aura-500/30 transition hover:bg-aura-400"
          >
            Essayer Aura gratuitement
          </Link>
          <Link
            href="/pricing"
            className="rounded-full border border-white/15 px-8 py-3 text-base font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
          >
            Voir les abonnements
          </Link>
        </div>
        <p className="mt-4 text-xs text-white/30">
          Aucune carte bancaire requise pour le plan gratuit.
        </p>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
          Pensé pour être utile, tous les jours
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-white/60">
          Pas un gadget qu&apos;on essaie une fois — un outil qu&apos;on garde ouvert.
        </p>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-aura-400/40 hover:bg-white/[0.07]"
            >
              <div className="mb-4 text-3xl">{f.icon}</div>
              <h3 className="text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-white/60">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-aura-900/40 to-transparent p-10 text-center">
          <h2 className="text-3xl font-bold text-white">
            Des abonnements simples, sans surprise
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/60">
            Commencez gratuitement. Passez à Plus ou Pro dès que vous en avez
            besoin, résiliable à tout moment.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl border p-6 text-left ${
                  plan.highlighted
                    ? "border-aura-400 bg-aura-500/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <p className="text-sm font-medium text-white/60">{plan.name}</p>
                <p className="mt-1 text-3xl font-bold text-white">
                  {plan.priceMonthly === 0 ? "Gratuit" : `${plan.priceMonthly}€`}
                  {plan.priceMonthly > 0 && (
                    <span className="text-sm font-normal text-white/40">/mois</span>
                  )}
                </p>
              </div>
            ))}
          </div>
          <Link
            href="/pricing"
            className="mt-10 inline-block rounded-full bg-white px-8 py-3 text-base font-semibold text-[#0a0a12] transition hover:bg-white/90"
          >
            Voir tous les détails
          </Link>
        </div>
      </section>
    </div>
  );
}
