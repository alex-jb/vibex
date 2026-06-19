import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 60; // 1-min ISR — wall freshness vs cost

interface WallRow {
  id: string;
  kind: "repo" | "idea";
  deceased_name: string;
  subline: string;
  cause_of_death: string | null;
  created_at: string;
  ash_image_url: string | null;
}

const CAUSE_LABELS: Record<string, { label: string; emoji: string }> = {
  no_users: { label: "No users", emoji: "👻" },
  no_revenue: { label: "No revenue", emoji: "💸" },
  founder_lost_interest: { label: "Lost interest", emoji: "🐿" },
  pivot_failed: { label: "Pivot failed", emoji: "🔁" },
  tech_debt: { label: "Tech debt", emoji: "🧱" },
  competition: { label: "Out-competed", emoji: "⚔" },
  money_ran_out: { label: "Out of money", emoji: "🪙" },
  regulation: { label: "Regulation", emoji: "📜" },
  other: { label: "Other", emoji: "·" },
};

interface WeeklyStats {
  total: number;
  topCause: { key: string; count: number } | null;
  topMourners: { name: string; count: number }[];
}

async function fetchWeeklyStats(): Promise<WeeklyStats> {
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!SUPA_URL || !SUPA_ANON_KEY) return { total: 0, topCause: null, topMourners: [] };
  const supa = createClient(SUPA_URL, SUPA_ANON_KEY);
  const week = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: funerals }, { data: ideas }] = await Promise.all([
    supa
      .from("funerals")
      .select("cause_of_death, mourner_name")
      .eq("is_public", true)
      .gte("created_at", week),
    supa
      .from("idea_funerals")
      .select("cause_of_death, mourner_name")
      .eq("is_public", true)
      .gte("created_at", week),
  ]);

  const all = [...(funerals || []), ...(ideas || [])];
  if (all.length === 0) return { total: 0, topCause: null, topMourners: [] };

  const causeBuckets = new Map<string, number>();
  for (const r of all) {
    const c = (r as { cause_of_death?: string }).cause_of_death;
    if (!c) continue;
    causeBuckets.set(c, (causeBuckets.get(c) || 0) + 1);
  }
  const topCause = causeBuckets.size > 0
    ? (() => {
        const sorted = Array.from(causeBuckets.entries()).sort((a, b) => b[1] - a[1]);
        return { key: sorted[0][0], count: sorted[0][1] };
      })()
    : null;

  // Top mourners (skip seed curator + anon)
  const mournerBuckets = new Map<string, number>();
  for (const r of all) {
    const name = ((r as { mourner_name?: string }).mourner_name || "").trim();
    if (!name) continue;
    if (name === "vibex curator") continue;
    mournerBuckets.set(name, (mournerBuckets.get(name) || 0) + 1);
  }
  const topMourners = Array.from(mournerBuckets.entries())
    .filter(([, c]) => c >= 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return { total: all.length, topCause, topMourners };
}

async function fetchWall(cause: string | null): Promise<WallRow[]> {
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!SUPA_URL || !SUPA_ANON_KEY) return [];
  const supa = createClient(SUPA_URL, SUPA_ANON_KEY);

  const repoQuery = supa
    .from("funerals")
    .select(
      "id, deceased_name, repo_owner, stars, language, age_days_alive, cause_of_death, created_at, ash_image_url",
    )
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(50);

  const ideaQuery = supa
    .from("idea_funerals")
    .select(
      "id, deceased_name, category, age_when_buried, cause_of_death, created_at, ash_image_url",
    )
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(50);

  const [{ data: repos }, { data: ideas }] = await Promise.all([
    cause ? repoQuery.eq("cause_of_death", cause) : repoQuery,
    cause ? ideaQuery.eq("cause_of_death", cause) : ideaQuery,
  ]);

  const repoRows: WallRow[] = (repos || []).map((r) => ({
    id: r.id as string,
    kind: "repo",
    deceased_name: r.deceased_name as string,
    subline: `${r.repo_owner}/${r.deceased_name} · ⭐ ${r.stars}${r.language ? ` · ${r.language}` : ""}${
      r.age_days_alive !== null ? ` · lived ${r.age_days_alive}d` : ""
    }`,
    cause_of_death: (r.cause_of_death as string | null) || null,
    created_at: r.created_at as string,
    ash_image_url: (r.ash_image_url as string | null) || null,
  }));

  const ideaRows: WallRow[] = (ideas || []).map((r) => ({
    id: r.id as string,
    kind: "idea",
    deceased_name: r.deceased_name as string,
    subline: `${(r.category as string) || "idea"}${r.age_when_buried ? ` · ${r.age_when_buried}` : ""}`,
    cause_of_death: (r.cause_of_death as string | null) || null,
    created_at: r.created_at as string,
    ash_image_url: (r.ash_image_url as string | null) || null,
  }));

  return [...repoRows, ...ideaRows]
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, 60);
}

