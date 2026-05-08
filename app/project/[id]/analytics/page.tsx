"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/i18n";
import type { GrowthSuggestion } from "@/lib/ai";

/**
 * /project/[id]/analytics — per-project analytics, two surfaces:
 *
 *   1) Cross-platform distribution (top section, populated from
 *      project_drafts where status=posted). The /api/cron/scrape-engagement
 *      cron writes to those rows every 6h.
 *
 *   2) In-app traction (bottom section, populated from project_events
 *      via the /api/project/[id]/analytics endpoint).
 *
 * Bilingual via useLang.
 */

interface DailyStat {
  day: string;
  views: number;
  clicks: number;
  shares: number;
  upvotes: number;
  demo_plays: number;
}

interface AnalyticsData {
  projectId: string;
  period: string;
  totals: Record<string, number>;
  daily: DailyStat[];
  conversionRate: number;
}

interface DraftRow {
  id: string;
  platform: string;
  language: "en" | "zh";
  variant_key: string | null;
  posted_url: string | null;
  posted_at: string | null;
  views: number;
  likes: number;
  comments: number;
  body: string;
}

const PLATFORM_LABEL: Record<string, string> = {
  x: "X (Twitter)",
  reddit: "Reddit",
  linkedin: "LinkedIn",
  hacker_news: "Hacker News",
  dev_to: "Dev.to",
  bluesky: "Bluesky",
  threads: "Threads",
  producthunt: "Product Hunt",
  xiaohongshu: "Xiaohongshu",
  jike: "Jike",
  zhihu: "Zhihu",
  bilibili: "Bilibili",
};

const PLATFORM_LABEL_ZH: Record<string, string> = {
  x: "X (Twitter)",
  reddit: "Reddit",
  linkedin: "LinkedIn",
  hacker_news: "Hacker News",
  dev_to: "Dev.to",
  bluesky: "Bluesky",
  threads: "Threads",
  producthunt: "Product Hunt",
  xiaohongshu: "小红书",
  jike: "即刻",
  zhihu: "知乎",
  bilibili: "B站",
};

// Platforms where the cron's public scraper actually returns data.
// Mirrors lib/engagement-scrapers SUPPORTED_SCRAPER_PLATFORMS.
const SCRAPER_SUPPORTED = new Set([
  "x",
  "reddit",
  "hacker_news",
  "dev_to",
  "bluesky",
]);

type PlatformAgg = {
  platform: string;
  drafts: DraftRow[];
  posted: number;
  views: number;
  likes: number;
  comments: number;
  engagement: number;
  bestDraft: DraftRow | null;
};

function aggregateByPlatform(drafts: DraftRow[]): PlatformAgg[] {
  const byPlatform = new Map<string, DraftRow[]>();
  for (const d of drafts) {
    if (!byPlatform.has(d.platform)) byPlatform.set(d.platform, []);
    byPlatform.get(d.platform)!.push(d);
  }
  const out: PlatformAgg[] = [];
  for (const [platform, ds] of byPlatform.entries()) {
    let views = 0;
    let likes = 0;
    let comments = 0;
    let bestDraft: DraftRow | null = null;
    let bestScore = -1;
    for (const d of ds) {
      views += d.views;
      likes += d.likes;
      comments += d.comments;
      const s = d.views + d.likes + d.comments;
      if (s > bestScore) {
        bestScore = s;
        bestDraft = d;
      }
    }
    out.push({
      platform,
      drafts: ds,
      posted: ds.length,
      views,
      likes,
      comments,
      engagement: views + likes + comments,
      bestDraft,
    });
  }
  out.sort((a, b) => b.engagement - a.engagement);
  return out;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

function relativeTime(iso: string | null, lang: "en" | "zh"): string {
  if (!iso) return "";
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diffSec = Math.max(0, Math.floor((now - t) / 1000));
  if (diffSec < 60) return lang === "zh" ? "刚刚" : "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return lang === "zh" ? `${diffMin}分钟前` : `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 48) return lang === "zh" ? `${diffHr}小时前` : `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return lang === "zh" ? `${diffDay}天前` : `${diffDay}d ago`;
}

function PixelChart({ data, dataKey, color, height = 80 }: { data: DailyStat[]; dataKey: keyof DailyStat; color: string; height?: number }) {
  const values = data.map((d) => d[dataKey] as number);
  const max = Math.max(...values, 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height }}>
      {values.map((val, i) => {
        const h = Math.max(2, (val / max) * height);
        return (
          <div
            key={i}
            title={`${data[i].day}: ${val}`}
            style={{
              flex: 1,
              height: h,
              background: color,
              opacity: 0.7 + (val / max) * 0.3,
              transition: "height 0.3s",
            }}
          />
        );
      })}
    </div>
  );
}

