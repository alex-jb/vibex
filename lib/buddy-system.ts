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
  publishProject: 100,    // 发布项目
  publishDemo: 50,        // 发布 Demo
  publishIdea: 30,        // 提交创意
  postArticle: 40,        // 发布文章
  shareContent: 10,       // 分享内容
  receiveUpvote: 5,       // 被点赞 (每次)
  giveComment: 5,         // 发表评论
  receiveComment: 3,      // 收到评论
  winBattle: 25,          // 赢得战斗
  loseBattle: 10,         // 输掉战斗 (参与奖)
  drawBattle: 15,         // 平局
  dailyLogin: 10,         // 每日登录
  getFollowed: 15,        // 被关注
  forkProject: 20,        // 复刻项目
  runAgent: 8,            // 运行 Agent
  createWorkflow: 35,     // 创建工作流
  completeProfile: 50,    // 完善个人资料
  firstProject: 200,      // 首个项目 (一次性)
  firstBattle: 100,       // 首次战斗 (一次性)
  firstBuddy: 50,         // 首个 Buddy (一次性)
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
  if (level >= 30) return "传说训练师";  // Legendary Trainer
  if (level >= 25) return "大师训练师";  // Master Trainer
  if (level >= 20) return "精英训练师";  // Elite Trainer
  if (level >= 15) return "资深训练师";  // Senior Trainer
  if (level >= 10) return "高级训练师";  // Advanced Trainer
  if (level >= 7) return "中级训练师";   // Intermediate Trainer
  if (level >= 5) return "初级训练师";   // Junior Trainer
  if (level >= 3) return "新手训练师";   // Novice Trainer
  return "见习训练师";                   // Apprentice
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
    nameZh: "像素狐",
    nameJa: "ピクセルフォックス",
    description: "A mischievous fire fox that boosts your project visibility",
    descriptionZh: "调皮的火狐，提升你的项目曝光度",
    rarity: "common",
    element: "Fire",
    emoji: "🦊",
    minLevel: 3,
    baseWeight: 40,
    color: "#FF6B35",
    passive: "+10% project views",
    passiveZh: "项目浏览量 +10%",
  },
  {
    id: "neon-slime",
    name: "NeonSlime",
    nameZh: "霓虹史莱姆",
    nameJa: "ネオンスライム",
    description: "A bouncy neon blob that attracts upvotes",
    descriptionZh: "弹弹的霓虹果冻，吸引点赞",
    rarity: "common",
    element: "Electric",
    emoji: "🟢",
    minLevel: 3,
    baseWeight: 40,
    color: "#39FF14",
    passive: "+5% upvote rate",
    passiveZh: "点赞率 +5%",
  },
  {
    id: "byte-owl",
    name: "ByteOwl",
    nameZh: "字节猫头鹰",
    nameJa: "バイトフクロウ",
    description: "A wise owl that enhances AI review scores",
    descriptionZh: "智慧猫头鹰，提升 AI 评审分数",
    rarity: "uncommon",
    element: "Wisdom",
    emoji: "🦉",
    minLevel: 5,
    baseWeight: 25,
    color: "#9D00FF",
    passive: "+5 AI review score",
    passiveZh: "AI 评审分数 +5",
  },
  {
    id: "code-dragon",
    name: "CodeDragon",
    nameZh: "代码龙",
    nameJa: "コードドラゴン",
    description: "A fierce dragon that powers up battle stats",
    descriptionZh: "凶猛的代码龙，强化战斗属性",
    rarity: "rare",
    element: "Power",
    emoji: "🐉",
    minLevel: 10,
    baseWeight: 12,
    color: "#FF4500",
    passive: "+15% battle power",
    passiveZh: "战斗力 +15%",
  },
  {
    id: "crystal-phoenix",
    name: "CrystalPhoenix",
    nameZh: "水晶凤凰",
    nameJa: "クリスタルフェニックス",
    description: "A legendary phoenix that grants evolution bonuses",
    descriptionZh: "传说中的水晶凤凰，赋予进化加成",
    rarity: "legendary",
    element: "Evolution",
    emoji: "🔥",
    minLevel: 15,
    baseWeight: 3,
    color: "#FFD700",
    passive: "+25% EXP gain",
    passiveZh: "经验获取 +25%",
  },
];

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
  if (totalUpvotes >= 100) bonuses.push(`点赞加成 (${totalUpvotes})`);
  if (userLevel >= 10) bonuses.push(`等级加成 (Lv${userLevel})`);

  return {
    buddy: selected.buddyType,
    isNew: !existingBuddyIds.includes(selected.buddyType.id),
    bonusApplied: bonuses.length > 0 ? bonuses.join(", ") : "无加成",
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
    labelZh: "普通",
    color: "#8888A0",
    bgColor: "bg-zinc-500/10",
    borderColor: "border-zinc-500/30",
    glow: "",
  },
  uncommon: {
    label: "Uncommon",
    labelZh: "稀有",
    color: "#39FF14",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    glow: "shadow-emerald-500/20",
  },
  rare: {
    label: "Rare",
    labelZh: "珍贵",
    color: "#06B6D4",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    glow: "shadow-cyan-500/20",
  },
  epic: {
    label: "Epic",
    labelZh: "史诗",
    color: "#9D00FF",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
    glow: "shadow-violet-500/30",
  },
  legendary: {
    label: "Legendary",
    labelZh: "传说",
    color: "#FFD700",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    glow: "shadow-amber-500/30 evolution-glow",
  },
};
