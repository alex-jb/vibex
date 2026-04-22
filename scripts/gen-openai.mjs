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
      "16-bit pixel art panoramic scene. Left third: distant pixel-mountain " +
      "silhouette in purple against a dark starry sky. Right third: a " +
      "small pixel anvil with orange spark pixels bursting upward. " +
      "Middle and upper two thirds are empty dark sky with scattered " +
      "single-pixel stars — that empty space is for a brand wordmark " +
      "overlay. Crisp pixels, no anti-aliasing.",
    size: "1536x1024",
    file: "twitter-header-pixel-v1.png",
    crop: { width: 1500, height: 500 },
    notes: "1500x500 Twitter header — pixel",
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
