"use client";

import { motion } from "framer-motion";
import { Crown, Medal, Award } from "lucide-react";
import type { Project } from "@/lib/types";
import { CLASS_CONFIG } from "@/lib/rpg-utils";
import { ClassIcon } from "./class-icon";
import { HudBars } from "./hud-bars";

interface GymLeaderCardProps {
  project: Project;
  rank: 1 | 2 | 3;
  className?: string;
}

const RANK_CONFIG = {
  1: {
    title: "Gym Master",
    icon: Crown,
    borderClass: "fire-border",
    color: "#facc15",
    glow: "0 0 30px #facc1540, 0 0 60px #facc1520",
  },
  2: {
    title: "Elite Four",
    icon: Medal,
    borderClass: "",
    color: "#94a3b8",
    glow: "0 0 20px #94a3b840",
  },
  3: {
    title: "Challenger",
    icon: Award,
    borderClass: "",
    color: "#cd7c32",
    glow: "0 0 20px #cd7c3240",
  },
};

export function GymLeaderCard({
  project,
  rank,
  className = "",
}: GymLeaderCardProps) {
  const hero = project.hero;
  if (!hero) return null;

  const config = RANK_CONFIG[rank];
  const RankIcon = config.icon;
  const classConfig = CLASS_CONFIG[hero.heroClass];

  return (
    <motion.div
      className={`relative retro-card l-corner ${config.borderClass} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: (rank - 1) * 0.15 }}
      style={{ boxShadow: config.glow }}
    >
      <div className="l-corner-inner absolute inset-0 pointer-events-none" />

      {/* Rank crown */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
        <div
          className="flex items-center gap-1 retro-border px-2 py-1"
          style={{
            background: "oklch(0.12 0 0)",
            borderColor: config.color,
          }}
        >
          <RankIcon size={12} style={{ color: config.color }} />
          <span
            className="font-pixel text-[7px] uppercase"
            style={{ color: config.color }}
          >
            #{rank} {config.title}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="pt-5 px-3 pb-3">
        {/* Hero info */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-10 h-10 rounded flex items-center justify-center sprite-float"
            style={{
              background: `${classConfig.color}20`,
              border: `2px solid ${classConfig.color}40`,
            }}
          >
            <ClassIcon heroClass={hero.heroClass} size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-pixel text-[8px] text-foreground truncate">
              {project.title}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="level-badge" style={{ borderColor: config.color }}>
                <span style={{ color: config.color }}>Lv</span>
                <span className="ml-0.5">{hero.level}</span>
              </span>
              <span className="font-retro text-xs text-muted-foreground">
                {project.creatorName}
              </span>
            </div>
          </div>
        </div>

        {/* HUD */}
        <HudBars hero={hero} compact />

        {/* Score */}
        <div className="flex items-center justify-between mt-2 font-pixel text-[7px]">
          <span className="text-muted-foreground">
            Score{" "}
            <span className="text-foreground">{project.score}</span>
          </span>
          <span className="text-muted-foreground">
            EVO{" "}
            <span style={{ color: config.color }}>
              {hero.evolutionStage.toUpperCase()}
            </span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
