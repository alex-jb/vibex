"use client";

import { Zap, Flame, Bomb, Bird } from "lucide-react";
import type { EvolutionStage } from "@/lib/types";
import { EVOLUTION_CONFIG } from "@/lib/rpg-utils";

const ICON_MAP: Record<EvolutionStage, React.ElementType> = {
  Spark: Zap,
  Flame: Flame,
  Inferno: Bomb,
  Phoenix: Bird,
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

  return (
    <span
      className={`inline-flex items-center gap-1 retro-border ${s.pad} ${config.cssClass} ${className}`}
      style={{ borderColor: "currentColor" }}
    >
      <Icon size={s.icon} />
      <span className="font-pixel uppercase" style={{ fontSize: s.text }}>
        {config.label}
      </span>
    </span>
  );
}