export default function ProjectAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);
  const { lang } = useLang();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [postedDrafts, setPostedDrafts] = useState<DraftRow[]>([]);
  const [suggestions, setSuggestions] = useState<GrowthSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [sugLoading, setSugLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/project/${projectId}/analytics`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    (async () => {
      const { data: drafts } = await supabase
        .from("project_drafts")
        .select(
          "id, platform, language, variant_key, posted_url, posted_at, views, likes, comments, body",
        )
        .eq("project_id", projectId)
        .eq("status", "posted")
        .order("posted_at", { ascending: false });
      setPostedDrafts((drafts || []) as DraftRow[]);
    })();
  }, [projectId]);

  const fetchSuggestions = useCallback(async () => {
    if (!data) return;
    setSugLoading(true);
    try {
      const res = await fetch("/api/ai/growth-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Project ${projectId}`,
          description: "AI project",
          category: "AI Tool",
          views: data.totals.views,
          upvotes: data.totals.upvotes,
          comments: 0,
          daysSinceLaunch: data.daily.length,
        }),
      });
      if (res.ok) {
        setSuggestions(await res.json());
      }
    } catch {} finally {
      setSugLoading(false);
    }
  }, [data, projectId]);

  const platforms = aggregateByPlatform(postedDrafts);
  const totalEngagement = platforms.reduce((s, p) => s + p.engagement, 0);
  const winningChannel = platforms[0] || null;

  const EFFORT_COLORS: Record<string, string> = {
    "5min": "#39FF14",
    "30min": "#FACC15",
    "1hr": "#FF4500",
    "1day": "#9D00FF",
  };

  const labelFor = (p: string) =>
    lang === "zh"
      ? PLATFORM_LABEL_ZH[p] || p
      : PLATFORM_LABEL[p] || p;

  return (
    <main className="min-h-screen bg-[var(--bg-deep)] px-4 sm:px-8 py-10">
      <div className="max-w-5xl mx-auto">
        <Link
          href={`/project/${projectId}`}
          className="font-pixel text-[10px] uppercase tracking-wider text-violet-400/70 hover:text-violet-300"
        >
          ← {lang === "zh" ? "返回项目" : "Back to project"}
        </Link>

        <header className="mt-3 mb-6">
          <p className="font-pixel text-[10px] uppercase tracking-wider text-violet-400/70 mb-1">
            ▸ {lang === "zh" ? "项目分析" : "PROJECT ANALYTICS"}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {lang === "zh" ? "曝光数据 · 渠道表现" : "Reach + channel performance"}
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            {lang === "zh"
              ? "跨平台 engagement 每 6 小时由 cron 自动刷新。"
              : "Cross-platform engagement refreshes every 6h via cron."}
          </p>
        </header>

        {/* Cross-platform distribution */}
        <section className="mb-10">
          <h2 className="font-pixel text-[11px] uppercase tracking-wider text-emerald-300 mb-4">
            ▸ {lang === "zh" ? "跨平台分发" : "CROSS-PLATFORM DISTRIBUTION"}
          </h2>

          {postedDrafts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] p-8 text-center">
              <p className="text-foreground/60 mb-3">
                {lang === "zh"
                  ? "还没有已发布的草稿。"
                  : "No drafts posted yet."}
              </p>
              <p className="text-foreground/40 text-sm mb-4">
                {lang === "zh"
                  ? "去 drafts 页面发布几条,粘贴 URL 后我们会自动追踪 engagement。"
                  : "Head to drafts, post a few, paste the URLs, and we'll track engagement."}
              </p>
              <Link
                href={`/project/${projectId}/drafts`}
                className="inline-block px-4 py-2 rounded text-xs font-pixel uppercase tracking-wider bg-violet-600 hover:bg-violet-500 text-white"
              >
                {lang === "zh" ? "去 drafts" : "Go to drafts"}
              </Link>
            </div>
          ) : (
            <>
              {/* Top-line totals + winning channel */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <Tile
                  label={lang === "zh" ? "已发布" : "Posted"}
                  value={postedDrafts.length}
                />
                <Tile
                  label={lang === "zh" ? "覆盖平台" : "Platforms"}
                  value={platforms.length}
                />
                <Tile
                  label={lang === "zh" ? "总互动" : "Engagement"}
                  value={totalEngagement}
                  accent="emerald"
                />
                <Tile
                  label={lang === "zh" ? "最强渠道" : "Top channel"}
                  value={winningChannel ? labelFor(winningChannel.platform) : "—"}
                  textValue
                  accent="orange"
                />
              </div>

              {/* Per-platform breakdown */}
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-white/[0.06] text-[10px] font-pixel uppercase tracking-wider text-foreground/50">
                  <div className="col-span-3">{lang === "zh" ? "平台" : "Platform"}</div>
                  <div className="col-span-1 text-right">{lang === "zh" ? "草稿" : "Posts"}</div>
                  <div className="col-span-2 text-right">{lang === "zh" ? "浏览" : "Views"}</div>
                  <div className="col-span-2 text-right">{lang === "zh" ? "点赞" : "Likes"}</div>
                  <div className="col-span-2 text-right">{lang === "zh" ? "评论" : "Comments"}</div>
                  <div className="col-span-2 text-right">{lang === "zh" ? "互动" : "Total"}</div>
                </div>
                {platforms.map((p, idx) => {
                  const isExpanded = expanded === p.platform;
                  const isWinner = idx === 0 && p.engagement > 0;
                  const supported = SCRAPER_SUPPORTED.has(p.platform);
                  return (
                    <div key={p.platform}>
                      <button
                        onClick={() => setExpanded(isExpanded ? null : p.platform)}
                        className="w-full grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors text-left items-center"
                      >
                        <div className="col-span-3 flex items-center gap-2">
                          <span className="text-foreground font-medium text-sm">
                            {labelFor(p.platform)}
                          </span>
                          {isWinner && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FF4500]/20 text-[#FF6633] font-pixel uppercase tracking-wider">
                              {lang === "zh" ? "▲ 最强" : "▲ TOP"}
                            </span>
                          )}
                          {!supported && (
                            <span
                              className="text-[9px] text-foreground/30 italic"
                              title={
                                lang === "zh"
                                  ? "这个平台需要手动填 engagement(无公共 API)"
                                  : "Manual entry required (no public scraper)"
                              }
                            >
                              {lang === "zh" ? "手动" : "manual"}
                            </span>
                          )}
                        </div>
                        <div className="col-span-1 text-right text-foreground/70 font-mono text-sm">
                          {p.posted}
                        </div>
                        <div className="col-span-2 text-right text-foreground/70 font-mono text-sm">
                          {formatCount(p.views)}
                        </div>
                        <div className="col-span-2 text-right text-foreground/70 font-mono text-sm">
                          {formatCount(p.likes)}
                        </div>
                        <div className="col-span-2 text-right text-foreground/70 font-mono text-sm">
                          {formatCount(p.comments)}
                        </div>
                        <div className="col-span-2 text-right text-emerald-300 font-mono text-sm font-bold">
                          {formatCount(p.engagement)}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="bg-black/30 border-b border-white/[0.04] px-4 py-3 space-y-2">
                          {p.drafts.map((d) => (
                            <div
                              key={d.id}
                              className="flex items-center gap-3 text-xs flex-wrap"
                            >
                              <span className="text-foreground/40 font-mono">
                                {d.language.toUpperCase()}
                                {d.variant_key ? ` · ${d.variant_key}` : ""}
                              </span>
                              <span className="text-foreground/40">
                                {relativeTime(d.posted_at, lang)}
                              </span>
                              <span className="text-foreground/70 font-mono">
                                {d.views}v · {d.likes}♥ · {d.comments}💬
                              </span>
                              {d.posted_url ? (
                                <a
                                  href={d.posted_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-violet-300 hover:underline truncate max-w-[300px]"
                                >
                                  {d.posted_url} ↗
                                </a>
                              ) : (
                                <span className="text-foreground/30 italic">
                                  {lang === "zh" ? "未填 URL" : "no URL"}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* In-app traction (existing) */}
        <section>
          <h2 className="font-pixel text-[11px] uppercase tracking-wider text-violet-300 mb-4">
            ▸ {lang === "zh" ? "站内数据" : "IN-APP TRACTION"}
          </h2>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            {loading && (
              <p className="text-foreground/40 text-sm text-center py-6">
                {lang === "zh" ? "加载中..." : "Loading..."}
              </p>
            )}

            {data && (
              <>
                <div className="flex gap-2 flex-wrap mb-5">
                  {[
                    { label: lang === "zh" ? "浏览" : "Views", value: data.totals.views, color: "#39FF14" },
                    { label: lang === "zh" ? "点击" : "Clicks", value: data.totals.clicks, color: "#06B6D4" },
                    { label: lang === "zh" ? "分享" : "Shares", value: data.totals.shares, color: "#9D00FF" },
                    { label: lang === "zh" ? "点赞" : "Upvotes", value: data.totals.upvotes, color: "#FACC15" },
                    { label: lang === "zh" ? "Demo" : "Demo", value: data.totals.demo_plays, color: "#FF4500" },
                    { label: lang === "zh" ? "转化率" : "Conv.", value: `${data.conversionRate}%`, color: "#FF69B4" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded border border-white/[0.06] bg-white/[0.02] px-3 py-2 min-w-[80px] text-center"
                    >
                      <div className="font-mono font-bold text-lg" style={{ color: s.color }}>
                        {s.value}
                      </div>
                      <div className="font-pixel text-[8px] uppercase tracking-wider text-foreground/50 mt-1">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "views" as const, label: lang === "zh" ? "浏览" : "Views", color: "#39FF14" },
                    { key: "clicks" as const, label: lang === "zh" ? "点击" : "Clicks", color: "#06B6D4" },
                    { key: "shares" as const, label: lang === "zh" ? "分享" : "Shares", color: "#9D00FF" },
                    { key: "upvotes" as const, label: lang === "zh" ? "点赞" : "Upvotes", color: "#FACC15" },
                  ].map((chart) => (
                    <div
                      key={chart.key}
                      className="rounded border border-white/[0.06] bg-white/[0.02] p-3"
                    >
                      <div
                        className="font-pixel text-[8px] uppercase tracking-wider mb-2"
                        style={{ color: chart.color }}
                      >
                        {chart.label} ({data.period})
                      </div>
                      <PixelChart data={data.daily} dataKey={chart.key} color={chart.color} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* AI Growth Suggestions */}
        <section className="mt-10">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-pixel text-[11px] uppercase tracking-wider text-yellow-300">
                ▸ {lang === "zh" ? "AI 增长建议" : "AI GROWTH SUGGESTIONS"}
              </h2>
              <button
                onClick={fetchSuggestions}
                disabled={sugLoading}
                className="px-3 py-1 text-xs rounded bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50"
              >
                {sugLoading
                  ? "..."
                  : lang === "zh"
                  ? "生成建议"
                  : "Generate suggestions"}
              </button>
            </div>

            {suggestions.length === 0 && !sugLoading && (
              <p className="text-foreground/40 text-sm">
                {lang === "zh"
                  ? "点击右上角生成建议。Claude 会基于当前数据给出可执行的增长动作。"
                  : "Click generate to get Claude-written growth actions based on current data."}
              </p>
            )}

            <motion.div className="space-y-3">
              {suggestions.map((sug, i) => (
                <div
                  key={i}
                  className="border-t border-white/[0.04] pt-3 first:border-t-0 first:pt-0"
                >
                  <div className="flex gap-2 items-center mb-1">
                    <span
                      className="font-pixel text-[8px] px-2 py-0.5 rounded uppercase tracking-wider"
                      style={{
                        color: "#0D0D0D",
                        background:
                          sug.priority === "high"
                            ? "#FF4500"
                            : sug.priority === "medium"
                            ? "#FACC15"
                            : "#39FF14",
                      }}
                    >
                      {sug.priority}
                    </span>
                    <span
                      className="font-pixel text-[8px] px-2 py-0.5 rounded uppercase tracking-wider border"
                      style={{
                        color: EFFORT_COLORS[sug.effort] ?? "#888",
                        borderColor: EFFORT_COLORS[sug.effort] ?? "#888",
                      }}
                    >
                      {sug.effort}
                    </span>
                  </div>
                  <p className="text-foreground/90 text-sm">{sug.action}</p>
                  <p className="text-foreground/50 text-xs mt-1">{sug.reason}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Tile({
  label,
  value,
  textValue,
  accent,
}: {
  label: string;
  value: string | number;
  textValue?: boolean;
  accent?: "emerald" | "orange";
}) {
  const color =
    accent === "emerald"
      ? "text-emerald-300"
      : accent === "orange"
      ? "text-[#FF6633]"
      : "text-foreground";
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="font-pixel text-[9px] uppercase tracking-wider text-foreground/50">
        {label}
      </p>
      <p
        className={`${
          textValue ? "text-base sm:text-lg font-bold truncate" : "text-2xl font-mono font-bold tabular-nums"
        } mt-2 ${color}`}
      >
        {value}
      </p>
    </div>
  );
}
