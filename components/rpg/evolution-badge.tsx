"use client";

import { Sprout, Zap, TrendingUp, Flame, Crown, Sparkles } from "lucide-react";
import type { EvolutionStage } from "@/lib/types";
import { EVOLUTION_CONFIG } from "@/lib/rpg-utils";

const ICON_MAP: Record<EvolutionStage, React.ElementType> = {
  Seed: Sprout,
  Active: Zap,
  Growing: TrendingUp,
  Breakout: Flame,
  Legend: Crown,
  Myth: Sparkles,
};

interface EvolutionBadgeProps {
  stage: EvolutionStage;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { icon: 12, text: "7px", pad: "px-1.5 py-0.5" },
  md: { icon: 14, text: "8px", pad: "px-2 py-1" },
  lg: { icon: 18, text: "10px", pad: "px-3 py-1.5" },
};

export function EvolutionBadge({
  stage,
  size = "md",
  className = "",
}: EvolutionBadgeProps) {
  const config = EVOLUTION_CONFIG[stage];
  const Icon = ICON_MAP[stage];
  const s = sizes[size];
  const isMythic = stage === "Myth";

  return (
    <span
      className={`inline-flex items-center gap-1 retro-border ${s.pad} ${className}`}
      style={{
        color: config.color,
        borderColor: `${config.color}60`,
        background: `${config.color}15`,
        ...(isMythic ? { animation: "pulse 2s infinite", boxShadow: `0 0 12px ${config.color}40` } : {}),
      }}
    >
      <Icon size={s.icon} />
      <span className="font-pixel uppercase" style={{ fontSize: s.text }}>
        {config.label}
      </span>
    </span>
  );
}
