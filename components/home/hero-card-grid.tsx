"use client";

import Link from "next/link";
import { HeroCard, type HeroCardData } from "@/components/home/hero-card";
import { computeEvolutionStage, pickTopAttrs } from "@/lib/rpg-utils";
import type { Project, EvolutionStage } from "@/lib/types";

const SEVEN_DAYS_MS = 7 * 86400 * 1000;

export function projectToHeroCardData(p: Project): HeroCardData {
  const stage: EvolutionStage =
    (p.hero?.evolutionStage as EvolutionStage | undefined) ??
    computeEvolutionStage(p);

  const topTraction: HeroCardData["traction"] =
    p.plays >= p.upvotes * 10
      ? { kind: "plays", value: p.plays }
      : p.upvotes >= p.shares
        ? { kind: "upvotes", value: p.upvotes }
        : { kind: "shares", value: p.shares };

  const newChip =
    stage === "Seed" &&
    !!p.createdAt &&
    Date.now() - new Date(p.createdAt).getTime() < SEVEN_DAYS_MS;

  return {
    id: p.id,
    name: p.title,
    creator: p.creatorName || "anon",
    category: p.category.toUpperCase(),
    evolutionStage: stage,
    compound: p.score,
    topAttrs: pickTopAttrs(p.aiReview, 2),
    traction: topTraction,
    newChip,
  };
}

export function projectsToCards(projects: Project[]): HeroCardData[] {
  return projects.map(projectToHeroCardData);
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
  viewAllHref = "/creators",
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
              style={{ color: "var(--text-muted)", marginLeft: 10 }}
            >
              {subLabel}
            </span>
          ) : null}
        </div>
        <Link
          href={viewAllHref}
          className="font-ui"
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            textDecoration: "none",
            letterSpacing: 1.5,
            borderBottom: "1px dashed var(--border-wire)",
            paddingBottom: 2,
          }}
        >
          VIEW ALL ›
        </Link>
      </div>
      <div className="grid gap-[18px] sm:gap-[22px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
        {cards.map((card) => (
          <HeroCard key={card.id} data={card} />
        ))}
      </div>
    </div>
  );
}

/* Mock data for the 9 sample heroes — new HeroCardData shape (Direction A) */

export const MOCK_LEGENDARY: HeroCardData[] = [
  {
    id: "agentcraft",
    name: "AgentCraft",
    creator: "orallexa",
    category: "AI AGENT",
    evolutionStage: "Myth",
    compound: 94,
    topAttrs: [
      { code: "VIR", label: "Virality Potential", value: 99 },
      { code: "INV", label: "Investor Curiosity", value: 97 },
    ],
    traction: { kind: "plays", value: 18200 },
  },
  {
    id: "loopmaster",
    name: "LoopMaster",
    creator: "sam",
    category: "AI WORKFLOW",
    evolutionStage: "Legend",
    compound: 88,
    topAttrs: [
      { code: "ORG", label: "Originality", value: 92 },
      { code: "UXP", label: "UX Potential", value: 85 },
    ],
    traction: { kind: "upvotes", value: 1240 },
  },
  {
    id: "codesage",
    name: "CodeSage",
    creator: "tessa",
    category: "AI AGENT",
    evolutionStage: "Legend",
    compound: 86,
    topAttrs: [
      { code: "CLR", label: "Clarity", value: 90 },
      { code: "INV", label: "Investor Curiosity", value: 82 },
    ],
    traction: { kind: "plays", value: 9800 },
  },
];

export const MOCK_RISING: HeroCardData[] = [
  {
    id: "pixelforge",
    name: "PixelForge",
    creator: "marcus",
    category: "AI GAME",
    evolutionStage: "Breakout",
    compound: 76,
    topAttrs: [
      { code: "VIR", label: "Virality Potential", value: 84 },
      { code: "ORG", label: "Originality", value: 78 },
    ],
    traction: { kind: "plays", value: 4200 },
  },
  {
    id: "hyperdrive",
    name: "Hyperdrive",
    creator: "dev42",
    category: "AI WORKFLOW",
    evolutionStage: "Breakout",
    compound: 73,
    topAttrs: [
      { code: "UXP", label: "UX Potential", value: 81 },
      { code: "CLR", label: "Clarity", value: 76 },
    ],
    traction: { kind: "shares", value: 340 },
  },
  {
    id: "moodalchemy",
    name: "MoodAlchemy",
    creator: "zoe",
    category: "AI TOOL",
    evolutionStage: "Growing",
    compound: 68,
    topAttrs: [
      { code: "ORG", label: "Originality", value: 80 },
      { code: "VIR", label: "Virality Potential", value: 72 },
    ],
    traction: { kind: "upvotes", value: 420 },
  },
];

export const MOCK_UNEXPLORED: HeroCardData[] = [
  {
    id: "vibetranslate",
    name: "VibeTranslate",
    creator: "linda",
    category: "AI TOOL",
    evolutionStage: "Growing",
    compound: 61,
    topAttrs: [
      { code: "CLR", label: "Clarity", value: 74 },
      { code: "UXP", label: "UX Potential", value: 68 },
    ],
    traction: { kind: "plays", value: 1800 },
  },
  {
    id: "starlight",
    name: "Starlight.io",
    creator: "nova",
    category: "AI GAME",
    evolutionStage: "Active",
    compound: 48,
    topAttrs: [
      { code: "VIR", label: "Virality Potential", value: 62 },
      { code: "ORG", label: "Originality", value: 55 },
    ],
    traction: { kind: "plays", value: 720 },
  },
  {
    id: "dreamcast",
    name: "DreamCast",
    creator: "jenny",
    category: "AI GAME",
    evolutionStage: "Seed",
    compound: 32,
    topAttrs: [
      { code: "CLR", label: "Clarity", value: 48 },
      { code: "ORG", label: "Originality", value: 35 },
    ],
    traction: { kind: "plays", value: 96 },
    newChip: true,
  },
];
