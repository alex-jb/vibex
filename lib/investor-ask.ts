/**
 * Canonical "what I'm looking for" data for VC outreach.
 *
 * Used by:
 *   - app/investors/page.tsx (the live VC landing page, EN only)
 *   - remotion/src/scenes/demo-vc/VCCTAAsk.tsx (the bilingual pitch
 *     video closer scene)
 *
 * Single source of truth for amounts, descriptions, and contact info
 * so a swap (e.g. Cal.com URL, branded email alias) is a one-file
 * change instead of a 4-place sweep.
 */

export type AskCard = {
  icon: string;
  tag: string;
  /** Short body — kept under ~12 words for the Remotion 3-card row. */
  body: string;
};

export const ASKS_EN: ReadonlyArray<AskCard> = [
  {
    icon: "◉",
    tag: "SEED",
    body: "pre-seed to seed · $250K–$1M · 6-9 month runway",
  },
  {
    icon: "⬢",
    tag: "DESIGN PARTNER",
    body: "AI maker willing to submit their project as a cohort-0 design partner",
  },
  {
    icon: "✦",
    tag: "ADVISOR",
    body: "growth / community / gamification mechanics expertise",
  },
] as const;

export const ASKS_ZH: ReadonlyArray<AskCard> = [
  {
    icon: "◉",
    tag: "SEED 投资",
    body: "pre-seed 到 seed · $250K–$1M · 6-9 月 runway",
  },
  {
    icon: "⬢",
    tag: "DESIGN PARTNER",
    body: "AI 创作者 · 作为 cohort-0 design partner 一起 ship",
  },
  {
    icon: "✦",
    tag: "顾问",
    body: "增长 · 社区 · 游戏化 经验",
  },
] as const;

export const CONTACT = {
  email: "xji1@mail.yu.edu",
  // Cal.com / Calendly URL goes here when set up. Until then this is a
  // mailto: that prefills a 15-min chat request. The web CTA can branch
  // on this prefix to render "BOOK A CALL" vs "EMAIL TO SCHEDULE".
  cal: "mailto:xji1@mail.yu.edu?subject=VibeXForge%20%E2%80%94%2015%20min%20chat&body=Hi%20Alex%2C%0A%0AI%27d%20like%20to%20chat%20about%20VibeXForge.%20A%2015-minute%20slot%20that%20works%20for%20you%3F%0A%0AThanks%2C",
  github: "https://github.com/alex-jb/vibex",
  site: "vibexforge.com/investors",
} as const;
