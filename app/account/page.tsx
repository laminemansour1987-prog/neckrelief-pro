import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionEmail } from "@/lib/auth";
import { getSubscriberByEmail } from "@/lib/subscribers";
import { getUsageToday } from "@/lib/usage";
import { getPlan } from "@/lib/plans";
import BillingPortalButton from "@/components/BillingPortalButton";

export const metadata = { title: "Mon compte — Aura AI" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const email = await getSessionEmail();
  if (!email) redirect("/login?next=/account");

  const subscriber = await getSubscriberByEmail(email);
  const planId = subscriber?.status === "active" ? subscriber.plan : "free";
  const plan = getPlan(planId);
  const usageToday = await getUsageToday(`user:${email}`);

  return (
    <div className="mx-auto max-w-lg px-6 py-20">
      <h1 className="text-3xl font-bold text-white">Mon compte</h1>
      <p className="mt-1 text-sm text-white/50">{email}</p>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-wide text-white/40">Plan actuel</p>
        <p className="mt-1 text-2xl font-semibold text-white">{plan.name}</p>
        <p className="mt-1 text-sm text-white/50">
          {plan.dailyMessageLimit === null
            ? "Messages illimités"
            : `${usageToday}/${plan.dailyMessageLimit} messages aujourd'hui`}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {subscriber?.stripeCustomerId ? (
            <BillingPortalButton />
          ) : (
            <Link
              href="/pricing"
              className="rounded-full bg-aura-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-aura-400"
            >
              Passer à un plan payant
            </Link>
          )}
          <Link
            href="/chat"
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/30"
          >
            Discuter avec Aura
          </Link>
        </div>
      </div>
    </div>
  );
}
