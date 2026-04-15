"use client";

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
  MOCK_LEGENDARY,
  MOCK_RISING,
  MOCK_UNEXPLORED,
} from "@/components/home/hero-card-grid";

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
  return (
    <div id="top" className="relative" style={{ background: "var(--bg-deep)" }}>
      <HqHeroBanner userName="creator" newEvolutionsToday={3} />
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
          cards={MOCK_LEGENDARY}
        />
        <HeroCardGrid
          label="▸ RISING IN THE COMMUNITY"
          subLabel="· EPIC + RARE ON THE CLIMB"
          cards={MOCK_RISING}
        />
        <HeroCardGrid
          label="▸ UNEXPLORED"
          subLabel="· 208 HEROES YOU HAVEN'T MET"
          cards={MOCK_UNEXPLORED}
        />
      </div>
      <Testimonials />
      <ForgeCtaBlock />
      <WalkerStrip />
      <DotNav />
    </div>
  );
}
