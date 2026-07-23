"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PLANS, type PlanId } from "@/lib/plans";

export default function PricingCards() {
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setIsLoggedIn(Boolean(data.email)))
      .catch(() => setIsLoggedIn(false));
  }, []);

  async function handleSubscribe(planId: PlanId) {
    setError(null);

    if (planId === "free") {
      router.push(isLoggedIn ? "/chat" : "/signup");
      return;
    }

    if (!isLoggedIn) {
      router.push("/login?next=/pricing");
      return;
    }

    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la création du paiement.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div>
      {isLoggedIn === false && (
        <p className="mx-auto mb-8 max-w-md text-center text-sm text-white/50">
          Connectez-vous pour souscrire à un plan payant — c&apos;est gratuit et rapide.
        </p>
      )}
      {error && <p className="mx-auto mb-6 max-w-md text-center text-sm text-red-300">{error}</p>}

      <div className="grid gap-6 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`flex flex-col rounded-2xl border p-8 ${
              plan.highlighted
                ? "border-aura-400 bg-aura-500/10 shadow-xl shadow-aura-500/10"
                : "border-white/10 bg-white/5"
            }`}
          >
            {plan.highlighted && (
              <span className="mb-4 w-fit rounded-full bg-aura-500 px-3 py-1 text-xs font-semibold text-white">
                Le plus populaire
              </span>
            )}
            <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
            <p className="mt-1 text-sm text-white/50">{plan.tagline}</p>
            <p className="mt-6">
              <span className="text-4xl font-bold text-white">
                {plan.priceMonthly === 0 ? "Gratuit" : `${plan.priceMonthly}€`}
              </span>
              {plan.priceMonthly > 0 && (
                <span className="text-sm text-white/40"> / mois</span>
              )}
            </p>
            <ul className="mt-6 flex-1 space-y-3 text-sm text-white/70">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-0.5 text-aura-300">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loadingPlan === plan.id}
              className={`mt-8 w-full rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                plan.highlighted
                  ? "bg-aura-500 text-white hover:bg-aura-400"
                  : "border border-white/15 text-white hover:border-white/30"
              }`}
            >
              {loadingPlan === plan.id
                ? "Redirection…"
                : plan.id === "free"
                ? "Commencer gratuitement"
                : `Passer à ${plan.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
