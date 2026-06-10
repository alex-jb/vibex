import Link from "next/link";
import { CouncilDiff, type CouncilDomain, type CouncilResult } from "@/lib/council";
import type { Metadata } from "next";

interface PageProps {
  searchParams: Promise<{ domain?: string; decision?: string; context?: string; oracle?: string }>;
}

export const runtime = "nodejs";
// Result depends on query, so no static caching. But each call ~$0.03 so
// don't auto-refresh either — let the user re-submit if they want a new run.
export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const decision = (sp.decision ?? "").slice(0, 100);
  return {
    title: `⚖️ Council verdict · VibeXForge`,
    description: decision || "5-voice AI council verdict",
    openGraph: { title: "Council Diff", description: decision || "5-voice AI council" },
  };
}

function validDomain(d: string | undefined): CouncilDomain {
  const valid: CouncilDomain[] = ["founder", "engineer", "investor", "career", "product", "quant"];
  if (d && valid.includes(d as CouncilDomain)) return d as CouncilDomain;
  return "founder";
}

const RECOMMENDATION_STYLE: Record<
  CouncilResult["recommendation"],
  { emoji: string; label: string; color: string }
> = {
  go: { emoji: "✅", label: "GO", color: "text-emerald-400" },
  wait: { emoji: "⏸", label: "WAIT", color: "text-amber-400" },
  kill: { emoji: "🛑", label: "KILL", color: "text-rose-400" },
  split: { emoji: "⚡", label: "SPLIT", color: "text-[var(--accent-indigo)]" },
};

export default async function CouncilResultPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const domain = validDomain(sp.domain);
  const decision = (sp.decision ?? "").trim();
  const context = (sp.context ?? "").trim();
  const useOracle = sp.oracle === "fable-5";

  if (!decision) {
    return (
      <main className="min-h-screen bg-[var(--bg-deep)] px-6 py-16 text-zinc-100">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold">No decision provided</h1>
          <Link
            href="/council"
            className="mt-8 inline-block rounded-[var(--r-card)] bg-[var(--accent-indigo)] px-6 py-3 font-semibold text-white"
          >
            ← Back to council
          </Link>
        </div>
      </main>
    );
  }

  let result: CouncilResult | null = null;
  let error: string | null = null;
  try {
    const council = new CouncilDiff();
    result = await council.deliberate({
      domain,
      decision,
      context: context || undefined,
      ...(useOracle ? { oracle: "fable-5" as const } : {}),
    });
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  if (!result || error) {
    return (
      <main className="min-h-screen bg-[var(--bg-deep)] px-6 py-16 text-zinc-100">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 text-6xl">🤔</div>
          <h1 className="text-3xl font-bold">Council could not convene</h1>
          <p className="mt-4 text-zinc-400">{error ?? "Something went wrong."}</p>
          <Link
            href="/council"
            className="mt-8 inline-block rounded-[var(--r-card)] bg-[var(--accent-indigo)] px-6 py-3 font-semibold text-white"
          >
            ← Try again
          </Link>
        </div>
      </main>
    );
  }

  const rec = RECOMMENDATION_STYLE[result.recommendation];

  return (
    <main className="min-h-screen bg-[var(--bg-deep)] px-6 py-16 text-zinc-100">
      <div className="mx-auto max-w-3xl">
        <Link href="/council" className="text-xs text-zinc-500 hover:text-[var(--accent-indigo)]">
          ← back to /council
        </Link>

        <header className="mt-6 border-b border-[var(--border-soft)] pb-8">
          <div className="text-xs uppercase tracking-widest text-[var(--accent-indigo)]">
            Council Diff · {domain}
          </div>
          <h1 className="mt-2 text-3xl font-bold">{decision}</h1>
          <div className="mt-6 flex items-center gap-6">
            <div className="text-5xl">{rec.emoji}</div>
            <div>
              <div className={`text-2xl font-bold ${rec.color}`}>{rec.label}</div>
              <div className="text-sm text-zinc-400">
                Agreement: <span className="tabular-nums">{(result.agreement_score * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-10">
          <h2 className="mb-4 text-xs uppercase tracking-widest text-zinc-500">Consensus</h2>
          <p className="rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-6 text-zinc-200 leading-relaxed">
            {result.consensus}
          </p>
        </section>

        {result.oracle && (
          <section className="mt-10">
            <h2 className="mb-4 flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500">
              <span>🔮 Oracle adjudication</span>
              <span className="text-[10px] text-[var(--accent-indigo)] normal-case">
                {result.oracle.model}
              </span>
            </h2>
            <div className="rounded-[var(--r-card)] border border-[var(--accent-indigo)] bg-[var(--bg-elev)] p-6">
              <div className="flex items-center justify-between">
                <div className={`text-2xl font-bold ${RECOMMENDATION_STYLE[result.oracle.recommendation].color}`}>
                  {RECOMMENDATION_STYLE[result.oracle.recommendation].emoji} {RECOMMENDATION_STYLE[result.oracle.recommendation].label}
                </div>
                <div className="text-xl font-bold tabular-nums text-[var(--accent-indigo)]">
                  {result.oracle.score}/100
                </div>
              </div>
              <p className="mt-4 text-zinc-200 leading-relaxed">{result.oracle.verdict}</p>
              {result.oracle.override_reason && (
                <div className="mt-4 rounded border border-amber-500/40 bg-amber-500/5 p-3">
                  <div className="text-xs uppercase tracking-widest text-amber-400">
                    ⚠ Override
                  </div>
                  <p className="mt-1 text-sm text-amber-100/80">
                    {result.oracle.override_reason}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="mt-10">
          <h2 className="mb-4 text-xs uppercase tracking-widest text-zinc-500">5-voice verdict</h2>
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
                <p className="mt-3 text-sm text-zinc-300 leading-relaxed">{v.verdict}</p>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-zinc-500">+ Strength: </span>
                    <span className="text-emerald-400">{v.strength}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">- Gap: </span>
                    <span className="text-amber-400">{v.gap}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-12 border-t border-[var(--border-soft)] pt-6 text-xs text-zinc-500">
          <p>
            Computed at {new Date(result.computed_at).toLocaleString()} ·{" "}
            <a
              href="https://github.com/alex-jb/council-diff"
              className="text-[var(--accent-indigo)] hover:underline"
            >
              council-diff OSS →
            </a>
          </p>
          <p className="mt-2">
            Brier-audited at resolution. Track recommendation accuracy over time at the public leaderboard
            (coming soon).
          </p>
        </footer>
      </div>
    </main>
  );
}
