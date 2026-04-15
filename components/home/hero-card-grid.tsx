"use client";

import { HeroCard, type HeroCardData, type Rarity } from "@/components/home/hero-card";
import type { Project } from "@/lib/types";

/**
 * Map a real Supabase Project row to the HeroCardData shape the grid renders.
 * This is where the DB schema meets the design system: evolution_stage →
 * rarity, score → HP, id → card number. Keep this pure so it's easy to test.
 */
const STAGE_TO_RARITY: Record<string, Rarity> = {
  Seed: "common",
  Active: "uncommon",
  Growing: "rare",
  Breakout: "epic",
  Legend: "legendary",
  Myth: "myth",
};

function projectToHeroCardData(
  p: Project,
  index: number,
): HeroCardData {
  // evolution_stage isn't in the Project TS type yet (it's a DB-only column),
  // so we read it through an index lookup and fall back to score buckets.
  const stage = (p as unknown as { evolutionStage?: string }).evolutionStage;
  const stageRarity = stage ? STAGE_TO_RARITY[stage] : undefined;
  const scoreRarity: Rarity =
    p.score >= 90
      ? "myth"
      : p.score >= 85
        ? "legendary"
        : p.score >= 75
          ? "epic"
          : p.score >= 60
            ? "rare"
            : p.score >= 40
              ? "uncommon"
              : "common";
  const rarity: Rarity = stageRarity ?? scoreRarity;

  // Stable card number from project id — first 3 trailing chars, padded.
  const tail = p.id.replace(/[^a-zA-Z0-9]/g, "").slice(-3).toUpperCase();
  const cardNumber = tail.padStart(3, "0");

  // HP is a cosmetic scale of the score. Map 0-100 → 60-250 so even low
  // scores look playable.
  const hp = 60 + Math.round((p.score / 100) * 190);

  return {
    id: p.id,
    name: p.title,
    hp,
    category: p.category.toUpperCase(),
    stage: stage ? `${stage.toUpperCase()}` : undefined,
    creator: p.creatorName || "anon",
    rarity,
    cardNumber,
    // Timeline is purely decorative (fake video player chrome).
    timelineStart: "00:00",
    timelineEnd: `00:${String(10 + (index % 40)).padStart(2, "0")}`,
  };
}

export function projectsToCards(
  projects: Project[],
): HeroCardData[] {
  return projects.map((p, i) => projectToHeroCardData(p, i));
}

type HeroCardGridProps = {
  id?: string;
  label: string;
  subLabel?: string;
  cards: HeroCardData[];
  viewAllHref?: string;
};

export function HeroCardGrid({
  id,
  label,
  subLabel,
  cards,
  viewAllHref = "#",
}: HeroCardGridProps) {
  return (
    <div
      id={id}
      className="mx-auto px-4 sm:px-8 mt-10 sm:mt-11"
      style={{ maxWidth: 1440 }}
    >
      <div className="flex items-baseline justify-between mb-[18px] gap-3 flex-wrap">
        <div
          className="font-ui text-[11px] sm:text-[13px]"
          style={{
            letterSpacing: 3,
            color: "var(--neon-green)",
            textShadow: "0 0 5px rgba(57,255,20,0.7)",
          }}
        >
          {label}
          {subLabel ? (
            <span
              className="text-[9px] sm:text-[11px]"
              style={{
                color: "var(--muted)",
                marginLeft: 10,
              }}
            >
              {subLabel}
            </span>
          ) : null}
        </div>
        <a
          href={viewAllHref}
          className="font-ui"
          style={{
            fontSize: 11,
            color: "var(--muted)",
            textDecoration: "none",
            letterSpacing: 1.5,
            borderBottom: "1px dashed var(--border-wire)",
            paddingBottom: 2,
          }}
        >
          VIEW ALL ›
        </a>
      </div>
      <div className="grid gap-[18px] sm:gap-[22px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <HeroCard key={card.id} data={card} />
        ))}
      </div>
    </div>
  );
}

/* Mock data for the 9 sample heroes — to be replaced with real supabase
   query in a follow-up pass. Order matches /design-shotgun approved mockup
   v6 "LEGENDARY IN THE WILD / RISING / UNEXPLORED". */

export const MOCK_LEGENDARY: HeroCardData[] = [
  {
    id: "agentcraft",
    name: "AgentCraft",
    hp: 240,
    category: "AI AGENT",
    stage: "STAGE 2 · EVOLVES FROM CODESAGE",
    creator: "orallexa",
    rarity: "myth",
    cardNumber: "001",
    timelineStart: "00:12",
    timelineEnd: "00:42",
  },
  {
    id: "loopmaster",
    name: "LoopMaster",
    hp: 180,
    category: "AI WORKFLOW",
    stage: "STAGE 2 · EVOLVES FROM HYPERDRIVE",
    creator: "sam",
    rarity: "legendary",
    cardNumber: "017",
    timelineStart: "00:08",
    timelineEnd: "00:32",
  },
  {
    id: "codesage",
    name: "CodeSage",
    hp: 170,
    category: "AI AGENT",
    stage: "STAGE 1 · EVOLVES FROM TINYGPT",
    creator: "tessa",
    rarity: "legendary",
    cardNumber: "028",
    timelineStart: "00:05",
    timelineEnd: "00:28",
  },
];

export const MOCK_RISING: HeroCardData[] = [
  {
    id: "pixelforge",
    name: "PixelForge",
    hp: 140,
    category: "AI GAME",
    stage: "STAGE 1 · EVOLVES FROM DREAMCAST",
    creator: "marcus",
    rarity: "epic",
    cardNumber: "044",
    timelineStart: "00:14",
    timelineEnd: "00:38",
  },
  {
    id: "hyperdrive",
    name: "Hyperdrive",
    hp: 130,
    category: "AI WORKFLOW",
    stage: "STAGE 1 · EVOLVES FROM TINYGPT",
    creator: "dev42",
    rarity: "epic",
    cardNumber: "061",
    timelineStart: "00:11",
    timelineEnd: "00:36",
  },
  {
    id: "moodalchemy",
    name: "MoodAlchemy",
    hp: 130,
    category: "AI TOOL",
    stage: "STAGE 1 · EVOLVES FROM RHYMEBOT",
    creator: "zoe",
    rarity: "epic",
    cardNumber: "072",
    timelineStart: "00:07",
    timelineEnd: "00:24",
  },
];

export const MOCK_UNEXPLORED: HeroCardData[] = [
  {
    id: "vibetranslate",
    name: "VibeTranslate",
    hp: 110,
    category: "AI TOOL",
    stage: "STAGE 1 · EVOLVES FROM RHYMEBOT",
    creator: "linda",
    rarity: "rare",
    cardNumber: "088",
    timelineStart: "00:09",
    timelineEnd: "00:30",
  },
  {
    id: "starlight",
    name: "Starlight.io",
    hp: 100,
    category: "AI GAME",
    creator: "nova",
    rarity: "rare",
    cardNumber: "104",
    timelineStart: "00:06",
    timelineEnd: "00:22",
  },
  {
    id: "dreamcast",
    name: "DreamCast",
    hp: 80,
    category: "AI GAME",
    creator: "jenny",
    rarity: "uncommon",
    cardNumber: "142",
    timelineStart: "00:03",
    timelineEnd: "00:15",
  },
];
