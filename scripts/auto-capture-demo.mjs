#!/usr/bin/env node
/**
 * Auto-capture a 20s looping preview of a project's demo URL and prep it
 * for the projects.demo_video_url column.
 *
 * What it does:
 *   1. Launches headless Chromium (Playwright), navigates to the given
 *      demo URL, records 20s of screen at 720×480, saves WebM.
 *   2. Converts WebM → MP4 via ffmpeg-static (smaller + broader codec
 *      support than WebM on iOS Safari).
 *   3. Uploads the MP4 to Vercel Blob under `demo-videos/auto-…mp4`.
 *   4. Prints a ready-to-run SQL UPDATE so you can copy/paste into the
 *      Supabase Dashboard SQL Editor. Script never writes the DB itself
 *      — you approve every row.
 *
 * Why not also write the DB: this script uses the public anon key path
 * (we don't ship service_role anywhere), so it can't UPDATE through RLS.
 * Printing the SQL keeps the same trust boundary as migration 045 +
 * seed-2 workflows.
 *
 * Prereqs:
 *   - BLOB_READ_WRITE_TOKEN in .env.local
 *     (`vercel env pull .env.production.local --environment production`)
 *   - ffmpeg-static installed (`npm install --no-save ffmpeg-static`)
 *   - Playwright Chromium browser (`npx playwright install chromium`)
 *
 * Usage:
 *   # Single project (the common case — backfill one at a time):
 *   node scripts/auto-capture-demo.mjs \
 *     --id proj-mo1w2haf-ga3v \
 *     --url https://github.com/alex-jb/orallexa-ai-trading-agent
 *
 *   # Batch from a JSON file: [{ id, url }, ...]
 *   node scripts/auto-capture-demo.mjs --batch candidates.json
 *
 *   # List known real projects that still have demo_url but no video
 *   # (output-only — actual query runs from the browser console via
 *   # fetch with the anon key; this just prints the known three).
 *   node scripts/auto-capture-demo.mjs --list
 *
 * Tuning:
 *   --seconds N     Capture duration (default 20, range 5-30).
 *   --width N       Viewport/record width (default 720).
 *   --height N      Viewport/record height (default 480).
 */

import { chromium } from "playwright";
import { put } from "@vercel/blob";
import {
  readFileSync,
  mkdirSync,
  existsSync,
  renameSync,
  rmSync,
  statSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { config as loadEnv } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
loadEnv({ path: resolve(root, ".env.local") });

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error(
    "✗ Missing BLOB_READ_WRITE_TOKEN in .env.local.\n" +
      "  Pull it with: vercel env pull .env.production.local --environment production",
  );
  process.exit(1);
}

/* ─── CLI ─── */
function parseArgs() {
  const args = process.argv.slice(2);
  const out = {
    id: null,
    url: null,
    batch: null,
    list: false,
    seconds: 20,
    width: 720,
    height: 480,
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--id") out.id = args[++i];
    else if (a === "--url") out.url = args[++i];
    else if (a === "--batch") out.batch = args[++i];
    else if (a === "--list") out.list = true;
    else if (a === "--seconds") out.seconds = Number(args[++i]);
    else if (a === "--width") out.width = Number(args[++i]);
    else if (a === "--height") out.height = Number(args[++i]);
  }
  out.seconds = Math.max(5, Math.min(30, out.seconds));
  return out;
}

/* Known real user-submitted projects as of 2026-04-24 — useful when you
   want a ready list of targets. Query the DB for anything fresher. */
const KNOWN_CANDIDATES = [
  {
    id: "proj-mo1w2haf-ga3v",
    url: "https://github.com/alex-jb/orallexa-ai-trading-agent",
    title: "orallexa-ai-trading-agent",
  },
  {
    id: "proj-mo9mncxu-he7r",
    url: "https://github.com/lessthanseventy/excessibility",
    title: "excessibility",
  },
  {
    id: "proj-mo3bo8p1-i8k8",
    url: "https://github.com/Chenxi1125-xixi/auto-sas-analytics",
    title: "auto-sas-analytics",
  },
];

const outDir = resolve(root, "out/auto-demos");
mkdirSync(outDir, { recursive: true });

const FFMPEG = (await import("ffmpeg-static")).default;

