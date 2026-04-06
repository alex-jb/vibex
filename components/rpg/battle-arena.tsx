"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, SkipForward } from "lucide-react";
import type { Project, BattleResult, BattleRound } from "@/lib/types";
import { simulateBattle, getBattleSummary } from "@/lib/battle-engine";
import { BattleHud } from "./battle-hud";
import { TypewriterText } from "./typewriter-text";
import { CriticalHit } from "./critical-hit";

type BattlePhase = "idle" | "flash" | "fighting" | "round" | "result";

interface BattleArenaProps {
  challenger: Project;
  defender: Project;
  onComplete?: (result: BattleResult) => void;
  className?: string;
}

export function BattleArena({
  challenger,
  defender,
  onComplete,
  className = "",
}: BattleArenaProps) {
  const [phase, setPhase] = useState<BattlePhase>("idle");
  const [result, setResult] = useState<BattleResult | null>(null);
  const [currentRoundIdx, setCurrentRoundIdx] = useState(-1);
  const [showCrit, setShowCrit] = useState(false);
  const [narrativeQueue, setNarrativeQueue] = useState<string[]>([]);

  const currentRound: BattleRound | undefined =
    result && currentRoundIdx >= 0 ? result.rounds[currentRoundIdx] : undefined;

  const startBattle = useCallback(() => {
    const battleResult = simulateBattle(challenger, defender);
    setResult(battleResult);
    setCurrentRoundIdx(-1);
    setNarrativeQueue([]);

    // Phase 1: Flash transition
    setPhase("flash");
    setTimeout(() => {
      setPhase("fighting");

      // Phase 2: Play rounds sequentially
      let roundIdx = 0;
      const playNextRound = () => {
        if (roundIdx >= battleResult.rounds.length) {
          // All rounds done — show result
          setPhase("result");
          setNarrativeQueue((q) => [
            ...q,
            getBattleSummary(battleResult, { challenger, defender }),
          ]);
          onComplete?.(battleResult);
          return;
        }

        const round = battleResult.rounds[roundIdx];
        setCurrentRoundIdx(roundIdx);
        setPhase("round");

        // Show critical hit effect
        if (round.isCritical) {
          setTimeout(() => {
            setShowCrit(true);
            setTimeout(() => setShowCrit(false), 1200);
          }, 500);
        }

        // Add narrative
        setNarrativeQueue((q) => [...q, round.narrative]);

        roundIdx++;
        setTimeout(playNextRound, 2500);
      };

      setTimeout(playNextRound, 800);
    }, 1200);
  }, [challenger, defender, onComplete]);

  const skipToResult = useCallback(() => {
    if (!result) return;
    setCurrentRoundIdx(result.rounds.length - 1);
    setPhase("result");
    setNarrativeQueue(
      result.rounds
        .map((r) => r.narrative)
        .concat(getBattleSummary(result, { challenger, defender }))
    );
    onComplete?.(result);
  }, [result, challenger, defender, onComplete]);

  const resetBattle = () => {
    setPhase("idle");
    setResult(null);
    setCurrentRoundIdx(-1);
    setNarrativeQueue([]);
    setShowCrit(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Critical Hit overlay */}
      <CriticalHit show={showCrit} />

      {/* Battle flash overlay */}
      <AnimatePresence>
        {phase === "flash" && (
          <motion.div
            className="fixed inset-0 z-[9997] battle-flash"
            style={{ background: "white" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Arena content */}
      <div className="space-y-4">
        {/* HUD */}
        <BattleHud
          challenger={challenger}
          defender={defender}
          currentRound={currentRound}
        />

        {/* Battle Stage */}
        <div className="retro-card l-corner relative min-h-[200px] p-4 overflow-hidden">
          <div className="l-corner-inner absolute inset-0 pointer-events-none" />

          {/* Idle — Start button */}
          {phase === "idle" && (
            <motion.div
              className="flex flex-col items-center justify-center h-full gap-4 py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="font-pixel text-[10px] text-muted-foreground text-center">
                {challenger.title} vs {defender.title}
              </div>
              <button
                onClick={startBattle}
                className="retro-button retro-button--primary flex items-center gap-2"
              >
                <Swords size={14} />
                <span>START BATTLE</span>
              </button>
            </motion.div>
          )}

          {/* Fighting / Round — Narrative */}
          {(phase === "fighting" || phase === "round") && (
            <div className="space-y-3">
              {/* Round indicator */}
              {currentRound && (
                <motion.div
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={currentRoundIdx}
                >
                  <span className="font-pixel text-[8px] text-violet-400 uppercase">
                    Round {currentRoundIdx + 1} — {currentRound.attribute}
                  </span>
                  <div className="flex items-center gap-3 font-pixel text-[9px]">
                    <span className="text-emerald-400">
                      {currentRound.challengerValue}
                    </span>
                    <span className="text-muted-foreground">vs</span>
                    <span className="text-blue-400">
                      {currentRound.defenderValue}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Attribute comparison bar */}
              {currentRound && (
                <motion.div
                  className="relative h-4 rpg-bar overflow-hidden"
                  key={`bar-${currentRoundIdx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(currentRound.challengerValue / (currentRound.challengerValue + currentRound.defenderValue)) * 100}%`,
                    }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <motion.div
                    className="absolute right-0 top-0 h-full bg-gradient-to-l from-blue-500 to-blue-400"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(currentRound.defenderValue / (currentRound.challengerValue + currentRound.defenderValue)) * 100}%`,
                    }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />
                </motion.div>
              )}

              {/* Narrative text box */}
              <div className="retro-dialog min-h-[60px]">
                {narrativeQueue.length > 0 && (
                  <TypewriterText
                    key={narrativeQueue[narrativeQueue.length - 1]}
                    text={narrativeQueue[narrativeQueue.length - 1]}
                    speed={30}
                    className="text-foreground"
                  />
                )}
              </div>

              {/* Skip button */}
              <div className="flex justify-end">
                <button
                  onClick={skipToResult}
                  className="retro-button flex items-center gap-1 text-[8px]"
                >
                  <SkipForward size={10} />
                  <span>SKIP</span>
                </button>
              </div>
            </div>
          )}

          {/* Result */}
          {phase === "result" && result && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* Winner announcement */}
              <div className="text-center py-4">
                <motion.div
                  className="font-pixel text-[12px] text-violet-400 mb-2"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.4 }}
                >
                  BATTLE COMPLETE!
                </motion.div>
                <div className="font-pixel text-[9px] text-foreground">
                  Winner:{" "}
                  {result.winner === challenger.id
                    ? challenger.title
                    : defender.title}
                </div>
              </div>

              {/* Round summary */}
              <div className="space-y-2">
                {result.rounds.map((round, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2 font-pixel text-[7px]"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <span className="text-muted-foreground uppercase w-16">
                      {round.attribute.slice(0, 6)}
                    </span>
                    <span className="text-emerald-400 w-6 text-right">
                      {round.challengerValue}
                    </span>
                    <span className="text-muted-foreground">vs</span>
                    <span className="text-blue-400 w-6">
                      {round.defenderValue}
                    </span>
                    <span
                      className={
                        round.winner === "challenger"
                          ? "text-emerald-400"
                          : round.winner === "defender"
                            ? "text-blue-400"
                            : "text-muted-foreground"
                      }
                    >
                      {round.winner === "draw"
                        ? "DRAW"
                        : round.winner === "challenger"
                          ? "WIN"
                          : "LOSE"}
                    </span>
                    {round.isCritical && (
                      <span className="text-yellow-400">CRIT!</span>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* EXP gains */}
              <div className="retro-dialog flex items-center justify-between">
                <div className="font-pixel text-[7px]">
                  <span className="text-muted-foreground">
                    {challenger.title}:{" "}
                  </span>
                  <span className="text-violet-400">
                    +{result.expGained.challenger} EXP
                  </span>
                </div>
                <div className="font-pixel text-[7px]">
                  <span className="text-muted-foreground">
                    {defender.title}:{" "}
                  </span>
                  <span className="text-violet-400">
                    +{result.expGained.defender} EXP
                  </span>
                </div>
              </div>

              {/* Play again */}
              <div className="flex justify-center">
                <button
                  onClick={resetBattle}
                  className="retro-button retro-button--primary flex items-center gap-2"
                >
                  <Swords size={12} />
                  <span>REMATCH</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
