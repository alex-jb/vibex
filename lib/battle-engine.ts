import type { Project, BattleResult, BattleRound, HeroAttributes } from "./types";

const ATTR_ORDER: (keyof HeroAttributes)[] = [
  "power",
  "resilience",
  "charisma",
  "wisdom",
  "agility",
  "stability",
];

const ATTR_NARRATIVES: Record<keyof HeroAttributes, { win: string; lose: string; crit: string }> = {
  power: {
    win: "{winner}'s raw Power overwhelms {loser}!",
    lose: "{loser} withstands {winner}'s Power assault!",
    crit: "DEVASTATING BLOW! {winner}'s Power surge obliterates all defenses!",
  },
  resilience: {
    win: "{winner}'s iron Resilience absorbs every hit!",
    lose: "{loser} outlasts {winner} in endurance!",
    crit: "UNBREAKABLE! {winner} shrugs off the attack like nothing!",
  },
  charisma: {
    win: "{winner}'s Charisma captivates the audience!",
    lose: "{loser}'s charm steals the spotlight from {winner}!",
    crit: "VIRAL MOMENT! {winner}'s Charisma goes supernova!",
  },
  wisdom: {
    win: "{winner}'s Wisdom outmaneuvers {loser}!",
    lose: "{loser} sees through {winner}'s strategy!",
    crit: "GALAXY BRAIN! {winner}'s Wisdom transcends all expectations!",
  },
  agility: {
    win: "{winner}'s Agility leaves {loser} in the dust!",
    lose: "{loser}'s reflexes outpace {winner}!",
    crit: "SPEED DEMON! {winner} moves at lightspeed!",
  },
  stability: {
    win: "{winner}'s Stability holds firm while {loser} crumbles!",
    lose: "{loser} proves more reliable than {winner}!",
    crit: "FORTRESS MODE! {winner}'s Stability is absolute!",
  },
};

/** Simulate a full battle between two projects */
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

    // Add small randomness (±10%)
    const cRoll = cVal * (0.9 + Math.random() * 0.2);
    const dRoll = dVal * (0.9 + Math.random() * 0.2);

    // Critical hit: 15% chance when winning by 20+ points
    const diff = Math.abs(cRoll - dRoll);
    const isCritical = diff > 20 && Math.random() < 0.15;

    const winner: BattleRound["winner"] =
      Math.abs(cRoll - dRoll) < 3
        ? "draw"
        : cRoll > dRoll
          ? "challenger"
          : "defender";

    const winnerName = winner === "challenger" ? challenger.title : defender.title;
    const loserName = winner === "challenger" ? defender.title : challenger.title;

    const templates = ATTR_NARRATIVES[attr];
    let narrative: string;
    if (winner === "draw") {
      narrative = `Both sides match evenly in ${attr}! A tense standoff!`;
    } else if (isCritical) {
      narrative = templates.crit
        .replace("{winner}", winnerName)
        .replace("{loser}", loserName);
    } else {
      narrative = templates.win
        .replace("{winner}", winnerName)
        .replace("{loser}", loserName);
    }

    return {
      attribute: attr,
      challengerValue: Math.round(cRoll),
      defenderValue: Math.round(dRoll),
      winner,
      narrative,
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

  // EXP rewards
  const baseExp = 50;
  const critBonus = rounds.filter((r) => r.isCritical).length * 30;

  return {
    id: `battle-${Date.now()}`,
    challengerId: challenger.id,
    defenderId: defender.id,
    rounds,
    winner,
    expGained: {
      challenger: winner === challenger.id ? baseExp + critBonus + 50 : baseExp + critBonus,
      defender: winner === defender.id ? baseExp + critBonus + 50 : baseExp + critBonus,
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
  const winnerExp =
    result.winner === projects.challenger.id
      ? result.expGained.challenger
      : result.expGained.defender;

  const crits = result.rounds.filter((r) => r.isCritical).length;
  const critText = crits > 0 ? ` ${crits} Critical Hit${crits > 1 ? "s" : ""}!` : "";

  return `Battle over! ${winnerProject.title} defeats ${loserProject.title} and earns ${winnerExp} EXP!${critText}`;
}
