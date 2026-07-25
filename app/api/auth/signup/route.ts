import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail, getUserByReferralCode } from "@/lib/users";
import { hashPassword, createSessionToken, SESSION_COOKIE, SESSION_COOKIE_MAX_AGE } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";

export const runtime = "nodejs";

function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && /^\S+@\S+\.\S+$/.test(email);
}

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string; ref?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isValidEmail(body.email)) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }
  if (!body.password || body.password.length < 8) {
    return NextResponse.json(
      { error: "Le mot de passe doit contenir au moins 8 caractères." },
      { status: 400 }
    );
  }

  const existing = await getUserByEmail(body.email);
  if (existing) {
    return NextResponse.json(
      { error: "Un compte existe déjà avec cet email. Connectez-vous plutôt." },
      { status: 409 }
    );
  }

  // Resolve the referral code (if any) to the referrer's code, ignoring
  // invalid or self-referrals silently — a bad ref should never block signup.
  let referredBy: string | null = null;
  if (body.ref) {
    const referrer = await getUserByReferralCode(body.ref);
    if (referrer && referrer.email !== body.email.toLowerCase()) {
      referredBy = referrer.referralCode;
    }
  }

  await createUser(body.email, hashPassword(body.password), referredBy);

  // Welcome email — best effort, never blocks or fails signup.
  await sendWelcomeEmail(body.email.toLowerCase());

  const token = await createSessionToken(body.email.toLowerCase());

  const res = NextResponse.json({ email: body.email.toLowerCase() });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE,
  });
  return res;
}
