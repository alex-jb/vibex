import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const revalidate = 300; // 5-min ISR

export const metadata = {
  title: "🧠 Cracked Score Leaderboard — Who's the most cracked dev?",
  description: "Live leaderboard of GitHub devs scored 0-100 on the 12-axis Cracked Score. From karpathy and antirez at the top to the rising waves below.",
  openGraph: {
    title: "Cracked Score Leaderboard · VibeXForge",
    description: "12-axis dev profile leaderboard",
    type: "website",
  },
};

interface Row {
  github_handle: string;
  overall: number;
  tier: string;
  total_stars: number;
  followers: number;
  scored_at: string;
}

const TIER_EMOJI: Record<string, string> = {
  mythic: "👑",
  cracked: "⚡",
  solid: "💪",
  rising: "🌱",
  starting: "🥚",
};

async function fetchLeaderboard(): Promise<Row[]> {
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!SUPA_URL || !SUPA_ANON_KEY) return [];
  const supa = createClient(SUPA_URL, SUPA_ANON_KEY);
  const { data } = await supa
    .from("cracked_scores")
    .select("github_handle, overall, tier, total_stars, followers, scored_at")
    .order("overall", { ascending: false })
    .limit(50);
  return (data as Row[] | null) || [];
}

export default async function CrackedLeaderboardPage() {
  const rows = await fetchLeaderboard();

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-zinc-200">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 text-center">
          <div className="mb-2 text-5xl">🧠</div>
          <p className="text-xs uppercase tracking-widest text-orange-400">
            Cracked Score · Leaderboard
          </p>
          <h1 className="mt-2 text-4xl font-bold">
            Who&apos;s the most <span className="text-orange-400">cracked</span>?
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            Top 50 by Cracked Score. Live from GitHub. Click a row to see the
            12-axis breakdown.
          </p>
        </header>

        {rows.length === 0 ? (
          <p className="text-center text-sm text-zinc-500">
            No scores yet. Be the first to{" "}
            <Link href="/cracked" className="text-orange-400 hover:underline">
              score a handle
            </Link>
            .
          </p>
        ) : (
          <section className="rounded-2xl bg-zinc-900/60 p-2 ring-1 ring-zinc-800">
            <ol className="divide-y divide-zinc-800">
              {rows.map((r, i) => (
                <li key={r.github_handle}>
                  <Link
                    href={`/cracked/${r.github_handle}`}
                    className="flex items-center gap-4 rounded-xl p-4 hover:bg-orange-500/5"
                  >
                    <div className="w-8 shrink-0 text-right text-sm text-zinc-500">
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-base font-semibold text-zinc-100">
                        @{r.github_handle}
                      </p>
                      <p className="text-xs text-zinc-500">
                        ⭐ {r.total_stars.toLocaleString()} · 👥{" "}
                        {r.followers.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-400">
                        {r.overall}
                      </p>
                      <p className="text-xs uppercase tracking-wider text-zinc-500">
                        {TIER_EMOJI[r.tier] || ""} {r.tier}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/cracked"
            className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-black hover:bg-orange-400"
          >
            Score yourself → /cracked
          </Link>
          <Link
            href="/score/alex"
            className="flex-1 rounded-xl bg-zinc-900 px-4 py-3 text-center text-sm text-zinc-300 ring-1 ring-zinc-800 hover:bg-zinc-800"
          >
            Your Creator Score → /score
          </Link>
        </div>

        <footer className="mt-16 text-center text-xs text-zinc-600">
          Live from GitHub public data · 5-min ISR cache · Seed handles via
          daily cron
        </footer>
      </div>
    </main>
  );
}
