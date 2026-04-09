// Public stub — full implementation is proprietary. See LICENSE.

/**
 * VibeX Buddy System — Pokemon-inspired pixel pets (simplified demo)
 *
 * Users earn EXP through platform actions.
 * At certain levels, they can "summon" (gacha) a buddy.
 */

// ═══════════════════════════════════════════════════════════════
// EXP REWARDS TABLE
// ═══════════════════════════════════════════════════════════════

export const EXP_REWARDS = {
  publishProject: 100,    // Publish project
  publishDemo: 50,        // Publish Demo
  publishIdea: 30,        // Submit idea
  postArticle: 40,        // Publish article
  shareContent: 10,       // Share content
  receiveUpvote: 5,       // Receive upvote (each)
  giveComment: 5,         // Post comment
  receiveComment: 3,      // Receive comment
  winBattle: 25,          // Win battle
  loseBattle: 10,         // Lose battle (participation)
  drawBattle: 15,         // Draw
  dailyLogin: 10,         // Daily login
  getFollowed: 15,        // Get followed
  forkProject: 20,        // Fork project
  runAgent: 8,            // Run Agent
  createWorkflow: 35,     // Create workflow
  completeProfile: 50,    // Complete profile
  firstProject: 200,      // First project (one-time)
  firstBattle: 100,       // First battle (one-time)
  firstBuddy: 50,         // First Buddy (one-time)
  // Project evolution rewards
  evolveToActive: 25,     // Project reaches Active stage
  evolveToGrowing: 50,    // Project reaches Growing stage
  evolveToBreakout: 100,  // Project reaches Breakout stage
  evolveToLegend: 200,    // Project reaches Legend stage
  evolveToMyth: 500,      // Project reaches Myth stage
} as const;

// ═══════════════════════════════════════════════════════════════
// LEVEL SYSTEM (RPG exponential curve)
// ═══════════════════════════════════════════════════════════════

export interface UserLevel {
  level: number;
  currentExp: number;
  expToNextLevel: number;
  totalExp: number;
  title: string;
  canSummon: boolean; // Can summon a buddy at this level?
}

export function computeUserLevel(totalExp: number): UserLevel {
  // Simplified level calculation
  const level = Math.max(1, Math.min(99, Math.floor(Math.sqrt(totalExp / 50))));
  const currentLevelExp = 50 * level * level;
  const nextLevelExp = 50 * (level + 1) * (level + 1);

  return {
    level,
    currentExp: totalExp - currentLevelExp,
    expToNextLevel: nextLevelExp - currentLevelExp,
    totalExp,
    title: level >= 20 ? "Elite Trainer" : level >= 10 ? "Advanced Trainer" : level >= 5 ? "Junior Trainer" : "Apprentice",
    canSummon: [3, 5, 8, 10, 13, 15, 18, 20, 25, 30].includes(level),
  };
}

// ═══════════════════════════════════════════════════════════════
// BUDDY DEFINITIONS (5 initial types + Wave 2)
// ═══════════════════════════════════════════════════════════════

export type BuddyRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface BuddyType {
  id: string;
  name: string;
  nameZh: string;
  nameJa: string;
  description: string;
  descriptionZh: string;
  rarity: BuddyRarity;
  element: string;
  emoji: string;          // Pixel sprite (emoji for now)
  minLevel: number;       // Minimum level to summon
  baseWeight: number;     // Base gacha weight (higher = more common)
  color: string;          // Theme color
  passive: string;        // Passive ability description
  passiveZh: string;
}

