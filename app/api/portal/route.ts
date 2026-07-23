import { NextRequest, NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/auth";
import { getSubscriberByEmail } from "@/lib/subscribers";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe n'est pas configuré sur le serveur." },
      { status: 501 }
    );
  }

  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ error: "Connectez-vous pour gérer votre abonnement." }, { status: 401 });
  }

  const subscriber = await getSubscriberByEmail(email);
  if (!subscriber?.stripeCustomerId) {
    return NextResponse.json(
      { error: "Aucun abonnement Stripe actif pour ce compte." },
      { status: 404 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

  try {
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: subscriber.stripeCustomerId,
      return_url: `${appUrl}/account`,
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe portal error:", error);
    return NextResponse.json({ error: "Impossible d'ouvrir le portail de facturation." }, { status: 502 });
  }
}
