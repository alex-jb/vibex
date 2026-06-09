import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const revalidate = 3600;

export const metadata = {
  title: "📊 Quant Bench Leaderboard · VibeXForge",
  description:
    "Top Jane-Street-ready GitHub profiles. 5-voice quant council verdict, Brier-audited at 6mo.",
  openGraph: {
    title: "Quant Bench Leaderboard",
    description: "Top Jane Street ready candidates · Brier-audited",
    type: "website",
  },
};

interface Row {
  handle: string;
  overall: number;
  tier: string;
  total_stars: number;
  followers: number;
  computed_at: string;
}

const TIER_EMOJI: Record<string, string> = {
  jane_street_ready: "🎯",
  tier1_quant_ready: "📈",
  ml_researcher_ready: "🧠",
  junior_quant_ready: "📊",
  needs_more_work: "🌱",
};

async function fetchLeaderboard(): Promise<Row[]> {
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!SUPA_URL || !SUPA_ANON_KEY) return [];
  const supa = createClient(SUPA_URL, SUPA_ANON_KEY);
  const { data } = await supa
    .from("quant_bench_scores")
    .select("handle, overall, tier, total_stars, followers, computed_at")
    .order("overall", { ascending: false })
    .limit(50);
  return (data as Row[] | null) || [];
}

export default async function QuantBenchLeaderboard() {
  const rows = await fetchLeaderboard();

  return (
    <main className="min-h-screen bg-[var(--bg-deep)] px-6 py-12 text-zinc-200">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 text-center">
          <div className="mb-2 text-5xl">📊</div>
          <p className="text-xs uppercase tracking-widest text-[var(--accent-indigo)]">
            Quant Bench · Brier-audited
          </p>
          <h1 className="mt-2 text-4xl font-bold">Top Jane Street ready</h1>
          <p className="mt-3 text-sm text-zinc-400">
            Top 50 by 5-voice quant council score. Public Brier audit at 6mo.
          </p>
        </header>

        {rows.length === 0 ? (
          <div className="rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-10 text-center">
            <p className="text-sm text-zinc-400">
              No scores yet. Be the first to{" "}
              <Link href="/quant-bench" className="text-[var(--accent-indigo)] hover:underline">
                score a handle
              </Link>
              .
            </p>
            <p className="mt-3 text-xs text-zinc-500">
              The `quant_bench_scores` table (migration 076) needs to be applied + the score
              endpoint must persist results. See `lib/quant-bench.ts` for the write hook spec.
            </p>
          </div>
        ) : (
          <section className="rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-2">
            <ol className="divide-y divide-[var(--border-soft)]">
              {rows.map((r, i) => (
                <li key={r.handle}>
                  <Link
                    href={`/quant-bench/${r.handle}`}
                    className="flex items-center gap-4 rounded-[var(--r-card)] p-4 hover:bg-[var(--accent-indigo)]/5"
                  >
                    <div
                      className={`w-8 shrink-0 text-right text-sm ${
                        i === 0
                          ? "font-bold text-[var(--accent-indigo)]"
                          : i < 3
                          ? "text-zinc-200"
                          : "text-zinc-500"
                      }`}
                    >
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-base font-semibold text-zinc-100">
                        @{r.handle}
                      </p>
                      <p className="text-xs text-zinc-500">
                        ⭐ {r.total_stars?.toLocaleString() ?? "—"} · 👥{" "}
                        {r.followers?.toLocaleString() ?? "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[var(--accent-indigo)]">
                        {r.overall}
                      </p>
                      <p className="text-xs uppercase tracking-wider text-zinc-500">
                        {TIER_EMOJI[r.tier] || ""} {r.tier?.replace(/_/g, " ")}
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
            href="/quant-bench"
            className="flex-1 rounded-[var(--r-card)] bg-[var(--accent-indigo)] px-4 py-3 text-center text-sm font-semibold text-white hover:opacity-90"
          >
            Score yourself → /quant-bench
          </Link>
          <Link
            href="/brier"
            className="flex-1 rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] px-4 py-3 text-center text-sm text-zinc-300 hover:border-[var(--border-strong)]"
          >
            All Brier-audited routes →
          </Link>
        </div>

        <footer className="mt-12 text-center text-xs text-zinc-500">
          5-voice council: Jane Street MD / Citadel / Two Sigma / Anthropic / HFT
          · Brier-audited at 6mo · See{" "}
          <a
            href="https://github.com/alex-jb/council-diff"
            className="text-[var(--accent-indigo)] hover:underline"
          >
            council-diff
          </a>{" "}
          for the engine.
        </footer>
      </div>
    </main>
  );
}
