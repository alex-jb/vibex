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

import { projects } from "@/lib/mock-data";
import type { Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassIcon } from "@/components/rpg/class-icon";
import { EvolutionBadge } from "@/components/rpg/evolution-badge";
import { useLang } from "@/lib/i18n";

function getSortedProjects(tab: string): Project[] {
  const sorted = [...projects];
  switch (tab) {
    case "daily":
      return sorted.sort((a, b) => b.score - a.score).slice(0, 10);
    case "weekly":
      return sorted.sort((a, b) => b.upvotes - a.upvotes).slice(0, 10);
    case "trending":
      return sorted.sort((a, b) => b.views - a.views).slice(0, 10);
    case "new":
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    default:
      return sorted;
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

function getStats() {
  const today = new Date().toISOString().split("T")[0];
  const todayProjects = projects.filter((p) => p.createdAt === today).length;
  const totalUpvotes = projects.reduce((sum, p) => sum + p.upvotes, 0);
  const creators = new Set(projects.map((p) => p.creatorName)).size;
  return { todayProjects, totalUpvotes, creators };
}

export default function HuntPage() {
  const [activeTab, setActiveTab] = useState("daily");
  const stats = getStats();
  const { t } = useLang();

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
            <span className="mb-3 inline-block rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400">
              {t("hunt.badge")}
            </span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {t("hunt.title")} <span className="text-gradient">{t("hunt.titleHighlight")}</span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground">
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
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Zap className="size-3.5 text-amber-400" />
              <span className="font-semibold text-foreground">{stats.todayProjects}</span>
              <span>{t("hunt.projectsToday")}</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ChevronUp className="size-3.5 text-violet-400" />
              <span className="font-semibold text-foreground">{stats.totalUpvotes.toLocaleString()}</span>
              <span>{t("hunt.totalUpvotes")}</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-1.5 text-muted-foreground">
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
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                key={tab}
                className="mt-6 glass-card-strong noise-bg rounded-2xl p-2 sm:p-3"
              >
                <div className="divide-y divide-white/5">
                  {getSortedProjects(tab).map((project, index) => (
                    <RankItem
                      key={project.id}
                      project={project}
                      rank={index + 1}
                    />
                  ))}
                </div>
              </motion.div>
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
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-muted-foreground font-bold text-sm font-mono">
      {rank}
    </div>
  );
}

function ScoreIndicator({ score }: { score: number }) {
  const color =
    score >= 90
      ? "from-violet-500 to-fuchsia-500"
      : score >= 80
        ? "from-amber-500 to-orange-500"
        : "from-zinc-500 to-zinc-400";
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
            className={`stroke-current`}
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

function RankItem({ project, rank }: { project: Project; rank: number }) {
  const isTop3 = rank <= 3;
  const isFirst = rank === 1;
  const hero = project.hero;
  const { t } = useLang();

  const gymTitle = rank === 1 ? t("hunt.gymMaster") : rank === 2 ? t("hunt.eliteFour") : rank === 3 ? t("hunt.challenger") : null;

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
          <RankBadge rank={rank} />
        </div>

        {/* Upvote column */}
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          <button
            type="button"
            className="glass-card flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 transition-all hover:glow-violet hover:border-violet-500/30 hover:bg-violet-500/10"
          >
            <ChevronUp className="size-4 text-violet-400" />
            <span className="text-xs font-semibold text-muted-foreground">
              {project.upvotes}
            </span>
          </button>
        </div>

        {/* RPG Class Icon */}
        {hero && (
          <div className="hidden sm:flex shrink-0">
            <ClassIcon heroClass={hero.heroClass} size={18} />
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`font-semibold truncate ${isFirst ? "text-lg" : ""}`}>
              {project.title}
            </p>
            {hero && (
              <span className="level-badge shrink-0">
                <span className="text-violet-400">Lv</span>
                <span className="ml-0.5">{hero.level}</span>
              </span>
            )}
            {isTop3 && gymTitle && (
              <span className="font-pixel text-[6px] text-amber-400 uppercase tracking-wider shrink-0 hidden md:inline">
                {gymTitle}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {project.tagline}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            {t("hunt.by")}{" "}
            <span className="text-muted-foreground">{project.creatorName}</span>
          </p>
        </div>

        {/* Category badge */}
        <Badge
          variant="secondary"
          className="hidden sm:inline-flex shrink-0 bg-white/5 border-white/10 text-muted-foreground"
        >
          {project.category}
        </Badge>

        {/* Evolution badge */}
        {hero && isTop3 && (
          <div className="hidden lg:flex shrink-0">
            <EvolutionBadge stage={hero.evolutionStage} size="sm" />
          </div>
        )}

        {/* Score indicator */}
        <div className="hidden sm:flex shrink-0">
          <ScoreIndicator score={project.score} />
        </div>

        {/* Link arrow */}
        <Link
          href={`/project/${project.id}`}
          className="shrink-0 rounded-lg p-2 transition-all hover:bg-white/10 hover:scale-105"
        >
          <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>
      </div>
    </motion.div>
  );
}
