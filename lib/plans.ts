export type PlanId = "free" | "plus" | "pro";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceId: string | null;
  dailyMessageLimit: number | null;
  features: string[];
  highlighted?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Pour découvrir Aura au quotidien",
    priceMonthly: 0,
    priceId: null,
    dailyMessageLimit: 15,
    features: [
      "15 messages par jour",
      "Conseils bien-être & posture de base",
      "Historique de conversation local",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    tagline: "Pour un usage quotidien sans limite",
    priceMonthly: 9,
    priceId: process.env.STRIPE_PRICE_ID_PLUS || "price_plus_placeholder",
    dailyMessageLimit: 300,
    features: [
      "300 messages par jour",
      "Réponses prioritaires, plus rapides",
      "Rappels bien-être personnalisés",
      "Support par email",
    ],
    highlighted: true,
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Pour les familles, équipes et power users",
    priceMonthly: 19,
    priceId: process.env.STRIPE_PRICE_ID_PRO || "price_pro_placeholder",
    dailyMessageLimit: null,
    features: [
      "Messages illimités",
      "Jusqu'à 5 profils dans un foyer",
      "Assistant vocal (bêta)",
      "Support prioritaire 24/7",
    ],
  },
];

export function getPlan(id: string | null | undefined): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

/** Daily message limit for anonymous (not signed in) visitors trying Aura. */
export const GUEST_DAILY_LIMIT = 5;
