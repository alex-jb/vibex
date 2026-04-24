"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Trophy,
  ChevronUp,
  Flame,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Users,
  Zap,
} from "lucide-react";

import { useProjects } from "@/lib/use-data";
import type { LeaderboardEntry, LeaderboardPeriod } from "@/lib/leaderboard";
import { useRealtimeLeaderboard } from "@/lib/realtime";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLang } from "@/lib/i18n";
import { EvolutionBadge } from "@/components/rpg/evolution-badge";
import { computeEvolutionStage } from "@/lib/rpg-utils";
import type { EvolutionStage, Project } from "@/lib/types";

const EVO_SPRITE: Record<EvolutionStage, string> = {
  Seed: "/generated/evo-1-seed.png",
  Active: "/generated/evo-2-active.png",
  Growing: "/generated/evo-3-growing.png",
  Breakout: "/generated/evo-4-breakout.png",
  Legend: "/generated/evo-5-legend.png",
  Myth: "/generated/evo-6-myth.png",
};

function formatUtcHm(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const h = d.getUTCHours().toString().padStart(2, "0");
    const m = d.getUTCMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  } catch {
    return "";
  }
}

/* "Today's Forges" recency strip — sits above the leaderboard Tabs. The
   leaderboard ranks by upvotes / plays; this strip ranks by raw creation
   time. Gives re-visiting users a reason to drop in: "see what showed up
   today" instead of "see what's been topping the board all day." */
