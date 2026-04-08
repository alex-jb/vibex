"use client";

import { useMemo, Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Trophy,
  Zap,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  MapPin,
  ArrowRight,
  Users,
  Rocket,
  Compass,
  Swords,
  MessageSquare,
} from "lucide-react";
import {
  projects,
  events,
  trendInsights,
  creators,
  weeklyWinners,
} from "@/lib/mock-data";
import { useLang } from "@/lib/i18n";
import { BootSequence } from "@/components/home/boot-sequence";
import { ValueHero } from "@/components/home/value-hero";
import { HeroSection } from "@/components/home/hero-section";
import { QuestBoard } from "@/components/home/quest-board";
import { CtaSection } from "@/components/home/cta-section";

/* ─── lazy-loaded below-fold RPG components ─── */
const ClassIcon = dynamic(() => import("@/components/rpg/class-icon").then(m => ({ default: m.ClassIcon })), {
  ssr: false,
  loading: () => <span className="inline-block w-6 h-6 animate-pulse rounded" style={{ background: "var(--border-metal)" }} />,
});

/* ─── skeleton fallback for lazy sections ─── */
function SectionSkeleton() {
  return (
    <div className="py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 animate-pulse">
        <div className="h-4 w-40 mb-4" style={{ background: "var(--border-metal)" }} />
        <div className="h-3 w-64 mb-8" style={{ background: "var(--border-metal)", opacity: 0.5 }} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((k) => (
            <div key={k} className="h-48" style={{ background: "var(--bg-panel)", border: "2px solid var(--border-metal)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

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
  const { t, lang } = useLang();

  const communityStats = useMemo(() => [
    { label: t("stats.questsLaunched"), value: "12K+", color: "var(--neon-green)" },
    { label: t("stats.activeHeroes"), value: "8K+", color: "var(--neon-cyan)" },
    { label: t("stats.guildActions"), value: "500K+", color: "var(--neon-purple)" },
  ], [t]);

  const bossProject = projects.filter((p) => p.featured)[0];
  const gridProjects = projects.slice(0, 6);
  const rankedProjects = [...projects].sort((a, b) => b.score - a.score).slice(0, 5);
  const selectedTrends = trendInsights.slice(0, 4);
  const upcomingEvents = events.slice(0, 3);
  const topCreators = creators.slice(0, 3);

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "var(--bg-deep)" }}>
      {/* Scanline CRT overlay */}
      <div className="scanline-overlay" />

      {/* SECTION 1 -- TERMINAL BOOT HERO */}
      <BootSequence communityStats={communityStats} />

      {/* VALUE HERO — 3-second value proposition */}
      <ValueHero />

      {/* QUICK ACTIONS BAR */}
      <section className="py-6">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: t("quick.launch"), href: "/launch", icon: Rocket, gradient: "linear-gradient(135deg, #7C3AED, #9D4EDD)" },
              { label: t("quick.discover"), href: "/discover", icon: Compass, gradient: "linear-gradient(135deg, #06B6D4, #22D3EE)" },
              { label: t("quick.dojo"), href: "/dojo", icon: Swords, gradient: "linear-gradient(135deg, #D97706, #F59E0B)" },
              { label: t("quick.feed"), href: "/feed", icon: MessageSquare, gradient: "linear-gradient(135deg, #DB2777, #F472B6)" },
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.div key={action.label} {...staggerChild(i)}>
                  <Link href={action.href}>
                    <div
                      className="retro-card p-3 flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                      style={{ boxShadow: "3px 3px 0 #000" }}
                    >
                      <div
                        className="w-10 h-10 flex items-center justify-center"
                        style={{ background: action.gradient, border: "2px solid var(--border-metal)" }}
                      >
                        <Icon size={18} color="#fff" />
                      </div>
                      <span className="font-pixel text-[7px] uppercase tracking-wider" style={{ color: "#E8E8EC" }}>
                        {action.label}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LIVE ACTIVITY TICKER */}
      <section className="py-2 overflow-hidden" style={{ background: "rgba(0,0,0,0.6)", borderTop: "1px solid var(--border-metal)", borderBottom: "1px solid var(--border-metal)" }}>
        <div className="relative">
          <div
            className="flex whitespace-nowrap font-pixel text-[8px]"
            style={{
              color: "var(--neon-green)",
              animation: "marquee 30s linear infinite",
            }}
          >
            {[
              "\uD83D\uDD25 AlphaSignal just reached 10k runs",
              "\u2694\uFE0F CodeWizard won Arena battle vs PixelMind",
              "\uD83C\uDFAE New buddy 'NeonSlime' discovered",
              "\uD83D\uDE80 ProjectX launched with score 94",
              "\uD83D\uDC51 Mika Tanaka reached Level 50",
            ].map((msg, i) => (
              <span key={i} className="mx-8">{msg}</span>
            ))}
            {/* duplicate for seamless loop */}
            {[
              "\uD83D\uDD25 AlphaSignal just reached 10k runs",
              "\u2694\uFE0F CodeWizard won Arena battle vs PixelMind",
              "\uD83C\uDFAE New buddy 'NeonSlime' discovered",
              "\uD83D\uDE80 ProjectX launched with score 94",
              "\uD83D\uDC51 Mika Tanaka reached Level 50",
            ].map((msg, i) => (
              <span key={`dup-${i}`} className="mx-8">{msg}</span>
            ))}
          </div>
        </div>
        <style jsx>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* SECTION 2 -- BOSS ENCOUNTER (Featured Project) */}
      <HeroSection bossProject={bossProject} />

      {/* Below-fold sections wrapped in Suspense for progressive loading */}
      <Suspense fallback={<SectionSkeleton />}>
        {/* SECTION 3 -- QUEST BOARD (Project Grid) */}
        <QuestBoard gridProjects={gridProjects} />

        {/* SECTION 4 -- TRENDING / TODAY'S HOT */}
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
                        <div
                          className="font-pixel text-base sm:text-lg w-8 text-center shrink-0"
                          style={{ color: rankColor, textShadow: isFirst ? "0 0 12px rgba(250,204,21,0.4)" : "none" }}
                        >
                          {isFirst && <Trophy className="inline h-5 w-5" />}
                          {!isFirst && `#${i + 1}`}
                        </div>
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
                        {project.hero && (
                          <div className="hidden sm:flex items-center gap-2">
                            <ClassIcon heroClass={project.hero.heroClass} size={12} />
                            <span className="font-pixel text-[7px]" style={{ color: "var(--neon-purple)" }}>
                              LV.{project.hero.level}
                            </span>
                          </div>
                        )}
                        <div className="font-pixel text-[10px] shrink-0" style={{ color: rankColor }}>
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

        {/* SECTION 5 -- TREND SIGNALS */}
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
                    <div className="retro-card l-corner p-4 h-full flex flex-col" style={{ boxShadow: "4px 4px 0 #000" }}>
                      <div className="l-corner-inner absolute inset-0 pointer-events-none" />
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 flex items-center justify-center" style={{ border: "2px solid var(--border-bolt)", background: "var(--bg-deep)" }}>
                          <TrendIcon size={14} style={{ color: config.color }} />
                        </div>
                        <span className="font-pixel text-[6px] uppercase px-2 py-1" style={{ border: `1px solid ${config.color}`, color: config.color }}>
                          {trend.signal}
                        </span>
                      </div>
                      <h3 className="font-pixel text-[8px] mb-2" style={{ color: "#E8E8EC" }}>{trend.title}</h3>
                      <p className="font-retro text-sm flex-1 leading-relaxed line-clamp-2" style={{ color: "#666" }}>{trend.summary}</p>
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

        {/* SECTION 6 -- EVENTS */}
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
                    <div className="retro-card l-corner p-5 h-full flex flex-col" style={{ boxShadow: "4px 4px 0 #000" }}>
                      <div className="l-corner-inner absolute inset-0 pointer-events-none" />
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-pixel text-[6px] uppercase px-2 py-1" style={{ border: `1px solid ${typeColor}`, color: typeColor }}>
                          {event.type}
                        </span>
                        {event.isOnline && (
                          <span className="font-pixel text-[6px] uppercase px-2 py-1" style={{ border: "1px solid var(--neon-green)", color: "var(--neon-green)" }}>
                            {t("events.online")}
                          </span>
                        )}
                        {event.status === "live" && (
                          <span className="font-pixel text-[6px] uppercase px-2 py-1 animate-pulse" style={{ border: "1px solid var(--neon-orange)", color: "var(--neon-orange)" }}>
                            {t("events.live")}
                          </span>
                        )}
                      </div>
                      <h3 className="font-pixel text-[8px] leading-relaxed mb-2" style={{ color: "#E8E8EC" }}>{event.title}</h3>
                      <p className="font-retro text-sm flex-1 line-clamp-2 leading-relaxed" style={{ color: "#666" }}>{event.description}</p>
                      <div className="mt-4 pt-3 flex items-center gap-4 font-retro text-sm" style={{ borderTop: "2px solid var(--border-metal)", color: "#555" }}>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" style={{ color: typeColor }} />
                          {new Date(event.date).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US", { month: "short", day: "numeric" })}
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

        {/* WEEKLY SPOTLIGHT */}
        {weeklyWinners[0] && (
          <section className="py-16 lg:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <motion.div {...fadeUp} className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy size={16} style={{ color: "var(--neon-yellow)" }} />
                  <span className="font-pixel text-[10px] uppercase tracking-widest" style={{ color: "var(--neon-yellow)" }}>
                    Weekly Spotlight
                  </span>
                </div>
                <h2 className="font-pixel text-sm sm:text-base" style={{ color: "#E8E8EC" }}>
                  This Week&apos;s Champion
                </h2>
              </motion.div>

              <motion.div {...fadeUp}>
                <Link href={`/project/${weeklyWinners[0].projectId}`}>
                  <div
                    className="retro-card l-corner p-6 sm:p-8 relative overflow-hidden cursor-pointer transition-transform hover:scale-[1.01]"
                    style={{
                      border: "3px solid var(--neon-yellow)",
                      boxShadow: "0 0 24px rgba(250,204,21,0.25), 4px 4px 0 #000",
                    }}
                  >
                    <div className="l-corner-inner absolute inset-0 pointer-events-none" />

                    {/* Champion badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <div
                        className="flex items-center gap-2 px-3 py-1.5 font-pixel text-[7px] uppercase tracking-widest"
                        style={{
                          background: "rgba(250,204,21,0.1)",
                          border: "2px solid var(--neon-yellow)",
                          color: "var(--neon-yellow)",
                        }}
                      >
                        <Trophy size={12} />
                        Weekly Champion
                      </div>
                      <span className="font-pixel text-[6px] uppercase px-2 py-1" style={{ border: "1px solid var(--neon-orange)", color: "var(--neon-orange)" }}>
                        {weeklyWinners[0].category}
                      </span>
                    </div>

                    {/* Project info */}
                    <h3
                      className="font-pixel text-sm sm:text-base mb-2"
                      style={{ color: "var(--neon-yellow)", textShadow: "0 0 12px rgba(250,204,21,0.3)" }}
                    >
                      {weeklyWinners[0].projectTitle}
                    </h3>
                    <p className="font-retro text-sm mb-4" style={{ color: "#888" }}>
                      by {weeklyWinners[0].creatorName}
                    </p>

                    {/* Score + CTA row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="font-pixel text-lg sm:text-xl"
                          style={{ color: "var(--neon-yellow)", textShadow: "0 0 16px rgba(250,204,21,0.4)" }}
                        >
                          {weeklyWinners[0].score}
                        </div>
                        <span className="font-pixel text-[6px] uppercase" style={{ color: "#666" }}>
                          Score
                        </span>
                      </div>
                      <div className="retro-button flex items-center gap-2">
                        <span>View Project</span>
                        <ArrowRight size={12} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
          </section>
        )}

        {/* SECTION 7 -- COMMUNITY HUD */}
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
                  <div className="retro-card l-corner p-5 h-full" style={{ boxShadow: "4px 4px 0 #000" }}>
                    <div className="l-corner-inner absolute inset-0 pointer-events-none" />
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-8 h-8 flex items-center justify-center font-pixel text-sm"
                        style={{ border: "2px solid var(--neon-yellow)", color: "var(--neon-yellow)", background: "rgba(250,204,21,0.05)" }}
                      >
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="font-pixel text-[8px]" style={{ color: "#E8E8EC" }}>{creator.name}</h3>
                        <p className="font-retro text-sm" style={{ color: "#666" }}>{t("guild.rank")} #{creator.rank}</p>
                      </div>
                    </div>
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
                    <div className="mt-3 flex flex-wrap gap-1">
                      {creator.badges.slice(0, 3).map((badge) => (
                        <span
                          key={badge}
                          className="font-pixel text-[5px] uppercase px-1.5 py-0.5"
                          style={{ border: "1px solid var(--border-bolt)", color: "var(--neon-yellow)" }}
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

        {/* SECTION 8 -- FINAL CTA */}
        <CtaSection weeklyWinners={weeklyWinners} />
      </Suspense>
    </div>
  );
}
