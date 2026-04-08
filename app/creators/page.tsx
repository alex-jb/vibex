"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Crown,
  Medal,
  TrendingUp,
  Star,
  Zap,
  Users,
  Play,
  GitFork,
  ChevronUp,
  ArrowUpRight,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/section-header";
import { creators, projects, weeklyWinners } from "@/lib/mock-data";
import { AttributeRadar } from "@/components/rpg/attribute-radar";
import { ClassIcon } from "@/components/rpg/class-icon";
import { computeClass, computeAttributes } from "@/lib/rpg-utils";
import { useLang } from "@/lib/i18n";
import type { HeroAttributes, HeroClass } from "@/lib/types";

// --- Helpers ---

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase();
}

const avatarColors = [
  "from-violet-500 to-fuchsia-500",
  "from-cyan-500 to-blue-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-indigo-500 to-violet-500",
  "from-fuchsia-500 to-rose-500",
  "from-teal-500 to-cyan-500",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getBadgeConfig(t: (key: any) => string): Record<string, { label: string; className: string }> {
  return {
    "top-creator": { label: t("creators.badgeTopCreator"), className: "bg-gradient-to-r from-violet-600 to-purple-600 text-white border-violet-500/30" },
    trending: { label: t("creators.badgeTrending"), className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    "remix-king": { label: t("creators.badgeRemixKing"), className: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30" },
    "weekly-winner": { label: t("creators.badgeWeeklyWinner"), className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    pioneer: { label: t("creators.badgePioneer"), className: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
    viral: { label: t("creators.badgeViral"), className: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
  };
}

function CreatorBadge({ badge, t }: { badge: string; t: (key: any) => string }) {
  const config = getBadgeConfig(t)[badge];
  if (!config) return null;
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${config.className}`}>
      {config.label}
    </span>
  );
}

function AvatarCircle({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = { sm: "size-10 text-sm", md: "size-14 text-lg", lg: "size-20 text-2xl" };
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${getAvatarColor(name)} flex items-center justify-center font-bold text-white shrink-0 shadow-lg`}>
      {getInitials(name)}
    </div>
  );
}

/** Compute dominant class for a creator from their projects */
function getCreatorClass(creatorId: string): HeroClass | null {
  const cp = projects.filter((p) => p.creatorId === creatorId);
  if (cp.length === 0) return null;
  const classCounts: Record<HeroClass, number> = { Architect: 0, Artisan: 0, Enchanter: 0, Alchemist: 0, Sentinel: 0 };
  for (const p of cp) {
    classCounts[computeClass(p.category)]++;
  }
  return (Object.entries(classCounts) as [HeroClass, number][]).sort((a, b) => b[1] - a[1])[0][0];
}

/** Get average attributes for a creator */
function getCreatorAttributes(creatorId: string): HeroAttributes | null {
  const cp = projects.filter((p) => p.creatorId === creatorId);
  if (cp.length === 0) return null;
  const sum: HeroAttributes = { power: 0, resilience: 0, charisma: 0, wisdom: 0, agility: 0, stability: 0 };
  for (const p of cp) {
    const attrs = computeAttributes(p);
    for (const k of Object.keys(sum) as (keyof HeroAttributes)[]) {
      sum[k] += attrs[k];
    }
  }
  for (const k of Object.keys(sum) as (keyof HeroAttributes)[]) {
    sum[k] = Math.round(sum[k] / cp.length);
  }
  return sum;
}

// --- Animations ---
const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

// --- Page ---

export default function CreatorsPage() {
  const { t } = useLang();
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const sortedCreators = [...creators].sort((a, b) => a.rank - b.rank);
  const top3 = sortedCreators.filter((c) => c.rank <= 3);
  const rest = sortedCreators.filter((c) => c.rank > 3);

  const PAGE_SIZE = 5;
  const totalPages = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const pagedRest = rest.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalCreators = creators.length;
  const totalProjects = creators.reduce((sum, c) => sum + c.projectCount, 0);
  const totalPlays = creators.reduce((sum, c) => sum + c.totalPlays, 0);
  const totalRemixes = creators.reduce((sum, c) => sum + c.totalRemixes, 0);

  const selectedData = selectedCreator
    ? {
        creator: creators.find((c) => c.id === selectedCreator)!,
        heroClass: getCreatorClass(selectedCreator),
        attributes: getCreatorAttributes(selectedCreator),
        projectList: projects.filter((p) => p.creatorId === selectedCreator),
      }
    : null;

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="pointer-events-none absolute -top-32 left-1/4 h-[480px] w-[480px] rounded-full bg-violet-600/8 blur-[120px]" />
      <div className="pointer-events-none absolute top-64 right-1/4 h-[360px] w-[360px] rounded-full bg-fuchsia-600/6 blur-[100px]" />

      {/* Hero */}
      <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="relative text-center mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 mb-5">
          <BookOpen className="size-3.5 text-violet-400" />
          <span className="font-pixel text-[8px] text-violet-400 tracking-wide uppercase">
            {t("creators.badge")}
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          {t("creators.title")}{" "}
          <span className="text-gradient">{t("creators.titleHighlight")}</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
          {t("creators.description")}
        </p>
      </motion.div>

      {/* Weekly Winner Banner */}
      <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }} className="relative mb-16">
        <div className="glass-card-strong border-glow rounded-2xl p-6 sm:p-8 overflow-hidden">
          <div className="absolute top-3 right-4 text-amber-400/20">
            <Sparkles className="size-24 animate-pulse-slow" />
          </div>
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-400 shadow-lg shadow-amber-500/25">
              <Trophy className="size-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-amber-400 tracking-wide uppercase mb-1">
                {t("creators.weeklyChampion")}
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                {weeklyWinners[0]?.projectTitle}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                by <span className="text-foreground font-medium">{weeklyWinners[0]?.creatorName}</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gradient">{weeklyWinners[0]?.score}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("creators.score")}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main grid: list + Pokédex detail */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        {/* Left: Rankings */}
        <div className="space-y-10">
          {/* Top 3 Podium */}
          <div>
            <SectionHeader badge={t("creators.leaderboard")} title={t("creators.topCreators")} description={t("creators.topDesc")} />
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {[top3[1], top3[0], top3[2]].map((creator, i) => {
                if (!creator) return null;
                const accent = i === 1 ? "gold" : i === 0 ? "silver" : "bronze";
                const elevated = i === 1;
                const heroClass = getCreatorClass(creator.id);
                return (
                  <PodiumCard
                    key={creator.id}
                    creator={creator}
                    accent={accent}
                    delay={0.2 + i * 0.05}
                    elevated={elevated}
                    heroClass={heroClass}
                    isSelected={selectedCreator === creator.id}
                    onSelect={() => setSelectedCreator(selectedCreator === creator.id ? null : creator.id)}
                  />
                );
              })}
            </div>
          </div>

          {/* Full Rankings */}
          <div>
            <SectionHeader badge={t("creators.rankings")} title={t("creators.allCreators")} description={t("creators.allDesc")} />
            <motion.div variants={stagger} initial="initial" animate="animate" className="mt-8 glass-card rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
              {pagedRest.map((creator) => {
                const heroClass = getCreatorClass(creator.id);
                return (
                  <motion.div
                    key={creator.id}
                    variants={fadeUp}
                    transition={{ duration: 0.4 }}
                    className={`flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors group cursor-pointer ${
                      selectedCreator === creator.id ? "bg-violet-500/5 ring-1 ring-violet-500/20" : ""
                    }`}
                    onClick={() => setSelectedCreator(selectedCreator === creator.id ? null : creator.id)}
                  >
                    <span className="text-lg font-bold text-muted-foreground/60 w-8 text-center shrink-0">
                      #{creator.rank}
                    </span>
                    <AvatarCircle name={creator.name} size="sm" />
                    {heroClass && (
                      <ClassIcon heroClass={heroClass} size={16} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{creator.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{creator.bio}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-6 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Zap className="size-3 text-violet-400" />
                        {formatNumber(creator.totalUpvotes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Play className="size-3 text-fuchsia-400" />
                        {formatNumber(creator.totalPlays)}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="size-3 text-cyan-400" />
                        {creator.totalRemixes}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium shrink-0">
                      <ChevronUp className="size-3" />
                      {creator.weeklyGrowth}%
                    </div>
                    <div className="hidden lg:flex items-center gap-1.5">
                      {creator.badges.map((b) => (
                        <CreatorBadge key={b} badge={b} t={t} />
                      ))}
                    </div>
                    <ArrowUpRight className="size-4 text-muted-foreground/40 group-hover:text-violet-400 transition-colors shrink-0" />
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 16 }}>
                <button
                  className="nes-btn is-primary"
                  style={{ fontSize: 10, padding: "8px 14px" }}
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  上一页
                </button>
                <span className="font-pixel" style={{ fontSize: 8, color: "#8888A0" }}>
                  第 {currentPage} / {totalPages} 页
                </span>
                <button
                  className="nes-btn is-primary"
                  style={{ fontSize: 10, padding: "8px 14px" }}
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  下一页
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Pokédex Panel (sticky) */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            {selectedData ? (
              <motion.div
                key={selectedData.creator.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="retro-card l-corner p-5 space-y-4 relative"
              >
                <div className="l-corner-inner absolute inset-0 pointer-events-none" />

                {/* Pokédex header */}
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-[8px] text-violet-400 uppercase tracking-wider">
                    {t("creators.badge")} #{String(selectedData.creator.rank).padStart(3, "0")}
                  </span>
                  {selectedData.heroClass && (
                    <ClassIcon heroClass={selectedData.heroClass} size={16} showLabel />
                  )}
                </div>

                {/* Avatar + name */}
                <div className="flex items-center gap-3">
                  <AvatarCircle name={selectedData.creator.name} size="lg" />
                  <div className="min-w-0">
                    <h3 className="font-bold text-foreground text-lg truncate">
                      {selectedData.creator.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{selectedData.creator.bio}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {selectedData.creator.badges.map((b) => (
                        <CreatorBadge key={b} badge={b} t={t} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Attribute Radar */}
                {selectedData.attributes && (
                  <div className="flex justify-center">
                    <AttributeRadar attributes={selectedData.attributes} size={200} />
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: t("creators.projects"), value: selectedData.creator.projectCount, color: "text-violet-400" },
                    { label: t("creators.upvotes"), value: selectedData.creator.totalUpvotes, color: "text-fuchsia-400" },
                    { label: t("creators.plays"), value: selectedData.creator.totalPlays, color: "text-cyan-400" },
                    { label: t("creators.remixes"), value: selectedData.creator.totalRemixes, color: "text-emerald-400" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/[0.03] rounded px-3 py-2">
                      <span className="font-pixel text-[6px] text-muted-foreground uppercase">{s.label}</span>
                      <p className={`font-pixel text-[10px] ${s.color}`}>{formatNumber(s.value)}</p>
                    </div>
                  ))}
                </div>

                {/* Growth */}
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                  <TrendingUp className="size-3" />
                  +{selectedData.creator.weeklyGrowth}% {t("creators.weeklyGrowth")}
                </div>

                {/* Projects by this creator */}
                {selectedData.projectList.length > 0 && (
                  <div>
                    <span className="font-pixel text-[7px] text-muted-foreground uppercase tracking-widest">
                      {t("creators.projects")}
                    </span>
                    <div className="mt-2 space-y-1.5">
                      {selectedData.projectList.map((p) => (
                        <a
                          key={p.id}
                          href={`/project/${p.id}`}
                          className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/[0.04] transition-colors"
                        >
                          {p.hero && (
                            <span className="level-badge shrink-0">
                              <span className="text-violet-400">Lv</span>
                              <span className="ml-0.5">{p.hero.level}</span>
                            </span>
                          )}
                          <span className="font-retro text-sm text-foreground truncate">
                            {p.title}
                          </span>
                          <Badge variant="outline" className="ml-auto text-[8px] shrink-0">
                            {p.category}
                          </Badge>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Joined */}
                <p className="font-pixel text-[6px] text-muted-foreground/40">
                  {t("creators.joined")} {selectedData.creator.joinedAt}
                </p>
              </motion.div>
            ) : (
              <div className="retro-card l-corner relative p-8 text-center">
                <div className="l-corner-inner absolute inset-0 pointer-events-none" />
                <BookOpen className="mx-auto size-8 text-muted-foreground/30 mb-3" />
                <p className="font-pixel text-[8px] text-muted-foreground">
                  {t("creators.selectCreator")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.35 }} className="mt-16">
        <SectionHeader badge={t("creators.overview")} title={t("creators.communityStats")} description={t("creators.communityDesc")} />
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t("creators.totalCreators"), value: totalCreators, icon: Users, color: "text-violet-400" },
            { label: t("creators.totalProjects"), value: totalProjects, icon: Star, color: "text-fuchsia-400" },
            { label: t("creators.totalPlays"), value: totalPlays, icon: Play, color: "text-cyan-400" },
            { label: t("creators.totalRemixes"), value: totalRemixes, icon: GitFork, color: "text-emerald-400" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.06 }}
              className="glass-card-strong rounded-xl p-5 noise-bg"
            >
              <stat.icon className={`size-5 ${stat.color} mb-3`} />
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{formatNumber(stat.value)}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// --- Podium Card ---

function PodiumCard({
  creator,
  accent,
  delay,
  elevated = false,
  heroClass,
  isSelected,
  onSelect,
}: {
  creator: (typeof creators)[number];
  accent: "gold" | "silver" | "bronze";
  delay: number;
  elevated?: boolean;
  heroClass: HeroClass | null;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { t } = useLang();
  const accentStyles = {
    gold: {
      border: "border-amber-500/30",
      glow: "shadow-amber-500/15",
      iconBg: "from-amber-400 to-yellow-300",
      icon: <Crown className="size-5 text-white" />,
      rankColor: "text-amber-400",
      wrapperExtra: "fire-border",
    },
    silver: {
      border: "border-zinc-400/25",
      glow: "shadow-zinc-400/10",
      iconBg: "from-zinc-300 to-zinc-400",
      icon: <Medal className="size-5 text-white" />,
      rankColor: "text-zinc-400",
      wrapperExtra: "",
    },
    bronze: {
      border: "border-orange-600/25",
      glow: "shadow-orange-600/10",
      iconBg: "from-orange-500 to-amber-600",
      icon: <Medal className="size-5 text-white" />,
      rankColor: "text-orange-400",
      wrapperExtra: "",
    },
  };

  const s = accentStyles[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`glass-card-strong rounded-2xl p-6 border ${s.border} shadow-lg ${s.glow} noise-bg relative cursor-pointer transition-all ${
        elevated ? "md:-mt-4 md:scale-[1.03] z-10" : ""
      } ${s.wrapperExtra} ${
        isSelected ? "ring-2 ring-violet-500 evolution-glow" : "hover:ring-1 hover:ring-white/20"
      }`}
      onClick={onSelect}
    >
      {/* Rank icon */}
      <div className="flex items-center justify-between mb-5">
        <div className={`flex items-center justify-center size-10 rounded-xl bg-gradient-to-br ${s.iconBg} shadow-md`}>
          {s.icon}
        </div>
        <div className="flex items-center gap-2">
          {heroClass && <ClassIcon heroClass={heroClass} size={16} />}
          <span className={`text-3xl font-black ${s.rankColor}`}>#{creator.rank}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <AvatarCircle name={creator.name} size={elevated ? "lg" : "md"} />
        <div className="min-w-0">
          <p className="font-bold text-foreground text-lg truncate">{creator.name}</p>
          <p className="text-xs text-muted-foreground truncate">{creator.bio}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: t("creators.projects"), value: creator.projectCount, icon: Star, color: "text-violet-400" },
          { label: t("creators.upvotes"), value: creator.totalUpvotes, icon: ChevronUp, color: "text-fuchsia-400" },
          { label: t("creators.plays"), value: creator.totalPlays, icon: Play, color: "text-cyan-400" },
          { label: t("creators.remixes"), value: creator.totalRemixes, icon: GitFork, color: "text-emerald-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/[0.04] rounded-lg px-3 py-2">
            <div className="flex items-center gap-1.5 mb-0.5">
              <stat.icon className={`size-3 ${stat.color}`} />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className="text-sm font-bold text-foreground">{formatNumber(stat.value)}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
          <TrendingUp className="size-3" />
          +{creator.weeklyGrowth}% {t("creators.thisWeek")}
        </div>
        <div className="flex items-center gap-1.5">
          {creator.badges.map((b) => (
            <CreatorBadge key={b} badge={b} t={t} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
