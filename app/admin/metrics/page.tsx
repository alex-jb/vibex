/**
 * /admin/metrics — internal launch-day dashboard.
 *
 * Built for the 2026-05-13 launch sprint. Alex hits this URL while
 * monitoring the PH / HN / Reddit / LinkedIn rollout to see in real
 * time which channel is converting.
 *
 * Auth: hard-gated by ADMIN_EMAILS env var (comma-separated list).
 * If empty/missing, only alex@vibexforge.com falls through. Anyone
 * else gets a 404 (not 403 — we don't even acknowledge the page
 * exists for non-admins).
 *
 * Data: read directly via server supabase client. Uses the
 * SUPABASE_SERVICE_ROLE_KEY when present (so signup_ref counts
 * include creators that opt out of public read), otherwise falls
 * back to anon-key + RLS.
 *
 * Revalidate: 60s. Alex refreshes the page on launch day to see
 * the latest counts. Cheap because the queries are small (5-50
 * rows max with our user count).
 */
import { notFound } from "next/navigation";
import { createServerSupabase, getAuthUser } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const revalidate = 60;
export const metadata = {
  title: "Admin · Metrics",
  robots: { index: false, follow: false },
};

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "alex@vibexforge.com")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

type RefBucket = { ref: string; count: number };
type RecentEntry = { id: string; title: string; created_at: string; signup_ref?: string | null };

async function loadMetrics() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // Prefer service role so we can read columns REVOKEd from anon
  // (creators.email, creators.signup_ref column-level grants are
  // anon-revoked in migrations 049 + 052).
  const supa = serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const now = new Date();
  const day = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const week = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: signups24h },
    { count: signups7d },
    { count: projects24h },
    { count: projects7d },
    { count: emailOptOuts },
    { data: refRows },
    { data: recentCreators },
    { data: recentProjects },
    { data: stageCounts },
  ] = await Promise.all([
    supa.from("creators").select("id", { count: "exact", head: true }).gte("created_at", day),
    supa.from("creators").select("id", { count: "exact", head: true }).gte("created_at", week),
    supa.from("projects").select("id", { count: "exact", head: true }).gte("created_at", day),
    supa.from("projects").select("id", { count: "exact", head: true }).gte("created_at", week),
    supa.from("creators").select("id", { count: "exact", head: true }).eq("email_opt_out", true),
    supa
      .from("creators")
      .select("signup_ref")
      .gte("created_at", week),
    supa
      .from("creators")
      .select("id, name, created_at, signup_ref, email")
      .order("created_at", { ascending: false })
      .limit(15),
    supa
      .from("projects")
      .select("id, title, created_at, evolution_stage, score")
      .order("created_at", { ascending: false })
      .limit(15),
    supa
      .from("projects")
      .select("evolution_stage")
      .gte("created_at", week),
  ]);

  // Bucket signup_ref counts.
  const refBuckets = new Map<string, number>();
  for (const row of refRows || []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = (row as any).signup_ref || "(direct)";
    refBuckets.set(r, (refBuckets.get(r) || 0) + 1);
  }
  const refList: RefBucket[] = Array.from(refBuckets.entries())
    .map(([ref, count]) => ({ ref, count }))
    .sort((a, b) => b.count - a.count);

  // Bucket evolution stage distribution.
  const stageBuckets = new Map<string, number>();
  for (const row of stageCounts || []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = (row as any).evolution_stage || "Seed";
    stageBuckets.set(s, (stageBuckets.get(s) || 0) + 1);
  }

  return {
    signups24h: signups24h ?? 0,
    signups7d: signups7d ?? 0,
    projects24h: projects24h ?? 0,
    projects7d: projects7d ?? 0,
    emailOptOuts: emailOptOuts ?? 0,
    refList,
    recentCreators: (recentCreators || []) as unknown as RecentEntry[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recentProjects: (recentProjects || []) as any[],
    stageBuckets: Object.fromEntries(stageBuckets) as Record<string, number>,
  };
}

