/**
 * VibeX Buddy System — Pokemon-inspired pixel pets
 *
 * Users earn EXP through platform actions.
 * At certain levels, they can "summon" (gacha) a buddy.
 * Higher stats = better odds for rare buddies.
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

/** EXP required for each level (cumulative) */
function expForLevel(level: number): number {
  if (level <= 1) return 0;
  // RPG curve: each level needs more EXP
  // L2: 100, L3: 300, L5: 1000, L10: 5000, L15: 12000, L20: 25000
  return Math.floor(50 * level * level + 50 * level - 100);
}

/** Level titles (RPG ranks) */
function getLevelTitle(level: number): string {
  if (level >= 30) return "Legendary Trainer";
  if (level >= 25) return "Master Trainer";
  if (level >= 20) return "Elite Trainer";
  if (level >= 15) return "Senior Trainer";
  if (level >= 10) return "Advanced Trainer";
  if (level >= 7) return "Intermediate Trainer";
  if (level >= 5) return "Junior Trainer";
  if (level >= 3) return "Novice Trainer";
  return "Apprentice";
}

/** Levels that unlock buddy summon */
const SUMMON_LEVELS = [3, 5, 8, 10, 13, 15, 18, 20, 25, 30];

export function computeUserLevel(totalExp: number): UserLevel {
  let level = 1;
  while (expForLevel(level + 1) <= totalExp) {
    level++;
    if (level >= 99) break;
  }

  const currentLevelExp = expForLevel(level);
  const nextLevelExp = expForLevel(level + 1);

  return {
    level,
    currentExp: totalExp - currentLevelExp,
    expToNextLevel: nextLevelExp - currentLevelExp,
    totalExp,
    title: getLevelTitle(level),
    canSummon: SUMMON_LEVELS.includes(level),
  };
}

// ═══════════════════════════════════════════════════════════════
// BUDDY DEFINITIONS (5 initial types)
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