function TodaysForges({ projects }: { projects: Project[] }) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const todayList = useMemo(() => {
    return projects
      .filter((p) => typeof p.createdAt === "string" && p.createdAt.startsWith(today))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, 6);
  }, [projects, today]);

  const count = todayList.length;

  return (
    <div className="mb-8">
      <div
        className="flex items-center gap-3 mb-3"
        style={{
          fontFamily: "var(--font-press-start), monospace",
          fontSize: 9,
          letterSpacing: 2.5,
          color: "#FFE27D",
        }}
      >
        <span style={{ color: "#FF4500", textShadow: "0 0 4px #FF4500" }}>⚒</span>
        <span>TODAY&rsquo;S FORGES</span>
        <span
          className="px-1.5 py-[1px]"
          style={{
            background: count > 0 ? "#FF4500" : "rgba(0,0,0,0.4)",
            color: count > 0 ? "#0A0A0C" : "#8A7B9A",
            border: "1px solid #FFE27D",
            fontSize: 9,
          }}
        >
          {count}
        </span>
        <span style={{ color: "rgba(255,255,255,0.25)", flex: 1, height: 1, background: "rgba(255,69,0,0.25)" }} aria-hidden />
      </div>

      {count === 0 ? (
        <div
          className="flex items-center gap-4 p-4"
          style={{
            background: "#0A0A0C",
            border: "2px solid rgba(255,69,0,0.4)",
          }}
        >
          <Image
            src="/generated/smith-idle.png"
            alt=""
            width={64}
            height={64}
            unoptimized
            style={{ imageRendering: "pixelated", flexShrink: 0 }}
          />
          <div>
            <div
              className="font-pixel"
              style={{
                fontSize: 10,
                letterSpacing: 2,
                color: "#FFE27D",
                marginBottom: 4,
              }}
            >
              ANVIL COOL · FORGE IDLE
            </div>
            <div className="font-retro text-sm" style={{ color: "#8A7B9A" }}>
              Be the first to forge today.{" "}
              <Link
                href="/launch"
                className="underline"
                style={{ color: "#FF4500", textDecorationColor: "#FF4500" }}
              >
                Forge a project →
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {todayList.map((p) => {
            const stage = (p.hero?.evolutionStage as EvolutionStage | undefined) ?? computeEvolutionStage(p);
            return (
              <Link
                key={p.id}
                href={`/project/${encodeURIComponent(p.id)}`}
                className="block group"
                style={{
                  background: "#0A0A0C",
                  border: "2px solid rgba(255,69,0,0.4)",
                  padding: 8,
                  transition: "border-color 120ms ease-out",
                }}
              >
                <div
                  className="flex items-center justify-center mb-2"
                  style={{
                    width: "100%",
                    height: 64,
                    background: "rgba(255,69,0,0.06)",
                  }}
                >
                  <Image
                    src={EVO_SPRITE[stage]}
                    alt=""
                    width={48}
                    height={48}
                    unoptimized
                    style={{
                      imageRendering: "pixelated",
                      filter: "drop-shadow(0 0 6px rgba(255,69,0,0.5))",
                    }}
                  />
                </div>
                <div
                  className="font-pixel truncate"
                  style={{
                    fontSize: 8,
                    letterSpacing: 1,
                    color: "#E8E8EC",
                    marginBottom: 2,
                  }}
                  title={p.title}
                >
                  {p.title}
                </div>
                <div
                  className="font-code"
                  style={{
                    fontSize: 8,
                    color: "#FF4500",
                    letterSpacing: 1.5,
                  }}
                >
                  {formatUtcHm(p.createdAt)} UTC
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Map tab names to LeaderboardPeriod */
function tabToPeriod(tab: string): LeaderboardPeriod {
  switch (tab) {
    case "daily": return "daily";
    case "weekly": return "weekly";
    case "trending": return "monthly";
    case "new": return "allTime";
    default: return "daily";
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function getStats(projects: { createdAt: string; upvotes: number; creatorName: string }[]) {
  const today = new Date().toISOString().split("T")[0];
  const todayProjects = projects.filter((p) => p.createdAt === today).length;
  const totalUpvotes = projects.reduce((sum, p) => sum + p.upvotes, 0);
  const creators = new Set(projects.map((p) => p.creatorName)).size;
  return { todayProjects, totalUpvotes, creators };
}

/** Pulsing LIVE indicator */
function LiveBadge({ connected }: { connected: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-red-400">
      <span
        className={`inline-block size-1.5 rounded-full ${
          connected ? "bg-red-500 animate-pulse" : "bg-red-500/40"
        }`}
      />
      LIVE
    </span>
  );
}

/** Rank change indicator: green arrow up, red arrow down, gray dash */
function RankChange({ change }: { change: number }) {
  if (change > 0) {
    return (
      <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400">
        <span>&#9650;</span>
        {change}
      </span>
    );
  }
  if (change < 0) {
    return (
      <span className="flex items-center gap-0.5 text-[10px] font-bold text-red-400">
        <span>&#9660;</span>
        {Math.abs(change)}
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold" style={{ color: "var(--text-dim)" }}>&mdash;</span>
  );
}

function LeaderboardTab({ tab }: { tab: string }) {
  const period = tabToPeriod(tab);
  const { entries, loading } = useRealtimeLeaderboard(period, 10);

  if (loading) {
    return (
      <div className="mt-6 glass-card-strong noise-bg rounded-2xl p-6 text-center">
        <span className="font-pixel text-[8px] animate-pulse" style={{ color: "var(--text-muted)" }}>
          Loading rankings...
        </span>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      key={tab}
      className="mt-6 glass-card-strong noise-bg rounded-2xl p-2 sm:p-3"
    >
      <div className="divide-y divide-white/5">
        {entries.map((entry) => (
          <RankItem key={entry.projectId} entry={entry} />
        ))}
      </div>
    </motion.div>
  );
}

export default function HuntPage() {
  const [activeTab, setActiveTab] = useState("daily");
  const { data: projects } = useProjects();
  const stats = getStats(projects);
  const { t } = useLang();
  const period = tabToPeriod(activeTab);
  const { connected } = useRealtimeLeaderboard(period, 1);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero Section — Direction A pixel treatment (matches /creators + /ideas) */}
      <div className="relative mb-12 overflow-hidden">
        {/* Forge ember glow — single orange pulse (replaces violet/fuchsia orbs) */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-[320px] w-[480px] rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(255,69,0,0.14), transparent 70%)" }}
        />

        <div className="relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="font-ui inline-flex items-center justify-center gap-3 mb-4"
              style={{
                fontSize: 11,
                color: "var(--neon-green)",
                letterSpacing: 3,
                textShadow: "0 0 4px rgba(57,255,20,0.8)",
              }}
            >
              ▸ VIBEXFORGE://HUNT · {t("hunt.badge").toUpperCase()}
              <LiveBadge connected={connected} />
            </div>
            <h1
              className="font-pixel font-pixel-hero text-[28px] sm:text-[38px] md:text-[48px]"
              style={{
                letterSpacing: 3,
                lineHeight: 1.25,
                background:
                  "linear-gradient(180deg, #FFE27D 0%, #FFD700 40%, #B8860B 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter:
                  "drop-shadow(2px 2px 0 #000) drop-shadow(3px 3px 0 #000) drop-shadow(0 0 20px rgba(250,204,21,0.5))",
              }}
            >
              {t("hunt.title")} {t("hunt.titleHighlight")}
            </h1>
            <p
              className="font-retro mx-auto mt-4 max-w-lg text-[16px] sm:text-[18px] md:text-[20px]"
              style={{
                color: "rgba(232,232,236,0.85)",
                textShadow: "0 2px 0 rgba(0,0,0,0.7)",
              }}
            >
              {t("hunt.description")}
            </p>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-sm"
          >
            <div className="flex items-center gap-1.5" style={{ color: "var(--text)" }}>
              <Zap className="size-3.5 text-amber-400" />
              <span className="font-semibold text-foreground">{stats.todayProjects}</span>
              <span>{t("hunt.projectsToday")}</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-1.5" style={{ color: "var(--text)" }}>
              <ChevronUp className="size-3.5 text-violet-400" />
              <span className="font-semibold text-foreground">{stats.totalUpvotes.toLocaleString()}</span>
              <span>{t("hunt.totalUpvotes")}</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-1.5" style={{ color: "var(--text)" }}>
              <Users className="size-3.5 text-fuchsia-400" />
              <span className="font-semibold text-foreground">{stats.creators}</span>
              <span>{t("hunt.creators")}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Today's Forges — recency strip (distinct from upvote-ranked
          leaderboard below). Gives re-visiting users a reason to check
          back in: "what appeared today" vs. "what's been at the top". */}
      <TodaysForges projects={projects} />

      {/* Tabs + List */}
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="glass-card-strong rounded-xl border-white/10 p-1">
            <TabsTrigger value="daily">
              <Trophy className="size-4" />
              {t("hunt.daily")}
            </TabsTrigger>
            <TabsTrigger value="weekly">
              <Flame className="size-4" />
              {t("hunt.weekly")}
            </TabsTrigger>
            <TabsTrigger value="trending">
              <TrendingUp className="size-4" />
              {t("hunt.trending")}
            </TabsTrigger>
            <TabsTrigger value="new">
              <Clock className="size-4" />
              {t("hunt.new")}
            </TabsTrigger>
          </TabsList>

          {["daily", "weekly", "trending", "new"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <LeaderboardTab tab={tab} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-black font-bold text-sm shadow-lg shadow-amber-500/20">
        <Trophy className="size-4" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-300 text-black font-bold text-sm">
        {rank}
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-700 text-white font-bold text-sm">
        {rank}
      </div>
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 font-bold text-sm font-mono" style={{ color: "var(--text)" }}>
      {rank}
    </div>
  );
}

function ScoreIndicator({ score }: { score: number }) {
  const pct = score;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-9 w-9">
        <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-white/5"
          />
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            strokeWidth="2.5"
            strokeDasharray={`${(pct / 100) * 94.2} 94.2`}
            strokeLinecap="round"
            className="stroke-current"
            style={{
              color:
                score >= 90
                  ? "#a855f7"
                  : score >= 80
                    ? "#f59e0b"
                    : "#71717a",
            }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-mono">
          {score}
        </span>
      </div>
    </div>
  );
}

/** Estimate evolution stage from leaderboard entry (simplified — full computation needs all project metrics) */
function estimateStage(score: number, upvotes: number): EvolutionStage {
  if (score >= 90 && upvotes >= 1000) return "Myth";
  if (score >= 85 && upvotes >= 500) return "Legend";
  if (score >= 70 && upvotes >= 100) return "Breakout";
  if (upvotes >= 50) return "Growing";
  if (score >= 40) return "Active";
  return "Seed";
}

function RankItem({ entry }: { entry: LeaderboardEntry }) {
  const isTop3 = entry.rank <= 3;
  const isFirst = entry.rank === 1;
  const { t } = useLang();

  const gymTitle = entry.rank === 1 ? t("hunt.gymMaster") : entry.rank === 2 ? t("hunt.eliteFour") : entry.rank === 3 ? t("hunt.challenger") : null;

  const wrapperClasses = isFirst
    ? "fire-border border-glow glow-soft rounded-xl p-1"
    : isTop3
      ? "rounded-xl"
      : "";

  return (
    <motion.div variants={itemVariants} className={wrapperClasses}>
      <div
        className={`flex items-center gap-4 py-3.5 px-3 sm:px-4 rounded-xl transition-colors hover:bg-white/5 group ${
          isFirst ? "bg-white/[0.03]" : ""
        }`}
      >
        {/* Rank badge */}
        <div className="shrink-0">
          <RankBadge rank={entry.rank} />
        </div>

        {/* Rank change arrow */}
        <div className="shrink-0 w-6 text-center">
          <RankChange change={entry.change} />
        </div>

        {/* Upvote column */}
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          <button
            type="button"
            className="glass-card flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 transition-all hover:glow-violet hover:border-violet-500/30 hover:bg-violet-500/10"
          >
            <ChevronUp className="size-4 text-violet-400" />
            <span className="text-xs font-semibold" style={{ color: "var(--text)" }}>
              {entry.upvotes}
            </span>
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`font-semibold truncate ${isFirst ? "text-lg" : ""}`}>
              {entry.title}
            </p>
            {isTop3 && gymTitle && (
              <span className="font-pixel text-[6px] text-amber-400 uppercase tracking-wider shrink-0 hidden md:inline">
                {gymTitle}
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {t("hunt.by")}{" "}
            <span style={{ color: "var(--text)" }}>{entry.creatorName}</span>
          </p>
        </div>

        {/* Evolution + Category badges */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <EvolutionBadge stage={estimateStage(entry.score, entry.upvotes)} size="sm" />
          <Badge
            variant="secondary"
            className="bg-white/5 border-white/10"
            style={{ color: "var(--text)" }}
          >
            {entry.category}
          </Badge>
        </div>

        {/* Score indicator */}
        <div className="hidden sm:flex shrink-0">
          <ScoreIndicator score={entry.score} />
        </div>

        {/* Link arrow */}
        <Link
          href={`/project/${entry.projectId}`}
          aria-label={`View ${entry.title}`}
          className="shrink-0 rounded-lg p-2 transition-all hover:bg-white/10 hover:scale-105"
        >
          <ArrowUpRight
            className="size-4 group-hover:text-[var(--neon-yellow)] transition-colors"
            style={{ color: "var(--text-muted)" }}
            aria-hidden="true"
          />
        </Link>
      </div>
    </motion.div>
  );
}
