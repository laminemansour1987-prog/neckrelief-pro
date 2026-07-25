import { prisma } from "@/lib/db";

export interface DayCount {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface TopReferrer {
  email: string;
  count: number;
}

export interface AdminStats {
  totalUsers: number;
  usersLast7Days: number;
  referredUsers: number;
  activeSubscribers: number;
  planBreakdown: { plan: string; count: number }[];
  signupsByDay: DayCount[]; // last 14 days
  topReferrers: TopReferrer[];
}

/** Returns true only when ADMIN_EMAIL is set and matches (case-insensitive). */
export function isAdmin(email: string | null | undefined): boolean {
  const admin = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!admin || !email) return false;
  return email.toLowerCase() === admin;
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getAdminStats(): Promise<AdminStats> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const [totalUsers, usersLast7Days, referredUsers, activeSubscribers, subs, recentUsers, referralGroups] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.user.count({ where: { referredBy: { not: null } } }),
      prisma.subscriber.count({ where: { status: "active" } }),
      prisma.subscriber.groupBy({
        by: ["plan"],
        where: { status: "active" },
        _count: { plan: true },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: fourteenDaysAgo } },
        select: { createdAt: true },
      }),
      prisma.user.groupBy({
        by: ["referredBy"],
        where: { referredBy: { not: null } },
        _count: { referredBy: true },
        orderBy: { _count: { referredBy: "desc" } },
        take: 5,
      }),
    ]);

  const planBreakdown = subs.map((s) => ({ plan: s.plan, count: s._count.plan }));

  // Bucket the last 14 days, filling gaps with zeros.
  const buckets = new Map<string, number>();
  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    buckets.set(dayKey(d), 0);
  }
  for (const u of recentUsers) {
    const key = dayKey(new Date(u.createdAt));
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  const signupsByDay: DayCount[] = Array.from(buckets, ([date, count]) => ({ date, count }));

  // Resolve referrer codes to emails for the leaderboard.
  const codes = referralGroups.map((g) => g.referredBy).filter((c): c is string => Boolean(c));
  const referrers = codes.length
    ? await prisma.user.findMany({
        where: { referralCode: { in: codes } },
        select: { email: true, referralCode: true },
      })
    : [];
  const emailByCode = new Map(referrers.map((r) => [r.referralCode, r.email]));
  const topReferrers: TopReferrer[] = referralGroups.map((g) => ({
    email: (g.referredBy && emailByCode.get(g.referredBy)) || "—",
    count: g._count.referredBy,
  }));

  return {
    totalUsers,
    usersLast7Days,
    referredUsers,
    activeSubscribers,
    planBreakdown,
    signupsByDay,
    topReferrers,
  };
}