export const BUDDY_TYPES: BuddyType[] = [
  {
    id: "pixel-fox",
    name: "PixelFox",
    nameZh: "PixelFox",
    nameJa: "ピクセルフォックス",
    description: "A mischievous fire fox that boosts your project visibility",
    descriptionZh: "A mischievous fire fox that boosts your project visibility",
    rarity: "common",
    element: "Fire",
    emoji: "🦊",
    minLevel: 3,
    baseWeight: 40,
    color: "#FF6B35",
    passive: "+10% project views",
    passiveZh: "+10% project views",
  },
  {
    id: "neon-slime",
    name: "NeonSlime",
    nameZh: "NeonSlime",
    nameJa: "ネオンスライム",
    description: "A bouncy neon blob that attracts upvotes",
    descriptionZh: "A bouncy neon blob that attracts upvotes",
    rarity: "common",
    element: "Electric",
    emoji: "🟢",
    minLevel: 3,
    baseWeight: 40,
    color: "#39FF14",
    passive: "+5% upvote rate",
    passiveZh: "+5% upvote rate",
  },
  {
    id: "byte-owl",
    name: "ByteOwl",
    nameZh: "ByteOwl",
    nameJa: "バイトフクロウ",
    description: "A wise owl that enhances AI review scores",
    descriptionZh: "A wise owl that enhances AI review scores",
    rarity: "uncommon",
    element: "Wisdom",
    emoji: "🦉",
    minLevel: 5,
    baseWeight: 25,
    color: "#9D00FF",
    passive: "+5 AI review score",
    passiveZh: "+5 AI review score",
  },
  {
    id: "code-dragon",
    name: "CodeDragon",
    nameZh: "CodeDragon",
    nameJa: "コードドラゴン",
    description: "A fierce dragon that powers up battle stats",
    descriptionZh: "A fierce dragon that powers up battle stats",
    rarity: "rare",
    element: "Power",
    emoji: "🐉",
    minLevel: 10,
    baseWeight: 12,
    color: "#FF4500",
    passive: "+15% battle power",
    passiveZh: "+15% battle power",
  },
  {
    id: "crystal-phoenix",
    name: "CrystalPhoenix",
    nameZh: "CrystalPhoenix",
    nameJa: "クリスタルフェニックス",
    description: "A legendary phoenix that grants evolution bonuses",
    descriptionZh: "A legendary phoenix that grants evolution bonuses",
    rarity: "legendary",
    element: "Evolution",
    emoji: "🔥",
    minLevel: 15,
    baseWeight: 3,
    color: "#FFD700",
    passive: "+25% EXP gain",
    passiveZh: "+25% EXP gain",
  },
  // ── Wave 2: 6 new buddies ──
  {
    id: "aqua-turtle",
    name: "AquaTurtle",
    nameZh: "AquaTurtle",
    nameJa: "",
    description: "A calm water turtle that reduces battle cooldowns",
    descriptionZh: "A calm water turtle that reduces battle cooldowns",
    rarity: "common",
    element: "Water",
    emoji: "🐢",
    minLevel: 3,
    baseWeight: 35,
    color: "#00BFFF",
    passive: "-10% battle cooldown",
    passiveZh: "-10% battle cooldown",
  },
  {
    id: "frost-cat",
    name: "FrostCat",
    nameZh: "FrostCat",
    nameJa: "",
    description: "A frosty feline that freezes competition in rankings",
    descriptionZh: "A frosty feline that freezes competition in rankings",
    rarity: "uncommon",
    element: "Ice",
    emoji: "🐱",
    minLevel: 5,
    baseWeight: 22,
    color: "#88DDFF",
    passive: "+8% ranking score",
    passiveZh: "+8% ranking score",
  },
  {
    id: "shadow-bat",
    name: "ShadowBat",
    nameZh: "ShadowBat",
    nameJa: "",
    description: "A dark bat that steals opponent buffs in battle",
    descriptionZh: "A dark bat that steals opponent buffs in battle",
    rarity: "rare",
    element: "Dark",
    emoji: "🦇",
    minLevel: 8,
    baseWeight: 15,
    color: "#8B5CF6",
    passive: "Steal 5% opponent buff",
    passiveZh: "Steal 5% opponent buff",
  },
  {
    id: "volt-rabbit",
    name: "VoltRabbit",
    nameZh: "VoltRabbit",
    nameJa: "",
    description: "A speedy electric rabbit that doubles daily login rewards",
    descriptionZh: "A speedy electric rabbit that doubles daily login rewards",
    rarity: "uncommon",
    element: "Electric",
    emoji: "🐰",
    minLevel: 5,
    baseWeight: 20,
    color: "#FFE033",
    passive: "2x daily login EXP",
    passiveZh: "2x daily login EXP",
  },
  {
    id: "terra-golem",
    name: "TerraGolem",
    nameZh: "TerraGolem",
    nameJa: "",
    description: "A sturdy earth golem that shields your projects from downvotes",
    descriptionZh: "A sturdy earth golem that shields your projects from downvotes",
    rarity: "epic",
    element: "Earth",
    emoji: "🪨",
    minLevel: 12,
    baseWeight: 8,
    color: "#CD853F",
    passive: "+20% defense rating",
    passiveZh: "+20% defense rating",
  },
  {
    id: "stellar-jellyfish",
    name: "StellarJelly",
    nameZh: "StellarJelly",
    nameJa: "",
    description: "A cosmic jellyfish that boosts all allies in guild events",
    descriptionZh: "A cosmic jellyfish that boosts all allies in guild events",
    rarity: "legendary",
    element: "Cosmic",
    emoji: "🪼",
    minLevel: 18,
    baseWeight: 2,
    color: "#FF69B4",
    passive: "+15% guild event bonus",
    passiveZh: "+15% guild event bonus",
  },
];

