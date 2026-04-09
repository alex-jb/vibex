import type { EvolutionStage } from "./types";
import { EXP_REWARDS } from "./buddy-system";

/**
 * EXP reward mapping for project evolution events.
 * When a project reaches a new stage, the creator gets EXP for their user level.
 */
const EVOLUTION_EXP: Record<EvolutionStage, number> = {
  Seed: 0,
  Active: EXP_REWARDS.evolveToActive,
  Growing: EXP_REWARDS.evolveToGrowing,
  Breakout: EXP_REWARDS.evolveToBreakout,
  Legend: EXP_REWARDS.evolveToLegend,
  Myth: EXP_REWARDS.evolveToMyth,
};

/**
 * Compute the EXP reward when a project evolves to a new stage.
 * Returns 0 if the stage hasn't actually changed.
 */
export function getEvolutionReward(
  oldStage: EvolutionStage | undefined,
  newStage: EvolutionStage
): number {
  if (!oldStage || oldStage === newStage) return 0;
  return EVOLUTION_EXP[newStage] || 0;
}

/**
 * Fire an evolution event — called when project metrics update
 * and the evolution stage changes.
 *
 * In production, this would:
 * 1. Update user EXP in database
 * 2. Check if buddy can evolve
 * 3. Create a notification
 * 4. Track analytics event
 *
 * For now, it posts to /api/buddy/evolve-reward
 */
export async function fireEvolutionEvent(params: {
  projectId: string;
  creatorId: string;
  oldStage: EvolutionStage;
  newStage: EvolutionStage;
}): Promise<void> {
  const reward = getEvolutionReward(params.oldStage, params.newStage);
  if (reward <= 0) return;

  try {
    await fetch("/api/buddy/evolve-reward", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: params.projectId,
        creatorId: params.creatorId,
        newStage: params.newStage,
        expReward: reward,
      }),
    });
  } catch {
    // Non-critical — best effort
  }
}
