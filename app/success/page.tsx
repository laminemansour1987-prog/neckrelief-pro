import Link from "next/link";

export const metadata = {
  title: "Abonnement confirmé — Aura AI",
};

export default function SuccessPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-32 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-aura-500/20 text-3xl">
        🎉
      </div>
      <h1 className="text-3xl font-bold text-white">Merci pour votre abonnement !</h1>
      <p className="mt-3 text-white/60">
        Votre paiement a été confirmé par Stripe. Votre plan sera activé sous
        quelques instants.
      </p>
      <Link
        href="/chat"
        className="mt-8 rounded-full bg-aura-500 px-8 py-3 text-sm font-semibold text-white hover:bg-aura-400"
      >
        Aller discuter avec Aura
      </Link>
    </div>
  );
}
