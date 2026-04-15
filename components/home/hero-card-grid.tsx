"use client";

import { HeroCard, type HeroCardData } from "@/components/home/hero-card";

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
      className="mx-auto"
      style={{ maxWidth: 1440, padding: "0 32px", marginTop: 44 }}
    >
      <div className="flex items-baseline justify-between mb-[18px]">
        <div
          className="font-ui"
          style={{
            fontSize: 13,
            letterSpacing: 3,
            color: "var(--neon-green)",
            textShadow: "0 0 5px rgba(57,255,20,0.7)",
          }}
        >
          {label}
          {subLabel ? (
            <span
              style={{
                color: "var(--muted)",
                marginLeft: 10,
                fontSize: 11,
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
      <div
        className="grid gap-[22px]"
        style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
      >
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
