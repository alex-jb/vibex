"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

/**
 * /dashboard — Creator's project + draft + reach overview.
 *
 * The retention loop. Creator submits a project, drafts get generated,
 * email pulls them back to /project/[id]/drafts, but for repeat visits
 * they need a HOME. This is it.
 *
 * Shows:
 *   - All their projects
 *   - Per-project draft status (pending / approved / posted / rejected)
 *   - Aggregate reach when posted drafts have stats logged
 *   - CTA to submit a new project
 *
 * Auth-required. Server-side data filtered by RLS (each row keyed to
 * the auth.uid() via creators.auth_user_id → projects.creator_id).
 */

interface ProjectRow {
  id: string;
  title: string;
  tagline: string;
  evolution_stage: string | null;
  score: number | null;
  views: number | null;
  upvotes: number | null;
  created_at: string;
  draft_counts?: {
    pending: number;
    approved: number;
    posted: number;
    rejected: number;
    failed: number;
  };
}

const STAGE_COLOR: Record<string, string> = {
  Seed: "#6B6E76",
  Active: "#39FF14",
  Growing: "#FACC15",
  Breakout: "#FF8800",
  Legend: "#FF4500",
  Myth: "#A855F7",
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState<{ name: string; id: string } | null>(null);

  const loadAll = useCallback(async () => {
    if (!user) return;
    const { data: c } = await supabase
      .from("creators")
      .select("id, name")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    if (!c) return;
    setCreator(c as { name: string; id: string });

    const { data: pjs } = await supabase
      .from("projects")
      .select("id, title, tagline, evolution_stage, score, views, upvotes, created_at")
      .eq("creator_id", c.id)
      .order("created_at", { ascending: false });
    if (!pjs) {
      setProjects([]);
      return;
    }

    const projectIds = (pjs as ProjectRow[]).map((p) => p.id);
    if (projectIds.length === 0) {
      setProjects([]);
      return;
    }
    const { data: drafts } = await supabase
      .from("project_drafts")
      .select("project_id, status")
      .in("project_id", projectIds);
    const counts = new Map<
      string,
      { pending: number; approved: number; posted: number; rejected: number; failed: number }
    >();
    for (const d of drafts || []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row = d as any;
      const cur =
        counts.get(row.project_id) ||
        ({ pending: 0, approved: 0, posted: 0, rejected: 0, failed: 0 } as {
          pending: number;
          approved: number;
          posted: number;
          rejected: number;
          failed: number;
        });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (cur as any)[row.status] = ((cur as any)[row.status] || 0) + 1;
      counts.set(row.project_id, cur);
    }
    const enriched = (pjs as ProjectRow[]).map((p) => ({
      ...p,
      draft_counts: counts.get(p.id) || {
        pending: 0,
        approved: 0,
        posted: 0,
        rejected: 0,
        failed: 0,
      },
    }));
    setProjects(enriched);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      await loadAll();
      setLoading(false);
    })();

    if (!user) return;
    const channel = supabase
      .channel("dashboard-drafts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "project_drafts" },
        () => loadAll(),
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [authLoading, user, loadAll]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-[var(--bg-deep)] p-8">
        <p className="text-foreground/60">Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[var(--bg-deep)] p-8">
        <div className="max-w-md mx-auto mt-20 text-center">
          <p className="text-foreground/70 mb-4">
            Sign in to view your creator dashboard.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 rounded bg-violet-600 hover:bg-violet-500 text-white font-pixel text-[10px] uppercase tracking-wider"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  const totals = projects.reduce(
    (acc, p) => ({
      pending: acc.pending + (p.draft_counts?.pending || 0),
      approved: acc.approved + (p.draft_counts?.approved || 0),
      posted: acc.posted + (p.draft_counts?.posted || 0),
      views: acc.views + (p.views || 0),
      upvotes: acc.upvotes + (p.upvotes || 0),
    }),
    { pending: 0, approved: 0, posted: 0, views: 0, upvotes: 0 },
  );

  return (
    <main className="min-h-screen bg-[var(--bg-deep)] px-4 sm:px-8 py-10">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <p className="font-pixel text-[10px] uppercase tracking-wider text-violet-400/70 mb-1">
            ▸ CREATOR DASHBOARD
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            欢迎回来,{creator?.name || "creator"}
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            你的项目 · 草稿状态 · 跨平台曝光数据
          </p>
        </header>

        {/* Stat tiles */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Stat label="Projects" value={projects.length} />
          <Stat
            label="Drafts pending review"
            value={totals.pending}
            accent={totals.pending > 0 ? "violet" : undefined}
          />
          <Stat label="Drafts posted" value={totals.posted} accent="emerald" />
          <Stat label="Total reach (views)" value={totals.views} />
        </section>

        {/* CTA */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            href="/launch"
            className="px-4 py-2 rounded bg-[#FF4500] hover:bg-[#FF6633] text-black font-pixel text-[10px] uppercase tracking-wider"
            style={{ boxShadow: "4px 4px 0 #000" }}
          >
            ▶ Submit new project
          </Link>
          <Link
            href="/how-it-works"
            className="px-4 py-2 rounded border border-white/15 hover:bg-white/5 text-foreground/80 font-pixel text-[10px] uppercase tracking-wider"
          >
            How it works
          </Link>
          <Link
            href={`/profile/${creator?.id}`}
            className="px-4 py-2 rounded border border-white/15 hover:bg-white/5 text-foreground/80 font-pixel text-[10px] uppercase tracking-wider"
          >
            Public profile →
          </Link>
        </div>

        {/* Projects list */}
        <section>
          <h2 className="font-pixel text-[11px] uppercase tracking-wider text-emerald-300 mb-4">
            ▸ YOUR PROJECTS ({projects.length})
          </h2>
          {projects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] p-10 text-center">
              <p className="text-foreground/60 mb-4">
                No projects yet.
              </p>
              <p className="text-foreground/40 text-sm mb-6">
                Submit your first AI project. Our agents will write 10+
                platform-specific posts in 5 seconds.
              </p>
              <Link
                href="/launch"
                className="inline-block px-6 py-3 rounded bg-[#FF4500] hover:bg-[#FF6633] text-black font-pixel text-[10px] uppercase tracking-wider"
                style={{ boxShadow: "4px 4px 0 #000" }}
              >
                ▶ Submit first project
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((p) => (
                <ProjectRow key={p.id} project={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "violet" | "emerald";
}) {
  const color =
    accent === "violet"
      ? "text-violet-300"
      : accent === "emerald"
      ? "text-emerald-300"
      : "text-foreground";
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="font-pixel text-[9px] uppercase tracking-wider text-foreground/50">
        {label}
      </p>
      <p className={`text-2xl font-mono font-bold tabular-nums mt-2 ${color}`}>
        {value}
      </p>
    </div>
  );
}

function ProjectRow({ project }: { project: ProjectRow }) {
  const stage = project.evolution_stage || "Seed";
  const stageColor = STAGE_COLOR[stage] || "#6B6E76";
  const counts = project.draft_counts;
  const totalDrafts = counts
    ? counts.pending + counts.approved + counts.posted + counts.rejected
    : 0;

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors">
      <div className="flex items-start gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Link
              href={`/project/${project.id}`}
              className="font-bold text-foreground hover:text-violet-200 truncate"
            >
              {project.title}
            </Link>
            <span
              className="text-[9px] px-2 py-0.5 rounded font-pixel uppercase tracking-wider"
              style={{
                color: stageColor,
                border: `1px solid ${stageColor}40`,
                background: `${stageColor}10`,
              }}
            >
              {stage}
            </span>
            {project.score !== null && (
              <span className="text-[10px] text-foreground/50 font-mono">
                {project.score}/100
              </span>
            )}
          </div>
          <p className="text-foreground/60 text-sm mb-3 line-clamp-1">
            {project.tagline}
          </p>

          {/* Draft pipeline */}
          <div className="flex items-center gap-3 text-xs flex-wrap">
            {totalDrafts === 0 ? (
              <span className="text-foreground/40 italic">
                No drafts yet
              </span>
            ) : (
              <>
                {counts && counts.pending > 0 && (
                  <Pill color="violet" label={`${counts.pending} pending`} />
                )}
                {counts && counts.approved > 0 && (
                  <Pill color="yellow" label={`${counts.approved} approved`} />
                )}
                {counts && counts.posted > 0 && (
                  <Pill color="emerald" label={`${counts.posted} posted ✓`} />
                )}
                {counts && counts.rejected > 0 && (
                  <Pill color="red" label={`${counts.rejected} rejected`} />
                )}
              </>
            )}
            <span className="text-foreground/40">·</span>
            <span className="text-foreground/50">
              {project.views || 0} views · {project.upvotes || 0} upvotes
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/project/${project.id}/drafts`}
            className="px-3 py-1.5 rounded text-xs border border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10 text-violet-300"
          >
            ✨ Drafts
          </Link>
          <Link
            href={`/project/${project.id}`}
            className="px-3 py-1.5 rounded text-xs border border-white/10 hover:bg-white/5 text-foreground/70"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}

function Pill({
  color,
  label,
}: {
  color: "violet" | "yellow" | "emerald" | "red";
  label: string;
}) {
  const map: Record<string, string> = {
    violet: "border-violet-500/30 bg-violet-500/5 text-violet-300",
    yellow: "border-yellow-500/30 bg-yellow-500/5 text-yellow-300",
    emerald: "border-emerald-500/30 bg-emerald-500/5 text-emerald-300",
    red: "border-red-500/30 bg-red-500/5 text-red-400",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-medium border ${map[color]}`}
    >
      {label}
    </span>
  );
}
