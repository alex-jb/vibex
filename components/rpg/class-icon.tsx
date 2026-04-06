"use client";

import {
  Cpu,
  Palette,
  Sparkles,
  FlaskConical,
  Shield,
} from "lucide-react";
import type { HeroClass } from "@/lib/types";
import { CLASS_CONFIG } from "@/lib/rpg-utils";

const ICON_MAP: Record<HeroClass, React.ElementType> = {
  Architect: Cpu,
  Artisan: Palette,
  Enchanter: Sparkles,
  Alchemist: FlaskConical,
  Sentinel: Shield,
};

interface ClassIconProps {
  heroClass: HeroClass;
  size?: number;
  className?: string;
  showLabel?: boolean;
}

export function ClassIcon({
  heroClass,
  size = 16,
  className = "",
  showLabel = false,
}: ClassIconProps) {
  const Icon = ICON_MAP[heroClass];
  const config = CLASS_CONFIG[heroClass];

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      style={{ color: config.color }}
    >
      <Icon size={size} />
      {showLabel && (
        <span className="font-pixel text-[8px] uppercase tracking-wider">
          {config.label}
        </span>
      )}
    </span>
  );
}
