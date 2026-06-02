import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import type { ValidatorReport } from "@/lib/idea-validator";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface ValidationRow {
  id: string;
  idea_text: string;
  idea_category: string | null;
  idea_keywords: string[] | null;
  target_persona: string | null;
  report: ValidatorReport;
  pmf_score: number | null;
  verdict: string | null;
  death_probability_6m: number | null;
  death_reason: string | null;
  is_public: boolean;
  created_at: string;
}

async function fetchValidation(id: string): Promise<ValidationRow | null> {
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!SUPA_URL || !SUPA_ANON_KEY) return null;
  const supa = createClient(SUPA_URL, SUPA_ANON_KEY);
  const { data } = await supa
    .from("idea_validations")
    .select(
      "id, idea_text, idea_category, idea_keywords, target_persona, report, pmf_score, verdict, death_probability_6m, death_reason, is_public, created_at",
    )
    .eq("id", id)
    .maybeSingle();
  return data as ValidationRow | null;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const row = await fetchValidation(id);
  if (!row) return { title: "Validation not found" };
  const title = `📊 PMF Score ${row.pmf_score}/100 · ${row.verdict}`;
  const description = (row.report?.verdict?.one_liner || row.idea_text).slice(
    0,
    160,
  );
  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary", title, description },
  };
}

function VerdictBadge({
  verdict,
  score,
}: {
  verdict: string | null;
  score: number | null;
}) {
  const color =
    verdict === "BUILD"
      ? "bg-green-500/20 text-green-300 ring-green-500/40"
      : verdict === "ITERATE"
        ? "bg-yellow-500/20 text-yellow-300 ring-yellow-500/40"
        : "bg-red-500/20 text-red-300 ring-red-500/40";
  const emoji =
    verdict === "BUILD" ? "🟢" : verdict === "ITERATE" ? "🟡" : "🔴";
  return (
    <div className={`rounded-2xl px-6 py-4 ring-1 ${color}`}>
      <p className="text-sm uppercase tracking-widest">PMF Score</p>
      <p className="text-5xl font-bold">{score ?? "?"}/100</p>
      <p className="mt-1 text-lg font-semibold">
        {emoji} {verdict || "PENDING"}
      </p>
    </div>
  );
}

