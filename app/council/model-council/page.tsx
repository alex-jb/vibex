import type { Metadata } from "next";
import Link from "next/link";

export const runtime = "nodejs";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Model Council · Brier-audited 5-voice scoreboard",
  description:
    "5 voices, 1 model. See which persona has been right most often over time. Brier-audited at the persona layer.",
  openGraph: {
    title: "Model Council — Council Diff",
    description: "5 voices, 1 model. Track which persona is right.",
  },
};

interface VoiceCard {
  name: "Bull" | "Bear" | "Judge" | "Critic" | "Auditor";
  emoji: string;
  brier: number;
  n: number;
  bestAt: string;
  worstAt: string;
  accent: string;
}

// Static baseline pulled from council-diff usage 2026-06 — refresh when
// `council_verdicts` table reaches n=100 per voice. Current numbers are
// honest n<30 estimates from manual log audit, NOT calibrated probabilities.
const VOICES: VoiceCard[] = [
  {
    name: "Bull",
    emoji: "🐂",
    brier: 0.31,
    n: 23,
    bestAt: "founder + investor calls",
    worstAt: "engineer architecture decisions",
    accent: "text-emerald-400",
  },
  {
    name: "Bear",
    emoji: "🐻",
    brier: 0.22,
    n: 23,
    bestAt: "quant + product kill calls",
    worstAt: "career timing",
    accent: "text-rose-400",
  },
  {
    name: "Judge",
    emoji: "⚖️",
    brier: 0.19,
    n: 23,
    bestAt: "split verdicts where evidence is genuinely 50/50",
    worstAt: "early-stage founder bet sizing",
    accent: "text-amber-400",
  },
  {
    name: "Critic",
    emoji: "🔍",
    brier: 0.21,
    n: 23,
    bestAt: "engineer reviews + plan critique",
    worstAt: "consumer product launches",
    accent: "text-[var(--accent-indigo)]",
  },
  {
    name: "Auditor",
    emoji: "📋",
    brier: 0.18,
    n: 23,
    bestAt: "quant + finance verdicts",
    worstAt: "creative/career direction",
    accent: "text-zinc-300",
  },
];

function status(brier: number): { label: string; color: string } {
  if (brier < 0.20) return { label: "BETTER THAN COIN-FLIP", color: "text-emerald-400" };
  if (brier < 0.25) return { label: "ABOUT COIN-FLIP", color: "text-amber-400" };
  return { label: "WORSE THAN COIN-FLIP", color: "text-rose-400" };
}

export default function ModelCouncilPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-deep)] px-6 py-16 text-zinc-100">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.4em] text-zinc-500">
            Council Diff · Model Council
          </div>
          <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
            5 voices, 1 model.
            <br />
            <span className="text-[var(--accent-indigo)]">Track which persona is right.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-zinc-400">
            Perplexity&apos;s Model Council puts different models side-by-side. Council Diff puts
            5 personas of one model side-by-side and audits which one has been right most often.
            Different problem, different leverage.
          </p>
        </div>

        <section className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-5">
          {VOICES.map((v) => {
            const s = status(v.brier);
            return (
              <div
                key={v.name}
                className="rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="text-3xl">{v.emoji}</div>
                  <div className={`text-xs font-semibold ${v.accent}`}>{v.name}</div>
                </div>
                <div className="mt-4 text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Brier
                </div>
                <div className="mt-1 font-mono text-2xl font-bold">{v.brier.toFixed(2)}</div>
                <div className={`mt-1 text-[10px] font-semibold ${s.color}`}>{s.label}</div>
                <div className="mt-4 text-xs text-zinc-500">n = {v.n}</div>
                <div className="mt-3 text-xs">
                  <div className="text-zinc-500">Best at</div>
                  <div className="mt-1 text-zinc-200">{v.bestAt}</div>
                </div>
                <div className="mt-3 text-xs">
                  <div className="text-zinc-500">Weakest on</div>
                  <div className="mt-1 text-zinc-400">{v.worstAt}</div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="mt-16 rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-8">
          <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            How to read this
          </div>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-zinc-300">
            <li>
              Brier &lt; 0.25 = better than coin-flip on this voice&apos;s historical predictions.
              Above 0.25 = ignore this voice on this domain.
            </li>
            <li>
              n is the number of *resolved* council runs the voice has been on. Until n &gt; 30
              per voice per domain, these are <span className="text-amber-300">soft signals</span>{" "}
              — pre-calibration.
            </li>
            <li>
              When personas disagree (split verdict), the historically lower-Brier voice on
              the relevant domain gets more weight in your decision.
            </li>
            <li>
              <span className="text-rose-300">Important caveat:</span> 5 personas of one model
              do NOT have independent priors. Apply{" "}
              <code className="rounded bg-[var(--bg-deep)] px-1.5 py-0.5 text-xs">
                ensemble_shrinkage λ=0.4
              </code>{" "}
              when 5/5 agree — see <Link href="/postmortems" className="text-[var(--accent-indigo)] hover:underline">
                BKSY postmortem
              </Link>.
            </li>
          </ol>
        </section>

        <section className="mt-12 text-center text-xs text-zinc-500">
          <div>
            Want side-by-side comparison instead?{" "}
            <Link href="/council" className="text-[var(--accent-indigo)] hover:underline">
              Submit a decision → 5-voice verdict
            </Link>
          </div>
          <div className="mt-2">
            Refreshed when council_verdicts table reaches n &gt; 30 per voice. Currently n = 23 each.
          </div>
        </section>
      </div>
    </main>
  );
}
