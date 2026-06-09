/**
 * lib/learn.ts — AICG Academy learning path metadata + scoring.
 *
 * 3 chapters (port from aicg-academy.html prototype 2026-06-04):
 *   1. AI 绘画 / AI Drawing — prompt → real image via /api/img
 *   2. 提示词工程 / Prompt Engineering — role + context + task + constraint formula
 *   3. AI Agent — Goal + Tools + Memory + Reflection assembly
 *
 * Funnel role: free, gamified, bilingual. Visitor completes 3 chapters →
 * creates a VibeX project card → enters AICG NYC workshop CTA flow.
 *
 * Storage: localStorage on client (XP + completed chapters). Server-side
 * persistence happens on Chapter 3 completion via /api/projects/submit.
 */

export type ChapterSlug = "ai-drawing" | "prompt-engineering" | "ai-agent";

export interface Chapter {
  slug: ChapterSlug;
  num: 1 | 2 | 3;
  emoji: string;
  titleEn: string;
  titleZh: string;
  blurbEn: string;
  blurbZh: string;
  xpReward: number;
  /** Slug of the chapter that must be completed before this one unlocks. null = first. */
  unlockAfter: ChapterSlug | null;
}

export const CHAPTERS: Chapter[] = [
  {
    slug: "ai-drawing",
    num: 1,
    emoji: "🎨",
    titleEn: "Summon your first AI image",
    titleZh: "召唤你的第一张 AI 图",
    blurbEn: "Write a prompt that calls a real image generator. No setup, no credit card.",
    blurbZh: "写出能召唤好图的提示词,真实 AI 出图。零环境配置。",
    xpReward: 50,
    unlockAfter: null,
  },
  {
    slug: "prompt-engineering",
    num: 2,
    emoji: "🧠",
    titleEn: "Make AI actually do what you want",
    titleZh: "让 AI 写出真正能用的文案",
    blurbEn: "Role + Context + Task + Constraint — the prompt formula that scales.",
    blurbZh: "角色+上下文+任务+约束,让 AI 听你的。",
    xpReward: 75,
    unlockAfter: "ai-drawing",
  },
  {
    slug: "ai-agent",
    num: 3,
    emoji: "🤖",
    titleEn: "Assemble your first AI agent",
    titleZh: "组装你的第一个 AI Agent",
    blurbEn: "Goal + Tools + Memory + Reflection. Ship a working spec.",
    blurbZh: "目标+工具+记忆+反思,产出一份可用的 agent spec。",
    xpReward: 100,
    unlockAfter: "prompt-engineering",
  },
];

export const TOTAL_XP = CHAPTERS.reduce((sum, c) => sum + c.xpReward, 0);

export interface LevelInfo {
  level: number;
  label: string;
  nextLevelAt: number;
}

/** Map total XP to a level (1/2/3/Master). Keeps in lockstep with localStorage. */
export function levelFromXp(xp: number): LevelInfo {
  if (xp >= TOTAL_XP) return { level: 4, label: "AICG Master", nextLevelAt: TOTAL_XP };
  if (xp >= 125) return { level: 3, label: "Agent Builder", nextLevelAt: TOTAL_XP };
  if (xp >= 50) return { level: 2, label: "Prompt Crafter", nextLevelAt: 125 };
  return { level: 1, label: "Apprentice", nextLevelAt: 50 };
}

export function getChapter(slug: string): Chapter | null {
  return CHAPTERS.find((c) => c.slug === slug) ?? null;
}

/** True if the user (with given completed set) can start this chapter. */
export function isUnlocked(chapter: Chapter, completed: Set<ChapterSlug>): boolean {
  if (chapter.unlockAfter === null) return true;
  return completed.has(chapter.unlockAfter);
}