export default async function ValidatorReportPage({ params }: PageProps) {
  const { id } = await params;
  const row = await fetchValidation(id);
  if (!row) notFound();
  const r = row.report;

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 text-center">
          <p className="text-sm uppercase tracking-widest text-orange-400">
            Idea Validator · Report
          </p>
          <h1 className="mt-3 text-2xl font-bold leading-tight">
            {row.idea_category && (
              <span className="text-zinc-400">{row.idea_category}</span>
            )}
          </h1>
          <p className="mt-2 text-sm italic text-zinc-400">
            &ldquo;{row.idea_text.slice(0, 200)}
            {row.idea_text.length > 200 ? "…" : ""}&rdquo;
          </p>
        </header>

        <div className="mb-10 flex justify-center">
          <VerdictBadge verdict={row.verdict} score={row.pmf_score} />
        </div>

        {r.verdict?.one_liner && (
          <p className="mb-12 text-center text-lg italic text-zinc-300">
            &ldquo;{r.verdict.one_liner}&rdquo;
          </p>
        )}

        {/* Section 1: Competitors */}
        <section className="mb-10 rounded-2xl bg-zinc-900/60 p-6 ring-1 ring-zinc-800">
          <h2 className="mb-3 text-xl font-bold">🔍 Existing competitors</h2>
          <p className="mb-4 text-sm text-zinc-300">{r.competitors?.summary}</p>
          <ul className="space-y-2">
            {(r.competitors?.items || []).map((c, i) => (
              <li
                key={i}
                className="rounded-xl bg-zinc-800/60 px-4 py-3 text-sm"
              >
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-orange-400 hover:underline"
                >
                  {c.name}
                </a>
                <p className="mt-1 text-zinc-400">{c.differentiator}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Section 2: Demand */}
        <section className="mb-10 rounded-2xl bg-zinc-900/60 p-6 ring-1 ring-zinc-800">
          <h2 className="mb-3 text-xl font-bold">📊 Demand signals</h2>
          <p className="mb-4 text-sm text-zinc-300">
            {r.demand_signals?.summary}
          </p>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-xl bg-zinc-800/60 p-3">
              <p className="text-2xl font-bold">
                {r.demand_signals?.reddit_post_count ?? 0}
              </p>
              <p className="text-xs text-zinc-400">Reddit posts</p>
            </div>
            <div className="rounded-xl bg-zinc-800/60 p-3">
              <p className="text-2xl font-bold">
                {r.demand_signals?.hn_post_count ?? 0}
              </p>
              <p className="text-xs text-zinc-400">HN posts</p>
            </div>
            <div className="rounded-xl bg-zinc-800/60 p-3">
              <p className="text-2xl font-bold">
                {r.demand_signals?.avg_hn_points ?? 0}
              </p>
              <p className="text-xs text-zinc-400">Avg HN points</p>
            </div>
          </div>
          <p className="mt-3 text-center text-sm font-semibold uppercase text-orange-400">
            {r.demand_signals?.quantified_verdict ?? "?"} demand
          </p>
        </section>

        {/* Section 3: What's built */}
        <section className="mb-10 rounded-2xl bg-zinc-900/60 p-6 ring-1 ring-zinc-800">
          <h2 className="mb-3 text-xl font-bold">🏗️ What&apos;s already built</h2>
          <p className="mb-4 text-sm text-zinc-300">{r.whats_built?.summary}</p>
          {r.whats_built?.missing_features &&
            r.whats_built.missing_features.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-sm font-semibold text-zinc-400">
                  Missing features
                </p>
                <ul className="space-y-1 text-sm">
                  {r.whats_built.missing_features.map((m, i) => (
                    <li key={i} className="text-zinc-300">
                      · {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          {r.whats_built?.pain_points && r.whats_built.pain_points.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-semibold text-zinc-400">
                Pain points
              </p>
              <ul className="space-y-1 text-sm">
                {r.whats_built.pain_points.map((p, i) => (
                  <li key={i} className="text-zinc-300">
                    · {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-sm text-zinc-400">
            <b>Pricing:</b> {r.whats_built?.pricing_distribution}
          </p>
        </section>

        {/* Section 4: White space */}
        <section className="mb-10 rounded-2xl bg-zinc-900/60 p-6 ring-1 ring-zinc-800">
          <h2 className="mb-3 text-xl font-bold">💡 White space</h2>
          <p className="mb-4 text-sm text-zinc-300">{r.white_space?.summary}</p>
          <div className="space-y-3">
            {(r.white_space?.angles || []).map((a, i) => (
              <div key={i} className="rounded-xl bg-zinc-800/60 p-4">
                <p className="font-semibold text-orange-400">
                  &ldquo;{a.tagline}&rdquo;
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  MRR ceiling: <b>{a.estimated_mrr_ceiling}</b>
                </p>
                <p className="mt-2 text-sm text-zinc-300">{a.reasoning}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Verdict axes */}
        {r.verdict?.axes && (
          <section className="mb-10 rounded-2xl bg-zinc-900/60 p-6 ring-1 ring-zinc-800">
            <h2 className="mb-3 text-xl font-bold">🎯 Verdict breakdown</h2>
            <div className="space-y-2 text-sm">
              {Object.entries(r.verdict.axes).map(([axis, score]) => (
                <div key={axis} className="flex items-center gap-3">
                  <span className="w-32 capitalize text-zinc-400">{axis}</span>
                  <div className="flex-1 rounded-full bg-zinc-800">
                    <div
                      className="rounded-full bg-orange-500 py-1 text-center text-xs"
                      style={{ width: `${score}%` }}
                    >
                      {score}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {r.verdict.analogy && (
              <p className="mt-4 text-center text-sm italic text-zinc-300">
                &ldquo;{r.verdict.analogy}&rdquo;
              </p>
            )}
          </section>
        )}

        {/* Section 6: Death Probability (migration 068) */}
        {row.death_probability_6m !== null && (
          <section className="mb-10 rounded-2xl bg-zinc-900/60 p-6 ring-1 ring-zinc-800">
            <h2 className="mb-3 text-xl font-bold">💀 Death probability (6 months)</h2>
            <div className="flex items-center gap-3 text-sm">
              <span className="w-32 text-zinc-400">If you build it</span>
              <div className="flex-1 rounded-full bg-zinc-800">
                <div
                  className={`rounded-full py-1 text-center text-xs ${
                    row.death_probability_6m >= 70
                      ? "bg-red-500"
                      : row.death_probability_6m >= 50
                        ? "bg-yellow-500 text-black"
                        : "bg-green-500 text-black"
                  }`}
                  style={{ width: `${Math.max(row.death_probability_6m, 8)}%` }}
                >
                  {row.death_probability_6m}%
                </div>
              </div>
            </div>
            {row.death_reason && (
              <p className="mt-3 text-sm text-zinc-300">{row.death_reason}</p>
            )}
            {row.death_probability_6m >= 70 && (
              <div className="mt-4 rounded-xl bg-orange-500/10 p-4 ring-1 ring-orange-500/30">
                <p className="text-sm text-orange-300">
                  Most ideas like this die within 6 months.
                </p>
                <Link
                  href={`/funeral/idea?prefill=${encodeURIComponent(row.idea_text.slice(0, 400))}`}
                  className="mt-2 inline-block text-sm font-semibold text-orange-200 underline hover:text-orange-100"
                >
                  Bury it on /funeral/idea — closure first, then next idea →
                </Link>
              </div>
            )}
          </section>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/validator"
            className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-black hover:bg-orange-400"
          >
            Validate another →
          </Link>
          <Link
            href="/funeral"
            className="flex-1 rounded-xl bg-zinc-900 px-4 py-3 text-center text-sm text-zinc-300 ring-1 ring-zinc-800 hover:bg-zinc-800"
          >
            🕯️ Bury an old one →
          </Link>
        </div>

        <footer className="mt-16 text-center text-xs text-zinc-600">
          A side project of{" "}
          <Link href="/" className="text-orange-400 hover:underline">
            VibeXForge
          </Link>
        </footer>
      </div>
    </main>
  );
}
