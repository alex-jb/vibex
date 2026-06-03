/**
 * /admin/score-leaderboard — Creator Score top-N + tier distribution.
 *
 * Built for the 2026-06-02 Creator Lifecycle Suite launch. Shows:
 *   - Top 30 handles by score
 *   - Tier distribution (how many Bronze/Silver/Gold/Platinum/Diamond)
 *   - Surface mix (where the score is coming from across 6 surfaces)
 *   - Activity in last 7d
 *
 * Auth: hard-gated by ADMIN_EMAILS env var (matches /admin/metrics
 * pattern). Non-admins get 404, not 403.
 *
 * Why this matters: lets Alex see whether the Silver tier (≥150)
 * unlock is actually happening or staying theoretical. Also surfaces
 * who to manually reach out to ("you're 30 pts from Gold — here's
 * what unlocks").
 */
import { notFound } from "next/navigation";
import { createServerSupabase, getAuthUser } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";
import { tierFromScore, TIER_LADDER } from "@/lib/score";
import Link from "next/link";

export const runtime = "nodejs";
export const revalidate = 60;
export const metadata = {
  title: "Admin · Score Leaderboard",
  robots: { index: false, follow: false },
};

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "alex@vibexforge.com")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

type ScoreRow = {
  handle: string;
  score: number;
  tier: string;
  validations_count: number;
  launchkits_count: number;
  funerals_count: number;
  idea_funerals_count: number;
  revivals_triggered_count: number;
  vibex_submits_count: number;
  last_active_at: string;
  created_at: string;
};