/** Evolution chains for each buddy type */
const BUDDY_EVOLUTIONS: Record<string, BuddyEvolution[]> = {
  "pixel-fox": [
    { stage: 0, name: "PixelFox", nameZh: "PixelFox", emoji: "🦊", requiredLevel: 0, newPassive: "+10% project views", newPassiveZh: "+10% project views" },
    { stage: 1, name: "InfernoFox", nameZh: "InfernoFox", emoji: "🔥", requiredLevel: 8, newPassive: "+20% project views", newPassiveZh: "+20% project views" },
    { stage: 2, name: "ThunderFox", nameZh: "ThunderFox", emoji: "⚡", requiredLevel: 15, newPassive: "+35% project views", newPassiveZh: "+35% project views" },
  ],
  "neon-slime": [
    { stage: 0, name: "NeonSlime", nameZh: "NeonSlime", emoji: "🟢", requiredLevel: 0, newPassive: "+5% upvote rate", newPassiveZh: "+5% upvote rate" },
    { stage: 1, name: "MegaSlime", nameZh: "MegaSlime", emoji: "💚", requiredLevel: 8, newPassive: "+12% upvote rate", newPassiveZh: "+12% upvote rate" },
    { stage: 2, name: "CrystalSlime", nameZh: "CrystalSlime", emoji: "💎", requiredLevel: 15, newPassive: "+25% upvote rate", newPassiveZh: "+25% upvote rate" },
  ],
  "byte-owl": [
    { stage: 0, name: "ByteOwl", nameZh: "ByteOwl", emoji: "🦉", requiredLevel: 0, newPassive: "+5 AI review score", newPassiveZh: "+5 AI review score" },
    { stage: 1, name: "MoonOwl", nameZh: "MoonOwl", emoji: "🌙", requiredLevel: 12, newPassive: "+10 AI review score", newPassiveZh: "+10 AI review score" },
    { stage: 2, name: "StarOwl", nameZh: "StarOwl", emoji: "🌟", requiredLevel: 20, newPassive: "+20 AI review score", newPassiveZh: "+20 AI review score" },
  ],
  "code-dragon": [
    { stage: 0, name: "CodeDragon", nameZh: "CodeDragon", emoji: "🐉", requiredLevel: 0, newPassive: "+15% battle power", newPassiveZh: "+15% battle power" },
    { stage: 1, name: "FlameDragon", nameZh: "FlameDragon", emoji: "🔥", requiredLevel: 15, newPassive: "+30% battle power", newPassiveZh: "+30% battle power" },
    { stage: 2, name: "SwordDragon", nameZh: "SwordDragon", emoji: "⚔️", requiredLevel: 25, newPassive: "+50% battle power", newPassiveZh: "+50% battle power" },
  ],
  "crystal-phoenix": [
    { stage: 0, name: "CrystalPhoenix", nameZh: "CrystalPhoenix", emoji: "🔥", requiredLevel: 0, newPassive: "+25% EXP gain", newPassiveZh: "+25% EXP gain" },
    { stage: 1, name: "PrismPhoenix", nameZh: "PrismPhoenix", emoji: "🌈", requiredLevel: 20, newPassive: "+40% EXP gain", newPassiveZh: "+40% EXP gain" },
    { stage: 2, name: "EternalPhoenix", nameZh: "EternalPhoenix", emoji: "👑", requiredLevel: 30, newPassive: "+60% EXP gain", newPassiveZh: "+60% EXP gain" },
  ],
  "aqua-turtle": [
    { stage: 0, name: "AquaTurtle", nameZh: "AquaTurtle", emoji: "🐢", requiredLevel: 0, newPassive: "-10% battle cooldown", newPassiveZh: "-10% battle cooldown" },
    { stage: 1, name: "TidalTurtle", nameZh: "TidalTurtle", emoji: "🌊", requiredLevel: 8, newPassive: "-20% battle cooldown", newPassiveZh: "-20% battle cooldown" },
    { stage: 2, name: "OceanKing", nameZh: "OceanKing", emoji: "🔱", requiredLevel: 15, newPassive: "-35% battle cooldown", newPassiveZh: "-35% battle cooldown" },
  ],
  "frost-cat": [
    { stage: 0, name: "FrostCat", nameZh: "FrostCat", emoji: "🐱", requiredLevel: 0, newPassive: "+8% ranking score", newPassiveZh: "+8% ranking score" },
    { stage: 1, name: "BlizzardCat", nameZh: "BlizzardCat", emoji: "❄️", requiredLevel: 10, newPassive: "+18% ranking score", newPassiveZh: "+18% ranking score" },
    { stage: 2, name: "AbsoluteZero", nameZh: "AbsoluteZero", emoji: "🧊", requiredLevel: 20, newPassive: "+30% ranking score", newPassiveZh: "+30% ranking score" },
  ],
  "shadow-bat": [
    { stage: 0, name: "ShadowBat", nameZh: "ShadowBat", emoji: "🦇", requiredLevel: 0, newPassive: "Steal 5% buff", newPassiveZh: "Steal 5% buff" },
    { stage: 1, name: "NightWing", nameZh: "NightWing", emoji: "🌑", requiredLevel: 12, newPassive: "Steal 12% buff", newPassiveZh: "Steal 12% buff" },
    { stage: 2, name: "VoidLord", nameZh: "VoidLord", emoji: "🕳️", requiredLevel: 22, newPassive: "Steal 25% buff", newPassiveZh: "Steal 25% buff" },
  ],
  "volt-rabbit": [
    { stage: 0, name: "VoltRabbit", nameZh: "VoltRabbit", emoji: "🐰", requiredLevel: 0, newPassive: "2x daily login EXP", newPassiveZh: "2x daily login EXP" },
    { stage: 1, name: "ThunderHare", nameZh: "ThunderHare", emoji: "⚡", requiredLevel: 10, newPassive: "3x daily login EXP", newPassiveZh: "3x daily login EXP" },
    { stage: 2, name: "StormRacer", nameZh: "StormRacer", emoji: "🌩️", requiredLevel: 18, newPassive: "5x daily login EXP", newPassiveZh: "5x daily login EXP" },
  ],
  "terra-golem": [
    { stage: 0, name: "TerraGolem", nameZh: "TerraGolem", emoji: "🪨", requiredLevel: 0, newPassive: "+20% defense", newPassiveZh: "+20% defense" },
    { stage: 1, name: "IronGolem", nameZh: "IronGolem", emoji: "🛡️", requiredLevel: 15, newPassive: "+35% defense", newPassiveZh: "+35% defense" },
    { stage: 2, name: "MountainTitan", nameZh: "MountainTitan", emoji: "🏔️", requiredLevel: 25, newPassive: "+50% defense", newPassiveZh: "+50% defense" },
  ],
  "stellar-jellyfish": [
    { stage: 0, name: "StellarJelly", nameZh: "StellarJelly", emoji: "🪼", requiredLevel: 0, newPassive: "+15% guild bonus", newPassiveZh: "+15% guild bonus" },
    { stage: 1, name: "NebulaJelly", nameZh: "NebulaJelly", emoji: "🌌", requiredLevel: 20, newPassive: "+30% guild bonus", newPassiveZh: "+30% guild bonus" },
    { stage: 2, name: "CosmicEmpress", nameZh: "CosmicEmpress", emoji: "✨", requiredLevel: 30, newPassive: "+50% guild bonus", newPassiveZh: "+50% guild bonus" },
  ],
};

