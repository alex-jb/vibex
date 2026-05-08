"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/i18n";
import { EmptyState } from "@/components/empty-state";
import { SkeletonStatTile } from "@/components/skeleton";

const ONBOARDING_DISMISSED_KEY = "vibex-onboarding-dismissed";

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
  title_zh: string | null;
  tagline: string;
  tagline_zh: string | null;
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
  cross_platform_reach?: {
    views: number;
    likes: number;
    comments: number;
  };
}

const STAGE_COLOR: Record<string, string> = {
  Seed: "#6B6E76",
  Active: "#39FF14",
  Growing: "#FACC15",
  Breakout: "#FF8800",
  Legend: "#F97316",
  Myth: "#A855F7",
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { lang } = useLang();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState<{ name: string; id: string } | null>(null);
  const [credits, setCredits] = useState<{ used: number; cap: number } | null>(null);

  const loadAll = useCallback(async () => {
    if (!user) return;
    const { data: c } = await supabase
      .from("creators")
      .select("id, name")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    if (!c) return;
    setCreator(c as { name: string; id: string });

    // Pull today's credit usage (D5 cost gate). Lookup-only RPC, no
    // credits consumed.
    const { data: creditsData } = await supabase.rpc("get_draft_credits", {
      p_creator_id: (c as { id: string }).id,
      p_cap: 100,
    });
    if (creditsData && typeof creditsData === "object") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cd = creditsData as any;
      setCredits({ used: cd.used || 0, cap: cd.cap || 100 });
    }

    const { data: pjs } = await supabase
      .from("projects")
      .select("id, title, title_zh, tagline, tagline_zh, evolution_stage, score, views, upvotes, created_at")
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
      .select("project_id, status, views, likes, comments")
      .in("project_id", projectIds);
    const counts = new Map<
      string,
      { pending: number; approved: number; posted: number; rejected: number; failed: number }
    >();
    const reachByProject = new Map<
      string,
      { views: number; likes: number; comments: number }
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

      if (row.status === "posted") {
        const r =
          reachByProject.get(row.project_id) || { views: 0, likes: 0, comments: 0 };
        r.views += row.views || 0;
        r.likes += row.likes || 0;
        r.comments += row.comments || 0;
        reachByProject.set(row.project_id, r);
      }
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
      cross_platform_reach: reachByProject.get(p.id) || {
        views: 0,
        likes: 0,
        comments: 0,
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

  // CRITICAL: derived state must be calculated BEFORE the early
  // returns below. Otherwise the useMemo gets called conditionally,
  // which trips React error #310 (hooks-order violation) when auth
  // state transitions from loading to ready. Caught in prod 2026-05-09.
  const totals = projects.reduce(
    (acc, p) => ({
      pending: acc.pending + (p.draft_counts?.pending || 0),
      approved: acc.approved + (p.draft_counts?.approved || 0),
      posted: acc.posted + (p.draft_counts?.posted || 0),
      reachViews: acc.reachViews + (p.cross_platform_reach?.views || 0),
      reachLikes: acc.reachLikes + (p.cross_platform_reach?.likes || 0),
      reachComments: acc.reachComments + (p.cross_platform_reach?.comments || 0),
    }),
    { pending: 0, approved: 0, posted: 0, reachViews: 0, reachLikes: 0, reachComments: 0 },
  );
  const totalEngagement =
    totals.reachViews + totals.reachLikes + totals.reachComments;

  // Onboarding quest state — derives from data; persisted dismissal
  // stored in localStorage so a creator who chose Skip stays dismissed
  // across sessions.
  const onboardingProgress = useMemo(
    () => ({
      step1Done: projects.length > 0,
      step2Done: totals.approved + totals.posted > 0,
      step3Done: totals.posted >= 5,
    }),
    [projects.length, totals.approved, totals.posted],
  );
  const onboardingComplete =
    onboardingProgress.step1Done &&
    onboardingProgress.step2Done &&
    onboardingProgress.step3Done;

  // Early returns AFTER all hooks have been called — moves of these
  // before the useMemo above would re-introduce the hooks-order
  // violation that produced React error #310.
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
            className="inline-block px-6 py-3 rounded bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-deep)] px-4 sm:px-8 py-10">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <p className="font-pixel text-[10px] uppercase tracking-wider text-violet-400/70 mb-1">
            ▸ CREATOR DASHBOARD
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {lang === "zh"
              ? `欢迎回来,${creator?.name || "creator"}`
              : `Welcome back, ${creator?.name || "creator"}`}
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            {lang === "zh"
              ? "你的项目 · 草稿状态 · 跨平台曝光数据"
              : "Your projects · draft pipeline · cross-platform reach"}
          </p>
        </header>

        <OnboardingQuest
          progress={onboardingProgress}
          complete={onboardingComplete}
          lang={lang}
          firstProjectId={projects[0]?.id}
        />

        {credits ? <CreditsBar credits={credits} lang={lang} /> : null}

        {/* Stat tiles */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Stat
            label={lang === "zh" ? "项目" : "Projects"}
            value={projects.length}
          />
          <Stat
            label={lang === "zh" ? "待审核草稿" : "Drafts pending review"}
            value={totals.pending}
            accent={totals.pending > 0 ? "violet" : undefined}
          />
          <Stat
            label={lang === "zh" ? "已发布草稿" : "Drafts posted"}
            value={totals.posted}
            accent="emerald"
          />
          <Stat
            label={
              lang === "zh"
                ? "跨平台互动"
                : "Cross-platform engagement"
            }
            value={totalEngagement}
            accent={totalEngagement > 0 ? "emerald" : undefined}
          />
        </section>

        {/* CTA */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            href="/launch"
            className="px-5 py-2.5 rounded-md bg-[#F97316] hover:bg-[#FB923C] text-black text-sm font-semibold"
            style={{ boxShadow: "4px 4px 0 #000" }}
          >
            {lang === "zh" ? "▶ 提交新项目" : "▶ Submit new project"}
          </Link>
          <Link
            href="/how-it-works"
            className="px-5 py-2.5 rounded-md border border-white/15 hover:bg-white/5 text-foreground/85 text-sm font-medium"
          >
            {lang === "zh" ? "怎么用" : "How it works"}
          </Link>
          <Link
            href={`/profile/${creator?.id}`}
            className="px-5 py-2.5 rounded-md border border-white/15 hover:bg-white/5 text-foreground/85 text-sm font-medium"
          >
            {lang === "zh" ? "公开主页 →" : "Public profile →"}
          </Link>
        </div>

        {/* Projects list */}
        <section>
          <h2 className="font-pixel text-[11px] uppercase tracking-[1.5px] text-emerald-300 mb-4">
            ▸ {lang === "zh" ? "你的项目" : "YOUR PROJECTS"} ({projects.length})
          </h2>
          {projects.length === 0 ? (
            <EmptyState
              kind="projects"
              accent="forge"
              title={lang === "zh" ? "还没有项目" : "No projects yet"}
              description={
                lang === "zh"
                  ? "提交你的第一个 AI 项目。我们的 agent 在 10 秒内为你写好 17 张平台专属草稿。"
                  : "Submit your first AI project. Our agents write 17 platform-native posts in 10 seconds."
              }
              ctaLabel={
                lang === "zh" ? "提交第一个项目 →" : "Submit your first project →"
              }
              ctaHref="/launch"
            />
          ) : (
            <div className="space-y-3">
              {projects.map((p) => (
                <ProjectRow key={p.id} project={p} lang={lang} />
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

function ProjectRow({
  project,
  lang,
}: {
  project: ProjectRow;
  lang: "en" | "zh";
}) {
  const stage = project.evolution_stage || "Seed";
  const stageColor = STAGE_COLOR[stage] || "#6B6E76";
  const counts = project.draft_counts;
  const totalDrafts = counts
    ? counts.pending + counts.approved + counts.posted + counts.rejected
    : 0;
  const displayTitle =
    lang === "zh" && project.title_zh ? project.title_zh : project.title;
  const displayTagline =
    lang === "zh" && project.tagline_zh ? project.tagline_zh : project.tagline;

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors">
      <div className="flex items-start gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Link
              href={`/project/${project.id}`}
              className="font-bold text-foreground hover:text-violet-200 truncate"
            >
              {displayTitle}
            </Link>
            <span
              className="text-[10px] px-2 py-0.5 rounded uppercase font-medium"
              style={{
                color: stageColor,
                border: `1px solid ${stageColor}40`,
                background: `${stageColor}10`,
                letterSpacing: "0.05em",
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
            {displayTagline}
          </p>

          {/* Draft pipeline */}
          <div className="flex items-center gap-3 text-xs flex-wrap">
            {totalDrafts === 0 ? (
              <span className="text-foreground/40 italic">
                {lang === "zh" ? "暂无草稿" : "No drafts yet"}
              </span>
            ) : (
              <>
                {counts && counts.pending > 0 && (
                  <Pill
                    color="violet"
                    label={
                      lang === "zh"
                        ? `${counts.pending} 待审`
                        : `${counts.pending} pending`
                    }
                  />
                )}
                {counts && counts.approved > 0 && (
                  <Pill
                    color="yellow"
                    label={
                      lang === "zh"
                        ? `${counts.approved} 已批`
                        : `${counts.approved} approved`
                    }
                  />
                )}
                {counts && counts.posted > 0 && (
                  <Pill
                    color="emerald"
                    label={
                      lang === "zh"
                        ? `${counts.posted} 已发 ✓`
                        : `${counts.posted} posted ✓`
                    }
                  />
                )}
                {counts && counts.rejected > 0 && (
                  <Pill
                    color="red"
                    label={
                      lang === "zh"
                        ? `${counts.rejected} 已拒`
                        : `${counts.rejected} rejected`
                    }
                  />
                )}
              </>
            )}
            {project.cross_platform_reach &&
              (project.cross_platform_reach.views > 0 ||
                project.cross_platform_reach.likes > 0 ||
                project.cross_platform_reach.comments > 0) && (
                <>
                  <span className="text-foreground/40">·</span>
                  <span className="text-emerald-300/80 font-mono text-[11px]">
                    {lang === "zh"
                      ? `跨平台 ${project.cross_platform_reach.views} 浏览 · ${project.cross_platform_reach.likes} 赞 · ${project.cross_platform_reach.comments} 评论`
                      : `cross-platform ${project.cross_platform_reach.views} views · ${project.cross_platform_reach.likes} likes · ${project.cross_platform_reach.comments} comments`}
                  </span>
                </>
              )}
            <span className="text-foreground/40">·</span>
            <span className="text-foreground/50">
              {lang === "zh"
                ? `站内 ${project.views || 0} 浏览 · ${project.upvotes || 0} 点赞`
                : `in-app ${project.views || 0} views · ${project.upvotes || 0} upvotes`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/project/${project.id}/drafts`}
            className="px-3 py-1.5 rounded text-xs border border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10 text-violet-300"
          >
            {lang === "zh" ? "✨ 草稿" : "✨ Drafts"}
          </Link>
          <Link
            href={`/project/${project.id}`}
            className="px-3 py-1.5 rounded text-xs border border-white/10 hover:bg-white/5 text-foreground/70"
          >
            {lang === "zh" ? "查看" : "View"}
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

function CreditsBar({
  credits,
  lang,
}: {
  credits: { used: number; cap: number };
  lang: "en" | "zh";
}) {
  const pct = Math.min(100, Math.round((credits.used / credits.cap) * 100));
  const lowAndDangerous = pct >= 85;
  return (
    <div
      className={`rounded-lg border p-3 mb-6 flex items-center gap-3 ${
        lowAndDangerous
          ? "border-yellow-500/40 bg-yellow-500/5"
          : "border-white/[0.06] bg-white/[0.02]"
      }`}
    >
      <span className="font-pixel text-[9px] uppercase tracking-wider text-foreground/50 shrink-0">
        {lang === "zh" ? "今日额度" : "Daily quota"}
      </span>
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden min-w-[120px]">
        <div
          className={`h-full transition-all duration-500 ${
            lowAndDangerous
              ? "bg-yellow-400"
              : "bg-gradient-to-r from-violet-500 to-emerald-400"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-foreground/70 font-mono shrink-0">
        {credits.used}/{credits.cap}
      </span>
      {lowAndDangerous && (
        <span className="text-[10px] text-yellow-300 italic shrink-0">
          {lang === "zh" ? "UTC 0 点重置" : "resets at UTC 00:00"}
        </span>
      )}
    </div>
  );
}

function OnboardingQuest({
  progress,
  complete,
  lang,
  firstProjectId,
}: {
  progress: { step1Done: boolean; step2Done: boolean; step3Done: boolean };
  complete: boolean;
  lang: "en" | "zh";
  firstProjectId: string | undefined;
}) {
  const [dismissed, setDismissed] = useState(true); // start dismissed; localStorage decides

  useEffect(() => {
    const saved = localStorage.getItem(ONBOARDING_DISMISSED_KEY);
    setDismissed(saved === "1");
  }, []);

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, "1");
    setDismissed(true);
  };

  if (dismissed) return null;
  if (complete) return null;

  const doneCount =
    Number(progress.step1Done) +
    Number(progress.step2Done) +
    Number(progress.step3Done);

  const steps = [
    {
      n: 1,
      done: progress.step1Done,
      title: lang === "zh" ? "提交一个 AI 项目" : "Submit an AI project",
      hint:
        lang === "zh"
          ? "贴 URL 或 GitHub repo,30 秒"
          : "Paste a URL or GitHub repo, 30s",
      cta: lang === "zh" ? "去 /launch →" : "Go to /launch →",
      href: "/launch",
    },
    {
      n: 2,
      done: progress.step2Done,
      title:
        lang === "zh" ? "审核并批准 17 张草稿" : "Review and approve 17 drafts",
      hint:
        lang === "zh"
          ? "edit inline,1-click 打开平台,~5 分钟"
          : "Edit inline, 1-click open platform, ~5 min",
      cta:
        firstProjectId && progress.step1Done
          ? lang === "zh"
            ? "去 drafts →"
            : "Go to drafts →"
          : lang === "zh"
            ? "先做第 1 步"
            : "Finish step 1 first",
      href:
        firstProjectId && progress.step1Done
          ? `/project/${firstProjectId}/drafts`
          : "/launch",
    },
    {
      n: 3,
      done: progress.step3Done,
      title: lang === "zh" ? "今天发出 5 条" : "Post 5 today",
      hint:
        lang === "zh"
          ? "发出后粘贴 URL,我们会帮你追踪 engagement"
          : "Paste posted URL after — we'll track engagement",
      cta:
        firstProjectId && progress.step1Done
          ? lang === "zh"
            ? "去 drafts →"
            : "Go to drafts →"
          : lang === "zh"
            ? "先完成前面"
            : "Finish previous steps",
      href:
        firstProjectId && progress.step1Done
          ? `/project/${firstProjectId}/drafts`
          : "/launch",
    },
  ];

  return (
    <section
      className="rounded-xl border border-[#F97316]/40 bg-gradient-to-br from-[#F97316]/10 to-violet-500/5 p-5 mb-8"
      style={{ boxShadow: "4px 4px 0 #000" }}
    >
      <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
        <div>
          <p className="font-pixel text-[10px] uppercase tracking-wider text-[#FB923C] mb-1">
            ▸ {lang === "zh" ? "新手任务" : "ONBOARDING QUEST"}
          </p>
          <h2 className="text-lg font-bold text-foreground">
            {lang === "zh"
              ? "首次发布:从提交到 10+ 平台齐发"
              : "First launch: submit → 10+ channels"}
          </h2>
          <p className="text-xs text-foreground/60 mt-1">
            {lang === "zh"
              ? `进度 ${doneCount}/3`
              : `Progress ${doneCount}/3`}
          </p>
        </div>
        <button
          onClick={dismiss}
          className="text-foreground/40 hover:text-foreground/70 text-xs"
          aria-label={lang === "zh" ? "跳过" : "Skip"}
        >
          {lang === "zh" ? "跳过 ✕" : "Skip ✕"}
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/5 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#F97316] to-yellow-400 transition-all duration-500"
          style={{ width: `${(doneCount / 3) * 100}%` }}
        />
      </div>

      <ol className="space-y-2">
        {steps.map((s) => (
          <li
            key={s.n}
            className={`flex items-center gap-3 rounded-md p-3 ${
              s.done
                ? "bg-emerald-500/5 border border-emerald-500/20"
                : "bg-white/[0.02] border border-white/[0.06]"
            }`}
          >
            <span
              className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-sm ${
                s.done
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-white/[0.05] text-foreground/60"
              }`}
            >
              {s.done ? "✓" : s.n}
            </span>
            <div className="flex-1 min-w-0">
              <p
                className={`font-medium text-sm ${
                  s.done ? "text-foreground/50 line-through" : "text-foreground"
                }`}
              >
                {s.title}
              </p>
              <p className="text-xs text-foreground/50">{s.hint}</p>
            </div>
            {!s.done && (
              <Link
                href={s.href}
                className="shrink-0 text-xs text-violet-300 hover:text-violet-200 hover:underline"
              >
                {s.cta}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
