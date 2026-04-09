// Public stub — full implementation is proprietary. See LICENSE.

import type { Project, BattleResult, BattleRound, HeroAttributes } from "./types";

const ATTR_ORDER: (keyof HeroAttributes)[] = [
  "power",
  "resilience",
  "charisma",
  "wisdom",
  "agility",
  "stability",
];

/** Simulate a full battle between two projects (simplified demo version) */
export function simulateBattle(
  challenger: Project,
  defender: Project
): BattleResult {
  if (!challenger.hero || !defender.hero) {
    throw new Error("Both projects must have hero stats");
  }

  // Select 4 random attributes for the battle
  const shuffled = [...ATTR_ORDER].sort(() => Math.random() - 0.5);
  const selectedAttrs = shuffled.slice(0, 4);

  const rounds: BattleRound[] = selectedAttrs.map((attr) => {
    const cVal = challenger.hero!.attributes[attr];
    const dVal = defender.hero!.attributes[attr];

    // Simple random comparison
    const cRoll = cVal + Math.random() * 10;
    const dRoll = dVal + Math.random() * 10;
    const isCritical = Math.random() < 0.1;

    const winner: BattleRound["winner"] =
      Math.abs(cRoll - dRoll) < 3
        ? "draw"
        : cRoll > dRoll
          ? "challenger"
          : "defender";

    return {
      attribute: attr,
      challengerValue: Math.round(cRoll),
      defenderValue: Math.round(dRoll),
      winner,
      narrative: `${attr} round: ${winner === "draw" ? "A draw!" : `${winner} wins!`}`,
      isCritical,
    };
  });

  // Count wins
  const cWins = rounds.filter((r) => r.winner === "challenger").length;
  const dWins = rounds.filter((r) => r.winner === "defender").length;
  const winner =
    cWins > dWins
      ? challenger.id
      : dWins > cWins
        ? defender.id
        : Math.random() > 0.5
          ? challenger.id
          : defender.id;

  return {
    id: `battle-${Date.now()}`,
    challengerId: challenger.id,
    defenderId: defender.id,
    rounds,
    winner,
    expGained: {
      challenger: winner === challenger.id ? 100 : 50,
      defender: winner === defender.id ? 100 : 50,
    },
    timestamp: new Date().toISOString(),
  };
}

/** Generate battle summary text */
export function getBattleSummary(result: BattleResult, projects: { challenger: Project; defender: Project }): string {
  const winnerProject =
    result.winner === projects.challenger.id
      ? projects.challenger
      : projects.defender;
  const loserProject =
    result.winner === projects.challenger.id
      ? projects.defender
      : projects.challenger;

  return `Battle over! ${winnerProject.title} defeats ${loserProject.title}!`;
}
