"use client";

import { motion } from "framer-motion";
import type { Project, BattleRound } from "@/lib/types";
import { ClassIcon } from "./class-icon";

interface BattleHudProps {
  challenger: Project;
  defender: Project;
  currentRound?: BattleRound;
  className?: string;
}

function FighterHud({
  project,
  side,
  currentRound,
}: {
  project: Project;
  side: "left" | "right";
  currentRound?: BattleRound;
}) {
  const hero = project.hero!;
  const isWinning =
    currentRound &&
    ((side === "left" && currentRound.winner === "challenger") ||
      (side === "right" && currentRound.winner === "defender"));

  return (
    <div
      className={`flex ${side === "right" ? "flex-row-reverse text-right" : ""} items-start gap-3`}
    >
      <motion.div
        className={`w-12 h-12 flex items-center justify-center retro-border sprite-float ${
          isWinning ? "evolution-glow" : ""
        }`}
        style={{
          background: isWinning ? "oklch(0.2 0.05 280)" : "oklch(0.12 0 0)",
        }}
        animate={isWinning ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <ClassIcon heroClass={hero.heroClass} size={24} />
      </motion.div>

      <div className="flex-1 min-w-0">
        <div className="font-pixel text-[8px] text-foreground truncate">
          {project.title}
        </div>
        <div className="font-pixel text-[6px] text-muted-foreground mb-1">
          Lv {hero.level} {hero.heroClass}
        </div>

        {/* HP bar */}
        <div className="rpg-bar h-3 mb-1">
          <div
            className="rpg-bar__fill rpg-bar--hp"
            style={{ width: `${(hero.hp / hero.maxHp) * 100}%` }}
          />
        </div>
        {/* MP bar */}
        <div className="rpg-bar h-2">
          <div
            className="rpg-bar__fill rpg-bar--mp"
            style={{ width: `${(hero.mp / hero.maxMp) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function BattleHud({
  challenger,
  defender,
  currentRound,
  className = "",
}: BattleHudProps) {
  return (
    <div
      className={`retro-card l-corner p-4 ${className}`}
    >
      <div className="l-corner-inner absolute inset-0 pointer-events-none" />

      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
        <FighterHud
          project={challenger}
          side="left"
          currentRound={currentRound}
        />

        <div className="flex flex-col items-center gap-1">
          <span className="font-pixel text-[10px] text-violet-400">VS</span>
          {currentRound && (
            <motion.span
              className="font-pixel text-[7px] text-muted-foreground uppercase"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {currentRound.attribute}
            </motion.span>
          )}
        </div>

        <FighterHud
          project={defender}
          side="right"
          currentRound={currentRound}
        />
      </div>
    </div>
  );
}
