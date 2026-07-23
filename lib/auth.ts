import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "aura_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const SECRET_FILE = path.join(process.cwd(), "data", ".session-secret");

let cachedSecret: string | null = null;

// Dev convenience: persist a generated secret to disk so sessions survive
// restarts when SESSION_SECRET isn't set. Set SESSION_SECRET in production.
async function getSessionSecret(): Promise<string> {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  if (cachedSecret) return cachedSecret;

  try {
    cachedSecret = (await fs.readFile(SECRET_FILE, "utf-8")).trim();
    if (cachedSecret) return cachedSecret;
  } catch {
    // fall through to generation
  }

  cachedSecret = randomBytes(32).toString("hex");
  await fs.mkdir(path.dirname(SECRET_FILE), { recursive: true });
  await fs.writeFile(SECRET_FILE, cachedSecret, "utf-8");
  return cachedSecret;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

export async function createSessionToken(email: string): Promise<string> {
  const secret = await getSessionSecret();
  const payload = JSON.stringify({
    email,
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  });
  const payloadB64 = base64url(payload);
  const signature = createHmac("sha256", secret).update(payloadB64).digest("base64url");
  return `${payloadB64}.${signature}`;
}

export async function verifySessionToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  const secret = await getSessionSecret();
  const expected = createHmac("sha256", secret).update(payloadB64).digest("base64url");

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
    return typeof payload.email === "string" ? payload.email : null;
  } catch {
    return null;
  }
}

/** Reads the current session email from cookies(), for use in Server Components / Route Handlers. */
export async function getSessionEmail(): Promise<string | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export const SESSION_COOKIE_MAX_AGE = SESSION_TTL_SECONDS;
