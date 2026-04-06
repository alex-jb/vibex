"use client";

import { motion } from "framer-motion";
import type { Project, HeroClass } from "@/lib/types";
import { CLASS_CONFIG } from "@/lib/rpg-utils";
import { ClassIcon } from "./class-icon";
import { EvolutionBadge } from "./evolution-badge";
import { HudBars } from "./hud-bars";

const CLASS_EMOJI: Record<HeroClass, string> = {
  Architect: "\u{1F3D7}\uFE0F",
  Artisan: "\u{1F3A8}",
  Enchanter: "\u2728",
  Alchemist: "\u{1F9EA}",
  Sentinel: "\u{1F6E1}\uFE0F",
};

interface HeroCardProps {
  project: Project;
  compact?: boolean;
  className?: string;
  onClick?: () => void;
}

export function HeroCard({
  project,
  compact = false,
  className = "",
  onClick,
}: HeroCardProps) {
  const hero = project.hero;
  if (!hero) return null;

  const classConfig = CLASS_CONFIG[hero.heroClass];

  return (
    <motion.div
      className={`retro-card l-corner relative overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      style={{ cursor: onClick ? "pointer" : undefined }}
    >
      {/* L-corner inner (top-right + bottom-left) */}
      <div className="l-corner-inner absolute inset-0 pointer-events-none" />

      {/* Header strip */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: "oklch(1 0 0 / 8%)" }}
      >
        <div className="flex items-center gap-2">
          <div className="level-badge">
            <span style={{ color: classConfig.color }}>Lv</span>
            <span className="ml-0.5">{hero.level}</span>
          </div>
          <ClassIcon heroClass={hero.heroClass} size={14} showLabel />
        </div>
        <EvolutionBadge stage={hero.evolutionStage} size="sm" />
      </div>

      {/* Sprite area */}
      <div className="relative flex items-center justify-center py-4 px-3">
        {/* Background glow */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `radial-gradient(circle at 50% 60%, ${classConfig.color}, transparent 70%)`,
          }}
        />

        {/* Pixel sprite placeholder */}
        <div className="sprite-float relative">
          <div
            className="w-16 h-16 rounded flex items-center justify-center"
            style={{
              background: `${classConfig.color}20`,
              border: `2px solid ${classConfig.color}40`,
              imageRendering: "pixelated",
            }}
          >
            <span className="text-4xl leading-none" role="img" aria-label={hero.heroClass}>
              {CLASS_EMOJI[hero.heroClass]}
            </span>
          </div>
        </div>
      </div>

      {/* Name + tagline */}
      <div className="px-3 pb-2">
        <h3 className="font-pixel text-[9px] leading-tight text-foreground truncate">
          {project.title}
        </h3>
        {!compact && (
          <p className="font-retro text-sm text-muted-foreground mt-0.5 truncate">
            {project.tagline}
          </p>
        )}
      </div>

      {/* HUD Bars */}
      <div className="px-3 pb-3">
        <HudBars hero={hero} compact={compact} />
      </div>

      {/* Quick stats row */}
      {!compact && (
        <div
          className="flex items-center justify-between px-3 py-2 border-t font-pixel text-[7px] text-muted-foreground"
          style={{ borderColor: "oklch(1 0 0 / 8%)" }}
        >
          <span>
            PWR <span className="text-foreground">{hero.attributes.power}</span>
          </span>
          <span>
            WIS <span className="text-foreground">{hero.attributes.wisdom}</span>
          </span>
          <span>
            CHA <span className="text-foreground">{hero.attributes.charisma}</span>
          </span>
          <span>
            AGI <span className="text-foreground">{hero.attributes.agility}</span>
          </span>
        </div>
      )}
    </motion.div>
  );
}
