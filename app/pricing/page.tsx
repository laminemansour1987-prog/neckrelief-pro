import PricingCards from "@/components/PricingCards";

export const metadata = {
  title: "Abonnements — Aura AI",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-white">Choisissez votre plan</h1>
        <p className="mt-3 text-white/60">
          Commencez gratuitement. Passez à Plus ou Pro quand Aura devient
          indispensable dans votre quotidien. Résiliable à tout moment.
        </p>
      </div>
      <PricingCards />
    </div>
  );
}