// ═══════════════════════════════════════════════════════════════
// EVOLUTION SYSTEM
// ═══════════════════════════════════════════════════════════════

export interface BuddyEvolution {
  stage: number;       // 0 = base, 1 = evolved, 2 = final
  name: string;
  nameZh: string;
  emoji: string;
  requiredLevel: number;
  newPassive: string;
  newPassiveZh: string;
}

/** Get the current evolution stage for a buddy at a given level (simplified) */
export function getEvolutionStage(buddyTypeId: string, _level: number): BuddyEvolution {
  const buddy = BUDDY_TYPES.find((b) => b.id === buddyTypeId);
  return {
    stage: 0,
    name: buddy?.name ?? "Unknown",
    nameZh: buddy?.nameZh ?? "Unknown",
    emoji: buddy?.emoji ?? "❓",
    requiredLevel: 0,
    newPassive: buddy?.passive ?? "",
    newPassiveZh: buddy?.passiveZh ?? "",
  };
}

/** Check if a buddy can evolve at its current level (stub: always false) */
export function canEvolve(_buddyTypeId: string, _currentLevel: number): boolean {
  return false;
}

/** Get all evolutions for a buddy type (stub: returns base stage only) */
export function getEvolutions(buddyTypeId: string): BuddyEvolution[] {
  return [getEvolutionStage(buddyTypeId, 0)];
}

// ═══════════════════════════════════════════════════════════════
// BUDDY INSTANCE (user's actual buddy)
// ═══════════════════════════════════════════════════════════════

export interface UserBuddy {
  id: string;
  buddyTypeId: string;
  nickname?: string;
  level: number;
  exp: number;
  happiness: number;    // 0-100
  obtainedAt: string;
  isActive: boolean;    // Currently displayed buddy
}

// ═══════════════════════════════════════════════════════════════
// GACHA / SUMMON SYSTEM
// ═══════════════════════════════════════════════════════════════

export interface SummonResult {
  buddy: BuddyType;
  isNew: boolean;       // First time getting this type
  bonusApplied: string; // What bonus affected the roll
}

/**
 * Calculate summon weights (simplified: base weights only).
 */
export function calculateSummonWeights(
  userLevel: number,
  _totalUpvotes: number,
  _existingBuddyIds: string[],
): { buddyType: BuddyType; weight: number }[] {
  return BUDDY_TYPES
    .filter((b) => userLevel >= b.minLevel)
    .map((b) => ({ buddyType: b, weight: b.baseWeight }));
}

/**
 * Perform a summon (simplified gacha roll).
 */
export function summonBuddy(
  userLevel: number,
  totalUpvotes: number,
  existingBuddyIds: string[],
): SummonResult {
  const weights = calculateSummonWeights(userLevel, totalUpvotes, existingBuddyIds);
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);

  let roll = Math.random() * totalWeight;
  let selected = weights[0];

  for (const w of weights) {
    roll -= w.weight;
    if (roll <= 0) {
      selected = w;
      break;
    }
  }

  return {
    buddy: selected.buddyType,
    isNew: !existingBuddyIds.includes(selected.buddyType.id),
    bonusApplied: "No bonus",
  };
}

// ═══════════════════════════════════════════════════════════════
// RARITY CONFIG
// ═══════════════════════════════════════════════════════════════

export const RARITY_CONFIG: Record<BuddyRarity, {
  label: string;
  labelZh: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glow: string;
}> = {
  common: {
    label: "Common",
    labelZh: "Common",
    color: "#8888A0",
    bgColor: "bg-zinc-500/10",
    borderColor: "border-zinc-500/30",
    glow: "",
  },
  uncommon: {
    label: "Uncommon",
    labelZh: "Uncommon",
    color: "#39FF14",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    glow: "shadow-emerald-500/20",
  },
  rare: {
    label: "Rare",
    labelZh: "Rare",
    color: "#06B6D4",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    glow: "shadow-cyan-500/20",
  },
  epic: {
    label: "Epic",
    labelZh: "Epic",
    color: "#9D00FF",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
    glow: "shadow-violet-500/30",
  },
  legendary: {
    label: "Legendary",
    labelZh: "Legendary",
    color: "#FFD700",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    glow: "shadow-amber-500/30 evolution-glow",
  },
};
