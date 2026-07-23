import { prisma } from "@/lib/db";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getUsageToday(identity: string): Promise<number> {
  const row = await prisma.usageCounter.findUnique({
    where: { identity_date: { identity, date: todayKey() } },
  });
  return row?.count ?? 0;
}

/** Atomically increments and returns the new count for today. */
export async function incrementUsage(identity: string): Promise<number> {
  const date = todayKey();
  const row = await prisma.usageCounter.upsert({
    where: { identity_date: { identity, date } },
    create: { identity, date, count: 1 },
    update: { count: { increment: 1 } },
  });
  return row.count;
}
