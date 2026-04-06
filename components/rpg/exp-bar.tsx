"use client";

import { motion } from "framer-motion";
import type { HeroStats } from "@/lib/types";

interface ExpBarProps {
  hero: HeroStats;
  className?: string;
}

export function ExpBar({ hero, className = "" }: ExpBarProps) {
  const percent = Math.min(100, (hero.exp / hero.expToNextLevel) * 100);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Level badge */}
      <div className="level-badge shrink-0">
        <span className="text-violet-400">Lv</span>
        <span className="ml-0.5">{hero.level}</span>
      </div>

      {/* EXP bar */}
      <div className="flex-1">
        <div className="rpg-bar h-4">
          <motion.div
            className="rpg-bar__fill rpg-bar--exp"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
          <span className="rpg-bar__label">EXP</span>
          <span className="rpg-bar__value">
            {hero.exp}/{hero.expToNextLevel}
          </span>
        </div>
      </div>
    </div>
  );
}
