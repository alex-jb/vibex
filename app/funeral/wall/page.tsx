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

export const metadata = {
  title: "🪦 Memorial Wall — A Funeral for Your Side Project",
  description: "The public memorial wall. Recent dead projects + ideas given a proper send-off.",
};

export default async function MemorialWall({ searchParams }: PageProps) {
  const { cause: rawCause } = await searchParams;
  const cause = rawCause && CAUSE_LABELS[rawCause] ? rawCause : null;
  const rows = await fetchWall(cause);
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
                      <span
                        className="shrink-0 rounded-full bg-black/40 px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-400 ring-1 ring-zinc-800"
                        title={meta.label}
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
