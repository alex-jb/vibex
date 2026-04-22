#!/usr/bin/env node
/**
 * Records 4 short product clips (R1-R4) for Remotion demo scene integration.
 *
 * Each clip is 6s · 1920×1080 · silent MP4, targeting prod (www.vibexforge.com)
 * or localhost:3000 if --local flag set. Output: out/R1.mp4 ... R4.mp4.
 *
 * After running, feed the 4 MP4s to the next pipeline step:
 *   1. Upload to Blob:  (extend scripts/sync-demo-blob.mjs to handle R-clips)
 *   2. Swap the staticFile PNG refs in Remotion scenes:
 *      - ForgeAction.tsx:82  03-launch-filled.png  → OffthreadVideo R1
 *      - ReviewStream.tsx:114 04-project-forged.png → OffthreadVideo R2 + R3
 *      - EvolveRank.tsx:214   05-hunt.png            → OffthreadVideo R4
 *   3. Re-render demo:  npm run remotion:demo && npm run remotion:demo-vc
 *
 * Shot list:
 *   R1 — /launch form: fill title + tagline + description, scroll to Forge button
 *   R2 — /launch → click Forge → forge-unveil animation plays on project page
 *   R3 — /project/[id] AI review panel: tokens streaming in, stats animating
 *   R4 — /hunt: scroll through ranked projects, hover one, click upvote
 *
 * Prereq:
 *   - Playwright installed (already in deps for e2e)
 *   - ffmpeg-static (npm install --no-save ffmpeg-static) for webm→mp4 convert
 *   - If --local: dev server running + DEV_AUTH_BYPASS=1 in env so /launch loads
 *
 * Usage:
 *   node scripts/record-r-clips.mjs              # records against prod
 *   node scripts/record-r-clips.mjs --local      # records against localhost:3000
 *   node scripts/record-r-clips.mjs --only=R2    # just one clip (R1|R2|R3|R4)
 */

import { chromium } from "playwright";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { mkdirSync, renameSync, existsSync, readdirSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outDir = resolve(root, "out");
mkdirSync(outDir, { recursive: true });

const FFMPEG = (await import("ffmpeg-static")).default;

const args = process.argv.slice(2);
const local = args.includes("--local");
const only = args.find((a) => a.startsWith("--only="))?.split("=")[1];
const BASE = local ? "http://localhost:3000" : "https://www.vibexforge.com";
const W = 1920;
const H = 1080;

const CLIPS = [
  {
    id: "R1",
    description: "fill /launch form",
    url: "/launch",
    script: async (page) => {
      await page.waitForLoadState("networkidle");
      // Type into URL field (first input)
      const urlInput = page.locator('input[type="url"]').first();
      if (await urlInput.count()) {
        await urlInput.fill("https://vibexforge.com/demo");
      }
      await page.waitForTimeout(800);
      // Title
      const title = page.locator("input").filter({ hasText: "" }).nth(1);
      if (await title.count()) {
        await title.fill("Forge Demo");
      }
      await page.waitForTimeout(600);
      // Scroll to reveal more of the form
      await page.evaluate(() => window.scrollBy(0, 300));
      await page.waitForTimeout(1500);
      await page.evaluate(() => window.scrollBy(0, 200));
      await page.waitForTimeout(1500);
    },
  },
  {
    id: "R2",
    description: "forge-unveil animation on project page",
    url: "/project/proj-mo1w2haf-ga3v?forged=1",
    script: async (page) => {
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000); // let forge-unveil animation play
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(2000);
    },
  },
  {
    id: "R3",
    description: "AI review panel tokens streaming",
    url: "/project/proj-mo1w2haf-ga3v",
    script: async (page) => {
      await page.waitForLoadState("networkidle");
      // Scroll to the AI review panel
      await page.evaluate(() => {
        const el = document.querySelector('[data-ai-review], [class*="review"], [class*="Review"]');
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      await page.waitForTimeout(4500);
    },
  },
  {
    id: "R4",
    description: "/hunt scroll + hover upvote",
    url: "/hunt",
    script: async (page) => {
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(800);
      await page.evaluate(() => window.scrollBy(0, 200));
      await page.waitForTimeout(1500);
      // Hover the first card
      const card = page.locator('[href^="/project/"]').first();
      if (await card.count()) {
        await card.hover();
      }
      await page.waitForTimeout(1500);
      await page.evaluate(() => window.scrollBy(0, 300));
      await page.waitForTimeout(1500);
    },
  },
];

const toRun = only ? CLIPS.filter((c) => c.id === only) : CLIPS;
if (toRun.length === 0) {
  console.error(`No clips match --only=${only}. Valid: R1, R2, R3, R4`);
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });

for (const clip of toRun) {
  console.log(`\n=== ${clip.id}: ${clip.description} ===`);
  const tmpDir = resolve(outDir, `_tmp_${clip.id}`);
  mkdirSync(tmpDir, { recursive: true });

  const context = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
    recordVideo: { dir: tmpDir, size: { width: W, height: H } },
  });
  const page = await context.newPage();
  await page.goto(`${BASE}${clip.url}`, { waitUntil: "domcontentloaded" });
  await clip.script(page);
  await page.waitForTimeout(500); // tail padding
  await context.close(); // flushes the webm

  // Playwright names the file by page guid; pick the first webm in tmpDir
  const webms = readdirSync(tmpDir).filter((f) => f.endsWith(".webm"));
  if (webms.length === 0) {
    console.error(`  ✗ no webm produced for ${clip.id}`);
    continue;
  }
  const webm = resolve(tmpDir, webms[0]);
  const mp4 = resolve(outDir, `${clip.id}.mp4`);
  console.log(`  converting ${webms[0]} → ${clip.id}.mp4 ...`);
  execSync(
    `"${FFMPEG}" -y -i "${webm}" -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -an "${mp4}"`,
    { stdio: "pipe" },
  );
  console.log(`  ✓ out/${clip.id}.mp4`);

  // cleanup tmp
  try {
    for (const f of readdirSync(tmpDir)) {
      renameSync(resolve(tmpDir, f), resolve(tmpDir, f)); // no-op; we'll just leave it
    }
  } catch {}
}

await browser.close();

console.log(`\nAll clips in ${outDir}/`);
console.log("\nNext: 1. review out/R*.mp4 · 2. upload to Blob · 3. swap scenes in Remotion.");