/** Get the current evolution stage for a buddy at a given level */
export function getEvolutionStage(buddyTypeId: string, level: number): BuddyEvolution {
  const evolutions = BUDDY_EVOLUTIONS[buddyTypeId];
  if (!evolutions) {
    return { stage: 0, name: "Unknown", nameZh: "Unknown", emoji: "❓", requiredLevel: 0, newPassive: "", newPassiveZh: "" };
  }
  // Find the highest evolution the buddy qualifies for
  let current = evolutions[0];
  for (const evo of evolutions) {
    if (level >= evo.requiredLevel) {
      current = evo;
    }
  }
  return current;
}

/** Check if a buddy can evolve at its current level (i.e. there's a higher stage it hasn't reached yet) */
export function canEvolve(buddyTypeId: string, currentLevel: number): boolean {
  const evolutions = BUDDY_EVOLUTIONS[buddyTypeId];
  if (!evolutions) return false;

  const currentStage = getEvolutionStage(buddyTypeId, currentLevel);
  // Check if there's a next stage that exactly matches currentLevel
  const nextStage = evolutions.find((evo) => evo.stage === currentStage.stage + 1);
  return nextStage !== undefined && currentLevel >= nextStage.requiredLevel;
}

/** Get all evolutions for a buddy type */
export function getEvolutions(buddyTypeId: string): BuddyEvolution[] {
  return BUDDY_EVOLUTIONS[buddyTypeId] ?? [];
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
 * Calculate summon weights based on user stats.
 * Higher upvotes/level = better odds for rare buddies.
 */
export function calculateSummonWeights(
  userLevel: number,
  totalUpvotes: number,
  existingBuddyIds: string[],
): { buddyType: BuddyType; weight: number }[] {
  return BUDDY_TYPES
    .filter((b) => userLevel >= b.minLevel) // Only summon buddies you qualify for
    .map((b) => {
      let weight = b.baseWeight;

      // Upvote bonus: every 100 upvotes adds +2 weight to rare+ buddies
      if (b.rarity === "rare" || b.rarity === "epic" || b.rarity === "legendary") {
        weight += Math.floor(totalUpvotes / 100) * 2;
      }

      // Level bonus: every 5 levels adds +3 to uncommon+ buddies
      if (b.rarity !== "common") {
        weight += Math.floor(userLevel / 5) * 3;
      }

      // Pity system: if you don't have this buddy yet, +5 weight
      if (!existingBuddyIds.includes(b.id)) {
        weight += 5;
      }

      return { buddyType: b, weight };
    });
}

/**
 * Perform a summon (gacha roll).
 */
export function summonBuddy(
  userLevel: number,
  totalUpvotes: number,
  existingBuddyIds: string[],
): SummonResult {
  const weights = calculateSummonWeights(userLevel, totalUpvotes, existingBuddyIds);
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);

  // Weighted random selection
  let roll = Math.random() * totalWeight;
  let selected = weights[0];

  for (const w of weights) {
    roll -= w.weight;
    if (roll <= 0) {
      selected = w;
      break;
    }
  }

  const bonuses: string[] = [];
  if (totalUpvotes >= 100) bonuses.push(`Upvote bonus (${totalUpvotes})`);
  if (userLevel >= 10) bonuses.push(`Level bonus (Lv${userLevel})`);

  return {
    buddy: selected.buddyType,
    isNew: !existingBuddyIds.includes(selected.buddyType.id),
    bonusApplied: bonuses.length > 0 ? bonuses.join(", ") : "No bonus",
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