interface PageProps {
  searchParams: Promise<{ cause?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps) {
  const { cause } = await searchParams;
  if (cause && CAUSE_LABELS[cause]) {
    const m = CAUSE_LABELS[cause];
    return {
      title: `🪦 Dead because of ${m.label} — Memorial Wall`,
      description: `Indie projects + ideas that died from ${m.label.toLowerCase()}. The Memorial Wall filtered to one cause-of-death category. Learn from each.`,
      openGraph: {
        title: `🪦 ${m.label} — Memorial Wall · VibeXForge`,
        description: `Indie projects + ideas killed by ${m.label.toLowerCase()}.`,
        type: "website",
      },
    };
  }
  return {
    title: "🪦 Memorial Wall — A Funeral for Your Side Project",
    description: "The public memorial wall. Recent dead projects + ideas given a proper send-off, classified by cause of death.",
  };
}

export default async function MemorialWall({ searchParams }: PageProps) {
  const { cause: rawCause } = await searchParams;
  const cause = rawCause && CAUSE_LABELS[rawCause] ? rawCause : null;
  const [rows, weeklyStats] = await Promise.all([
    fetchWall(cause),
    fetchWeeklyStats(),
  ]);
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-200 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 text-center">
          <div className="mb-3 text-5xl">🪦</div>
          <h1 className="font-serif text-4xl font-bold">Memorial Wall</h1>
          <p className="mt-3 text-sm text-zinc-400">
            Recent goodbyes to dead repos + dead ideas.
            <br />
            <Link href="/funeral" className="text-orange-400 hover:underline">
              Bury a repo →
            </Link>
            {" · "}
            <Link href="/funeral/idea" className="text-orange-400 hover:underline">
              Bury an idea →
            </Link>
          </p>
        </header>

        {/* This-week stat banner (SEO + share hook for /funeral/wall) */}
        {weeklyStats.total > 0 && (
          <div className="mb-8 rounded-2xl bg-zinc-900/40 p-5 text-center ring-1 ring-zinc-800">
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              This week
            </p>
            <p className="mt-2 text-lg text-zinc-200">
              <b className="text-orange-400">{weeklyStats.total}</b> indie
              projects + ideas buried.
              {weeklyStats.topCause && (
                <>
                  {" "}
                  <span className="text-zinc-400">
                    #1 cause:{" "}
                    <Link
                      href={`/funeral/wall?cause=${weeklyStats.topCause.key}`}
                      className="text-zinc-200 underline hover:text-orange-400"
                    >
                      {CAUSE_LABELS[weeklyStats.topCause.key]?.emoji}{" "}
                      {CAUSE_LABELS[weeklyStats.topCause.key]?.label}
                    </Link>
                    {" "}({weeklyStats.topCause.count})
                  </span>
                </>
              )}
            </p>
            {weeklyStats.topMourners.length > 0 && (
              <div className="mt-4 border-t border-zinc-800 pt-3">
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                  Top mourners
                </p>
                <ul className="mt-2 flex flex-wrap justify-center gap-2 text-sm">
                  {weeklyStats.topMourners.map((m, i) => (
                    <li
                      key={m.name}
                      className="rounded-full bg-black/40 px-3 py-1.5 ring-1 ring-zinc-800"
                    >
                      <span className="text-orange-400">#{i + 1}</span>{" "}
                      <span className="text-zinc-200">{m.name}</span>{" "}
                      <span className="text-zinc-500">({m.count})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Cause-of-death filter pills */}
        <nav
          aria-label="Filter by cause of death"
          className="mb-8 flex flex-wrap justify-center gap-2 text-xs"
        >
          <Link
            href="/funeral/wall"
            className={`rounded-full px-3 py-1.5 ring-1 ${
              cause === null
                ? "bg-orange-500 text-black ring-orange-500"
                : "text-zinc-400 ring-zinc-700 hover:text-zinc-200"
            }`}
          >
            All
          </Link>
          {Object.entries(CAUSE_LABELS).map(([key, meta]) => (
            <Link
              key={key}
              href={`/funeral/wall?cause=${key}`}
              className={`rounded-full px-3 py-1.5 ring-1 ${
                cause === key
                  ? "bg-orange-500 text-black ring-orange-500"
                  : "text-zinc-400 ring-zinc-700 hover:text-zinc-200"
              }`}
            >
              {meta.emoji} {meta.label}
            </Link>
          ))}
        </nav>

        {rows.length === 0 ? (
          <p className="text-center text-zinc-500">
            {cause
              ? `No memorials with cause "${CAUSE_LABELS[cause]?.label}". Try another filter.`
              : "No memorials yet. Be the first to bury something."}
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {rows.map((r) => {
              const meta = r.cause_of_death ? CAUSE_LABELS[r.cause_of_death] : null;
              const href = r.kind === "repo" ? `/funeral/${r.id}` : `/funeral/idea/${r.id}`;
              return (
                <Link
                  key={`${r.kind}-${r.id}`}
                  href={href}
                  className="block rounded-2xl bg-zinc-900/60 p-5 ring-1 ring-zinc-800 transition hover:bg-zinc-900 hover:ring-orange-500/30"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="text-2xl">
                        {r.kind === "repo" ? "🪦" : "💭"}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-serif text-lg font-bold text-zinc-100">
                          {r.deceased_name}
                        </p>
                        <p className="truncate text-xs text-zinc-500">{r.subline}</p>
                      </div>
                    </div>
                    {meta && (
                      // Parchment chip per
                      // docs/specs/2026-06-14-funeral-visual-upgrade-spec.md
                      // step 7. Wall background stays dark (density matters here);
                      // identity comes from the cards previewing the parchment
                      // surface used on memorial pages.
                      <span
                        className="shrink-0 rounded-full px-2 py-1 text-[10px] uppercase tracking-wider"
                        title={meta.label}
                        style={{
                          background: "var(--funeral-parchment)",
                          color: "var(--funeral-burgundy)",
                          border: "1px solid var(--funeral-burgundy)",
                        }}
                      >
                        {meta.emoji} {meta.label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500">
                    buried {new Date(r.created_at).toISOString().slice(0, 10)}
                  </p>
                </Link>
              );
            })}
          </div>
        )}

        <footer className="mt-16 text-center text-xs text-zinc-600">
          Public wall · most recent 60 ·{" "}
          <Link href="/" className="text-orange-400 hover:underline">
            VibeXForge
          </Link>
        </footer>
      </div>
    </main>
  );
}
