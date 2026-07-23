import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/users";
import { hashPassword, createSessionToken, SESSION_COOKIE, SESSION_COOKIE_MAX_AGE } from "@/lib/auth";

export const runtime = "nodejs";

function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && /^\S+@\S+\.\S+$/.test(email);
}

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
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

  await createUser(body.email, hashPassword(body.password));
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
