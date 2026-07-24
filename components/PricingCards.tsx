"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PLANS, type BillingCycle, type PlanId } from "@/lib/plans";
import SpotlightCard from "@/components/SpotlightCard";

export default function PricingCards() {
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [billing, setBilling] = useState<BillingCycle>("monthly");
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
        body: JSON.stringify({ planId, billing }),
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

      <div className="mb-12 flex items-center justify-center gap-3">
        <div className="flex rounded-full border border-white/10 bg-white/[0.04] p-1">
          <button
            onClick={() => setBilling("monthly")}
            aria-pressed={billing === "monthly"}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              billing === "monthly" ? "bg-white text-canvas" : "text-white/60 hover:text-white"
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setBilling("annual")}
            aria-pressed={billing === "annual"}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              billing === "annual" ? "bg-white text-canvas" : "text-white/60 hover:text-white"
            }`}
          >
            Annuel
          </button>
        </div>
        <span className="rounded-full bg-aura-500/20 px-3 py-1 text-xs font-semibold text-aura-200">
          2 mois offerts
        </span>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <SpotlightCard
            key={plan.id}
            className={`rounded-2xl border p-8 transition duration-300 ${
              plan.highlighted
                ? "border-aura-400/50 bg-aura-500/[0.08] shadow-2xl shadow-aura-500/10 sm:-translate-y-3"
                : "border-white/[0.08] bg-white/[0.02] hover:border-white/15"
            }`}
          >
            {plan.highlighted && (
              <div className="pointer-events-none absolute -top-6 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-aura-500/25 blur-3xl" />
            )}
            {plan.highlighted && (
              <span className="mb-4 w-fit rounded-full bg-gradient-to-r from-aura-500 to-bloom-pink px-3 py-1 text-xs font-semibold text-white">
                Le plus populaire
              </span>
            )}
            <h3 className="font-display text-xl font-medium text-white">{plan.name}</h3>
            <p className="mt-1 text-sm text-white/45">{plan.tagline}</p>
            <p className="mt-6 flex items-baseline gap-1">
              <span className="font-display text-4xl font-medium text-white">
                {plan.priceMonthly === 0
                  ? "Gratuit"
                  : billing === "monthly"
                  ? `${plan.priceMonthly}€`
                  : `${(plan.priceAnnual / 12).toFixed(2).replace(".", ",").replace(",00", "")}€`}
              </span>
              {plan.priceMonthly > 0 && <span className="text-sm text-white/35">/ mois</span>}
            </p>
            {plan.priceMonthly > 0 && billing === "annual" && (
              <p className="mt-1 text-xs text-white/40">
                Facturé {plan.priceAnnual}€ par an — 2 mois offerts
              </p>
            )}
            <ul className="mt-6 flex-1 space-y-3 text-sm text-white/65">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-aura-500/20 text-[10px] text-aura-300">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loadingPlan === plan.id}
              className={`mt-8 w-full rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                plan.highlighted
                  ? "bg-white text-canvas hover:bg-white/90"
                  : "border border-white/15 text-white hover:border-white/30"
              }`}
            >
              {loadingPlan === plan.id
                ? "Redirection…"
                : plan.id === "free"
                ? "Commencer gratuitement"
                : `Passer à ${plan.name}`}
            </button>
          </SpotlightCard>
        ))}
      </div>
    </div>
  );
}
