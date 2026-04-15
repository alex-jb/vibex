"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useProjects } from "@/lib/use-data";
import { HqHeroBanner } from "@/components/home/hq-hero-banner";
import {
  StatsStrip,
  HotRightNow,
  CategoryFilterPills,
  type CategoryKey,
  labelToCategory,
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
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("ALL");

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

  // Per-category counts — used by the filter pills to show real numbers
  // instead of hardcoded 250/52/74. Computed from the unfiltered project
  // set so the pills always show totals even after a filter is applied.
  const counts = useMemo(() => {
    const out: Partial<Record<CategoryKey, number>> = { ALL: projects.length };
    for (const p of projects) {
      // Map schema category ("AI Agent") back to pill label ("AI AGENT").
      const label = p.category.toUpperCase() as CategoryKey;
      // "Experimental" is special — its label is "AI EXPERIMENT".
      const key: CategoryKey =
        p.category === "Experimental" ? "AI EXPERIMENT" : label;
      out[key] = (out[key] ?? 0) + 1;
    }
    return out;
  }, [projects]);

  // Bucket real projects into JUST LAUNCHED / Legendary / Rising / Unexplored.
  // JUST LAUNCHED is sorted by createdAt DESC so newly submitted heroes land
  // at the top of /home immediately, giving creators instant feedback.
  // The other buckets are sorted by score to preserve the curation feel.
  // The active category filter is applied BEFORE bucketing so all four
  // grids reflect the same selection.
  const { justLaunched, legendary, rising, unexplored, unexploredCount } = useMemo(() => {
    const schemaCategory = labelToCategory(activeCategory);
    const filtered = schemaCategory
      ? projects.filter((p) => p.category === schemaCategory)
      : projects;

    const byScore = [...filtered].sort((a, b) => b.score - a.score);
    const byDate = [...filtered].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const scoreCards = projectsToCards(byScore);
    const dateCards = projectsToCards(byDate);

    const legendaryCards = scoreCards.filter(
      (c) => c.rarity === "myth" || c.rarity === "legendary",
    );
    const risingCards = scoreCards.filter(
      (c) => c.rarity === "epic" || c.rarity === "rare",
    );
    const unexploredCards = scoreCards.filter(
      (c) => c.rarity === "uncommon" || c.rarity === "common",
    );

    // When a category filter is active we show real results only — no mock
    // fallback — because showing mocks across categories would be confusing
    // ("AI GAME" should never render the AI WORKFLOW mock cards). When no
    // filter is active we fall back to mocks as before so the page never
    // renders empty during the pre-Supabase phase.
    const withFallback = (real: HeroCardData[], mock: HeroCardData[]) => {
      if (real.length > 0) return real.slice(0, 3);
      return activeCategory === "ALL" ? mock : [];
    };

    return {
      justLaunched: withFallback(dateCards, MOCK_RISING),
      legendary: withFallback(legendaryCards, MOCK_LEGENDARY),
      rising: withFallback(risingCards, MOCK_RISING),
      unexplored: withFallback(unexploredCards, MOCK_UNEXPLORED),
      unexploredCount: unexploredCards.length || (activeCategory === "ALL" ? MOCK_UNEXPLORED.length : 0),
    };
  }, [projects, activeCategory]);

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
      <CategoryFilterPills
        active={activeCategory}
        onChange={setActiveCategory}
        counts={counts}
      />
      <div id="heroes">
        <HeroCardGrid
          label="▸ JUST LAUNCHED"
          subLabel="· FRESH FROM THE FORGE"
          cards={justLaunched}
        />
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
