#!/usr/bin/env node
/**
 * Screenshot v3 — Direction A visual system capture.
 *
 * Produces 6 high-fidelity PNGs of the main user-facing surfaces AFTER the
 * Direction A sweep (29 commits, 2026-04-20 → 2026-04-21). Replaces the
 * stale docs/screenshots-v2/ set which predates the forge redesign.
 *
 * Targets production by default (vibexforge.com) so the screenshots reflect
 * what HN / Twitter / PR readers will actually see when they click through.
 * Override with BASE_URL=http://localhost:3000 for local dev testing.
 *
 * Prereqs: `npm install --no-save playwright` (or reuse repo's playwright dep
 * if already installed via @playwright/test).
 *
 * Run: `node scripts/screenshot-v3.mjs`
 */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const BASE_URL = process.env.BASE_URL || "https://www.vibexforge.com";
const OUT_DIR = "docs/screenshots-v3";
const VIEWPORT = { width: 1440, height: 900 };
const DEVICE_SCALE = 2; // Retina. Produces 2880×1800 PNGs; launch kits
// usually resize down, but the source stays sharp.

/**
 * Six shots — one per canonical surface. Each shot has an optional
 * `prepare` function that runs before the screenshot (e.g. fill form
 * fields on /launch so the forge plates glow orange instead of sitting grey).
 */
const SHOTS = [
  {
    name: "01-landing",
    path: "/",
    // Splash page: wait for the interactive demo + FAQ + schema to settle.
    settleMs: 2500,
  },
  {
    name: "02-home",
    path: "/home",
    // HeroCard grid + 3D globe. The cobe globe animation needs a second to
    // reach steady rotation; grid cards animate in on staggered delay.
    settleMs: 3000,
  },
  {
    name: "03-launch-filled",
    path: "/launch?seed=AgentForge",
    // Forge plates lit orange, live preview populated, STRIKE THE ANVIL
    // armed. Seed param pre-fills title + description (see
    // app/launch/page.tsx useEffect for hydrate logic). Then we type into
    // the remaining fields so all 9 plates are `filled` and the live
    // HeroCard preview on the right shows a populated card.
    settleMs: 2000,
    async prepare(page) {
      // Wait for the form to hydrate from the URL seed param.
      await page.waitForTimeout(1200);

      // Click through to show the full form (the URL Paste Hero default
      // state has showForm=false; the useEffect that reads ?seed sets
      // showForm=true, but we verify the form inputs are visible).
      const taglineInput = page
        .locator('input[placeholder*="tagline" i], textarea[placeholder*="tagline" i]')
        .first();
      try {
        await taglineInput.fill("Claude reviews your AI project across 5 dimensions.", {
          timeout: 2000,
        });
      } catch {
        // If the placeholder doesn't match, skip — the seed has already
        // populated title + description, which is enough to show forge
        // plates in a mixed state (some filled, some grey).
      }

      // Pick a category — Playwright can click the shadcn Select trigger
      // and then the item. Fall through silently if the DOM differs in prod.
      try {
        const categoryTrigger = page.locator('button[role="combobox"]').first();
        await categoryTrigger.click({ timeout: 1500 });
        await page.waitForTimeout(200);
        const item = page.locator('[role="option"]').filter({ hasText: "AI Agent" }).first();
        await item.click({ timeout: 1500 });
      } catch {
        /* optional */
      }

      // Scroll back to top so the hero + first 3 forge plates are in frame.
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    },
  },
  {
    name: "04-project-forged",
    path: "/project/2?forged=1",
    // Landing on AgentForge (mock id 2) with the forge-unveil animation
    // running. The animation is 3.5s total (frame reveal 0.6→1.8s,
    // compound roll 1.4→3.2s, attr bars 1.8→2.8s). We wait 4s so the
    // sequence has fully resolved — screenshots that freeze mid-animation
    // look broken. The ?forged=1 param is stripped by the page's useEffect
    // after 3.6s, but by then the screenshot is captured.
    settleMs: 4000,
  },
  {
    name: "05-hunt",
    path: "/hunt",
    // Realtime leaderboard. The new Direction A hero (pixel h1, green
    // eyebrow, forge ember) shipped in 9e395ab.
    settleMs: 2500,
  },
  {
    name: "06-creators",
    path: "/creators",
    // Creator rankings. Hero was already Direction A before the sweep;
    // the orb swap in 24af5e6 is the new element.
    settleMs: 2000,
  },
];

async function run() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: DEVICE_SCALE,
    colorScheme: "dark",
    // Prevent the cursor from flickering into random positions during
    // form interaction.
    reducedMotion: "no-preference",
  });

  // Route intercept: block cookie consent banners, analytics beacons, and
  // Sentry — these can pop up over the UI and wreck a screenshot.
  await context.route("**/*", (route) => {
    const url = route.request().url();
    if (
      url.includes("sentry.io") ||
      url.includes("posthog") ||
      url.includes("vercel-insights") ||
      url.includes("vercel-analytics")
    ) {
      return route.abort();
    }
    return route.continue();
  });

  const page = await context.newPage();

  for (const shot of SHOTS) {
    const target = `${BASE_URL}${shot.path}`;
    console.log(`→ ${shot.name}: ${target}`);
    try {
      await page.goto(target, { waitUntil: "networkidle", timeout: 20000 });
    } catch (e) {
      // networkidle can time out on realtime-heavy pages (/home, /hunt);
      // fall through to domcontentloaded + manual wait.
      console.warn(`  networkidle timeout, falling back to load event (${e.message})`);
      await page.goto(target, { waitUntil: "load", timeout: 20000 });
    }

    if (shot.prepare) {
      try {
        await shot.prepare(page);
      } catch (e) {
        console.warn(`  prepare step failed: ${e.message}`);
      }
    }

    // Settle — wait for animations (framer-motion, cobe, forge-unveil, etc.)
    // to resolve to their final frame.
    await page.waitForTimeout(shot.settleMs);

    const out = `${OUT_DIR}/${shot.name}.png`;
    await page.screenshot({
      path: out,
      fullPage: false, // Viewport only. Full-page on /home would capture
      // the 3 HeroCardGrid sections stacked, which is too long for launch
      // kit thumbnails. Change to true if you want the long version.
    });
    console.log(`  ✓ ${out}`);
  }

  await browser.close();
  console.log(`\nDone. ${SHOTS.length} screenshots → ${OUT_DIR}/`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
