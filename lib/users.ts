import { randomBytes } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export interface UserRecord {
  email: string;
  passwordHash: string;
  referralCode: string;
  referredBy: string | null;
  createdAt: string;
}

interface UserRow {
  email: string;
  passwordHash: string;
  referralCode: string;
  referredBy: string | null;
  createdAt: Date;
}

function toRecord(user: UserRow): UserRecord {
  return {
    email: user.email,
    passwordHash: user.passwordHash,
    referralCode: user.referralCode,
    referredBy: user.referredBy,
    createdAt: user.createdAt.toISOString(),
  };
}

/** Short, URL-safe, unambiguous referral code (no 0/O/1/I). */
function generateReferralCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(7);
  let code = "";
  for (let i = 0; i < 7; i++) code += alphabet[bytes[i] % alphabet.length];
  return code;
}

export async function createUser(
  email: string,
  passwordHash: string,
  referredBy?: string | null
): Promise<UserRecord> {
  // Retry a couple of times in the (very unlikely) event of a code collision.
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          referralCode: generateReferralCode(),
          referredBy: referredBy ?? null,
        },
      });
      return toRecord(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const target = (error.meta?.target as string[] | string | undefined) ?? "";
        const targetStr = Array.isArray(target) ? target.join(",") : String(target);
        if (targetStr.includes("email")) {
          throw new Error("Un compte existe déjà avec cet email.");
        }
        // referralCode collision — loop and regenerate
        continue;
      }
      throw error;
    }
  }
  throw new Error("Impossible de créer le compte, réessayez.");
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  return user ? toRecord(user) : null;
}

export async function getUserByReferralCode(code: string): Promise<UserRecord | null> {
  if (!code) return null;
  const user = await prisma.user.findUnique({ where: { referralCode: code.toUpperCase() } });
  return user ? toRecord(user) : null;
}

/** How many people signed up using this user's referral code. */
export async function getReferralCount(referralCode: string): Promise<number> {
  return prisma.user.count({ where: { referredBy: referralCode } });
}
