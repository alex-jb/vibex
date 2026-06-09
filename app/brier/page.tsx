import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "⚖️ Brier-audited routes · VibeXForge",
  description:
    "All Brier-audited research, councils, and predictions in one place. Every claim gets scored honestly at resolution.",
  openGraph: {
    title: "Brier-audited · VibeXForge",
    description: "Decisions and predictions that get graded on whether they were right.",
  },
};

interface Route {
  href: string;
  emoji: string;
  title: string;
  subtitle: string;
  thesis: string;
  source: string;
}

const ROUTES: Route[] = [
  {
    href: "/predictions",
    emoji: "📈",
    title: "Predictions feed",
    subtitle: "Daily AI-quant picks · 30-min ISR",
    thesis:
      "NBA Finals, 2026 World Cup, 8 SpaceX pure-play tickers, Polymarket events. Every pick timestamped. Brier-audited at settlement.",
    source: "predictions-feed",
  },
  {
    href: "/memory-wall",
    emoji: "🧱",
    title: "Memory Wall basket",
    subtitle: "Druckenmiller AI inference · daily 14:00 ET",
    thesis:
      "AVGO/INTC/ARM/MU/STX/WDC — Druckenmiller's Q1 2026 thesis that AI bottleneck shifts from GPU to memory/IO/networking.",
    source: "memory-wall-tracker",
  },
  {
    href: "/council",
    emoji: "⚖️",
    title: "Council Diff",
    subtitle: "5-voice AI council · any decision",
    thesis:
      "Founder / engineer / investor / career / product / quant councils. Single Sonnet 4.6 call, agreement_score + go/wait/kill/split.",
    source: "council-diff",
  },
  {
    href: "/quant-bench",
    emoji: "📊",
    title: "Quant Bench",
    subtitle: "Jane Street readiness · GitHub profile",
    thesis:
      "5 quant personas (Jane Street MD / Citadel / Two Sigma / Anthropic / HFT) score any GitHub handle 0-100. Brier-audited at 6mo.",
    source: "vibex/quant-bench",
  },
];

export default function BrierIndex() {
  return (
    <main className="min-h-screen bg-[var(--bg-deep)] px-6 py-16 text-zinc-100">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <div className="mb-3 text-6xl">⚖️</div>
          <p className="text-xs uppercase tracking-widest text-[var(--accent-indigo)]">
            Brier-audited · VibeXForge
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight">
            Predictions that get <span className="text-[var(--accent-indigo)]">graded honestly</span>
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            Every claim here is timestamped. At resolution it gets scored against actual outcome.
            Brier score collapses confidence into one number you can hold us accountable to.
          </p>
        </div>

        <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROUTES.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-6 hover:border-[var(--accent-indigo)] transition-colors"
            >
              <div className="flex items-baseline justify-between">
                <div className="text-3xl">{r.emoji}</div>
                <div className="text-xs text-zinc-500 font-mono">{r.href}</div>
              </div>
              <h2 className="mt-4 text-xl font-bold text-zinc-100">{r.title}</h2>
              <p className="mt-1 text-xs uppercase tracking-widest text-zinc-500">
                {r.subtitle}
              </p>
              <p className="mt-3 text-sm text-zinc-300 leading-relaxed">{r.thesis}</p>
              <p className="mt-4 text-xs text-zinc-500">source: {r.source}</p>
            </Link>
          ))}
        </section>

        <section className="mt-12 rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-6">
          <h2 className="text-xs uppercase tracking-widest text-zinc-500">
            Brier score primer
          </h2>
          <p className="mt-4 text-sm text-zinc-300 leading-relaxed">
            <code className="text-[var(--accent-indigo)]">Brier = (predicted_probability − actual_outcome)²</code>
          </p>
          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
            0 = perfect, 1 = max wrong, 0.25 = random guess. If our mean Brier across many
            resolved predictions is below 0.25, we have calibration edge. Above 0.25, we&apos;re
            worse than a coin flip and you should ignore us.
          </p>
          <p className="mt-4 text-xs text-zinc-500">
            Math + persistence-agnostic library:{" "}
            <a
              href="https://github.com/alex-jb/council-diff/blob/main/src/brier.ts"
              className="text-[var(--accent-indigo)] hover:underline"
            >
              council-diff/src/brier.ts
            </a>
            {" · "}
            Python port:{" "}
            <a
              href="https://github.com/alex-jb/council-diff-py"
              className="text-[var(--accent-indigo)] hover:underline"
            >
              council-diff-py
            </a>
          </p>
        </section>

        <footer className="mt-16 text-center text-xs text-zinc-500">
          Not financial advice. Public research with public Brier audit. Built by{" "}
          <a
            href="https://github.com/alex-jb"
            className="text-[var(--accent-indigo)] hover:underline"
          >
            @alex-jb
          </a>
          .
        </footer>
      </div>
    </main>
  );
}
