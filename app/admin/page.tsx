import { redirect } from "next/navigation";
import { getSessionEmail } from "@/lib/auth";
import { getAdminStats, isAdmin } from "@/lib/stats";

export const metadata = { title: "Admin — statistiques" };
export const dynamic = "force-dynamic";

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default async function AdminPage() {
  const email = await getSessionEmail();
  if (!email) redirect("/login?next=/admin");
  if (!isAdmin(email)) {
    // Not an admin — don't reveal the page exists.
    redirect("/");
  }

  const stats = await getAdminStats();
  const maxDay = Math.max(1, ...stats.signupsByDay.map((d) => d.count));
  const maxRef = Math.max(1, ...stats.topReferrers.map((r) => r.count));

  const kpis = [
    { label: "Inscrits au total", value: stats.totalUsers },
    { label: "7 derniers jours", value: stats.usersLast7Days },
    { label: "Venus par parrainage", value: stats.referredUsers },
    { label: "Abonnés actifs", value: stats.activeSubscribers },
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-3xl font-medium text-white">Tableau de bord</h1>
        <span className="text-xs text-white/40">{email}</span>
      </div>

      {/* KPI tiles */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <p className="font-display text-4xl font-medium tabular-nums text-white">{kpi.value}</p>
            <p className="mt-1 text-sm text-white/45">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Signups chart */}
      <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
        <p className="text-sm font-medium text-white/80">Inscriptions — 14 derniers jours</p>
        <div className="mt-6 flex h-40 items-end gap-2">
          {stats.signupsByDay.map((d) => (
            <div key={d.date} className="group flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t bg-gradient-to-t from-aura-600 to-aura-400 transition-all"
                  style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count > 0 ? "4px" : "0" }}
                  title={`${d.count} inscription${d.count > 1 ? "s" : ""}`}
                />
              </div>
              <span className="text-[10px] text-white/30">{formatDay(d.date).replace(". ", " ")}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Plan breakdown */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
          <p className="text-sm font-medium text-white/80">Abonnements actifs</p>
          {stats.planBreakdown.length === 0 ? (
            <p className="mt-4 text-sm text-white/40">Aucun abonnement payant pour l&apos;instant.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {stats.planBreakdown.map((p) => (
                <li key={p.plan} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-white/70">{p.plan}</span>
                  <span className="font-semibold tabular-nums text-white">{p.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Referral leaderboard */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
          <p className="text-sm font-medium text-white/80">Top parrains</p>
          {stats.topReferrers.length === 0 ? (
            <p className="mt-4 text-sm text-white/40">Aucun parrainage pour l&apos;instant.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {stats.topReferrers.map((r) => (
                <li key={r.email}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate pr-3 text-white/70">{r.email}</span>
                    <span className="font-semibold tabular-nums text-white">{r.count}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-aura-400 to-bloom-pink"
                      style={{ width: `${(r.count / maxRef) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
