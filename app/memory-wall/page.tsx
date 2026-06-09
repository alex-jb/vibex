import Link from "next/link";
import type { Metadata } from "next";

interface Ticker {
  sym: string;
  name: string;
  thesis: string;
  position_pct: string;
}

const TICKERS: Ticker[] = [
  { sym: "AVGO", name: "Broadcom",        thesis: "Custom AI ASICs + networking switches", position_pct: "~6.5%" },
  { sym: "INTC", name: "Intel",           thesis: "Server CPUs + foundry roadmap recovery", position_pct: "~3.0%" },
  { sym: "ARM",  name: "ARM Holdings",    thesis: "Datacenter Neoverse design-win royalty", position_pct: "~4.5%" },
  { sym: "MU",   name: "Micron",          thesis: "HBM3E + DDR5 — direct memory wall play", position_pct: "~5.5%" },
  { sym: "STX",  name: "Seagate",         thesis: "Mass storage for AI training data lakes", position_pct: "~2.5%" },
  { sym: "WDC",  name: "Western Digital", thesis: "NAND for inference cache + storage tier", position_pct: "~2.0%" },
];

export const runtime = "nodejs";
export const revalidate = 3600; // 1-hour cache for latest brief

export const metadata: Metadata = {
  title: "📊 Memory Wall · VibeXForge",
  description:
    "Brier-audited daily research on Druckenmiller's Q1 2026 AI inference memory basket: AVGO/INTC/ARM/MU/STX/WDC.",
  openGraph: {
    title: "Memory Wall — Druckenmiller's AI inference basket",
    description: "Brier-audited daily research on 6-ticker basket.",
  },
};

async function fetchLatestBrief(): Promise<{ date: string; markdown: string } | null> {
  // Try today + last 5 days. Daily brief cron writes at 14:00 ET UTC.
  const now = new Date();
  for (let i = 0; i < 5; i++) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateStr = d.toISOString().slice(0, 10);
    const url = `https://raw.githubusercontent.com/alex-jb/memory-wall-tracker/main/briefs/${dateStr}.md`;
    try {
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (res.ok) {
        const markdown = await res.text();
        return { date: dateStr, markdown };
      }
    } catch {
      continue;
    }
  }
  return null;
}

export default async function MemoryWallPage() {
  const brief = await fetchLatestBrief();

  return (
    <main className="min-h-screen bg-[var(--bg-deep)] px-6 py-16 text-zinc-100">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <div className="mb-3 text-6xl">🧱</div>
          <p className="text-xs uppercase tracking-widest text-[var(--accent-indigo)]">
            Memory Wall · Brier-audited
          </p>
          <h1 className="mt-3 text-5xl font-bold leading-tight">
            Druckenmiller&apos;s <span className="text-[var(--accent-indigo)]">AI inference</span> basket
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            Stan&apos;s Q1 2026 13F shows 30+ new positions in AI inference memory + IO + networking.
            We track all 6 daily with Brier-audited predictions.
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            <a
              href="https://github.com/alex-jb/memory-wall-tracker"
              className="text-[var(--accent-indigo)] hover:underline"
            >
              Open source on GitHub →
            </a>
          </p>
        </div>

        <section className="mt-12">
          <div className="mb-4 text-xs uppercase tracking-widest text-zinc-500">
            The 6 tickers
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TICKERS.map((t) => (
              <div
                key={t.sym}
                className="rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-5"
              >
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-xl font-bold tabular-nums text-zinc-100">{t.sym}</div>
                    <div className="text-xs text-zinc-500">{t.name}</div>
                  </div>
                  <div className="text-xs text-zinc-500">
                    Druck: <span className="text-[var(--accent-indigo)] tabular-nums">{t.position_pct}</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-zinc-300 leading-relaxed">{t.thesis}</p>
              </div>
            ))}
          </div>
        </section>

        {brief && (
          <section className="mt-12">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs uppercase tracking-widest text-zinc-500">
                Latest brief — {brief.date}
              </div>
              <a
                href={`https://github.com/alex-jb/memory-wall-tracker/blob/main/briefs/${brief.date}.md`}
                className="text-xs text-[var(--accent-indigo)] hover:underline"
              >
                view on GitHub →
              </a>
            </div>
            <pre className="whitespace-pre-wrap rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-6 text-xs text-zinc-300 leading-relaxed font-sans">
              {brief.markdown}
            </pre>
          </section>
        )}

        <section className="mt-12 rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-6">
          <div className="text-xs uppercase tracking-widest text-zinc-500">Why Brier audit</div>
          <p className="mt-4 text-sm text-zinc-300 leading-relaxed">
            Most stock newsletters cherry-pick winners. This one publishes every prediction with a timestamp,
            then resolves it against actual price action. The Brier score is the differentiation — anyone can
            publish bullish theses, few will get scored honestly.
          </p>
          <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
            Daily brief at 14:00 ET. Cron-managed. Cost ~$0.03/day.
          </p>
          <p className="mt-3 text-xs text-zinc-500">
            Related:{" "}
            <Link href="/predictions" className="text-[var(--accent-indigo)] hover:underline">
              /predictions feed
            </Link>
            {" · "}
            <Link href="/council" className="text-[var(--accent-indigo)] hover:underline">
              /council
            </Link>
            {" · "}
            <Link href="/quant-bench" className="text-[var(--accent-indigo)] hover:underline">
              /quant-bench
            </Link>
          </p>
        </section>

        <footer className="mt-12 border-t border-[var(--border-soft)] pt-6 text-xs text-zinc-500">
          <p>Not financial advice. This is public research with a Brier audit.</p>
          <p className="mt-2">
            Source thesis:{" "}
            <a
              href="https://www.fool.com/investing/2026/05/24/why-billionaire-stanley-druckenmiller-dumped-nvidi/"
              className="text-[var(--accent-indigo)] hover:underline"
            >
              Druckenmiller Q1 2026 13F coverage
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
