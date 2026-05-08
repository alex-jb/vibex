"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/i18n";

/* ═══════════════════════════════════════════════════════════════════════════
   LANDING `/` — v9 distribution-amplifier (Indie Hackers-inspired).
   2026-05-08: replaced the RPG forge splash with a content-rich, scrollable
   landing page that speaks to the locked positioning ("multi-channel
   distribution amplifier for solo AI creators"). The original RPG splash
   lives at `/arcade` for visitors who want the brand moment.

   Why this design: the old splash was visually striking but only read as
   "AI projects gallery", not "we publish your launch to 10+ channels for
   you." First-time visitors from X / Reddit / HN saw boot logs + glitch
   headlines + 12 category pills and bounced before understanding the job
   the product does. This page picks the IH playbook: dark, plain, high-
   contrast type, real numbers, real recent projects, builder-to-builder
   founder voice, and a single clear conversion path.

   Bilingual via useLang(). EN by default, 中文 toggle in nav.
   ═══════════════════════════════════════════════════════════════════════════ */

const FORGE = "#FF4500";

const PLATFORMS = [
  { en: "X", zh: "X", logo: "𝕏" },
  { en: "Xiaohongshu", zh: "小红书", logo: "📕" },
  { en: "Jike", zh: "即刻", logo: "💛" },
  { en: "Reddit", zh: "Reddit", logo: "🔶" },
  { en: "Hacker News", zh: "Hacker News", logo: "Y" },
  { en: "Dev.to", zh: "Dev.to", logo: "</>" },
  { en: "LinkedIn", zh: "LinkedIn", logo: "in" },
  { en: "Bluesky", zh: "Bluesky", logo: "🦋" },
  { en: "Threads", zh: "Threads", logo: "@" },
  { en: "Product Hunt", zh: "Product Hunt", logo: "🐱" },
  { en: "Zhihu", zh: "知乎", logo: "知" },
  { en: "Bilibili", zh: "B站", logo: "📺" },
];

const COPY = {
  en: {
    eyebrow: "Distribution amplifier for solo AI creators",
    h1Pre: "Build once.",
    h1Highlight: "Ship to 10+ channels.",
    sub: "You vibe-coded an AI app. Our agents write 10+ platform-specific posts in 5 seconds — X, Xiaohongshu, Reddit, HN, Dev.to, LinkedIn, and more. Edit, approve, publish.",
    ctaPrimary: "Submit your project",
    ctaSecondary: "How it works",
    betaNote: "Free for the first 100 creators. No credit card.",
    statsTitle: "Real numbers, real-time",
    stat1: "Projects amplified",
    stat2: "Creators shipping",
    stat3: "Total engagement",
    platformsTitle: "10+ channels, one submit",
    platformsSub: "Each draft is platform-specific — long-form for Dev.to, short threads for X, aesthetic notes for Xiaohongshu, technical detail for Hacker News.",
    stepsTitle: "How it works",
    step1: "Submit your AI project URL or GitHub repo. 30 seconds.",
    step2: "Agents write 10+ platform-specific drafts in ~10 seconds.",
    step3: "Review, edit, one-click publish. 5 minutes per project.",
    recentTitle: "Recently amplified",
    recentEmpty: "Be the first to ship.",
    founderTitle: "Built by a solo creator, for solo creators",
    founderBody: "I'm Alex. I shipped my own AI gallery for 6 months and got 5 users. Distribution killed me. So I built the tool I wished existed: agents that write platform-native posts so I never have to copy-paste a tweet thread again. It's free during beta, MIT-licensed, and I'm the only one running it. If it works for you, tell me. If it doesn't, tell me louder.",
    ctaH2: "Ready to be seen?",
    ctaBody: "Free during beta. First 100 creators get unlimited generation + priority on the public discovery feed.",
    ctaButton: "Submit your AI project",
    arcadeNote: "Looking for the original arcade splash? It's still alive at /arcade.",
  },
  zh: {
    eyebrow: "给独立 AI 创作者的多渠道发行放大器",
    h1Pre: "做一次。",
    h1Highlight: "10+ 渠道齐发。",
    sub: "你 vibe-coded 了一个 AI 作品。我们的 agent 5 秒内写好 10+ 平台专属推广帖 — X、小红书、Reddit、HN、Dev.to、LinkedIn 等等。审核、修改、一键发布。",
    ctaPrimary: "提交你的作品",
    ctaSecondary: "看怎么用",
    betaNote: "前 100 名 creator 免费,不需要信用卡。",
    statsTitle: "实时数据",
    stat1: "项目放大",
    stat2: "活跃 creator",
    stat3: "总互动",
    platformsTitle: "10+ 平台,一次提交",
    platformsSub: "每张草稿都是平台专属 — Dev.to 长文、X 短 thread、小红书的氛围笔记、Hacker News 的技术细节。",
    stepsTitle: "怎么用",
    step1: "贴上你的 AI 作品链接或 GitHub repo,30 秒。",
    step2: "Agent 在约 10 秒内写好 10+ 平台专属帖子。",
    step3: "审核、修改、一键发布,每个项目 5 分钟。",
    recentTitle: "最近被放大的项目",
    recentEmpty: "成为第一个出片的人。",
    founderTitle: "独立开发者亲手打造,服务独立开发者",
    founderBody: "我是 Alex。我自己做了 6 个月 AI 作品 gallery,只拿到 5 个用户。distribution 把我搞死了。所以我做了一个我自己想要的工具:让 agent 帮我写平台专属帖子,我再也不用手动复制粘贴一个 tweet thread。Beta 期免费,MIT 协议,我一个人维护。能用就告诉我,不能用就大声告诉我。",
    ctaH2: "准备好被看见了吗?",
    ctaBody: "Beta 期免费。前 100 名 creator 拿无限次生成 + 公共发现 feed 优先曝光。",
    ctaButton: "提交你的 AI 作品",
    arcadeNote: "想看原来那个 arcade 风格首页?还在 /arcade。",
  },
} as const;

