"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords,
  Trophy,
  Flame,
  Zap,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  MapPin,
  ArrowRight,
  Star,
  ChevronUp,
  Users,
  Eye,
  Share2,
} from "lucide-react";
import {
  projects,
  events,
  trendInsights,
  creators,
  weeklyWinners,
} from "@/lib/mock-data";
import { TypewriterText } from "@/components/rpg/typewriter-text";
import { HeroCard } from "@/components/rpg/hero-card";
import { HudBars } from "@/components/rpg/hud-bars";
import { ClassIcon } from "@/components/rpg/class-icon";
import { EvolutionBadge } from "@/components/rpg/evolution-badge";
import { ExpBar } from "@/components/rpg/exp-bar";
import { RareCandyButton } from "@/components/rpg/rare-candy-button";
import { useLang } from "@/lib/i18n";

/* ─── animation presets ─── */

const pixelEase = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.5, ease: pixelEase },
};

const staggerChild = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-30px" },
  transition: { duration: 0.4, delay: i * 0.08, ease: pixelEase },
});

/* ─── data helpers ─── */

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

const trendTypeConfig: Record<
  string,
  { icon: typeof TrendingUp; color: string; barColor: string }
> = {
  rising: { icon: TrendingUp, color: "var(--neon-green)", barColor: "bg-[#39FF14]" },
  saturated: { icon: TrendingDown, color: "var(--neon-orange)", barColor: "bg-[#FF4500]" },
  opportunity: { icon: Target, color: "var(--neon-purple)", barColor: "bg-[#9D00FF]" },
  emerging: { icon: Zap, color: "var(--neon-cyan)", barColor: "bg-[#06B6D4]" },
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════════ */

export default function Home() {
  const [bootComplete, setBootComplete] = useState(false);
  const [bootLine, setBootLine] = useState(0);
  const { t } = useLang();

  const bootLines = useMemo(() => [
    t("boot.0"),
    t("boot.1"),
    t("boot.2"),
    t("boot.3"),
    t("boot.4"),
    t("boot.5"),
    t("boot.6"),
  ], [t]);

  const communityStats = useMemo(() => [
    { label: t("stats.questsLaunched"), value: "12K+", color: "var(--neon-green)" },
    { label: t("stats.activeHeroes"), value: "8K+", color: "var(--neon-cyan)" },
    { label: t("stats.guildActions"), value: "500K+", color: "var(--neon-purple)" },
  ], [t]);

  const featuredProjects = projects.filter((p) => p.featured).slice(0, 4);
  const bossProject = featuredProjects[0];
  const gridProjects = projects.slice(0, 6);
  const rankedProjects = [...projects]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  const selectedTrends = trendInsights.slice(0, 4);
  const upcomingEvents = events.slice(0, 3);
  const topCreators = creators.slice(0, 3);

  const handleBootLineComplete = useCallback(() => {
    if (bootLine < bootLines.length - 1) {
      setBootLine((prev) => prev + 1);
    } else {
      setBootComplete(true);
    }
  }, [bootLine, bootLines.length]);

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "var(--bg-deep)" }}>
      {/* Scanline CRT overlay */}
      <div className="scanline-overlay" />

      {/* ================================================================
          SECTION 1 -- TERMINAL BOOT HERO
          ================================================================ */}
      <section className="relative min-h-[90vh] flex items-center py-16 lg:py-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="retro-card l-corner p-6 sm:p-10" style={{ background: "var(--bg-panel)" }}>
            <div className="l-corner-inner absolute inset-0 pointer-events-none" />

            {/* Terminal header */}
            <div
              className="flex items-center gap-2 pb-4 mb-6"
              style={{ borderBottom: "2px solid var(--border-metal)" }}
            >
              <div className="w-3 h-3" style={{ background: "var(--neon-orange)", border: "1px solid #000" }} />
              <div className="w-3 h-3" style={{ background: "var(--neon-yellow)", border: "1px solid #000" }} />
              <div className="w-3 h-3" style={{ background: "var(--neon-green)", border: "1px solid #000" }} />
              <span className="font-pixel text-[8px] ml-3 uppercase tracking-widest" style={{ color: "var(--neon-green)" }}>
                VIBECODE_HUNT.EXE
              </span>
            </div>

            {/* Boot sequence */}
            <div className="min-h-[200px] sm:min-h-[260px]">
              {bootLines.slice(0, bootLine + 1).map((line, i) => (
                <div key={i} className="mb-2">
                  {i < bootLine ? (
                    <span
                      className="font-retro text-lg"
                      style={{ color: i === bootLines.length - 1 ? "var(--neon-yellow)" : "var(--neon-green)" }}
                    >
                      {line}
                    </span>
                  ) : (
                    <TypewriterText
                      text={line}
                      speed={line === "" ? 10 : 25}
                      className={i === bootLines.length - 1 ? "!text-[var(--neon-yellow)]" : "!text-[var(--neon-green)]"}
                      onComplete={handleBootLineComplete}
                      showCursor={i === bootLine}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Action buttons - appear after boot */}
            <AnimatePresence>
              {bootComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="mt-8 flex flex-col sm:flex-row gap-4"
                >
                  <Link href="/launch">
                    <button className="retro-button retro-button--primary flex items-center gap-2">
                      <Swords size={14} />
                      <span>{t("hero.startQuest")}</span>
                    </button>
                  </Link>
                  <Link href="/explore">
                    <button className="retro-button flex items-center gap-2">
                      <Eye size={14} />
                      <span>{t("hero.exploreArena")}</span>
                    </button>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Community HUD stats */}
            <AnimatePresence>
              {bootComplete && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="mt-8 pt-6 flex flex-wrap gap-8"
                  style={{ borderTop: "2px solid var(--border-metal)" }}
                >
                  {communityStats.map((stat) => (
                    <div key={stat.label} className="flex flex-col">
                      <span
                        className="font-pixel text-xl sm:text-2xl"
                        style={{ color: stat.color, textShadow: `0 0 20px ${stat.color}40` }}
                      >
                        {stat.value}
                      </span>
                      <span className="font-pixel text-[7px] mt-1" style={{ color: "var(--border-bolt)" }}>
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 2 -- BOSS ENCOUNTER (Featured Project)
          ================================================================ */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Section heading */}
          <motion.div {...fadeUp} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Flame size={18} style={{ color: "var(--neon-orange)" }} />
              <span className="font-pixel text-[10px] uppercase tracking-widest" style={{ color: "var(--neon-orange)" }}>
                {t("boss.label")}
              </span>
            </div>
            <h2 className="font-pixel text-sm sm:text-base" style={{ color: "var(--neon-yellow)" }}>
              {t("boss.heading")}
            </h2>
          </motion.div>

          {/* Boss card - RPGUI golden frame style */}
          <motion.div {...fadeUp}>
            <Link href={`/project/${bossProject.id}`} className="block group">
              <div
                className="rpgui-container framed-golden relative overflow-hidden"
                style={{
                  background: "var(--bg-panel)",
                  border: "3px solid var(--neon-yellow)",
                  boxShadow: "0 0 30px rgba(250,204,21,0.15), 4px 4px 0 #000",
                }}
              >
                {/* Gold corner decorations */}
                <div className="absolute top-0 left-0 w-5 h-5" style={{ borderTop: "3px solid var(--neon-yellow)", borderLeft: "3px solid var(--neon-yellow)" }} />
                <div className="absolute top-0 right-0 w-5 h-5" style={{ borderTop: "3px solid var(--neon-yellow)", borderRight: "3px solid var(--neon-yellow)" }} />
                <div className="absolute bottom-0 left-0 w-5 h-5" style={{ borderBottom: "3px solid var(--neon-yellow)", borderLeft: "3px solid var(--neon-yellow)" }} />
                <div className="absolute bottom-0 right-0 w-5 h-5" style={{ borderBottom: "3px solid var(--neon-yellow)", borderRight: "3px solid var(--neon-yellow)" }} />

                <div className="flex flex-col lg:flex-row">
                  {/* Left: Sprite area */}
                  <div
                    className="flex items-center justify-center py-12 px-8 lg:w-2/5"
                    style={{
                      background: "radial-gradient(circle at 50% 50%, rgba(250,204,21,0.08), transparent 70%)",
                    }}
                  >
                    <div className="text-center">
                      {/* Boss badge */}
                      <div
                        className="font-pixel text-[8px] uppercase tracking-widest mb-4 px-3 py-1 inline-block"
                        style={{
                          color: "var(--neon-yellow)",
                          border: "2px solid var(--neon-yellow)",
                          textShadow: "0 0 10px rgba(250,204,21,0.5)",
                        }}
                      >
                        BOSS LV.{bossProject.hero?.level ?? "??"}
                      </div>

                      {/* Pixel sprite placeholder */}
                      <div className="sprite-float mx-auto">
                        {bossProject.hero && (
                          <div
                            className="w-24 h-24 flex items-center justify-center mx-auto"
                            style={{
                              border: "3px solid var(--neon-yellow)",
                              background: "rgba(250,204,21,0.05)",
                              imageRendering: "pixelated",
                              boxShadow: "0 0 20px rgba(250,204,21,0.2)",
                            }}
                          >
                            <ClassIcon heroClass={bossProject.hero.heroClass} size={48} />
                          </div>
                        )}
                      </div>

                      {bossProject.hero && (
                        <div className="mt-4">
                          <EvolutionBadge stage={bossProject.hero.evolutionStage} size="md" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Info */}
                  <div className="flex-1 p-6 lg:p-8" style={{ borderLeft: "2px solid var(--border-metal)" }}>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      {bossProject.hero && (
                        <ClassIcon heroClass={bossProject.hero.heroClass} size={14} showLabel />
                      )}
                      <span className="font-pixel text-[7px]" style={{ color: "var(--neon-yellow)" }}>
                        SCORE: {bossProject.score}
                      </span>
                    </div>

                    <h3
                      className="font-pixel text-sm sm:text-base mb-2 group-hover:text-[var(--neon-yellow)] transition-colors"
                      style={{ color: "#E8E8EC" }}
                    >
                      {bossProject.title}
                    </h3>
                    <p className="font-retro text-base sm:text-lg mb-4" style={{ color: "var(--neon-cyan)" }}>
                      {bossProject.tagline}
                    </p>
                    <p className="font-retro text-sm leading-relaxed mb-6" style={{ color: "#888" }}>
                      {bossProject.description.slice(0, 200)}...
                    </p>

                    {/* HUD Bars */}
                    {bossProject.hero && (
                      <div className="mb-4">
                        <HudBars hero={bossProject.hero} />
                      </div>
                    )}

                    {/* Stats row */}
                    <div
                      className="flex items-center gap-6 pt-4 flex-wrap font-pixel text-[7px]"
                      style={{ borderTop: "2px solid var(--border-metal)" }}
                    >
                      <span style={{ color: "var(--neon-green)" }}>
                        <ChevronUp className="inline h-3 w-3" /> {formatNumber(bossProject.upvotes)}
                      </span>
                      <span style={{ color: "var(--neon-cyan)" }}>
                        <Eye className="inline h-3 w-3" /> {formatNumber(bossProject.views)}
                      </span>
                      <span style={{ color: "var(--neon-purple)" }}>
                        <Share2 className="inline h-3 w-3" /> {formatNumber(bossProject.shares)}
                      </span>
                      <span className="ml-auto" style={{ color: "#666" }}>
                        by {bossProject.creatorName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ================================================================
          SECTION 3 -- PROJECT MASONRY GRID (Xiaohongshu-style waterfall)
          ================================================================ */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Section heading */}
          <motion.div {...fadeUp} className="mb-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Star size={16} style={{ color: "var(--neon-purple)" }} />
                <span className="font-pixel text-[10px] uppercase tracking-widest" style={{ color: "var(--neon-purple)" }}>
                  {t("quest.label")}
                </span>
              </div>
              <h2 className="font-pixel text-sm sm:text-base" style={{ color: "#E8E8EC" }}>
                {t("quest.heading")}
              </h2>
            </div>
            <Link href="/explore">
              <button className="retro-button flex items-center gap-2">
                <span>{t("quest.viewAll")}</span>
                <ArrowRight size={12} />
              </button>
            </Link>
          </motion.div>

          {/* 2-column masonry layout */}
          <div className="columns-1 sm:columns-2 gap-5 [column-fill:_balance]">
            {gridProjects.map((project, i) => {
              const isOdd = i % 2 === 1;
              return (
                <motion.div
                  key={project.id}
                  {...staggerChild(i)}
                  className="break-inside-avoid mb-5"
                >
                  <Link href={`/project/${project.id}`} className="block group">
                    <div
                      className="retro-card l-corner relative overflow-hidden"
                      style={{
                        boxShadow: "4px 4px 0 #000",
                      }}
                    >
                      <div className="l-corner-inner absolute inset-0 pointer-events-none" />

                      {/* Top: Pixel art area (varying heights for masonry) */}
                      <div
                        className="relative flex items-center justify-center"
                        style={{
                          height: isOdd ? "180px" : "140px",
                          background: `radial-gradient(circle at 50% 60%, ${
                            project.hero
                              ? "rgba(157,0,255,0.08)"
                              : "rgba(6,182,212,0.05)"
                          }, transparent 70%)`,
                        }}
                      >
                        {project.hero ? (
                          <div className="sprite-float">
                            <div
                              className="w-16 h-16 flex items-center justify-center"
                              style={{
                                border: "2px solid var(--border-bolt)",
                                background: "var(--bg-card)",
                                imageRendering: "pixelated",
                              }}
                            >
                              <ClassIcon heroClass={project.hero.heroClass} size={32} />
                            </div>
                          </div>
                        ) : (
                          <div className="font-pixel text-[8px]" style={{ color: "var(--border-bolt)" }}>
                            {t("quest.noSprite")}
                          </div>
                        )}

                        {/* Category tag */}
                        <div
                          className="absolute top-3 right-3 font-pixel text-[6px] uppercase px-2 py-1"
                          style={{
                            border: "1px solid var(--border-bolt)",
                            background: "var(--bg-deep)",
                            color: "var(--neon-cyan)",
                          }}
                        >
                          {project.category}
                        </div>

                        {/* Viral badge */}
                        {project.viralBoosted && (
                          <div
                            className="absolute top-3 left-3 font-pixel text-[6px] uppercase px-2 py-1"
                            style={{
                              border: "1px solid var(--neon-orange)",
                              background: "rgba(255,69,0,0.1)",
                              color: "var(--neon-orange)",
                              textShadow: "0 0 8px var(--neon-orange-dim)",
                            }}
                          >
                            {t("quest.viral")}
                          </div>
                        )}
                      </div>

                      {/* Bottom: Info panel */}
                      <div className="p-3" style={{ borderTop: "2px solid var(--border-metal)" }}>
                        {/* Title + Level */}
                        <div className="flex items-center gap-2 mb-1">
                          {project.hero && (
                            <span
                              className="font-pixel text-[7px] px-1.5 py-0.5 shrink-0"
                              style={{
                                border: "1px solid var(--neon-purple)",
                                color: "var(--neon-purple)",
                              }}
                            >
                              LV.{project.hero.level}
                            </span>
                          )}
                          <h3
                            className="font-pixel text-[9px] truncate group-hover:text-[var(--neon-yellow)] transition-colors"
                            style={{ color: "#E8E8EC" }}
                          >
                            {project.title}
                          </h3>
                        </div>

                        {/* Class icon + Evolution */}
                        {project.hero && (
                          <div className="flex items-center gap-2 mb-2">
                            <ClassIcon heroClass={project.hero.heroClass} size={12} showLabel />
                            <EvolutionBadge stage={project.hero.evolutionStage} size="sm" />
                          </div>
                        )}

                        {/* HP / MP / EXP bars */}
                        {project.hero && (
                          <HudBars hero={project.hero} compact />
                        )}

                        {/* Quick stats */}
                        <div
                          className="flex items-center justify-between mt-2 pt-2 font-pixel text-[6px]"
                          style={{ borderTop: "1px solid var(--border-metal)", color: "#666" }}
                        >
                          <span>
                            <ChevronUp className="inline h-2.5 w-2.5" style={{ color: "var(--neon-green)" }} />
                            {formatNumber(project.upvotes)}
                          </span>
                          <span>
                            <Eye className="inline h-2.5 w-2.5" style={{ color: "var(--neon-cyan)" }} />
                            {formatNumber(project.views)}
                          </span>
                          <span style={{ color: "#555" }}>
                            {project.creatorName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 4 -- TRENDING / TODAY'S HOT (NES-style container)
          ================================================================ */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div {...fadeUp} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp size={16} style={{ color: "var(--neon-green)" }} />
              <span className="font-pixel text-[10px] uppercase tracking-widest" style={{ color: "var(--neon-green)" }}>
                {t("arena.label")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <h2 className="font-pixel text-sm sm:text-base" style={{ color: "#E8E8EC" }}>
                {t("arena.heading")}
              </h2>
              <Link href="/hunt">
                <button className="retro-button flex items-center gap-2">
                  <span>{t("arena.fullRankings")}</span>
                  <ArrowRight size={12} />
                </button>
              </Link>
            </div>
          </motion.div>

          {/* NES-style ranked list */}
          <motion.div {...fadeUp}>
            <div
              className="nes-container is-dark"
              style={{
                background: "var(--bg-panel)",
                border: "3px solid var(--border-metal)",
                padding: 0,
                boxShadow: "4px 4px 0 #000",
              }}
            >
              {rankedProjects.map((project, i) => {
                const isFirst = i === 0;
                const isSecond = i === 1;
                const isThird = i === 2;
                const rankColor = isFirst
                  ? "var(--neon-yellow)"
                  : isSecond
                    ? "#C0C0C0"
                    : isThird
                      ? "var(--neon-orange)"
                      : "#666";

                return (
                  <motion.div key={project.id} {...staggerChild(i)}>
                    <Link
                      href={`/project/${project.id}`}
                      className="group flex items-center gap-4 px-4 sm:px-6 py-4 transition-colors hover:bg-white/[0.02]"
                      style={{
                        borderBottom: i < rankedProjects.length - 1 ? "2px solid var(--border-metal)" : "none",
                      }}
                    >
                      {/* Rank number */}
                      <div
                        className="font-pixel text-base sm:text-lg w-8 text-center shrink-0"
                        style={{ color: rankColor, textShadow: isFirst ? "0 0 12px rgba(250,204,21,0.4)" : "none" }}
                      >
                        {isFirst && <Trophy className="inline h-5 w-5" />}
                        {!isFirst && `#${i + 1}`}
                      </div>

                      {/* Project info */}
                      <div className="min-w-0 flex-1">
                        <h3
                          className="font-pixel text-[8px] sm:text-[9px] truncate group-hover:text-[var(--neon-yellow)] transition-colors"
                          style={{ color: "#E8E8EC" }}
                        >
                          {project.title}
                        </h3>
                        <p className="font-retro text-sm truncate" style={{ color: "#666" }}>
                          {project.tagline}
                        </p>
                      </div>

                      {/* Class + Level */}
                      {project.hero && (
                        <div className="hidden sm:flex items-center gap-2">
                          <ClassIcon heroClass={project.hero.heroClass} size={12} />
                          <span className="font-pixel text-[7px]" style={{ color: "var(--neon-purple)" }}>
                            LV.{project.hero.level}
                          </span>
                        </div>
                      )}

                      {/* Score */}
                      <div
                        className="font-pixel text-[10px] shrink-0"
                        style={{ color: rankColor }}
                      >
                        {project.score}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================
          SECTION 5 -- TREND SIGNALS (Pixel radar)
          ================================================================ */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div {...fadeUp} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Zap size={16} style={{ color: "var(--neon-cyan)" }} />
              <span className="font-pixel text-[10px] uppercase tracking-widest" style={{ color: "var(--neon-cyan)" }}>
                {t("intel.label")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <h2 className="font-pixel text-sm sm:text-base" style={{ color: "#E8E8EC" }}>
                {t("intel.heading")}
              </h2>
              <Link href="/trends">
                <button className="retro-button flex items-center gap-2">
                  <span>{t("intel.allSignals")}</span>
                  <ArrowRight size={12} />
                </button>
              </Link>
            </div>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {selectedTrends.map((trend, i) => {
              const config = trendTypeConfig[trend.type] ?? trendTypeConfig.rising;
              const TrendIcon = config.icon;

              return (
                <motion.div key={trend.id} {...staggerChild(i)}>
                  <div
                    className="retro-card l-corner p-4 h-full flex flex-col"
                    style={{ boxShadow: "4px 4px 0 #000" }}
                  >
                    <div className="l-corner-inner absolute inset-0 pointer-events-none" />

                    {/* Icon + Signal badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-8 h-8 flex items-center justify-center"
                        style={{ border: "2px solid var(--border-bolt)", background: "var(--bg-deep)" }}
                      >
                        <TrendIcon size={14} style={{ color: config.color }} />
                      </div>
                      <span
                        className="font-pixel text-[6px] uppercase px-2 py-1"
                        style={{
                          border: `1px solid ${config.color}`,
                          color: config.color,
                        }}
                      >
                        {trend.signal}
                      </span>
                    </div>

                    <h3 className="font-pixel text-[8px] mb-2" style={{ color: "#E8E8EC" }}>
                      {trend.title}
                    </h3>
                    <p className="font-retro text-sm flex-1 leading-relaxed line-clamp-2" style={{ color: "#666" }}>
                      {trend.summary}
                    </p>

                    {/* Momentum bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-pixel text-[6px]" style={{ color: "#555" }}>{t("intel.momentum")}</span>
                        <span className="font-pixel text-[7px]" style={{ color: config.color }}>{trend.momentum}%</span>
                      </div>
                      <div className="rpg-bar h-3">
                        <motion.div
                          className="rpg-bar__fill"
                          style={{ background: config.color }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${trend.momentum}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: i * 0.1, ease: pixelEase }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 6 -- EVENTS (Game Event Board)
          ================================================================ */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div {...fadeUp} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Calendar size={16} style={{ color: "var(--neon-pink)" }} />
              <span className="font-pixel text-[10px] uppercase tracking-widest" style={{ color: "var(--neon-pink)" }}>
                {t("events.label")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <h2 className="font-pixel text-sm sm:text-base" style={{ color: "#E8E8EC" }}>
                {t("events.heading")}
              </h2>
              <Link href="/events">
                <button className="retro-button flex items-center gap-2">
                  <span>{t("events.allEvents")}</span>
                  <ArrowRight size={12} />
                </button>
              </Link>
            </div>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event, i) => {
              const typeColor = event.type === "hackathon"
                ? "var(--neon-purple)"
                : event.type === "demo-day"
                  ? "var(--neon-yellow)"
                  : event.type === "salon"
                    ? "var(--neon-pink)"
                    : "var(--neon-green)";

              return (
                <motion.div key={event.id} {...staggerChild(i)}>
                  <div
                    className="retro-card l-corner p-5 h-full flex flex-col"
                    style={{ boxShadow: "4px 4px 0 #000" }}
                  >
                    <div className="l-corner-inner absolute inset-0 pointer-events-none" />

                    {/* Type badges */}
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="font-pixel text-[6px] uppercase px-2 py-1"
                        style={{ border: `1px solid ${typeColor}`, color: typeColor }}
                      >
                        {event.type}
                      </span>
                      {event.isOnline && (
                        <span
                          className="font-pixel text-[6px] uppercase px-2 py-1"
                          style={{ border: "1px solid var(--neon-green)", color: "var(--neon-green)" }}
                        >
                          {t("events.online")}
                        </span>
                      )}
                      {event.status === "live" && (
                        <span
                          className="font-pixel text-[6px] uppercase px-2 py-1 animate-pulse"
                          style={{ border: "1px solid var(--neon-orange)", color: "var(--neon-orange)" }}
                        >
                          {t("events.live")}
                        </span>
                      )}
                    </div>

                    <h3 className="font-pixel text-[8px] leading-relaxed mb-2" style={{ color: "#E8E8EC" }}>
                      {event.title}
                    </h3>
                    <p className="font-retro text-sm flex-1 line-clamp-2 leading-relaxed" style={{ color: "#666" }}>
                      {event.description}
                    </p>

                    {/* Date + Location */}
                    <div
                      className="mt-4 pt-3 flex items-center gap-4 font-retro text-sm"
                      style={{ borderTop: "2px solid var(--border-metal)", color: "#555" }}
                    >
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" style={{ color: typeColor }} />
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" style={{ color: typeColor }} />
                        {event.location}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 7 -- COMMUNITY HUD (Quick stats + top creators)
          ================================================================ */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div {...fadeUp} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Users size={16} style={{ color: "var(--neon-green)" }} />
              <span className="font-pixel text-[10px] uppercase tracking-widest" style={{ color: "var(--neon-green)" }}>
                {t("guild.label")}
              </span>
            </div>
            <h2 className="font-pixel text-sm sm:text-base" style={{ color: "#E8E8EC" }}>
              {t("guild.heading")}
            </h2>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topCreators.map((creator, i) => (
              <motion.div key={creator.id} {...staggerChild(i)}>
                <div
                  className="retro-card l-corner p-5 h-full"
                  style={{ boxShadow: "4px 4px 0 #000" }}
                >
                  <div className="l-corner-inner absolute inset-0 pointer-events-none" />

                  {/* Rank + Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-8 h-8 flex items-center justify-center font-pixel text-sm"
                      style={{
                        border: "2px solid var(--neon-yellow)",
                        color: "var(--neon-yellow)",
                        background: "rgba(250,204,21,0.05)",
                      }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-pixel text-[8px]" style={{ color: "#E8E8EC" }}>
                        {creator.name}
                      </h3>
                      <p className="font-retro text-sm" style={{ color: "#666" }}>
                        Rank #{creator.rank}
                      </p>
                    </div>
                  </div>

                  {/* Stats as pixel bars */}
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between font-pixel text-[6px] mb-1">
                        <span style={{ color: "#555" }}>{t("guild.projects")}</span>
                        <span style={{ color: "var(--neon-cyan)" }}>{creator.projectCount}</span>
                      </div>
                      <div className="rpg-bar h-3">
                        <motion.div
                          className="rpg-bar__fill"
                          style={{ background: "var(--neon-cyan)" }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${Math.min(100, creator.projectCount * 10)}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: i * 0.1, ease: pixelEase }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-pixel text-[6px] mb-1">
                        <span style={{ color: "#555" }}>{t("guild.upvotes")}</span>
                        <span style={{ color: "var(--neon-green)" }}>{formatNumber(creator.totalUpvotes)}</span>
                      </div>
                      <div className="rpg-bar h-3">
                        <motion.div
                          className="rpg-bar__fill"
                          style={{ background: "var(--neon-green)" }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${Math.min(100, creator.totalUpvotes / 50)}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: i * 0.1 + 0.1, ease: pixelEase }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-pixel text-[6px] mb-1">
                        <span style={{ color: "#555" }}>{t("guild.growth")}</span>
                        <span style={{ color: "var(--neon-purple)" }}>+{creator.weeklyGrowth}%</span>
                      </div>
                      <div className="rpg-bar h-3">
                        <motion.div
                          className="rpg-bar__fill"
                          style={{ background: "var(--neon-purple)" }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${Math.min(100, creator.weeklyGrowth)}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: i * 0.1 + 0.2, ease: pixelEase }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {creator.badges.slice(0, 3).map((badge) => (
                      <span
                        key={badge}
                        className="font-pixel text-[5px] uppercase px-1.5 py-0.5"
                        style={{
                          border: "1px solid var(--border-bolt)",
                          color: "var(--neon-yellow)",
                        }}
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 8 -- FINAL CTA (Game Over / Continue?)
          ================================================================ */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div {...fadeUp}>
            <div
              className="retro-dialog text-center py-16 px-6 sm:px-12"
              style={{
                boxShadow: "0 0 40px rgba(157,0,255,0.1), 4px 4px 0 #000",
              }}
            >
              {/* Pixel art decoration */}
              <div
                className="font-pixel text-[8px] mb-6 tracking-widest"
                style={{ color: "var(--neon-cyan)" }}
              >
                {t("cta.transmission")}
              </div>

              <h2
                className="font-pixel text-sm sm:text-base lg:text-lg mb-4"
                style={{
                  color: "var(--neon-yellow)",
                  textShadow: "0 0 20px rgba(250,204,21,0.3)",
                }}
              >
                {t("cta.heading1")}
                <br />
                {t("cta.heading2")}
              </h2>

              <p className="font-retro text-base sm:text-lg max-w-xl mx-auto mb-8" style={{ color: "#888" }}>
                {t("cta.description")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/launch">
                  <button className="retro-button retro-button--primary flex items-center gap-2 mx-auto sm:mx-0">
                    <Swords size={14} />
                    <span>{t("cta.beginQuest")}</span>
                  </button>
                </Link>
                <Link href="/explore">
                  <button className="retro-button retro-button--danger flex items-center gap-2 mx-auto sm:mx-0">
                    <Eye size={14} />
                    <span>{t("cta.spectate")}</span>
                  </button>
                </Link>
              </div>

              {/* Weekly winner callout */}
              {weeklyWinners.length > 0 && (
                <div
                  className="mt-10 pt-6 font-pixel text-[7px]"
                  style={{ borderTop: "2px solid var(--border-metal)" }}
                >
                  <span style={{ color: "#555" }}>{t("cta.lastWeekChampion")}</span>
                  <span style={{ color: "var(--neon-yellow)" }}>
                    {weeklyWinners[0].projectTitle}
                  </span>
                  <span style={{ color: "#555" }}>{t("cta.by")}</span>
                  <span style={{ color: "var(--neon-green)" }}>
                    {weeklyWinners[0].creatorName}
                  </span>
                  <span style={{ color: "#555" }}>{t("cta.score")}{weeklyWinners[0].score})</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
