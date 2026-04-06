"use client";

import { motion } from "framer-motion";
import type { HeroStats } from "@/lib/types";

interface HudBarsProps {
  hero: HeroStats;
  compact?: boolean;
  className?: string;
}

function Bar({
  label,
  value,
  max,
  type,
  compact,
}: {
  label: string;
  value: number;
  max: number;
  type: "hp" | "mp" | "exp";
  compact?: boolean;
}) {
  const percent = Math.min(100, (value / max) * 100);

  return (
    <div className={`rpg-bar ${compact ? "h-3" : ""}`}>
      <motion.div
        className={`rpg-bar__fill rpg-bar--${type}`}
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={`rpg-bar__fill rpg-bar--${type}`} style={{ width: "100%" }} />
      </motion.div>
      {!compact && (
        <>
          <span className="rpg-bar__label">{label}</span>
          <span className="rpg-bar__value">
            {value}/{max}
          </span>
        </>
      )}
    </div>
  );
}

export function HudBars({ hero, compact = false, className = "" }: HudBarsProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Bar label="HP" value={hero.hp} max={hero.maxHp} type="hp" compact={compact} />
      <Bar label="MP" value={hero.mp} max={hero.maxMp} type="mp" compact={compact} />
      <Bar
        label="EXP"
        value={hero.exp}
        max={hero.expToNextLevel}
        type="exp"
        compact={compact}
      />
    </div>
  );
}
