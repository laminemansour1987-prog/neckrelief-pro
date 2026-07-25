import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public, non-sensitive: just the total number of accounts, for social proof.
export async function GET() {
  try {
    const users = await prisma.user.count();
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ users: 0 });
  }
}
