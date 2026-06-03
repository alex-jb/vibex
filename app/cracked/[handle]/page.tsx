import { notFound } from "next/navigation";
import Link from "next/link";
import { scoreHandle } from "@/lib/cracked-score";
import { bumpScore, getAnonClient } from "@/lib/score";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ as?: string }>;
}

export const runtime = "nodejs";
export const revalidate = 600; // 10-min cache per (handle) — GitHub API rate respect

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  return {
    title: `🧠 ${handle} Cracked Score · VibeXForge`,
    description: `How cracked is @${handle}? 0-100 score across 12 axes — shipping velocity, OSS contribution, signal-to-noise. Live from GitHub.`,
    openGraph: {
      title: `${handle} — Cracked Score`,
      description: `12-axis dev profile score. Computed from GitHub public data.`,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${handle} — Cracked Score`,
      description: `12-axis dev profile score`,
    },
  };
}

export default async function CrackedHandlePage({ params, searchParams }: PageProps) {
  const { handle } = await params;
  const { as: creatorHandle } = await searchParams;
  const result = await scoreHandle(handle);
  if (!result) notFound();

  // If the user passed ?as=<creator-handle>, fire a Creator Score bump
  // (surface = revival, +40 — Cracked Score completion counts as a creator
  // action, slotted under the existing revival surface so we don't need a
  // new RPC enum value). Best-effort, never blocks the render.
  if (creatorHandle && creatorHandle.length <= 64) {
    try {
      const supa = getAnonClient();
      await bumpScore(supa, {
        handle: creatorHandle,
        surface: "revival",
        ref_id: `cracked-${result.handle}`,
      });
    } catch {
      // best-effort; logging would be noisy in server logs
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-zinc-200">
      <div className="mx-auto max-w-2xl">
        <header className="mb-10 text-center">
          <div className="mb-2 text-6xl">{result.tier.emoji}</div>
          <p className="text-xs uppercase tracking-widest text-orange-400">
            Cracked Score
          </p>
          <h1 className="mt-2 text-4xl font-bold">@{result.handle}</h1>
        </header>

        {/* Score hero */}
        <section className="mb-8 rounded-2xl bg-zinc-900/60 p-6 ring-1 ring-zinc-800">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-zinc-500">
                Overall
              </p>
              <p className="mt-1 text-6xl font-bold text-orange-400">
                {result.overall}
              </p>
              <p className="text-sm text-zinc-500">/ 100</p>
            </div>
            <div className="rounded-full bg-orange-500 px-5 py-2 text-base font-bold uppercase text-black">
              {result.tier.name}
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-black/40 p-2 ring-1 ring-zinc-800">
              <p className="text-base font-semibold">{result.totalStars}</p>
              <p className="text-zinc-500">total stars</p>
            </div>
            <div className="rounded-lg bg-black/40 p-2 ring-1 ring-zinc-800">
              <p className="text-base font-semibold">{result.totalRepos}</p>
              <p className="text-zinc-500">public repos</p>
            </div>
            <div className="rounded-lg bg-black/40 p-2 ring-1 ring-zinc-800">
              <p className="text-base font-semibold">{result.followers}</p>
              <p className="text-zinc-500">followers</p>
            </div>
          </div>
        </section>

        {/* Axes */}
        <section className="mb-8 rounded-2xl bg-zinc-900/60 p-6 ring-1 ring-zinc-800">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            12 axes
          </h2>
          <ul className="space-y-3">
            {result.axes.map((a) => (
              <li key={a.key} className="flex items-center gap-3 text-sm">
                <span className="w-36 shrink-0 text-zinc-300">{a.label}</span>
                <div className="flex-1 rounded-full bg-zinc-800">
                  <div
                    className="rounded-full bg-orange-500 py-1 text-center text-[10px] text-black"
                    style={{ width: `${Math.max(a.score, 4)}%` }}
                  >
                    {a.score}
                  </div>
                </div>
                <span className="w-32 shrink-0 text-right text-xs text-zinc-500">
                  {a.raw}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              `My Cracked Score: ${result.overall}/100 ${result.tier.emoji} ${result.tier.name.toUpperCase()}.\n\n@${result.handle} on GitHub. 12-axis score across velocity, depth, OSS.\n\nGet yours:`,
            )}&url=${encodeURIComponent(`https://vibexforge.com/cracked/${result.handle}`)}`}
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
            Score another handle →
          </Link>
        </div>

        <footer className="mt-16 text-center text-xs text-zinc-600">
          Live from GitHub public data · Computed{" "}
          {new Date(result.computedAt).toLocaleString()} · cached 10m
        </footer>
      </div>
    </main>
  );
}