/* ─── Capture one project ─── */
async function captureOne({ id, url, seconds, width, height }) {
  if (!id || !url) throw new Error("captureOne requires {id, url}");
  console.log(`\n→ [${id}] ${url}`);

  // 1. Playwright screencast (saves WebM to a temp dir)
  const videoDir = resolve(outDir, `tmp-${id}`);
  mkdirSync(videoDir, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width, height },
    recordVideo: { dir: videoDir, size: { width, height } },
    // Some demo URLs block iframes / headless fetches — spoof UA.
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20_000 });
    await page.waitForTimeout(1500); // settle
    console.log(`  recording ${seconds}s...`);
    await page.waitForTimeout(seconds * 1000);
  } catch (err) {
    console.warn(`  ⚠ navigation warning: ${err.message}`);
    // Continue anyway — page may have loaded partially.
  }
  await context.close();
  await browser.close();

  // Playwright writes an auto-generated *.webm; rename to a predictable path.
  const { readdirSync } = await import("node:fs");
  const webms = readdirSync(videoDir).filter((f) => f.endsWith(".webm"));
  if (webms.length === 0) throw new Error("no .webm produced");
  const srcWebm = resolve(videoDir, webms[0]);
  const mp4 = resolve(outDir, `${id}.mp4`);

  // 2. Convert webm → mp4 via ffmpeg-static. H264 for iOS Safari; AAC
  //    audio isn't needed (screen record is silent) so strip.
  console.log(`  converting → mp4...`);
  execSync(
    `"${FFMPEG}" -y -i "${srcWebm}" -c:v libx264 -preset veryfast -crf 28 -pix_fmt yuv420p -an "${mp4}"`,
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  const sizeMb = (statSync(mp4).size / 1024 / 1024).toFixed(2);
  rmSync(videoDir, { recursive: true, force: true });

  // 3. Upload to Blob.
  console.log(`  uploading ${sizeMb} MB to Blob...`);
  const buf = readFileSync(mp4);
  const blob = await put(
    `demo-videos/auto-${id}-${Date.now()}.mp4`,
    buf,
    {
      access: "public",
      contentType: "video/mp4",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
    },
  );
  console.log(`  ✓ ${blob.url}`);
  return { id, mp4Path: mp4, blobUrl: blob.url, sizeMb };
}

/* ─── Main ─── */
const args = parseArgs();

if (args.list) {
  console.log("Known real-user candidates (demo_url present, likely no video yet):\n");
  for (const c of KNOWN_CANDIDATES) {
    console.log(`  ${c.id.padEnd(22)} ${c.url}`);
  }
  console.log(
    "\nTo backfill one, pipe id+url to this script:\n" +
      "  node scripts/auto-capture-demo.mjs --id <id> --url <url>\n",
  );
  process.exit(0);
}

let targets;
if (args.batch) {
  targets = JSON.parse(readFileSync(args.batch, "utf8"));
  if (!Array.isArray(targets)) {
    console.error(
      "✗ --batch file must be a JSON array of { id, url } entries",
    );
    process.exit(1);
  }
} else if (args.id && args.url) {
  targets = [{ id: args.id, url: args.url }];
} else {
  console.error(
    "Usage:\n" +
      "  node scripts/auto-capture-demo.mjs --id PROJ --url URL\n" +
      "  node scripts/auto-capture-demo.mjs --batch candidates.json\n" +
      "  node scripts/auto-capture-demo.mjs --list\n",
  );
  process.exit(1);
}

const results = [];
for (const t of targets) {
  try {
    results.push(
      await captureOne({
        id: t.id,
        url: t.url,
        seconds: args.seconds,
        width: args.width,
        height: args.height,
      }),
    );
  } catch (err) {
    console.error(`  ✗ [${t.id}] ${err.message}`);
  }
}

if (results.length === 0) {
  console.error("\n✗ No captures succeeded.");
  process.exit(1);
}

/* 4. Print copy-paste SQL. */
console.log("\n═══ Ready-to-run SQL ═══");
console.log(
  "Paste the block below into the Supabase Dashboard SQL Editor:\n",
);
for (const r of results) {
  // Single-quote-escape the URL just in case, though Blob URLs never
  // contain apostrophes.
  const safeUrl = r.blobUrl.replace(/'/g, "''");
  console.log(
    `UPDATE projects SET demo_video_url = '${safeUrl}' WHERE id = '${r.id}';`,
  );
}
console.log("");
