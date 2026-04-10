"use client";

import { motion } from "framer-motion";
import { Heart, Eye, Play, GitFork } from "lucide-react";
import type { Project } from "@/lib/types";

interface ProjectDemoCardProps {
  project: Project;
  className?: string;
}

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

/**
 * "Front" face of the flip card.
 * Premium holographic trading card — gold embossed border, foil shimmer,
 * sun-ray sprite background, pixel scoreboard stats, engraved creator footer.
 * This is what a project looks like AFTER VibeX turns it into a collectible.
 */
export function ProjectDemoCard({ project, className = "" }: ProjectDemoCardProps) {
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(160deg, #0f0a1a 0%, #140a1f 40%, #1a0a1f 100%)",
        border: "3px solid #FFD700",
        boxShadow:
          "0 0 0 1px #000, 0 0 0 4px #1a1322, 0 0 0 5px #5a4417, 0 0 24px rgba(255,215,0,0.28), 0 12px 40px rgba(0,0,0,0.7), inset 0 0 32px rgba(157,0,255,0.15)",
      }}
    >
      {/* Holographic foil shimmer — animated diagonal sweep */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, transparent 25%, rgba(255,255,255,0.08) 42%, rgba(157,0,255,0.14) 48%, rgba(6,182,212,0.12) 52%, rgba(57,255,20,0.10) 58%, transparent 75%)",
          mixBlendMode: "screen",
          zIndex: 20,
          backgroundSize: "300% 300%",
        }}
        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear", repeatType: "reverse" }}
      />

      {/* Inner gold pinstripe frame */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          inset: 6,
          border: "1px solid rgba(255,215,0,0.5)",
          zIndex: 15,
          boxShadow: "inset 0 0 12px rgba(255,215,0,0.1)",
        }}
      />

      {/* ═══ TOP BAR — rarity + featured crown ═══ */}
      <div
        className="flex items-center justify-between px-2.5 py-1.5 relative z-10"
        style={{
          background:
            "linear-gradient(90deg, #1a0a1f 0%, #2a1030 50%, #1a0a1f 100%)",
          borderBottom: "2px solid #FFD700",
          boxShadow: "0 2px 0 rgba(255,215,0,0.2), inset 0 1px 0 rgba(255,215,0,0.3)",
        }}
      >
        <span
          className="font-pixel uppercase"
          style={{
            fontSize: 6,
            letterSpacing: 1.5,
            color: "#FFD700",
            textShadow: "0 0 4px rgba(255,215,0,0.7), 1px 1px 0 #000",
          }}
        >
          ★ {project.category} ★
        </span>
        {project.featured && (
          <span
            className="font-pixel"
            style={{
              fontSize: 6,
              letterSpacing: 1,
              color: "#000",
              background:
                "linear-gradient(180deg, #FFEC80 0%, #FFD700 50%, #B8860B 100%)",
              padding: "2px 6px",
              border: "1px solid #8B6914",
              boxShadow: "0 0 10px rgba(255,215,0,0.7), inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
          >
            FEATURED
          </span>
        )}
      </div>

      {/* ═══ SPRITE ART PANEL — sun rays + emoji + sparkles ═══ */}
      <div
        className="relative flex items-center justify-center"
        style={{
          minHeight: 110,
          flex: 1,
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(157,0,255,0.35) 0%, rgba(157,0,255,0.1) 40%, transparent 70%)",
          borderBottom: "2px solid rgba(255,215,0,0.3)",
          overflow: "hidden",
        }}
      >
        {/* Sun ray burst */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full opacity-40"
          viewBox="0 0 200 120"
          preserveAspectRatio="xMidYMid slice"
        >
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i * 22.5 * Math.PI) / 180;
            const x1 = 100 + Math.cos(angle) * 20;
            const y1 = 55 + Math.sin(angle) * 20;
            const x2 = 100 + Math.cos(angle) * 200;
            const y2 = 55 + Math.sin(angle) * 200;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#9D00FF"
                strokeWidth="1.5"
                strokeLinecap="square"
                opacity={i % 2 === 0 ? 0.6 : 0.25}
              />
            );
          })}
        </svg>

        {/* Floating sparkles */}
        {[
          { left: "18%", top: "22%", size: 3, color: "#FFD700", delay: 0 },
          { left: "82%", top: "28%", size: 4, color: "#39FF14", delay: 0.8 },
          { left: "14%", top: "72%", size: 3, color: "#06B6D4", delay: 1.4 },
          { left: "86%", top: "70%", size: 4, color: "#EC4899", delay: 2 },
          { left: "50%", top: "12%", size: 3, color: "#FFF", delay: 0.4 },
        ].map((s, i) => (
          <motion.div
            key={i}
            aria-hidden="true"
            className="absolute pointer-events-none"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              background: s.color,
              boxShadow: `0 0 8px ${s.color}, 0 0 2px ${s.color}`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.8, 1.3, 0.8],
            }}
            transition={{
              duration: 2,
              delay: s.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Big emoji */}
        <motion.div
          className="relative z-10"
          style={{
            fontSize: 56,
            filter:
              "drop-shadow(0 0 14px rgba(157,0,255,0.8)) drop-shadow(0 4px 6px rgba(0,0,0,0.6))",
            imageRendering: "pixelated",
          }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          {"\u{1F916}"}
        </motion.div>

        {/* Bottom ground shadow */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: 8,
            width: 80,
            height: 6,
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ═══ TITLE PLATE ═══ */}
      <div
        className="px-3 py-2 relative z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(157,0,255,0.15) 0%, rgba(0,0,0,0.4) 100%)",
          borderBottom: "1px dashed rgba(255,215,0,0.3)",
        }}
      >
        <h3
          className="font-pixel leading-tight truncate"
          style={{
            fontSize: 10,
            color: "#FFF",
            textShadow:
              "1px 1px 0 #9D00FF, -1px -1px 0 rgba(6,182,212,0.7), 0 0 10px rgba(157,0,255,0.5)",
          }}
        >
          {project.title}
        </h3>
        <p
          className="font-retro mt-1 line-clamp-2 leading-tight"
          style={{
            fontSize: 12,
            color: "#C9B8E8",
          }}
        >
          {project.tagline}
        </p>
      </div>

      {/* ═══ PIXEL SCOREBOARD STATS ═══ */}
      <div
        className="grid grid-cols-4 relative z-10"
        style={{
          background: "rgba(0,0,0,0.55)",
        }}
      >
        {[
          { Icon: Heart, value: project.upvotes, color: "#EC4899" },
          { Icon: Eye, value: project.views, color: "#06B6D4" },
          { Icon: Play, value: project.plays, color: "#39FF14" },
          { Icon: GitFork, value: project.remixCount, color: "#9D00FF" },
        ].map(({ Icon, value, color }, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center gap-1 py-2"
            style={{
              borderRight: i < 3 ? "1px solid rgba(255,215,0,0.25)" : "none",
            }}
          >
            <Icon className="h-3 w-3" style={{ color, filter: `drop-shadow(0 0 4px ${color})` }} />
            <span
              className="font-pixel"
              style={{
                fontSize: 7,
                color: "#FFE680",
                textShadow: `0 0 4px ${color}`,
                letterSpacing: 0.5,
              }}
            >
              {formatCount(value)}
            </span>
          </div>
        ))}
      </div>

      {/* ═══ GOLD ENGRAVED CREATOR FOOTER ═══ */}
      <div
        className="px-3 py-1.5 text-center relative z-10"
        style={{
          background:
            "linear-gradient(90deg, #1a0a1f 0%, #2a1030 50%, #1a0a1f 100%)",
          borderTop: "2px solid #FFD700",
          boxShadow: "0 -1px 0 rgba(255,215,0,0.3) inset",
        }}
      >
        <span
          className="font-pixel uppercase"
          style={{
            fontSize: 6,
            letterSpacing: 2,
            color: "#FFD700",
            textShadow: "0 0 4px rgba(255,215,0,0.6), 1px 1px 0 #000",
          }}
        >
          ◆ BY {project.creatorName.toUpperCase()} ◆
        </span>
      </div>
    </motion.div>
  );
}
