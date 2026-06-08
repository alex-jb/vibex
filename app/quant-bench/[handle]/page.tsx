import { notFound } from "next/navigation";
import Link from "next/link";
import { scoreHandle, tierFor, type QuantBenchResult } from "@/lib/quant-bench";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ handle: string }>;
}

export const runtime = "nodejs";
// 1-hour ISR per handle. Cached so repeat visits don't burn $0.03 each.
export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  return {
    title: `📊 ${handle} Quant Bench · VibeXForge`,
    description: `How Jane Street ready is @${handle}? 0-100 score from 5-voice quant council. Brier-audited.`,
    openGraph: {
      title: `${handle} — Quant Bench`,
      description: `5-voice quant council verdict on this GitHub profile.`,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${handle} — Quant Bench`,
      description: `5-voice quant council. Brier-audited at 6mo.`,
    },
  };
}

export default async function QuantBenchHandlePage({ params }: PageProps) {
  const { handle } = await params;
  if (!handle || handle.length > 40) notFound();

  let result: QuantBenchResult | null = null;
  let errorMsg: string | null = null;
  try {
    result = await scoreHandle(handle);
    if (!result)
      errorMsg = "Could not score this handle. Check it exists on GitHub or try again later.";
  } catch (e) {
    errorMsg = e instanceof Error ? e.message : "Unknown error during scoring.";
  }

  if (!result || errorMsg) {
    return (
      <main className="min-h-screen bg-[var(--bg-deep)] px-6 py-16 text-zinc-100">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 text-6xl">🤔</div>
          <h1 className="text-3xl font-bold">Could not score @{handle}</h1>
          <p className="mt-4 text-zinc-400">{errorMsg ?? "Something went wrong."}</p>
          <Link
            href="/quant-bench"
            className="mt-8 inline-block rounded-[var(--r-card)] bg-[var(--accent-indigo)] px-6 py-3 font-semibold text-white hover:opacity-90"
          >
            ← Try another handle
          </Link>
        </div>
      </main>
    );
  }

  const tier = result.tier ?? tierFor(result.overall);

  return (
    <main className="min-h-screen bg-[var(--bg-deep)] px-6 py-16 text-zinc-100">
      <div className="mx-auto max-w-3xl">
        <Link href="/quant-bench" className="text-xs text-zinc-500 hover:text-[var(--accent-indigo)]">
          ← back to /quant-bench
        </Link>

        <header className="mt-6 flex items-center justify-between border-b border-[var(--border-soft)] pb-8">
          <div>
            <div className="text-xs uppercase tracking-widest text-[var(--accent-indigo)]">
              Quant Bench · Brier-audited
            </div>
            <h1 className="mt-2 text-4xl font-bold">@{handle}</h1>
            <p className="mt-2 text-sm text-zinc-400">
              {result.followers.toLocaleString()} followers · {result.totalRepos} repos ·{" "}
              {result.totalStars.toLocaleString()} stars
            </p>
          </div>
          <div className="text-right">
            <div className="text-6xl font-bold tabular-nums">{result.overall}</div>
            <div className="mt-1 text-xs uppercase tracking-widest text-zinc-400">/ 100</div>
            <div className="mt-3 text-lg">
              <span className="mr-2 text-2xl">{tier.emoji}</span>
              <span className="text-zinc-300">{tier.name.replace(/_/g, " ")}</span>
            </div>
          </div>
        </header>

        <section className="mt-10">
          <h2 className="mb-4 text-xs uppercase tracking-widest text-zinc-500">
            Council consensus
          </h2>
          <p className="rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-6 text-zinc-200 leading-relaxed">
            {result.summary}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-xs uppercase tracking-widest text-zinc-500">
            5-voice verdict
          </h2>
          <div className="space-y-4">
            {result.voices.map((v) => (
              <div
                key={v.voice}
                className="rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-zinc-200">{v.voice_display}</div>
                  <div className="text-2xl font-bold tabular-nums text-[var(--accent-indigo)]">
                    {v.score}
                  </div>
                </div>
                <p className="mt-3 text-sm text-zinc-300">{v.verdict}</p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-zinc-500">Strength: </span>
                    <span className="text-emerald-400">{v.strength}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Gap: </span>
                    <span className="text-amber-400">{v.gap}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-12 border-t border-[var(--border-soft)] pt-6 text-xs text-zinc-500">
          <p>
            Computed at {new Date(result.computedAt).toLocaleString()} ·{" "}
            <Link href="/quant-bench/leaderboard" className="text-[var(--accent-indigo)] hover:underline">
              Public leaderboard →
            </Link>
          </p>
          <p className="mt-2">
            Brier-audited at 6mo — scores ground-truthed against whether the candidate landed a quant offer.
            Methodology: 5 specialist Claude personas evaluate GitHub public data via Orallexa LangGraph council pattern.
          </p>
        </footer>
      </div>
    </main>
  );
}
