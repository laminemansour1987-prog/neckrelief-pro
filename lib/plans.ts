export type PlanId = "free" | "plus" | "pro";
export type BillingCycle = "monthly" | "annual";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  priceMonthly: number;
  /** Total per year when billed annually (2 months free vs monthly). */
  priceAnnual: number;
  priceId: string | null;
  priceIdAnnual: string | null;
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
    priceAnnual: 0,
    priceId: null,
    priceIdAnnual: null,
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
    priceAnnual: 90,
    priceId: process.env.STRIPE_PRICE_ID_PLUS || "price_plus_placeholder",
    priceIdAnnual: process.env.STRIPE_PRICE_ID_PLUS_ANNUAL || "price_plus_annual_placeholder",
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
    priceAnnual: 190,
    priceId: process.env.STRIPE_PRICE_ID_PRO || "price_pro_placeholder",
    priceIdAnnual: process.env.STRIPE_PRICE_ID_PRO_ANNUAL || "price_pro_annual_placeholder",
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
