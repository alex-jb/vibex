import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Launches · 4 OSS repos in 48 hours · VibeXForge",
  description:
    "What I shipped 2026-06-08 to 2026-06-09: 4 open-source AI tools + 8 cover letters + 30-guru research base. The 48hr launch narrative.",
  openGraph: {
    title: "4 OSS repos in 48 hours",
    description: "Real-time velocity log. Built solo. All Brier-audited.",
  },
};

interface Launch {
  date: string;
  emoji: string;
  title: string;
  repo: string;
  href_repo: string;
  href_live?: string;
  one_liner: string;
  shipped: string[];
}

const LAUNCHES: Launch[] = [
  {
    date: "2026-06-08",
    emoji: "⚖️",
    title: "council-diff",
    repo: "alex-jb/council-diff",
    href_repo: "https://github.com/alex-jb/council-diff",
    href_live: "https://www.vibexforge.com/council",
    one_liner: "5-voice AI council for any decision · Brier-audited",
    shipped: [
      "TypeScript engine: ~200 LOC, single Claude Sonnet 4.6 call produces 5 specialist verdicts",
      "Brier audit module v0.2 (next day): math + persistence-agnostic interface",
      "13 platform launch drafts in launch/ folder",
      "npm release.yml workflow ready (await NPM_TOKEN secret)",
      "6 built-in domains + custom",
      "Bilingual README EN + 中文",
    ],
  },
  {
    date: "2026-06-08",
    emoji: "📊",
    title: "Quant Bench (vibex route)",
    repo: "vibex/app/quant-bench",
    href_repo: "https://github.com/alex-jb/vibex",
    href_live: "https://www.vibexforge.com/quant-bench",
    one_liner: "How Jane Street ready is your GitHub? · 5-voice council scoring",
    shipped: [
      "/quant-bench landing + /[handle] dynamic route",
      "lib/quant-bench.ts: scoreHandle() with 5 quant personas (Jane Street MD / Citadel / Two Sigma / Anthropic / HFT)",
      "Supabase persistence + leaderboard at /quant-bench/leaderboard",
      "Migration 076 for quant_bench_scores table",
    ],
  },
  {
    date: "2026-06-09",
    emoji: "🧱",
    title: "memory-wall-tracker",
    repo: "alex-jb/memory-wall-tracker",
    href_repo: "https://github.com/alex-jb/memory-wall-tracker",
    href_live: "https://www.vibexforge.com/memory-wall",
    one_liner: "Brier-audited daily research on Druckenmiller's Q1 AI inference memory basket",
    shipped: [
      "6-ticker basket (AVGO/INTC/ARM/MU/STX/WDC) with thesis per ticker",
      "scripts/daily_brief.py — yfinance + Claude Sonnet 4.6 + auto-commit",
      "launchd cron at 14:00 ET daily",
      "GitHub Pages via _config.yml + index.md",
      "3 awesome-list submission PRs drafted",
      "Bilingual README EN + 中文",
    ],
  },
  {
    date: "2026-06-09",
    emoji: "🐍",
    title: "council-diff-py",
    repo: "alex-jb/council-diff-py",
    href_repo: "https://github.com/alex-jb/council-diff-py",
    one_liner: "Python port of council-diff · pip install council-diff",
    shipped: [
      "council_diff/__init__.py — CouncilDiff class with 6 domains",
      "council_diff/brier.py — Brier audit math + dataclasses",
      "15 pytest tests covering all Brier behaviors (all pass)",
      "examples/founder.py with Brier logging",
      "PyPI release workflow + pytest matrix (3.10/3.11/3.12)",
      "Bilingual README EN + 中文",
    ],
  },
  {
    date: "2026-06-09",
    emoji: "🎓",
    title: "Walk-forward gate (Orallexa)",
    repo: "alex-jb/orallexa-ai-trading-agent",
    href_repo: "https://github.com/alex-jb/orallexa-ai-trading-agent",
    one_liner: "Sliding-window OOS Sharpe gate · caught my own false-positive backtest",
    shipped: [
      "markets/auto/walkforward.py — 4 sliding (train, test) windows over decision_log",
      "Gate: mean OOS Sharpe > 0.5, worst > 0, worst DD < 25%",
      "Ran on production 2026-06-09: FAIL (mean OOS Sharpe -3.08)",
      "ADX regime gate fix in skills/prediction.py (trending/ranging/uncertain)",
      "RSI ≥ 70 bug fix (was +3, now -10)",
      "Anti-extension gate (RSI > 60 + BB% > 0.7 → cap score)",
    ],
  },
];

