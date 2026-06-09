import type { Metadata } from "next";
import Link from "next/link";

export const runtime = "nodejs";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Postmortems · Calibration-honest failure log",
  description:
    "Every prediction gets a resolve_by date. Every loss gets a postmortem. Publishing FAIL is the moat.",
  openGraph: {
    title: "Postmortems — VibeXForge",
    description: "Honest negative results. Public audit log.",
  },
};

interface Postmortem {
  date: string;
  slug: string;
  title: string;
  verdict: "FAIL" | "SKIP" | "CANCELED";
  capital: string;
  oneLine: string;
}

const POSTMORTEMS: Postmortem[] = [
  {
    date: "2026-06-09",
    slug: "spcx-ipo-skip",
    title: "SPCX IPO 6/12 — SKIP",
    verdict: "SKIP",
    capital: "$0-648 upside skipped",
    oneLine: "Walkforward gate verdict FAIL. The rule is the rule.",
  },
  {
    date: "2026-06-08",
    slug: "orallexa-walkforward-fail",
    title: "Orallexa walkforward — FAIL",
    verdict: "FAIL",
    capital: "$0 lost ($300+ NOT entered)",
    oneLine: "Mean OOS Sharpe -3.08. In-sample fit ≠ production edge.",
  },
  {
    date: "2026-06-05",
    slug: "bksy-trade-canceled",
    title: "BKSY 6/16 single-name — CANCELED",
    verdict: "CANCELED",
    capital: "$300 diversified across 3 names",
    oneLine: "5/5 personas of one model ≠ 5 independent voters. Shipped λ=0.4 shrinkage.",
  },
  {
    date: "2026-05-27",
    slug: "markets-paper-pnl-fail",
    title: "Markets stack 14-day paper P&L — FAIL",
    verdict: "FAIL",
    capital: "$0 real / $1015 paper",
    oneLine: "Brier calibration was right. Sharpe direction was wrong. They are not the same.",
  },
];

const VERDICT_STYLE: Record<Postmortem["verdict"], string> = {
  FAIL: "text-rose-400 border-rose-500/40",
  SKIP: "text-amber-400 border-amber-500/40",
  CANCELED: "text-zinc-400 border-zinc-500/40",
};

export default function PostmortemsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-deep)] px-6 py-16 text-zinc-100">
      <div className="mx-auto max-w-3xl">
        <div className="text-xs uppercase tracking-[0.4em] text-zinc-500">
          Calibration-honest · public audit
        </div>
        <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
          Postmortems.
        </h1>
        <p className="mt-5 max-w-2xl text-zinc-400">
          Every prediction gets a <code className="rounded bg-[var(--bg-elev)] px-1.5 py-0.5 text-xs">resolve_by</code>{" "}
          date. Every loss gets a postmortem. Publishing FAIL is the moat.
        </p>

        <section className="mt-12 space-y-4">
          {POSTMORTEMS.map((p) => (
            <a
              key={p.slug}
              href={`https://github.com/alex-jb/alex-brain/blob/main/postmortems/${p.date}-${p.slug}.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-5 transition hover:border-[var(--accent-indigo)]"
            >
              <div className="flex items-center justify-between">
                <div className="font-mono text-xs text-zinc-500">{p.date}</div>
                <div
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${VERDICT_STYLE[p.verdict]}`}
                >
                  {p.verdict}
                </div>
              </div>
              <div className="mt-3 text-lg font-semibold">{p.title}</div>
              <div className="mt-2 text-sm text-zinc-300">{p.oneLine}</div>
              <div className="mt-3 font-mono text-xs text-zinc-500">{p.capital}</div>
            </a>
          ))}
        </section>

        <section className="mt-16 rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-6 text-sm text-zinc-300">
          <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Why publish this</div>
          <p className="mt-3">
            Roy Lee&apos;s Cluely ARR retraction in March 2026 went more viral than the original
            lie. Wispr Flow&apos;s pivot postmortem hit a 5× free→paid conversion at launch.
            Honest negative results from a serious operator are the cheapest distribution asset
            of 2026 H1.
          </p>
          <p className="mt-3">
            The full audit lives at{" "}
            <a
              href="https://github.com/alex-jb/alex-brain/tree/main/postmortems"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent-indigo)] hover:underline"
            >
              github.com/alex-jb/alex-brain/postmortems
            </a>{" "}
            (private repo — public mirror coming).
          </p>
        </section>

        <section className="mt-10 text-center text-xs text-zinc-500">
          <Link href="/brier" className="text-[var(--accent-indigo)] hover:underline">
            ← Back to Brier index
          </Link>
        </section>
      </div>
    </main>
  );
}
