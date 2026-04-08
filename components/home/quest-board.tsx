"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Star, ArrowRight, ChevronUp, Eye } from "lucide-react";
import dynamic from "next/dynamic";
import { useLang } from "@/lib/i18n";
import type { Project } from "@/lib/types";

const HudBars = dynamic(() => import("@/components/rpg/hud-bars").then((m) => ({ default: m.HudBars })), {
  ssr: false,
  loading: () => <div className="w-full h-10 animate-pulse rounded" style={{ background: "var(--border-metal)" }} />,
});
const ClassIcon = dynamic(() => import("@/components/rpg/class-icon").then((m) => ({ default: m.ClassIcon })), {
  ssr: false,
  loading: () => <span className="inline-block w-6 h-6 animate-pulse rounded" style={{ background: "var(--border-metal)" }} />,
});
const EvolutionBadge = dynamic(() => import("@/components/rpg/evolution-badge").then((m) => ({ default: m.EvolutionBadge })), {
  ssr: false,
  loading: () => <span className="inline-block w-16 h-5 animate-pulse rounded-full" style={{ background: "var(--border-metal)" }} />,
});

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

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

interface QuestBoardProps {
  gridProjects: Project[];
}

export function QuestBoard({ gridProjects }: QuestBoardProps) {
  const { t } = useLang();

  return (
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
          <Link href="/discover">
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
              <motion.div key={project.id} {...staggerChild(i)} className="break-inside-avoid mb-5">
                <Link href={`/project/${project.id}`} className="block group">
                  <div
                    className="retro-card l-corner relative overflow-hidden"
                    style={{ boxShadow: "4px 4px 0 #000" }}
                  >
                    <div className="l-corner-inner absolute inset-0 pointer-events-none" />

                    {/* Top: Pixel art area */}
                    <div
                      className="relative flex items-center justify-center"
                      style={{
                        height: isOdd ? "180px" : "140px",
                        background: `radial-gradient(circle at 50% 60%, ${
                          project.hero ? "rgba(157,0,255,0.08)" : "rgba(6,182,212,0.05)"
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
                      <div className="flex items-center gap-2 mb-1">
                        {project.hero && (
                          <span
                            className="font-pixel text-[7px] px-1.5 py-0.5 shrink-0"
                            style={{ border: "1px solid var(--neon-purple)", color: "var(--neon-purple)" }}
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

                      {project.hero && (
                        <div className="flex items-center gap-2 mb-2">
                          <ClassIcon heroClass={project.hero.heroClass} size={12} showLabel />
                          <EvolutionBadge stage={project.hero.evolutionStage} size="sm" />
                        </div>
                      )}

                      {project.hero && <HudBars hero={project.hero} compact />}

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
                        <span style={{ color: "#555" }}>{project.creatorName}</span>
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
  );
}
