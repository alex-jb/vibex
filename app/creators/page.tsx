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
import { EvolutionBadge } from "@/components/rpg/evolution-badge";

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
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[360px] w-[520px] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(255,69,0,0.14), transparent 70%)" }}
      />

      {/* Hero — pixel game-UI treatment matching /home + /project/[id] */}
      <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="relative text-center mb-14 sm:mb-16">
        <div
          className="font-ui inline-flex items-center gap-2 mb-4"
          style={{
            fontSize: 11,
            color: "var(--neon-green)",
            letterSpacing: 3,
            textShadow: "0 0 4px rgba(57,255,20,0.8)",
          }}
        >
          <BookOpen className="size-3.5" />
          ▸ VIBEXFORGE://CREATORS · {t("creators.badge").toUpperCase()}
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
          {t("creators.title")} {t("creators.titleHighlight")}
        </h1>
        <p
          className="font-retro mt-4 max-w-lg mx-auto text-[16px] sm:text-[18px] md:text-[20px]"
          style={{
            color: "rgba(232,232,236,0.85)",
            textShadow: "0 2px 0 rgba(0,0,0,0.7)",
          }}
        >
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
              <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                {weeklyWinners[0]?.projectTitle}
              </h2>
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
                const bestProject = projects
                  .filter((p) => p.creatorId === creator.id)
                  .sort((a, b) => b.score - a.score)[0];
                const bestStage = bestProject?.hero?.evolutionStage;
                return (
                  <div key={creator.id} className="relative">
                    {bestStage && (
                      <div className="absolute -top-2 right-2 z-10">
                        <EvolutionBadge stage={bestStage} size="sm" />
                      </div>
                    )}
                    <PodiumCard
                      creator={creator}
                      accent={accent}
                      delay={0.2 + i * 0.05}
                      elevated={elevated}
                      heroClass={heroClass}
                      isSelected={selectedCreator === creator.id}
                      onSelect={() => setSelectedCreator(selectedCreator === creator.id ? null : creator.id)}
                    />
                  </div>
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
            { label: t("creators.totalCreators"), value: totalCreators, icon: Users, accent: "var(--neon-purple)" },
            { label: t("creators.totalProjects"), value: totalProjects, icon: Star, accent: "var(--neon-pink)" },
            { label: t("creators.totalPlays"), value: totalPlays, icon: Play, accent: "var(--neon-cyan)" },
            { label: t("creators.totalRemixes"), value: totalRemixes, icon: GitFork, accent: "var(--neon-green)" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.06 }}
              className="relative p-5"
              style={{
                background: "var(--bg-panel)",
                border: "2px solid var(--border-metal)",
                boxShadow: "4px 4px 0 #000",
              }}
            >
              <stat.icon className="size-5 mb-3" style={{ color: stat.accent }} />
              <p
                className="font-pixel"
                style={{
                  fontSize: 28,
                  color: "var(--neon-yellow)",
                  textShadow: "0 0 10px rgba(250,204,21,0.5), 3px 3px 0 #000",
                  letterSpacing: 1,
                  lineHeight: 1,
                  marginBottom: 6,
                }}
              >
                {formatNumber(stat.value)}
              </p>
              <p
                className="font-ui"
                style={{
                  fontSize: 9,
                  color: "var(--text-muted)",
                  letterSpacing: 2,
                }}
              >
                {stat.label.toUpperCase()}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
