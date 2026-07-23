import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { upsertSubscriber } from "@/lib/subscribers";
import type { PlanId } from "@/lib/plans";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe webhook n'est pas configuré." },
      { status: 501 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const rawBody = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_email || session.customer_details?.email;
        const planId = (session.metadata?.planId as PlanId) || "plus";
        if (email && session.customer && session.subscription) {
          await upsertSubscriber({
            email,
            stripeCustomerId: String(session.customer),
            stripeSubscriptionId: String(session.subscription),
            plan: planId,
            status: "active",
            updatedAt: new Date().toISOString(),
          });
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const planId = (subscription.metadata?.planId as PlanId) || "plus";
        const customer = await stripe.customers.retrieve(String(subscription.customer));
        const email = "email" in customer ? customer.email : null;
        if (email) {
          await upsertSubscriber({
            email,
            stripeCustomerId: String(subscription.customer),
            stripeSubscriptionId: subscription.id,
            plan: subscription.status === "active" ? planId : "free",
            status: subscription.status,
            updatedAt: new Date().toISOString(),
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