export default async function AdminMetricsPage() {
  // Gate: must be authenticated AND on the allowlist.
  await createServerSupabase(); // ensures cookies are read
  const user = await getAuthUser();
  if (!user?.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    notFound();
  }

  const m = await loadMetrics();

  const stages = ["Seed", "Active", "Growing", "Breakout", "Legend", "Myth"];

  return (
    <main className="min-h-screen bg-[var(--bg-deep)] px-6 py-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-pixel text-xs uppercase tracking-wider text-violet-300 mb-1">
          ▸ ADMIN · METRICS
        </h1>
        <p className="text-foreground/50 text-sm mb-8">
          Auto-refreshes every 60 seconds. {user.email} · {new Date().toUTCString()}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Stat label="Signups · 24h" value={m.signups24h} />
          <Stat label="Signups · 7d" value={m.signups7d} />
          <Stat label="Projects · 24h" value={m.projects24h} />
          <Stat label="Projects · 7d" value={m.projects7d} />
        </div>

        <Section title="Signup channel attribution · 7d">
          {m.refList.length === 0 ? (
            <Empty>No new creators in the last 7 days.</Empty>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-foreground/50 text-xs uppercase">
                <tr>
                  <th className="text-left py-2">Channel</th>
                  <th className="text-right py-2">Signups</th>
                  <th className="text-right py-2">Share</th>
                </tr>
              </thead>
              <tbody>
                {m.refList.map((r) => {
                  const total = m.refList.reduce((s, x) => s + x.count, 0);
                  const pct = total > 0 ? ((r.count / total) * 100).toFixed(0) : "0";
                  return (
                    <tr key={r.ref} className="border-t border-white/5">
                      <td className="py-2 text-foreground/90">
                        {r.ref === "(direct)" ? (
                          <span className="text-foreground/40">(direct / no ref)</span>
                        ) : (
                          <code className="text-violet-300">{r.ref}</code>
                        )}
                      </td>
                      <td className="py-2 text-right tabular-nums">{r.count}</td>
                      <td className="py-2 text-right tabular-nums text-foreground/60">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Section>

        <Section title="Evolution stage distribution · 7d">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {stages.map((s) => (
              <div
                key={s}
                className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-center"
              >
                <div className="font-pixel text-[9px] uppercase tracking-wider text-foreground/50">
                  {s}
                </div>
                <div className="text-2xl font-mono font-bold tabular-nums mt-1">
                  {m.stageBuckets[s] || 0}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Last 15 creators">
          {m.recentCreators.length === 0 ? (
            <Empty>No creators yet.</Empty>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {m.recentCreators.map((c) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const row = c as any;
                return (
                  <li
                    key={row.id}
                    className="flex items-center gap-3 px-3 py-2 rounded border border-white/5 bg-white/[0.02]"
                  >
                    <span className="text-foreground/90 flex-1 truncate">
                      @{row.name}{" "}
                      <span className="text-foreground/40 text-xs">{row.email || "(no email)"}</span>
                    </span>
                    <span className="text-violet-300 text-xs font-mono">
                      {row.signup_ref || "—"}
                    </span>
                    <span className="text-foreground/40 text-xs tabular-nums">
                      {new Date(row.created_at).toLocaleString()}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        <Section title="Last 15 projects">
          {m.recentProjects.length === 0 ? (
            <Empty>No projects yet.</Empty>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {m.recentProjects.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 px-3 py-2 rounded border border-white/5 bg-white/[0.02]"
                >
                  <span className="text-foreground/90 flex-1 truncate">{p.title}</span>
                  <span className="text-emerald-300 text-xs">
                    {p.evolution_stage || "Seed"}
                  </span>
                  <span className="text-foreground/60 text-xs tabular-nums">
                    {p.score ?? "—"}/100
                  </span>
                  <span className="text-foreground/40 text-xs tabular-nums">
                    {new Date(p.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Email">
          <div className="text-sm text-foreground/70">
            <span className="tabular-nums">{m.emailOptOuts}</span> creators have opted out of email.
          </div>
        </Section>

        <p className="text-foreground/30 text-xs mt-12 text-center">
          Set <code>ADMIN_EMAILS=alex@vibexforge.com,…</code> in Vercel env to add admins. Defaults to alex@vibexforge.com only.
        </p>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="font-pixel text-[9px] uppercase tracking-wider text-foreground/50">
        {label}
      </div>
      <div className="text-3xl font-mono font-bold tabular-nums mt-2 text-violet-200">
        {value}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-pixel text-[11px] uppercase tracking-wider text-emerald-300 mb-3">
        ▸ {title}
      </h2>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-foreground/40 text-sm italic px-3 py-6 rounded border border-dashed border-white/10 text-center">
      {children}
    </div>
  );
}
