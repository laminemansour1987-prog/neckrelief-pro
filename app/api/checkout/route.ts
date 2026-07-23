import { NextRequest, NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { getPlan } from "@/lib/plans";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe n'est pas configuré sur le serveur (STRIPE_SECRET_KEY manquant)." },
      { status: 501 }
    );
  }

  let body: { planId?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const plan = getPlan(body.planId);
  if (plan.id === "free" || !plan.priceId) {
    return NextResponse.json({ error: "Plan invalide pour le paiement." }, { status: 400 });
  }
  if (!body.email || !/^\S+@\S+\.\S+$/.test(body.email)) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${req.nextUrl.origin}`;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: body.email,
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
      metadata: { planId: plan.id },
      subscription_data: {
        metadata: { planId: plan.id },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Impossible de créer la session de paiement." },
      { status: 502 }
    );
  }
}
