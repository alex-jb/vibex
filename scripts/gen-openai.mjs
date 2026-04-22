#!/usr/bin/env node
/**
 * Generate brand assets via OpenAI gpt-image-2.
 *
 * Sibling to scripts/gen.mjs (Gemini + nanobanana for pixel art). Use
 * this one for photographic / real-world texture assets where
 * prompt-fidelity matters more than pixel-art aesthetic.
 *
 * Output: public/generated-gpt/{slug}.png  (kept separate from
 * public/generated/ so we can review and promote manually before they
 * go live).
 *
 * Prereq:  OPENAI_API_KEY in .env.local (already gitignored).
 *
 * Usage:
 *   node scripts/gen-openai.mjs --prompt "..." --out foo.png
 *   node scripts/gen-openai.mjs --preset investor-hero
 *   node scripts/gen-openai.mjs --preset-all
 *
 * Sizes supported by gpt-image-2: 1024x1024, 1024x1536, 1536x1024.
 * For odd aspect ratios we request the closest + post-crop via sharp.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import OpenAI from "openai";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
loadEnv({ path: resolve(root, ".env.local") });

if (!process.env.OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in .env.local");
  process.exit(1);
}

const OUT_DIR = resolve(root, "public/generated-gpt");
mkdirSync(OUT_DIR, { recursive: true });

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Brand style suffix appended to every preset. Keeps all outputs
// visually cohesive without hand-prompting the same descriptors each time.
//
// PIXEL — strict NES / SNES aesthetic (default, matches rest of brand)
const BRAND_SUFFIX_PIXEL = [
  "STYLE: strict 16-bit pixel art, NES/SNES retro game aesthetic.",
  "Crisp hard-edged pixels, no anti-aliasing, no smooth gradients.",
  "Limited palette: forge-orange (#FF4500) + cream (#FFE27D) highlights,",
  "deep charcoal (#0D0D0D) bg, muted purple (#9D00FF) accents.",
  "Visible pixel grid. Blocky silhouettes. Think 'Shovel Knight' or",
  "'Octopath Traveler' HD-2D sprite art.",
  "No text, no logos, no watermarks, no UI chrome.",
].join(" ");

// PAINTERLY — hi-res cinematic (kept for rare VC-facing photographic contexts)
const BRAND_SUFFIX_PAINTERLY = [
  "aesthetic: dark neon arcade-rpg, forge-orange (#FF4500) and cream (#FFE27D)",
  "accents, deep charcoal bg, subtle grain, painterly hi-res illustration,",
  "no text, no logos, no watermarks, no UI chrome, cinematic lighting",
].join(" ");

const BRAND_SUFFIX = BRAND_SUFFIX_PIXEL; // default

// Presets — named image generation jobs. Add entries as needed.
const PRESETS = {
  "investor-hero-pixel": {
    prompt:
      "16-bit pixel art scene: a tiny pixel blacksmith swinging a hammer " +
      "at a glowing anvil on the right side of the frame. Orange spark " +
      "pixels flying. Left half is a distant pixel-mountain silhouette " +
      "at night with a starfield of single-pixel stars. Empty left third " +
      "of frame for overlay text. Wide composition.",
    size: "1536x1024",
    file: "investor-hero-pixel-v1.png",
    notes: "/investors page hero — pixel version (replaces painterly v1)",
  },
  "twitter-header-pixel": {
    prompt:
      "16-bit pixel art panoramic landscape, WIDE 3:1 composition. " +
      "Left third: layered pixel-mountain silhouettes in deep purple " +
      "with a small glowing pixel campfire at base. " +
      "Center: a pixel-art knight silhouette (same style as Shovel Knight) " +
      "walking toward a distant forge on the horizon. " +
      "Right third: bright pixel anvil with big fountain of forge-orange " +
      "spark pixels shooting up, glowing brick forge with fire inside. " +
      "Across the top: starfield (single-pixel stars) — that upper band " +
      "is the overlay area for brand wordmark. " +
      "Bottom: ground-line of pixel grass tiles. Every pixel crisp, no " +
      "anti-aliasing, NES/SNES palette. Dense with detail.",
    size: "1536x1024",
    file: "twitter-header-pixel-v2.png",
    crop: { width: 1500, height: 500 },
    notes: "1500x500 Twitter header v2 — denser than v1 (v1 was too sparse)",
  },
  "og-pixel-alt": {
    prompt:
      "16-bit pixel art square-ish tile: a single pixel anvil centered, " +
      "forge-orange molten-metal glow on top, cream-colored hammer pixel " +
      "frozen mid-swing above. 4-5 spark pixels. Dark charcoal background. " +
      "NES aesthetic. No text anywhere. Minimal composition.",
    size: "1536x1024",
    file: "og-pixel-alt-v1.png",
    crop: { width: 1200, height: 630 },
    notes: "OG 1200x630 pixel-art alt (complements the existing forge Direction A)",
  },
  "ph-launch-hero": {
    prompt:
      "16-bit pixel art celebration scene for Product Hunt launch day. " +
      "Pixel-art knight mascot (same style as Shovel Knight, dark armor " +
      "with cream cape) holding a glowing forge-hammer raised high in " +
      "victory, standing on a pedestal. Confetti of orange + cream + " +
      "purple pixel squares falling from above. A cat-mascot Product Hunt " +
      "inspired silhouette pixel-style flies by in background with trail " +
      "of spark pixels. Dark charcoal starfield bg. Empty upper-right " +
      "corner for '#1 Product of the Day' badge overlay. Wide 16:9 " +
      "cinematic composition. NES/SNES aesthetic, crisp pixels.",
    size: "1536x1024",
    file: "ph-launch-hero-v1.png",
    crop: { width: 1280, height: 720 },
    notes: "Product Hunt launch day hero — for Twitter announce + PH gallery slot 1",
  },
  "evolution-ladder": {
    prompt:
      "16-bit pixel art horizontal infographic showing 6 evolution stages. " +
      "Left-to-right progression: " +
      "1) tiny seedling sprite glowing faint gray-white, " +
      "2) small green leaf creature, " +
      "3) medium cyan crystalline blob, " +
      "4) purple-pink bird-like creature with wings, " +
      "5) red fiery dragon creature, " +
      "6) pink-magenta legendary crowned creature. " +
      "Each sprite sits on a pixel pedestal with its stage name below: " +
      "SEED · ACTIVE · GROWING · BREAKOUT · LEGEND · MYTH. " +
      "A faint glowing pixel arrow chain connects them. " +
      "Dark charcoal bg, star field. NES/SNES aesthetic, crisp pixels, " +
      "no anti-aliasing. Wide cinematic composition.",
    size: "1536x1024",
    file: "evolution-ladder-v1.png",
    notes: "6-stage progression visual for /about page, pitch deck, blog posts",
  },
  "not-found-404": {
    prompt:
      "16-bit pixel art scene of a confused knight (cream cape, dark " +
      "armor, pixel mascot style) standing at the edge of a broken " +
      "pixel-stone bridge that falls into a dark void. A '?' pixel " +
      "cloud floats above the knight's head. Purple mountain silhouette " +
      "in distance. Dark starry sky. Centered composition, emotive " +
      "'nothing here' feel. NES/SNES aesthetic. No text.",
    size: "1024x1024",
    file: "not-found-404-v1.png",
    notes: "404 illustration — for app/not-found.tsx",
  },
  "empty-feed": {
    prompt:
      "16-bit pixel art scene: pixel-art knight mascot sitting next to " +
      "an empty unlit campfire, holding a scroll. Dark starry forest " +
      "background with faint pixel trees. Calm 'nothing brewing yet, " +
      "forge something' atmosphere. No spark action. Centered composition. " +
      "NES/SNES aesthetic, crisp pixels.",
    size: "1024x1024",
    file: "empty-feed-v1.png",
    notes: "Empty-state illustration for /feed when no posts exist",
  },
  "level-up-burst": {
    prompt:
      "16-bit pixel art burst scene. Centered pixel creature egg " +
      "cracking open, bright forge-orange and cream light rays shooting " +
      "outward in 8 directions (like a starburst pattern). Small " +
      "particles of purple and cream pixels exploding outward. Pure " +
      "dark charcoal background, no scenery. Transparent-feel, tile-like " +
      "composition suitable for overlaying on-screen when a project " +
      "evolves to the next tier. NES/SNES aesthetic.",
    size: "1024x1024",
    file: "level-up-burst-v1.png",
    notes: "Evolution celebration burst — overlay when projects level up",
  },
  "xhs-cover-pixel": {
    prompt:
      "16-bit pixel art portrait composition. Centered pixel-art knight " +
      "in 32x32 sprite-style holding a glowing hammer, standing in front " +
      "of a stone forge with forge-orange flames. Purple-mountain silhouette " +
      "background. Top one-third of canvas is empty starfield — that area " +
      "is reserved for a Chinese-character headline overlay. Crisp pixels.",
    size: "1024x1536",
    file: "xhs-cover-pixel-v1.png",
    notes: "小红书 cover 3:4 — pixel",
  },
};

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { prompt: null, size: "1024x1024", file: null, preset: null, all: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--prompt") out.prompt = args[++i];
    else if (a === "--size") out.size = args[++i];
    else if (a === "--out") out.file = args[++i];
    else if (a === "--preset") out.preset = args[++i];
    else if (a === "--preset-all") out.all = true;
  }
  return out;
}

async function generate({ prompt, size, file, crop }) {
  const fullPrompt = `${prompt}\n\nStyle: ${BRAND_SUFFIX}`;
  console.log(`\n→ Generating ${file} (${size})...`);
  console.log(`  prompt: ${prompt.slice(0, 100)}${prompt.length > 100 ? "…" : ""}`);
  const t0 = Date.now();
  const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";
  const res = await client.images.generate({
    model,
    prompt: fullPrompt,
    size,
    n: 1,
  });
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  const b64 = res.data?.[0]?.b64_json;
  if (!b64) {
    console.error("  ✗ no image data returned");
    console.error("  response:", JSON.stringify(res, null, 2).slice(0, 500));
    return;
  }
  let buf = Buffer.from(b64, "base64");
  if (crop) {
    buf = await sharp(buf)
      .resize(crop.width, crop.height, { fit: "cover", position: "center" })
      .png({ compressionLevel: 9, effort: 10 })
      .toBuffer();
  }
  const dst = resolve(OUT_DIR, file);
  writeFileSync(dst, buf);
  const kb = (buf.byteLength / 1024).toFixed(0);
  console.log(`  ✓ saved ${dst.replace(root + "/", "")} (${kb} KB, ${elapsed}s)`);
}

const args = parseArgs();

if (args.all) {
  for (const [name, p] of Object.entries(PRESETS)) {
    await generate(p);
  }
} else if (args.preset) {
  const p = PRESETS[args.preset];
  if (!p) {
    console.error(`Unknown preset: ${args.preset}. Options: ${Object.keys(PRESETS).join(", ")}`);
    process.exit(1);
  }
  await generate(p);
} else if (args.prompt && args.file) {
  await generate({ prompt: args.prompt, size: args.size, file: args.file });
} else {
  console.error("Usage:");
  console.error("  node scripts/gen-openai.mjs --prompt '...' --out name.png [--size WxH]");
  console.error("  node scripts/gen-openai.mjs --preset <name>");
  console.error("  node scripts/gen-openai.mjs --preset-all");
  console.error(`\nPresets: ${Object.keys(PRESETS).join(", ")}`);
  process.exit(1);
}

console.log(`\nDone. Outputs in ${OUT_DIR.replace(root + "/", "")}/`);
console.log("Review, then copy winners to public/generated/ or wherever they'll live.");
