import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { TIER_LADDER, tierFromScore } from "@/lib/score";
import { ScoreShareButtons } from "@/components/score/share-buttons";

interface PageProps {
  params: Promise<{ handle: string }>;
}

interface ScoreRow {
  handle: string;
  score: number;
  tier: string;
  funerals_count: number;
  idea_funerals_count: number;
  validations_count: number;
  launchkits_count: number;
  vibex_submits_count: number;
  revivals_triggered_count: number;
  last_active_at: string;
  created_at: string;
}

async function fetchScore(handle: string): Promise<ScoreRow | null> {
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!SUPA_URL || !SUPA_ANON_KEY) return null;
  const supa = createClient(SUPA_URL, SUPA_ANON_KEY);
  const { data } = await supa
    .from("creator_scores")
    .select(
      "handle, score, tier, funerals_count, idea_funerals_count, validations_count, launchkits_count, vibex_submits_count, revivals_triggered_count, last_active_at, created_at",
    )
    .eq("handle", handle.toLowerCase())
    .maybeSingle();
  return data as ScoreRow | null;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const row = await fetchScore(handle);
  if (!row) return { title: `@${handle} — Creator Score` };
  const meta = tierFromScore(row.score);
  const title = `${meta.emoji} @${handle} — ${meta.label} · ${row.score} pts`;
  const description = `${row.validations_count} validations · ${row.funerals_count + row.idea_funerals_count} funerals · ${row.vibex_submits_count} ships on VibeXForge.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "profile" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ScoreProfilePage({ params }: PageProps) {
  const { handle: rawHandle } = await params;
  const handle = rawHandle.toLowerCase();
  const row = await fetchScore(handle);
  if (!row) notFound();
  const tier = tierFromScore(row.score);
  const nextTier = TIER_LADDER.find((t) => t.threshold > row.score);
  const ptsToNext = nextTier ? nextTier.threshold - row.score : 0;

  const stats = [
    { label: "Validated ideas", value: row.validations_count, emoji: "📝" },
    { label: "LaunchKits", value: row.launchkits_count, emoji: "🚀" },
    { label: "Buried repos", value: row.funerals_count, emoji: "🪦" },
    { label: "Buried ideas", value: row.idea_funerals_count, emoji: "💭" },
    { label: "Revivals triggered", value: row.revivals_triggered_count, emoji: "🔄" },
    { label: "Ships on VibeX", value: row.vibex_submits_count, emoji: "⚡" },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-200 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <header className="mb-10 text-center">
          <div className="mb-3 text-6xl">{tier.emoji}</div>
          <h1 className="text-4xl font-bold leading-tight">@{handle}</h1>
          <p className="mt-2 text-sm uppercase tracking-widest text-orange-400">
            {tier.label}
          </p>
        </header>

        <div className="mb-8 rounded-2xl bg-zinc-900/60 p-6 ring-1 ring-zinc-800">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="text-sm text-zinc-400">Creator Score</p>
            <p className="text-4xl font-bold">{row.score}</p>
          </div>
          {nextTier && (
            <>
              <div className="mb-1 flex justify-between text-xs text-zinc-500">
                <span>{tier.label}</span>
                <span>
                  {ptsToNext} pts to {nextTier.label} {nextTier.emoji}
                </span>
              </div>
              <div className="rounded-full bg-zinc-800">
                <div
                  className="rounded-full bg-orange-500 py-1.5"
                  style={{
                    width: `${Math.min(
                      ((row.score - tier.threshold) /
                        (nextTier.threshold - tier.threshold)) *
                        100,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </>
          )}
          <p className="mt-4 text-xs text-zinc-400">
            <b className="text-orange-400">Current perk:</b> {tier.perk}
          </p>
        </div>

        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl bg-zinc-900/40 p-4 text-center ring-1 ring-zinc-800"
            >
              <p className="text-2xl">{s.emoji}</p>
              <p className="mt-1 text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-zinc-400">{s.label}</p>
            </div>
          ))}
        </section>

        <section className="mb-8 rounded-2xl bg-zinc-900/40 p-6 ring-1 ring-zinc-800">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Tier ladder
          </h2>
          <ul className="space-y-3 text-sm">
            {TIER_LADDER.filter((t) => t.threshold > 0 && t.threshold < 9999).map((t) => (
              <li
                key={t.name}
                className={`flex items-baseline justify-between rounded-xl px-4 py-2 ${
                  t.name === tier.name
                    ? "bg-orange-500/10 ring-1 ring-orange-500/40"
                    : ""
                }`}
              >
                <span>
                  <span className="mr-2">{t.emoji}</span>
                  <span className="font-semibold">{t.label}</span>
                  <span className="ml-2 text-xs text-zinc-500">≥ {t.threshold}</span>
                </span>
                <span className="text-xs text-zinc-400">{t.perk}</span>
              </li>
            ))}
          </ul>
        </section>

        <ScoreShareButtons
          handle={handle}
          score={row.score}
          tierLabel={tier.label}
          tierEmoji={tier.emoji}
          funerals={row.funerals_count}
          ideaFunerals={row.idea_funerals_count}
          validations={row.validations_count}
          launchkits={row.launchkits_count}
          revivals={row.revivals_triggered_count}
          ships={row.vibex_submits_count}
        />

        <div className="mt-3">
          <Link
            href="/validator"
            className="block w-full rounded-xl bg-zinc-900 px-4 py-3 text-center text-sm text-zinc-300 ring-1 ring-zinc-800 hover:bg-zinc-800"
          >
            Climb the ladder → /validator
          </Link>
        </div>

        <footer className="mt-16 text-center text-xs text-zinc-600">
          Active since {new Date(row.created_at).toLocaleDateString()} ·{" "}
          <Link href="/" className="text-orange-400 hover:underline">
            VibeXForge
          </Link>
        </footer>
      </div>
    </main>
  );
}
