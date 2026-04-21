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
    // Forge plates lit orange, live preview populated. Seed pre-fills
    // title + description via the page's useEffect (setShowForm(true)).
    // Auth gate: /launch redirects to /login unless demo session is set,
    // which context.addInitScript handles before any page JS runs.
    waitFor: 'input, textarea', // first form field rendered
    settleMs: 4000,
    async prepare(page) {
      // Scroll back to top so the hero + first 3 forge plates are in frame.
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    },
  },
  {
    name: "04-project-forged",
    path: "/project/2?forged=1",
    // Landing on AgentForge (id=2 in DB) with the forge-unveil animation
    // running. The animation is 3.5s total (frame reveal 0.6→1.8s,
    // compound roll 1.4→3.2s, attr bars 1.8→2.8s). Wait for the article
    // title, then 8s so mock→live data swap + animation both settle.
    waitFor: 'h1:has-text("AgentForge")',
    settleMs: 8000,
  },
  {
    name: "05-hunt",
    path: "/hunt",
    // Realtime leaderboard. useRealtimeLeaderboard fetches async — wait
    // for at least one leaderboard row to appear instead of the
    // "Loading rankings..." skeleton.
    waitFor: 'text=AgentForge',
    settleMs: 4000,
  },
  {
    name: "06-creators",
    path: "/creators",
    // Creator rankings (useCreators/useProjects/useWeeklyWinners).
    // Wait for the podium champion card.
    waitFor: 'text=SketchToApp',
    settleMs: 4000,
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

  // Pre-seed two things in every page context before page JS runs:
  //   1. demo session → lib/auth.tsx hydrates DEMO_USER (client-side
  //      gate for UI chrome)
  //   2. onboarding state → components/onboarding/tutorial-overlay.tsx
  //      doesn't render a "Welcome to VibeX!" modal over every capture
  await context.addInitScript(() => {
    try {
      sessionStorage.setItem("vibex-demo-session", "1");
    } catch {
      // sessionStorage can throw in private / restricted contexts; ignore.
    }
    try {
      localStorage.setItem(
        "vibex-onboarding",
        JSON.stringify({
          tutorialCompleted: true,
          questsCompleted: [],
          viewMode: "simple",
          firstVisit: false,
        }),
      );
    } catch {
      // ignore
    }
  });

  // Dev-only cookie that proxy.ts (Next.js 16 middleware) checks before
  // redirecting auth-gated routes to /login. Without it, /launch and
  // /profile land on the login page. proxy.ts requires NODE_ENV=dev so
  // this is inert against production.
  if (BASE_URL.startsWith("http://localhost") || BASE_URL.startsWith("http://127.")) {
    const { hostname } = new URL(BASE_URL);
    await context.addCookies([
      {
        name: "vibex-screenshot-bypass",
        value: "1",
        domain: hostname,
        path: "/",
        httpOnly: false,
        secure: false,
      },
    ]);
  }

  // Route intercept: block analytics beacons + Sentry, which can pop up
  // over the UI and wreck a screenshot.
  //
  // DO NOT abort PostHog. The PostHog SDK awaits its `/decide` call
  // during init, and aborting that request parks an unresolved promise
  // that blocks downstream client modules — empirically, Supabase's
  // realtime leaderboard hook on /hunt never fires its fetch. Let
  // PostHog through; its own beacons are harmless in a screenshot.
  await context.route("**/*", (route) => {
    const url = route.request().url();
    if (
      url.includes("sentry.io") ||
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

    // Optional data-ready gate: wait for a key selector before timing
    // out on settleMs. Handles cold dev server + client-side data hooks
    // (useRealtimeLeaderboard, useProjects, etc.) that don't complete
    // during the networkidle window.
    if (shot.waitFor) {
      try {
        await page.locator(shot.waitFor).first().waitFor({ state: "visible", timeout: 15000 });
      } catch (e) {
        console.warn(`  waitFor "${shot.waitFor}" timed out: ${e.message}`);
      }
    }

    // Hide floating chrome that's irrelevant to a marketing screenshot:
    //   - Chat widget (floating bottom-right bubble)
    //   - Toast notifications / Next.js dev indicator
    await page.addStyleTag({
      content: `
        button[aria-label="Messaging"],
        [data-nextjs-toast],
        [data-next-badge-root] {
          display: none !important;
        }
      `,
    });

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
