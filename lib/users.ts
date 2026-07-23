import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export interface UserRecord {
  email: string;
  passwordHash: string;
  createdAt: string;
}

function toRecord(user: { email: string; passwordHash: string; createdAt: Date }): UserRecord {
  return { email: user.email, passwordHash: user.passwordHash, createdAt: user.createdAt.toISOString() };
}

export async function createUser(email: string, passwordHash: string): Promise<UserRecord> {
  try {
    const user = await prisma.user.create({
      data: { email: email.toLowerCase(), passwordHash },
    });
    return toRecord(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("Un compte existe déjà avec cet email.");
    }
    throw error;
  }
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  return user ? toRecord(user) : null;
}