export default function LaunchesPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-deep)] px-6 py-16 text-zinc-100">
      <div className="mx-auto max-w-3xl">
        <header className="text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--accent-indigo)]">
            48hr launch log
          </p>
          <h1 className="mt-3 text-5xl font-bold leading-tight">
            4 OSS repos. <span className="text-[var(--accent-indigo)]">48 hours.</span>
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            Real-time velocity log from 2026-06-08 to 2026-06-09. Solo founder, Claude Code, no team.
            Every claim Brier-audited.
          </p>
        </header>

        <section className="mt-12 space-y-6">
          {LAUNCHES.map((l) => (
            <article
              key={`${l.date}-${l.title}`}
              className="rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{l.emoji}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-100">{l.title}</h2>
                    <p className="text-xs text-zinc-500 font-mono">{l.repo}</p>
                  </div>
                </div>
                <div className="text-xs text-zinc-500">{l.date}</div>
              </div>

              <p className="mt-4 text-zinc-300">{l.one_liner}</p>

              <ul className="mt-4 space-y-1.5 text-sm text-zinc-400">
                {l.shipped.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-zinc-600">·</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex gap-3 text-xs">
                <a
                  href={l.href_repo}
                  className="rounded-[var(--r-tight)] border border-[var(--border-soft)] px-3 py-1.5 text-[var(--accent-indigo)] hover:bg-[var(--accent-indigo)]/5"
                >
                  GitHub →
                </a>
                {l.href_live && (
                  <Link
                    href={l.href_live.startsWith("http") ? l.href_live : l.href_live}
                    className="rounded-[var(--r-tight)] border border-[var(--border-soft)] px-3 py-1.5 text-[var(--accent-indigo)] hover:bg-[var(--accent-indigo)]/5"
                  >
                    Live demo →
                  </Link>
                )}
              </div>
            </article>
          ))}
        </section>

        <section className="mt-12 rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-6">
          <h2 className="text-xs uppercase tracking-widest text-zinc-500">How</h2>
          <p className="mt-4 text-sm text-zinc-300 leading-relaxed">
            Solo Founder OS — 11 Claude-powered agents handle distribution, customer discovery,
            funnel analytics, bilingual content sync, and outreach. Claude Code drives the actual
            building. Anthropic Skills Marketplace{" "}
            <a
              href="https://github.com/anthropics/skills"
              className="text-[var(--accent-indigo)] hover:underline"
            >
              PR #1275
            </a>{" "}
            is the 11-skill batch submission currently under review.
          </p>
          <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
            The 48hr velocity isn&apos;t the point. The point is every shipped thing gets graded —{" "}
            <Link href="/brier" className="text-[var(--accent-indigo)] hover:underline">
              Brier-audited at resolution
            </Link>
            . You can hold us accountable to whether the predictions were right.
          </p>
        </section>

        <footer className="mt-12 text-center text-xs text-zinc-500">
          Built by{" "}
          <a
            href="https://github.com/alex-jb"
            className="text-[var(--accent-indigo)] hover:underline"
          >
            @alex-jb
          </a>{" "}
          · M.S. CS, AI specialization (4.0 GPA) · U.S. Navy veteran ·{" "}
          <a
            href="https://www.vibexforge.com/quant-bench/alex-jb"
            className="text-[var(--accent-indigo)] hover:underline"
          >
            score me on Quant Bench
          </a>
        </footer>
      </div>
    </main>
  );
}
