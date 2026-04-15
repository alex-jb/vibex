"use client";

import { useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { useProjects } from "@/lib/use-data";
import { HqHeroBanner } from "@/components/home/hq-hero-banner";
import {
  StatsStrip,
  HotRightNow,
  CategoryFilterPills,
  Testimonials,
  ForgeCtaBlock,
  WalkerStrip,
  DotNav,
} from "@/components/home/hq-chrome";
import { HqFeatureSections } from "@/components/home/hq-feature-sections";
import {
  HeroCardGrid,
  projectsToCards,
  MOCK_LEGENDARY,
  MOCK_RISING,
  MOCK_UNEXPLORED,
} from "@/components/home/hero-card-grid";
import type { HeroCardData } from "@/components/home/hero-card";

/* ═══════════════════════════════════════════════════════════════════════════
   /home — HQ page (new composition, approved via /design-consultation
   2026-04-14 mockup v6).

   Structure (top to bottom):
     1. Hero banner (pixel night scene + CTA + CRT mascot + butterfly)
     2. Social proof stats strip
     3. Hot Right Now tiles (4 live drops)
     4. 5 Feature sections (AI review / Evolution / Arena / Buddy / VC)
     5. Category filter pills
     6. Hero card grid: Legendary in the wild
     7. Hero card grid: Rising in the community
     8. Hero card grid: Unexplored
     9. Testimonials (3 creator quotes)
    10. Forge CTA block (purple/pink gradient)
    11. Walking pixel buddy strip
    12. Sticky right-side dot nav (floating)

   The existing Footer is rendered by app/layout.tsx, not here.
   Mock data for the card grids lives in components/home/hero-card-grid.tsx
   and will be replaced with real supabase queries in a follow-up.

   Replaces the old /home composition (ValueHero + QuestBoard + CtaSection +
   DailyQuestBar) because that redundantly showed project cards that also
   live on /discover. Per user decision 2026-04-14: one page, one catalog.
   ═══════════════════════════════════════════════════════════════════════════ */

export default function HomePage() {
  const { user } = useAuth();
  const { data: projects, loading: projectsLoading } = useProjects();

  // Prefer GitHub/Google handle if we have it, fall back to the local-part of
  // the email, fall back to "trainer" for logged-out visitors. Stripping to a
  // handle keeps the hero eyebrow short enough to fit on mobile.
  const rawName =
    (user?.user_metadata?.user_name as string | undefined) ??
    (user?.user_metadata?.preferred_username as string | undefined) ??
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "trainer";
  const userName = rawName.replace(/\s+/g, "").slice(0, 20);

  // Bucket real projects into Legendary / Rising / Unexplored by score. The
  // fallback mock constants are used while the fetch is in flight or if the
  // query returns empty, so the page never renders a blank grid.
  const { legendary, rising, unexplored, unexploredCount } = useMemo(() => {
    const sorted = [...projects].sort((a, b) => b.score - a.score);
    const cards = projectsToCards(sorted);

    const legendaryCards = cards.filter(
      (c) => c.rarity === "myth" || c.rarity === "legendary",
    );
    const risingCards = cards.filter(
      (c) => c.rarity === "epic" || c.rarity === "rare",
    );
    const unexploredCards = cards.filter(
      (c) => c.rarity === "uncommon" || c.rarity === "common",
    );

    const withFallback = (real: HeroCardData[], mock: HeroCardData[]) =>
      real.length > 0 ? real.slice(0, 3) : mock;

    return {
      legendary: withFallback(legendaryCards, MOCK_LEGENDARY),
      rising: withFallback(risingCards, MOCK_RISING),
      unexplored: withFallback(unexploredCards, MOCK_UNEXPLORED),
      unexploredCount: unexploredCards.length || MOCK_UNEXPLORED.length,
    };
  }, [projects]);

  const unexploredSub = projectsLoading
    ? "· LOADING…"
    : `· ${unexploredCount} HEROES YOU HAVEN'T MET`;

  return (
    <div id="top" className="relative" style={{ background: "var(--bg-deep)" }}>
      <HqHeroBanner userName={userName} newEvolutionsToday={3} />
      <StatsStrip />
      <HotRightNow />
      <div id="features">
        <HqFeatureSections />
      </div>
      <CategoryFilterPills />
      <div id="heroes">
        <HeroCardGrid
          label="▸ LEGENDARY IN THE WILD"
          subLabel="· TOP 3 THIS WEEK"
          cards={legendary}
        />
        <HeroCardGrid
          label="▸ RISING IN THE COMMUNITY"
          subLabel="· EPIC + RARE ON THE CLIMB"
          cards={rising}
        />
        <HeroCardGrid
          label="▸ UNEXPLORED"
          subLabel={unexploredSub}
          cards={unexplored}
        />
      </div>
      <Testimonials />
      <ForgeCtaBlock />
      <WalkerStrip />
      <DotNav />
    </div>
  );
}
