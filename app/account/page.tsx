import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionEmail } from "@/lib/auth";
import { getSubscriberByEmail } from "@/lib/subscribers";
import { getUsageToday } from "@/lib/usage";
import { getPlan } from "@/lib/plans";
import { getUserByEmail, getReferralCount } from "@/lib/users";
import BillingPortalButton from "@/components/BillingPortalButton";
import ReferralCard from "@/components/ReferralCard";

export const metadata = { title: "Mon compte — Aura AI" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const email = await getSessionEmail();
  if (!email) redirect("/login?next=/account");

  const subscriber = await getSubscriberByEmail(email);
  const planId = subscriber?.status === "active" ? subscriber.plan : "free";
  const plan = getPlan(planId);
  const usageToday = await getUsageToday(`user:${email}`);
  const usagePct = plan.dailyMessageLimit
    ? Math.min(100, (usageToday / plan.dailyMessageLimit) * 100)
    : 0;

  const user = await getUserByEmail(email);
  const referralCount = user ? await getReferralCount(user.referralCode) : 0;

  return (
    <div className="mx-auto max-w-lg px-6 py-20">
      <h1 className="font-display text-3xl font-medium text-white">Mon compte</h1>
      <p className="mt-1 text-sm text-white/40">{email}</p>

      <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7">
        <p className="text-xs uppercase tracking-wide text-white/35">Plan actuel</p>
        <p className="mt-1 font-display text-2xl font-medium text-white">{plan.name}</p>

        {plan.dailyMessageLimit === null ? (
          <p className="mt-2 text-sm text-white/50">Messages illimités</p>
        ) : (
          <div className="mt-3">
            <p className="text-sm text-white/50">
              {usageToday}/{plan.dailyMessageLimit} messages aujourd&apos;hui
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-aura-400 to-bloom-pink transition-all duration-500"
                style={{ width: `${usagePct}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-7 flex flex-wrap gap-3">
          {subscriber?.stripeCustomerId ? (
            <BillingPortalButton />
          ) : (
            <Link
              href="/pricing"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-canvas transition hover:bg-white/90"
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

      {user && <ReferralCard code={user.referralCode} count={referralCount} />}
    </div>
  );
}
