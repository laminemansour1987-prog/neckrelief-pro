import PricingCards from "@/components/PricingCards";
import FAQ from "@/components/FAQ";
import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Abonnements — Aura AI",
};

const BILLING_FAQ = [
  {
    question: "Comment fonctionne la facturation ?",
    answer:
      "Les plans Plus et Pro sont facturés mensuellement via Stripe. Vous recevez une facture par email à chaque renouvellement.",
  },
  {
    question: "Puis-je changer de plan à tout moment ?",
    answer:
      "Oui, depuis votre espace compte, le portail de facturation Stripe permet de passer d'un plan à l'autre ou d'annuler en un clic.",
  },
  {
    question: "Que se passe-t-il si j'annule ?",
    answer:
      "Vous gardez l'accès à votre plan jusqu'à la fin de la période déjà payée, puis vous repassez automatiquement au plan Free.",
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <Reveal>
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h1 className="font-display text-4xl font-medium text-white">Choisissez votre plan</h1>
          <p className="mt-3 text-white/50">
            Commencez gratuitement. Passez à Plus ou Pro quand Aura devient
            indispensable dans votre quotidien. Résiliable à tout moment.
          </p>
        </div>
      </Reveal>
      <Reveal delay={100}>
        <PricingCards />
      </Reveal>

      <Reveal delay={150}>
        <div className="mx-auto mt-24 max-w-2xl">
          <h2 className="text-center font-display text-2xl font-medium text-white">
            Questions sur la facturation
          </h2>
          <div className="mt-8">
            <FAQ items={BILLING_FAQ} />
          </div>
        </div>
      </Reveal>
    </div>
  );
}
