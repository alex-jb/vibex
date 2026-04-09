import type { EvolutionStage } from "./types";

/**
 * Visual configuration for each evolution stage.
 * Used by evolution badges, hero cards, share cards, and project displays.
 */
export interface SpriteStageConfig {
  label: string;
  labelZh: string;
  rarity: string;
  emoji: string;
  color: string;
  glowColor: string;
  bgGradient: string;
  cssClass: string;
  icon: string; // lucide icon name
}

export const SPRITE_STAGES: Record<EvolutionStage, SpriteStageConfig> = {
  Seed: {
    label: "Seed",
    labelZh: "种子",
    rarity: "Common",
    emoji: "🌱",
    color: "#a1a1aa",
    glowColor: "rgba(161,161,170,0.3)",
    bgGradient: "from-zinc-600/10 to-zinc-500/5",
    cssClass: "evo-seed",
    icon: "Sprout",
  },
  Active: {
    label: "Active",
    labelZh: "活跃",
    rarity: "Uncommon",
    emoji: "⚡",
    color: "#39FF14",
    glowColor: "rgba(57,255,20,0.3)",
    bgGradient: "from-emerald-600/15 to-green-500/5",
    cssClass: "evo-active",
    icon: "Zap",
  },
  Growing: {
    label: "Growing",
    labelZh: "成长",
    rarity: "Rare",
    emoji: "🌿",
    color: "#06B6D4",
    glowColor: "rgba(6,182,212,0.3)",
    bgGradient: "from-cyan-600/15 to-blue-500/5",
    cssClass: "evo-growing",
    icon: "TrendingUp",
  },
  Breakout: {
    label: "Breakout",
    labelZh: "突破",
    rarity: "Epic",
    emoji: "🔥",
    color: "#8b5cf6",
    glowColor: "rgba(139,92,246,0.4)",
    bgGradient: "from-violet-600/20 to-purple-500/10",
    cssClass: "evo-breakout",
    icon: "Flame",
  },
  Legend: {
    label: "Legend",
    labelZh: "传奇",
    rarity: "Legendary",
    emoji: "👑",
    color: "#FFD700",
    glowColor: "rgba(255,215,0,0.4)",
    bgGradient: "from-amber-500/20 to-yellow-500/10",
    cssClass: "evo-legend",
    icon: "Crown",
  },
  Myth: {
    label: "Myth",
    labelZh: "神话",
    rarity: "Mythic",
    emoji: "✨",
    color: "#FF69B4",
    glowColor: "rgba(255,105,180,0.5)",
    bgGradient: "from-pink-500/25 to-rose-500/15",
    cssClass: "evo-myth",
    icon: "Sparkles",
  },
};

/** Evolution thresholds — metric-based auto-evolution */
export interface EvolutionThreshold {
  plays?: number;
  upvotes?: number;
  views?: number;
  shares?: number;
  score?: number;
  originality?: number;
  investorCuriosity?: number;
}

export const EVOLUTION_THRESHOLDS: Record<EvolutionStage, EvolutionThreshold> = {
  Seed: {},
  Active: { plays: 50, score: 40 },
  Growing: { plays: 500, upvotes: 50, views: 1000 },
  Breakout: { plays: 1000, upvotes: 100, shares: 50, originality: 70 },
  Legend: { plays: 5000, upvotes: 500, shares: 200, score: 85 },
  Myth: { plays: 10000, upvotes: 1000, investorCuriosity: 80, score: 90 },
};

/** All stages in order */
export const EVOLUTION_ORDER: EvolutionStage[] = [
  "Seed", "Active", "Growing", "Breakout", "Legend", "Myth",
];