export default async function ScoreLeaderboardPage() {
  // Auth gate
  const auth = await getAuthUser();
  const email = auth?.email?.toLowerCase() || "";
  if (!ADMIN_EMAILS.includes(email)) {
    notFound();
  }

  // Service-role client if available (for full read across RLS-protected rows)
  const supa =
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
        )
      : await createServerSupabase();

  const week = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: topRows },
    { count: totalScored },
    { count: activeThisWeek },
    { data: tierRows },
  ] = await Promise.all([
    supa
      .from("creator_scores")
      .select(
        "handle, score, tier, validations_count, launchkits_count, funerals_count, idea_funerals_count, revivals_triggered_count, vibex_submits_count, last_active_at, created_at",
      )
      .order("score", { ascending: false })
      .limit(30),
    supa
      .from("creator_scores")
      .select("handle", { count: "exact", head: true }),
    supa
      .from("creator_scores")
      .select("handle", { count: "exact", head: true })
      .gte("last_active_at", week),
    supa.from("creator_scores").select("tier, score"),
  ]);

  const top = (topRows as ScoreRow[] | null) || [];

  // Tier distribution counter
  const tierBuckets = new Map<string, number>();
  for (const r of tierRows || []) {
    const t = (r as { tier?: string }).tier || "unranked";
    tierBuckets.set(t, (tierBuckets.get(t) || 0) + 1);
  }

  // Surface mix across top 30
  const surfaceMix = top.reduce(
    (acc, r) => ({
      validations: acc.validations + (r.validations_count || 0),
      launchkits: acc.launchkits + (r.launchkits_count || 0),
      funerals: acc.funerals + (r.funerals_count || 0),
      ideaFunerals: acc.ideaFunerals + (r.idea_funerals_count || 0),
      revivals: acc.revivals + (r.revivals_triggered_count || 0),
      ships: acc.ships + (r.vibex_submits_count || 0),
    }),
    {
      validations: 0,
      launchkits: 0,
      funerals: 0,
      ideaFunerals: 0,
      revivals: 0,
      ships: 0,
    },
  );
  const surfaceTotal =
    surfaceMix.validations +
    surfaceMix.launchkits +
    surfaceMix.funerals +
    surfaceMix.ideaFunerals +
    surfaceMix.revivals +
    surfaceMix.ships;

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-zinc-200">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-orange-400">
            Admin · Score Leaderboard
          </p>
          <h1 className="mt-2 text-3xl font-bold">Creator Score state</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {totalScored ?? 0} scored handles · {activeThisWeek ?? 0} active in
            the last 7 days
          </p>
        </header>

        {/* Tier distribution */}
        <section className="mb-10 rounded-2xl bg-zinc-900/60 p-6 ring-1 ring-zinc-800">
          <h2 className="mb-4 text-lg font-semibold">Tier distribution</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
            {TIER_LADDER.map((t) => {
              const n = tierBuckets.get(t.name) || 0;
              return (
                <div
                  key={t.name}
                  className="rounded-xl bg-black/40 p-3 text-center ring-1 ring-zinc-800"
                >
                  <p className="text-2xl">{t.emoji}</p>
                  <p className="mt-1 text-2xl font-bold">{n}</p>
                  <p className="text-xs text-zinc-400">{t.label}</p>
                  <p className="mt-1 text-[10px] text-zinc-500">
                    ≥ {t.threshold}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Surface mix */}
        <section className="mb-10 rounded-2xl bg-zinc-900/60 p-6 ring-1 ring-zinc-800">
          <h2 className="mb-4 text-lg font-semibold">
            Surface mix (top 30 handles, total events)
          </h2>
          {surfaceTotal === 0 ? (
            <p className="text-sm text-zinc-500">
              No surface events yet. Once users start submitting via Validator /
              Funeral / LaunchKit, this fills.
            </p>
          ) : (
            <div className="space-y-2 text-sm">
              {[
                { label: "📝 Validations", val: surfaceMix.validations },
                { label: "🚀 LaunchKits", val: surfaceMix.launchkits },
                { label: "🪦 Repo funerals", val: surfaceMix.funerals },
                { label: "💭 Idea funerals", val: surfaceMix.ideaFunerals },
                { label: "🔄 Revivals", val: surfaceMix.revivals },
                { label: "⚡ VibeX ships", val: surfaceMix.ships },
              ].map((row) => {
                const pct = surfaceTotal ? (row.val / surfaceTotal) * 100 : 0;
                return (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="w-40 text-zinc-400">{row.label}</span>
                    <div className="flex-1 rounded-full bg-zinc-800">
                      <div
                        className="rounded-full bg-orange-500 py-1 text-center text-[10px] text-black"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      >
                        {row.val}
                      </div>
                    </div>
                    <span className="w-12 text-right text-xs text-zinc-500">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Top 30 leaderboard */}
        <section className="rounded-2xl bg-zinc-900/60 p-6 ring-1 ring-zinc-800">
          <h2 className="mb-4 text-lg font-semibold">Top 30 handles</h2>
          {top.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No scored handles yet. Score bumps fire when users submit on
              Validator / Funeral / LaunchKit with a handle.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
                    <th className="px-2 py-2 text-left">#</th>
                    <th className="px-2 py-2 text-left">Handle</th>
                    <th className="px-2 py-2 text-right">Score</th>
                    <th className="px-2 py-2 text-left">Tier</th>
                    <th className="px-2 py-2 text-right">📝</th>
                    <th className="px-2 py-2 text-right">🚀</th>
                    <th className="px-2 py-2 text-right">🪦</th>
                    <th className="px-2 py-2 text-right">💭</th>
                    <th className="px-2 py-2 text-right">🔄</th>
                    <th className="px-2 py-2 text-right">⚡</th>
                    <th className="px-2 py-2 text-left">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {top.map((row, i) => {
                    const tier = tierFromScore(row.score);
                    const lastActive = new Date(row.last_active_at);
                    const daysAgo = Math.floor(
                      (Date.now() - lastActive.getTime()) /
                        (1000 * 60 * 60 * 24),
                    );
                    return (
                      <tr
                        key={row.handle}
                        className="border-b border-zinc-800/60 hover:bg-black/20"
                      >
                        <td className="px-2 py-2 text-zinc-500">{i + 1}</td>
                        <td className="px-2 py-2">
                          <Link
                            href={`/score/${row.handle}`}
                            className="font-medium text-orange-400 hover:underline"
                          >
                            @{row.handle}
                          </Link>
                        </td>
                        <td className="px-2 py-2 text-right font-bold">
                          {row.score}
                        </td>
                        <td className="px-2 py-2">
                          {tier.emoji} {tier.label}
                        </td>
                        <td className="px-2 py-2 text-right text-zinc-400">
                          {row.validations_count}
                        </td>
                        <td className="px-2 py-2 text-right text-zinc-400">
                          {row.launchkits_count}
                        </td>
                        <td className="px-2 py-2 text-right text-zinc-400">
                          {row.funerals_count}
                        </td>
                        <td className="px-2 py-2 text-right text-zinc-400">
                          {row.idea_funerals_count}
                        </td>
                        <td className="px-2 py-2 text-right text-zinc-400">
                          {row.revivals_triggered_count}
                        </td>
                        <td className="px-2 py-2 text-right text-zinc-400">
                          {row.vibex_submits_count}
                        </td>
                        <td className="px-2 py-2 text-xs text-zinc-500">
                          {daysAgo === 0
                            ? "today"
                            : daysAgo === 1
                              ? "yesterday"
                              : `${daysAgo}d ago`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="mt-10 text-center text-xs text-zinc-600">
          Auto-refreshes every 60s. Admin gate via ADMIN_EMAILS env var.
        </footer>
      </div>
    </main>
  );
}
