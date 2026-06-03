/**
 * /admin/cracked-waitlist — Cracked Score Phase 2 trigger dashboard.
 *
 * Shows count + recent signups. Phase 2 scoring engine kicks off when
 * count crosses ~200 (configurable in code).
 *
 * Auth: ADMIN_EMAILS-gated (404 for non-admins, matches /admin/metrics).
 */
import { notFound } from "next/navigation";
import { createServerSupabase, getAuthUser } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";
import { AdminNav } from "@/components/admin/admin-nav";

export const runtime = "nodejs";
export const revalidate = 60;
export const metadata = {
  title: "Admin · Cracked Waitlist",
  robots: { index: false, follow: false },
};

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "alex@vibexforge.com")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

const PHASE2_THRESHOLD = 200;

interface Row {
  email: string;
  github_handle: string;
  created_at: string;
  scored_at: string | null;
  score: number | null;
}

export default async function CrackedWaitlistPage() {
  const auth = await getAuthUser();
  const email = auth?.email?.toLowerCase() || "";
  if (!ADMIN_EMAILS.includes(email)) notFound();

  const supa =
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
      : await createServerSupabase();

  const day = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const week = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: total }, { count: last24h }, { count: last7d }, { data: recent }] =
    await Promise.all([
      supa.from("cracked_waitlist").select("id", { count: "exact", head: true }),
      supa.from("cracked_waitlist").select("id", { count: "exact", head: true }).gte("created_at", day),
      supa.from("cracked_waitlist").select("id", { count: "exact", head: true }).gte("created_at", week),
      supa
        .from("cracked_waitlist")
        .select("email, github_handle, created_at, scored_at, score")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  const totalN = total ?? 0;
  const pct = Math.min((totalN / PHASE2_THRESHOLD) * 100, 100);
  const rows = (recent as Row[] | null) || [];
  const trigger = totalN >= PHASE2_THRESHOLD;

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-zinc-200">
      <div className="mx-auto max-w-4xl">
        <AdminNav current="/admin/cracked-waitlist" />
        <header className="mb-8">
          <p className="text-xs uppercase tracking-widest text-orange-400">
            Admin · Cracked Waitlist
          </p>
          <h1 className="mt-2 text-3xl font-bold">🧠 Cracked Score Phase 2 readiness</h1>
        </header>

        <section className="mb-8 rounded-2xl bg-zinc-900/60 p-6 ring-1 ring-zinc-800">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-black/40 p-4 ring-1 ring-zinc-800">
              <p className="text-3xl font-bold">{totalN}</p>
              <p className="text-xs text-zinc-400">All-time signups</p>
            </div>
            <div className="rounded-xl bg-black/40 p-4 ring-1 ring-zinc-800">
              <p className="text-3xl font-bold">{last7d ?? 0}</p>
              <p className="text-xs text-zinc-400">Last 7 days</p>
            </div>
            <div className="rounded-xl bg-black/40 p-4 ring-1 ring-zinc-800">
              <p className="text-3xl font-bold">{last24h ?? 0}</p>
              <p className="text-xs text-zinc-400">Last 24h</p>
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-1 flex justify-between text-xs text-zinc-400">
              <span>Progress to Phase 2 ship trigger</span>
              <span>
                {totalN} / {PHASE2_THRESHOLD}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
              <div
                className={`h-3 ${trigger ? "bg-green-500" : "bg-orange-500"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {trigger && (
              <p className="mt-3 rounded-xl bg-green-500/10 p-3 text-sm text-green-300 ring-1 ring-green-500/30">
                ✅ Threshold reached. Phase 2 scoring engine cleared to ship.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-zinc-900/60 p-6 ring-1 ring-zinc-800">
          <h2 className="mb-4 text-lg font-semibold">Recent signups (50 most recent)</h2>
          {rows.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No signups yet. Once /cracked goes live, this fills.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
                    <th className="px-2 py-2 text-left">When</th>
                    <th className="px-2 py-2 text-left">GitHub</th>
                    <th className="px-2 py-2 text-left">Email</th>
                    <th className="px-2 py-2 text-right">Scored?</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const ageDays = Math.floor(
                      (Date.now() - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 24),
                    );
                    return (
                      <tr
                        key={`${r.email}-${r.github_handle}`}
                        className="border-b border-zinc-800/60 hover:bg-black/20"
                      >
                        <td className="px-2 py-2 text-xs text-zinc-500">
                          {ageDays === 0 ? "today" : ageDays === 1 ? "1d ago" : `${ageDays}d ago`}
                        </td>
                        <td className="px-2 py-2">
                          <a
                            href={`https://github.com/${r.github_handle}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-orange-400 hover:underline"
                          >
                            @{r.github_handle}
                          </a>
                        </td>
                        <td className="px-2 py-2 text-zinc-400">{r.email}</td>
                        <td className="px-2 py-2 text-right text-xs">
                          {r.scored_at ? `✓ ${r.score}/100` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="mt-10 text-center text-xs text-zinc-600">
          Phase 2 unlocks GitHub OAuth + 12-axis scoring engine.
        </footer>
      </div>
    </main>
  );
}