type StatTuple = { projects: number; creators: number; engagement: number };

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

type RecentProject = {
  id: string;
  title: string;
  title_zh: string | null;
  tagline: string | null;
  tagline_zh: string | null;
  evolution_stage: string | null;
  // W3 (2026-05-08): cross-platform engagement aggregated from
  // project_drafts where status=posted. NULL when project has zero
  // posted drafts — caller filters to "amplified" projects only.
  cross_platform?: {
    posted: number;
    views: number;
    likes: number;
    comments: number;
    platforms: string[];
  };
};

export default function LandingPage() {
  const { lang } = useLang();
  const t = COPY[lang];

  const [stats, setStats] = useState<StatTuple | null>(null);
  const [recent, setRecent] = useState<RecentProject[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [projectsRes, creatorsRes, recentRes] = await Promise.all([
          supabase
            .from("projects")
            .select("plays, upvotes, views, shares")
            .limit(5000),
          supabase.from("creators").select("*", { count: "exact", head: true }),
          supabase
            .from("projects")
            .select("id, title, title_zh, tagline, tagline_zh, evolution_stage")
            .order("created_at", { ascending: false })
            .limit(20),
        ]);
        if (!alive) return;
        const rows = (projectsRes.data ?? []) as Array<{
          plays?: number | null;
          upvotes?: number | null;
          views?: number | null;
          shares?: number | null;
        }>;
        const projects = rows.length;
        const engagement = rows.reduce(
          (s, r) =>
            s + (r.plays ?? 0) + (r.upvotes ?? 0) + (r.views ?? 0) + (r.shares ?? 0),
          0,
        );
        setStats({
          projects,
          creators: creatorsRes.count ?? 0,
          engagement,
        });

        // Pull cross-platform engagement for the recent project ids,
        // then filter the list to "amplified" projects (≥ 1 posted
        // draft). Fall back to title-only display if zero amplified.
        const recentRaw = (recentRes.data ?? []) as RecentProject[];
        const ids = recentRaw.map((p) => p.id);
        if (ids.length > 0) {
          const { data: draftRows } = await supabase
            .from("project_drafts")
            .select("project_id, platform, views, likes, comments")
            .eq("status", "posted")
            .in("project_id", ids);
          const byProject = new Map<
            string,
            { posted: number; views: number; likes: number; comments: number; platforms: Set<string> }
          >();
          for (const d of draftRows || []) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const r = d as any;
            const cur = byProject.get(r.project_id) || {
              posted: 0,
              views: 0,
              likes: 0,
              comments: 0,
              platforms: new Set<string>(),
            };
            cur.posted += 1;
            cur.views += r.views || 0;
            cur.likes += r.likes || 0;
            cur.comments += r.comments || 0;
            cur.platforms.add(r.platform);
            byProject.set(r.project_id, cur);
          }
          const enriched = recentRaw.map((p) => {
            const e = byProject.get(p.id);
            return e
              ? {
                  ...p,
                  cross_platform: {
                    posted: e.posted,
                    views: e.views,
                    likes: e.likes,
                    comments: e.comments,
                    platforms: Array.from(e.platforms),
                  },
                }
              : p;
          });
          // Sort: amplified projects first (by total engagement DESC),
          // then non-amplified by recency. Take top 6.
          const sorted = enriched.sort((a, b) => {
            const ea =
              (a.cross_platform?.views || 0) +
              (a.cross_platform?.likes || 0) +
              (a.cross_platform?.comments || 0);
            const eb =
              (b.cross_platform?.views || 0) +
              (b.cross_platform?.likes || 0) +
              (b.cross_platform?.comments || 0);
            return eb - ea;
          });
          setRecent(sorted.slice(0, 6));
        } else {
          setRecent(recentRaw);
        }
      } catch {
        // silent fail — stats just render zero
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[var(--bg-deep)] text-[var(--text)]">
      {/* Hero */}
      <section className="px-6 pt-24 pb-32 max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="font-pixel text-[10px] uppercase tracking-[0.28em] mb-6"
          style={{ color: FORGE }}
        >
          ▸ {t.eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-5xl sm:text-7xl md:text-[88px] font-bold leading-[1.02] mb-8 tracking-tight"
        >
          {t.h1Pre}
          <br />
          <span style={{ color: FORGE }}>{t.h1Highlight}</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-lg sm:text-xl text-foreground/70 max-w-2xl mb-8 leading-relaxed"
        >
          {t.sub}
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-wrap gap-3 mb-4"
        >
          <Link href="/launch" className="btn-primary btn-primary-lg">
            {t.ctaPrimary} →
          </Link>
          <Link href="/try" className="btn-ghost btn-ghost-lg">
            {lang === "zh"
              ? "看 6 个真实草稿(无需登录)"
              : "See 6 sample drafts"}
          </Link>
          <Link href="/how-it-works" className="btn-ghost btn-ghost-lg">
            {t.ctaSecondary}
          </Link>
        </motion.div>
        <p className="text-xs text-foreground/40">{t.betaNote}</p>
      </section>

      {/* Stats strip */}
      {stats && (stats.projects > 0 || stats.creators > 0) ? (
        <section className="border-y border-white/[0.06] bg-white/[0.015]">
          <div className="px-6 py-8 max-w-5xl mx-auto">
            <p className="font-pixel text-[9px] uppercase tracking-widest text-foreground/40 mb-4">
              ▸ {t.statsTitle}
            </p>
            <div className="grid grid-cols-3 gap-4 sm:gap-8">
              <StatTile num={stats.projects} label={t.stat1} />
              <StatTile num={stats.creators} label={t.stat2} />
              <StatTile num={stats.engagement} label={t.stat3} />
            </div>
          </div>
        </section>
      ) : null}

      {/* Platform strip */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">
          {t.platformsTitle}
        </h2>
        <p className="text-foreground/60 mb-8 max-w-2xl leading-relaxed">
          {t.platformsSub}
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {PLATFORMS.map((p) => (
            <div
              key={p.en}
              className="aspect-square rounded-md border border-white/[0.08] bg-white/[0.02] flex flex-col items-center justify-center hover:bg-white/[0.05] hover:border-white/[0.15] transition-colors"
            >
              <div className="text-2xl mb-1">{p.logo}</div>
              <div className="text-[10px] text-foreground/70 font-medium text-center px-1">
                {lang === "zh" ? p.zh : p.en}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3-step */}
      <section className="px-6 py-24 max-w-5xl mx-auto border-t border-white/[0.06]">
        <h2 className="text-2xl sm:text-3xl font-bold mb-10 tracking-tight">
          {t.stepsTitle}
        </h2>
        <ol className="grid md:grid-cols-3 gap-6">
          {[t.step1, t.step2, t.step3].map((body, i) => (
            <li
              key={i}
              className="rounded-md border border-white/[0.08] bg-white/[0.02] p-6"
            >
              <p
                className="text-3xl font-bold mb-3"
                style={{ color: FORGE }}
              >
                0{i + 1}
              </p>
              <p className="text-foreground/80 leading-relaxed">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Recent projects */}
      <section className="px-6 py-24 max-w-5xl mx-auto border-t border-white/[0.06]">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 tracking-tight">
          {t.recentTitle}
        </h2>
        {recent.length === 0 ? (
          <p className="text-foreground/40 italic">{t.recentEmpty}</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recent.slice(0, 6).map((p) => {
              const cp = p.cross_platform;
              const totalEng = cp ? cp.views + cp.likes + cp.comments : 0;
              return (
                <Link
                  key={p.id}
                  href={`/project/${p.id}`}
                  className={`rounded-md border p-5 transition-colors block ${
                    cp
                      ? "border-emerald-500/20 bg-emerald-500/[0.03] hover:bg-emerald-500/[0.06] hover:border-emerald-500/40"
                      : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15]"
                  }`}
                >
                  <h3 className="font-bold text-foreground mb-1 truncate">
                    {lang === "zh" && p.title_zh ? p.title_zh : p.title}
                  </h3>
                  <p className="text-foreground/60 text-sm line-clamp-2 mb-3">
                    {(lang === "zh" && p.tagline_zh ? p.tagline_zh : p.tagline) || ""}
                  </p>
                  {cp ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-pixel text-[9px] uppercase tracking-wider text-emerald-300">
                        ▸ {lang === "zh" ? "已放大" : "AMPLIFIED"}
                      </span>
                      <span className="text-[11px] text-foreground/70 font-mono">
                        {formatCount(totalEng)}{" "}
                        {lang === "zh" ? "互动" : "engagement"} · {cp.platforms.length}{" "}
                        {lang === "zh" ? "平台" : "platforms"}
                      </span>
                    </div>
                  ) : p.evolution_stage ? (
                    <span className="font-pixel text-[9px] uppercase tracking-wider text-foreground/40">
                      ▸ {p.evolution_stage}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        )}
        <div className="mt-6">
          <Link
            href="/home"
            className="text-sm text-violet-300 hover:underline"
          >
            {lang === "zh" ? "查看全部 →" : "Browse all projects →"}
          </Link>
        </div>
      </section>

      {/* Founder note */}
      <section className="px-6 py-20 max-w-3xl mx-auto border-t border-white/[0.06]">
        <div className="flex items-start gap-5">
          <div
            className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#FF4500] shrink-0"
            style={{ background: "#0A0A0C" }}
          >
            <Image
              src="/generated/mascot-v1.png"
              alt="Alex"
              width={48}
              height={48}
              className="object-cover"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 tracking-tight">
              {t.founderTitle}
            </h2>
            <p className="text-foreground/75 leading-relaxed">
              {t.founderBody}
            </p>
            <p className="text-xs text-foreground/40 mt-4">
              <a
                href="https://github.com/alex-jb"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground/70"
              >
                @alex-jb
              </a>
              {" · "}
              <a
                href="https://github.com/alex-jb/vibex"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground/70"
              >
                {lang === "zh" ? "GitHub 源码" : "Source on GitHub"}
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 max-w-3xl mx-auto text-center border-t border-white/[0.06]">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
          {t.ctaH2}
        </h2>
        <p className="text-foreground/60 mb-10 leading-relaxed">{t.ctaBody}</p>
        <Link href="/launch" className="btn-primary btn-primary-lg">
          {t.ctaButton} →
        </Link>
        <p className="text-xs text-foreground/30 mt-10">
          <Link href="/arcade" className="hover:text-foreground/60">
            {t.arcadeNote}
          </Link>
        </p>
      </section>

      {/* SEO content for crawlers — sr-only mirrors the locked positioning
          + FAQ block from the old splash so / continues to rank for
          "AI launch platform" / "distribution amplifier" queries. */}
      <section className="sr-only" aria-label="About VibeXForge">
        <h2>About VibeXForge</h2>
        <p>
          VibeXForge is the first multi-channel distribution amplifier built
          for solo and indie AI creators in China and globally. Submit your
          vibe-coded AI app (Lovable / Cursor / Claude Code / v0 / your own
          stack — any source). Our marketing agents auto-promote it across
          10+ channels: X / Xiaohongshu / Jike / Zhihu / Bilibili / Reddit /
          Dev.to / Hacker News / Product Hunt / LinkedIn — each post tailored
          to that platform&apos;s tone, language, and audience. Solo creators
          get the reach big companies pay $10K/month for. Free during beta.
        </p>
        <p>
          VibeXForge 是为中国 + 全球独立 AI 创作者打造的第一个多渠道发行
          放大器。提交你的 vibe-coded AI 作品(无论用 Lovable / Cursor /
          Claude Code / v0 还是自己的工具栈)。我们的 marketing agent 自动
          适配 10+ 平台的 vibe + 语言 + audience。独立开发者也能拿到大公司
          花 ¥10K/月才能买到的曝光。Beta 期免费。
        </p>
        <h3>What is VibeXForge?</h3>
        <p>
          VibeXForge (formerly VibeX) is a distribution amplifier for solo AI
          creators. Submit your AI project once and our agents write
          platform-specific promotional posts for X, Xiaohongshu, Reddit,
          Hacker News, Dev.to, LinkedIn, and 6 more channels. Bilingual EN ↔
          ZH. Built solo, MIT-licensed, free during beta.
        </p>
        <h3>How does the agent write platform-specific posts?</h3>
        <p>
          Each draft is generated by Claude Sonnet 4.6 with a platform-aware
          prompt — long-form for Dev.to, short threads for X, aesthetic
          notes for Xiaohongshu, technical detail for Hacker News. Drafts go
          to a HITL queue where the creator reviews, edits, and approves
          before publishing.
        </p>
      </section>
    </main>
  );
}

function StatTile({ num, label }: { num: number; label: string }) {
  return (
    <div>
      <p
        className="text-3xl sm:text-4xl font-bold tabular-nums"
        style={{ color: FORGE }}
      >
        {formatCount(num)}
      </p>
      <p className="text-xs text-foreground/50 mt-1 uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}
