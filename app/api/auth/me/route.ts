import { NextRequest, NextResponse } from "next/server";
import { resolveIdentity, ANON_COOKIE, ANON_COOKIE_MAX_AGE } from "@/lib/identity";
import { getUsageToday } from "@/lib/usage";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const identity = await resolveIdentity(req);
  const usage = await getUsageToday(identity.key);

  const res = NextResponse.json({
    email: identity.email,
    isGuest: identity.isGuest,
    plan: identity.plan,
    limit: identity.limit,
    usageToday: usage,
  });

  if (identity.newAnonId) {
    res.cookies.set(ANON_COOKIE, identity.newAnonId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ANON_COOKIE_MAX_AGE,
    });
  }

  return res;
}
