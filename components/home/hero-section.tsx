"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Flame,
  ChevronUp,
  Eye,
  Share2,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useLang } from "@/lib/i18n";
import type { Project } from "@/lib/types";

const HudBars = dynamic(() => import("@/components/rpg/hud-bars").then((m) => ({ default: m.HudBars })), { ssr: false });
const ClassIcon = dynamic(() => import("@/components/rpg/class-icon").then((m) => ({ default: m.ClassIcon })), { ssr: false });
const EvolutionBadge = dynamic(() => import("@/components/rpg/evolution-badge").then((m) => ({ default: m.EvolutionBadge })), { ssr: false });

/* ─── animation presets (shared) ─── */
const pixelEase = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.5, ease: pixelEase },
};

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

/* NOTE: This component is named HeroSection but renders the "Boss Encounter"
   featured-project spotlight. The parent requested the name hero-section.tsx
   for the "Hero area with stats", which in the page corresponds to the boss
   encounter section (section 2). */

interface BossEncounterProps {
  bossProject: Project;
}

export function HeroSection({ bossProject }: BossEncounterProps) {
  const { t } = useLang();

  return (
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

        {/* Boss card */}
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
                    {bossProject.hero && <ClassIcon heroClass={bossProject.hero.heroClass} size={14} showLabel />}
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

                  {bossProject.hero && (
                    <div className="mb-4">
                      <HudBars hero={bossProject.hero} />
                    </div>
                  )}

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
  );
}
