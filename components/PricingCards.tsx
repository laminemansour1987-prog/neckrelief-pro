"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLANS, type PlanId } from "@/lib/plans";

export default function PricingCards() {
  const [email, setEmail] = useState("");
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubscribe(planId: PlanId) {
    setError(null);

    if (planId === "free") {
      router.push("/chat");
      return;
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Merci d'entrer une adresse email valide avant de continuer.");
      return;
    }

    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, email }),
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
      <div className="mx-auto mb-10 max-w-sm">
        <label className="mb-2 block text-center text-sm text-white/60">
          Votre email (requis pour les plans payants)
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@example.com"
          className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-center text-sm text-white placeholder-white/30 outline-none focus:border-aura-400"
        />
        {error && <p className="mt-2 text-center text-xs text-red-300">{error}</p>}
      </div>

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
