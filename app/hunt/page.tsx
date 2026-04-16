"use client";

import { useState } from "react";
import Link from "next/link";
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
import type { EvolutionStage } from "@/lib/types";

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
      {/* Hero Section */}
      <div className="relative mb-12 overflow-hidden">
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-64 w-64 rounded-full bg-violet-600/20 blur-[100px] animate-pulse-slow" />
        <div className="pointer-events-none absolute -top-20 right-0 h-48 w-48 rounded-full bg-fuchsia-600/15 blur-[80px] animate-pulse-slow" style={{ animationDelay: "2s" }} />

        <div className="relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-3 flex items-center justify-center gap-2">
              <span className="inline-block rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400">
                {t("hunt.badge")}
              </span>
              <LiveBadge connected={connected} />
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {t("hunt.title")} <span className="text-gradient">{t("hunt.titleHighlight")}</span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-base" style={{ color: "var(--text)" }}>
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
          className="shrink-0 rounded-lg p-2 transition-all hover:bg-white/10 hover:scale-105"
        >
          <ArrowUpRight className="size-4 group-hover:text-[var(--neon-yellow)] transition-colors" style={{ color: "var(--text-muted)" }} />
        </Link>
      </div>
    </motion.div>
  );
}
