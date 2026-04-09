"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Star,
  Users,
  Play,
  GitFork,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { useCreators, useProjects, useWeeklyWinners } from "@/lib/use-data";
import { useLang } from "@/lib/i18n";
import { PodiumCard } from "@/components/creators/creator-card";
import { CreatorDetailPanel } from "@/components/creators/creator-detail";
import { RankingsTable } from "@/components/creators/rankings-table";
import { formatNumber, getCreatorClass, getCreatorAttributes } from "@/components/creators/creator-helpers";

// --- Animations ---
const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

// --- Page ---

export default function CreatorsPage() {
  const { t } = useLang();
  const { data: creators } = useCreators();
  const { data: projects } = useProjects();
  const { data: weeklyWinners } = useWeeklyWinners();
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
        heroClass: getCreatorClass(selectedCreator, projects),
        attributes: getCreatorAttributes(selectedCreator, projects),
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

      {/* Main grid: list + detail */}
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
                const heroClass = getCreatorClass(creator.id, projects);
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
            <RankingsTable
              pagedCreators={pagedRest}
              selectedCreator={selectedCreator}
              onSelectCreator={setSelectedCreator}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              getHeroClass={(id: string) => getCreatorClass(id, projects)}
            />
          </div>
        </div>

        {/* Right: Detail Panel (sticky) */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <CreatorDetailPanel data={selectedData} />
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
