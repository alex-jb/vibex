import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { scoreHandle } from "@/lib/cracked-score";

interface PageProps {
  params: Promise<{ a: string; b: string }>;
}

export const runtime = "nodejs";
export const revalidate = 600;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { a, b } = await params;
  return {
    title: `@${a} vs @${b} · Cracked Score · VibeXForge`,
    description: `Head-to-head Cracked Score. 12-axis dev profile, computed live from GitHub.`,
    openGraph: {
      title: `@${a} vs @${b} — Cracked Score`,
      description: `Who's more cracked? 12-axis head-to-head.`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `@${a} vs @${b} — Cracked Score`,
      description: `12-axis head-to-head`,
    },
  };
}

function delta(left: number, right: number): string {
  const d = left - right;
  if (d === 0) return "tie";
  return d > 0 ? `+${d}` : `${d}`;
}

export default async function CrackedVsPage({ params }: PageProps) {
  const { a: rawA, b: rawB } = await params;
  const [resA, resB] = await Promise.all([scoreHandle(rawA), scoreHandle(rawB)]);
  if (!resA || !resB) notFound();

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-zinc-200">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 text-center">
          <p className="text-xs uppercase tracking-widest text-orange-400">
            Cracked Score · Head-to-Head
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            @{resA.handle} <span className="text-zinc-500">vs</span> @{resB.handle}
          </h1>
        </header>

        {/* Two score panels */}
        <section className="mb-8 grid grid-cols-2 gap-3">
          {[resA, resB].map((r, idx) => {
            const other = idx === 0 ? resB : resA;
            const winning = r.overall > other.overall;
            return (
              <Link
                key={r.handle}
                href={`/cracked/${r.handle}`}
                className={`block rounded-2xl p-5 ring-1 hover:ring-orange-500/40 ${
                  winning
                    ? "bg-orange-500/10 ring-orange-500/40"
                    : "bg-zinc-900/60 ring-zinc-800"
                }`}
              >
                <div className="mb-2 flex items-baseline justify-between">
                  <p className="truncate text-base font-semibold">@{r.handle}</p>
                  <p className="text-2xl">{r.tier.emoji}</p>
                </div>
                <p className="text-5xl font-bold text-orange-400">{r.overall}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">
                  {r.tier.name} · {r.totalStars.toLocaleString()} ⭐
                </p>
              </Link>
            );
          })}
        </section>

        {/* Axis-by-axis */}
        <section className="mb-8 rounded-2xl bg-zinc-900/60 p-6 ring-1 ring-zinc-800">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            12 axes
          </h2>
          <ul className="space-y-2">
            {resA.axes.map((axisA, i) => {
              const axisB = resB.axes[i];
              const aWin = axisA.score > axisB.score;
              const bWin = axisB.score > axisA.score;
              return (
                <li
                  key={axisA.key}
                  className="grid grid-cols-[1fr_auto_2fr_auto_1fr] items-center gap-3 text-sm"
                >
                  <span
                    className={`text-right font-mono ${
                      aWin ? "text-orange-400 font-bold" : "text-zinc-500"
                    }`}
                  >
                    {axisA.score}
                  </span>
                  <span className="text-xs text-zinc-600">|</span>
                  <span className="text-center text-zinc-300">{axisA.label}</span>
                  <span className="text-xs text-zinc-600">|</span>
                  <span
                    className={`font-mono ${
                      bWin ? "text-orange-400 font-bold" : "text-zinc-500"
                    }`}
                  >
                    {axisB.score}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Verdict */}
        <section className="mb-8 rounded-2xl bg-zinc-900/40 p-6 text-center ring-1 ring-zinc-800">
          {resA.overall === resB.overall ? (
            <p className="text-sm text-zinc-300">
              Dead tie at <span className="text-orange-400 font-bold">{resA.overall}</span>. Cracked equilibrium.
            </p>
          ) : (
            <p className="text-sm text-zinc-300">
              <span className="text-orange-400 font-bold">
                @{resA.overall > resB.overall ? resA.handle : resB.handle}
              </span>{" "}
              wins by{" "}
              <span className="text-orange-400 font-bold">
                {Math.abs(resA.overall - resB.overall)}
              </span>{" "}
              points ({delta(resA.overall, resB.overall)} net).
            </p>
          )}
        </section>

        {/* CTA */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              `Cracked Score head-to-head:\n\n@${resA.handle} ${resA.overall} ${resA.tier.emoji}\n@${resB.handle} ${resB.overall} ${resB.tier.emoji}\n\n12-axis dev profile. Run yours:`,
            )}&url=${encodeURIComponent(`https://vibexforge.com/cracked/vs/${resA.handle}/${resB.handle}`)}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-black hover:bg-orange-400"
          >
            Share on 𝕏
          </a>
          <Link
            href="/cracked"
            className="flex-1 rounded-xl bg-zinc-900 px-4 py-3 text-center text-sm text-zinc-300 ring-1 ring-zinc-800 hover:bg-zinc-800"
          >
            Score yourself →
          </Link>
        </div>

        <footer className="mt-16 text-center text-xs text-zinc-600">
          Live from GitHub public data ·{" "}
          <Link href="/cracked/leaderboard" className="text-orange-400 hover:underline">
            See full leaderboard
          </Link>
        </footer>
      </div>
    </main>
  );
}
