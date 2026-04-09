"use client";

import { motion } from "framer-motion";
import type { Project, EvolutionStage } from "@/lib/types";
import { SPRITE_STAGES, EVOLUTION_THRESHOLDS, EVOLUTION_ORDER } from "@/lib/sprite-config";
import { EvolutionBadge } from "@/components/rpg/evolution-badge";

interface EvolutionProgressProps {
  project: Project;
  className?: string;
}

interface ConditionProgress {
  label: string;
  current: number;
  target: number;
  met: boolean;
}

function getNextStage(current: EvolutionStage): EvolutionStage | null {
  const idx = EVOLUTION_ORDER.indexOf(current);
  if (idx < 0 || idx >= EVOLUTION_ORDER.length - 1) return null;
  return EVOLUTION_ORDER[idx + 1];
}

function getConditionProgress(project: Project, stage: EvolutionStage): ConditionProgress[] {
  const thresholds = EVOLUTION_THRESHOLDS[stage];
  const conditions: ConditionProgress[] = [];

  if (thresholds.plays !== undefined) {
    conditions.push({ label: "Plays", current: project.plays, target: thresholds.plays, met: project.plays >= thresholds.plays });
  }
  if (thresholds.upvotes !== undefined) {
    conditions.push({ label: "Upvotes", current: project.upvotes, target: thresholds.upvotes, met: project.upvotes >= thresholds.upvotes });
  }
  if (thresholds.views !== undefined) {
    conditions.push({ label: "Views", current: project.views, target: thresholds.views, met: project.views >= thresholds.views });
  }
  if (thresholds.shares !== undefined) {
    conditions.push({ label: "Shares", current: project.shares, target: thresholds.shares, met: project.shares >= thresholds.shares });
  }
  if (thresholds.score !== undefined) {
    conditions.push({ label: "Score", current: project.score, target: thresholds.score, met: project.score >= thresholds.score });
  }
  if (thresholds.originality !== undefined) {
    conditions.push({ label: "Originality", current: project.aiReview.originality, target: thresholds.originality, met: project.aiReview.originality >= thresholds.originality });
  }
  if (thresholds.investorCuriosity !== undefined) {
    conditions.push({ label: "VC Signal", current: project.aiReview.investorCuriosity, target: thresholds.investorCuriosity, met: project.aiReview.investorCuriosity >= thresholds.investorCuriosity });
  }

  return conditions;
}

function ProgressBar({ current, target, color }: { current: number; target: number; color: string }) {
  const pct = Math.min(100, (current / target) * 100);
  return (
    <div style={{ display: "flex", width: "100%", height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ height: "100%", background: color, borderRadius: "2px" }}
      />
    </div>
  );
}

export function EvolutionProgress({ project, className = "" }: EvolutionProgressProps) {
  const currentStage = project.hero?.evolutionStage || "Seed";
  const nextStage = getNextStage(currentStage);
  const currentConfig = SPRITE_STAGES[currentStage];

  if (!nextStage) {
    // Already at Myth — max stage
    return (
      <div className={className}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{currentConfig.emoji}</span>
          <span className="font-pixel text-[8px] uppercase tracking-widest" style={{ color: currentConfig.color }}>
            MAX EVOLUTION
          </span>
        </div>
        <EvolutionBadge stage={currentStage} size="lg" />
      </div>
    );
  }

  const nextConfig = SPRITE_STAGES[nextStage];
  const conditions = getConditionProgress(project, nextStage);
  const metCount = conditions.filter((c) => c.met).length;

  return (
    <div className={className}>
      {/* Current → Next */}
      <div className="flex items-center gap-2 mb-3">
        <EvolutionBadge stage={currentStage} size="sm" />
        <span className="font-pixel text-[7px] text-muted-foreground">→</span>
        <span className="font-pixel text-[8px] uppercase" style={{ color: nextConfig.color }}>
          {nextConfig.emoji} {nextConfig.label}
        </span>
        <span className="font-pixel text-[7px] text-muted-foreground ml-auto">
          {metCount}/{conditions.length}
        </span>
      </div>

      {/* Condition progress bars */}
      <div className="space-y-2">
        {conditions.map((cond) => (
          <div key={cond.label}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-pixel text-[6px] text-muted-foreground uppercase">{cond.label}</span>
              <span className="font-pixel text-[7px]" style={{ color: cond.met ? "#39FF14" : nextConfig.color }}>
                {cond.current.toLocaleString()}/{cond.target.toLocaleString()}
                {cond.met && " ✓"}
              </span>
            </div>
            <ProgressBar current={cond.current} target={cond.target} color={cond.met ? "#39FF14" : nextConfig.color} />
          </div>
        ))}
      </div>
    </div>
  );
}
