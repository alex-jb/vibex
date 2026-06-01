import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 60; // 1-min ISR — wall freshness vs cost

interface FuneralRow {
  id: string;
  deceased_name: string;
  repo_owner: string;
  stars: number;
  language: string | null;
  age_days_alive: number | null;
  created_at: string;
  ash_image_url: string | null;
}

async function fetchRecentWall(): Promise<FuneralRow[]> {
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!SUPA_URL || !SUPA_ANON_KEY) return [];
  const supa = createClient(SUPA_URL, SUPA_ANON_KEY);
  const { data } = await supa
    .from("funerals")
    .select(
      "id, deceased_name, repo_owner, stars, language, age_days_alive, created_at, ash_image_url",
    )
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(50);
  return data || [];
}

export const metadata = {
  title: "🪦 Memorial Wall — A Funeral for Your Side Project",
  description:
    "The public memorial wall. Recent dead projects given a proper send-off.",
};

export default async function MemorialWall() {
  const rows = await fetchRecentWall();
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-200 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-12 text-center">
          <div className="mb-3 text-5xl">🪦</div>
          <h1 className="font-serif text-4xl font-bold">Memorial Wall</h1>
          <p className="mt-3 text-sm text-zinc-400">
            Recent goodbyes to the dead side projects.
            <br />
            <Link href="/funeral" className="text-orange-400 hover:underline">
              Bury one of your own →
            </Link>
          </p>
        </header>

        {rows.length === 0 ? (
          <p className="text-center text-zinc-500">
            No memorials yet. Be the first to bury a project.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {rows.map((r) => (
              <Link
                key={r.id}
                href={`/funeral/${r.id}`}
                className="block rounded-2xl bg-zinc-900/60 p-5 ring-1 ring-zinc-800 transition hover:bg-zinc-900 hover:ring-orange-500/30"
              >
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-2xl">🕯️</span>
                  <div>
                    <p className="font-serif text-lg font-bold text-zinc-100">
                      {r.deceased_name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {r.repo_owner}/{r.deceased_name}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-zinc-500">
                  ⭐ {r.stars}
                  {r.language && ` · ${r.language}`}
                  {r.age_days_alive !== null &&
                    ` · lived ${r.age_days_alive}d`}
                  {" · buried "}
                  {new Date(r.created_at).toISOString().slice(0, 10)}
                </p>
              </Link>
            ))}
          </div>
        )}

        <footer className="mt-16 text-center text-xs text-zinc-600">
          Public wall · 50 most recent ·{" "}
          <Link href="/" className="text-orange-400 hover:underline">
            VibeXForge
          </Link>
        </footer>
      </div>
    </main>
  );
}
