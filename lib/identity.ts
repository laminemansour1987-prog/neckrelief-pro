import { randomUUID } from "crypto";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getSubscriberByEmail } from "@/lib/subscribers";
import { getPlan, GUEST_DAILY_LIMIT, type PlanId } from "@/lib/plans";

export const ANON_COOKIE = "aura_anon_id";

export interface Identity {
  /** Unique key used for usage-quota tracking. */
  key: string;
  email: string | null;
  plan: PlanId;
  limit: number | null;
  isGuest: boolean;
  /** Set when a new anonymous id was generated and must be persisted via Set-Cookie. */
  newAnonId?: string;
}

export async function resolveIdentity(req: NextRequest): Promise<Identity> {
  const sessionToken = req.cookies.get(SESSION_COOKIE)?.value;
  const email = await verifySessionToken(sessionToken);

  if (email) {
    const subscriber = await getSubscriberByEmail(email);
    const planId = subscriber && subscriber.status === "active" ? subscriber.plan : "free";
    const plan = getPlan(planId);
    return {
      key: `user:${email}`,
      email,
      plan: plan.id,
      limit: plan.dailyMessageLimit,
      isGuest: false,
    };
  }

  const existingAnonId = req.cookies.get(ANON_COOKIE)?.value;
  const anonId = existingAnonId || randomUUID();

  return {
    key: `guest:${anonId}`,
    email: null,
    plan: "free",
    limit: GUEST_DAILY_LIMIT,
    isGuest: true,
    newAnonId: existingAnonId ? undefined : anonId,
  };
}

export const ANON_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
