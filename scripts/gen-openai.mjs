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
const BRAND_SUFFIX = [
  "aesthetic: dark neon arcade-rpg, forge-orange (#FF4500) and cream (#FFE27D)",
  "accents, deep charcoal bg, subtle grain, 16-bit pixel-art influence",
  "on hi-res painterly form (NOT pixelated), no text, no logos, no watermarks,",
  "no UI chrome, cinematic lighting",
].join(" ");

// Presets — named image generation jobs. Add entries as needed.
const PRESETS = {
  "investor-hero": {
    prompt:
      "A mystical blacksmith forge at night on a neon mountain range. " +
      "Warm orange embers glowing from the anvil, sparks trailing upward, " +
      "silhouette of a figure hammering glowing metal. Futuristic RPG atmosphere. " +
      "Wide cinematic composition with negative space on the left for overlay text.",
    size: "1536x1024",
    file: "investor-hero-v1.png",
    notes: "/investors page hero / background candidate",
  },
  "twitter-header": {
    prompt:
      "Panoramic night scene of a forge-mountain at dusk. Orange flames " +
      "bursting from a distant anvil silhouette, neon-cyan sky gradient, " +
      "jagged pixel-mountain silhouette below. Empty sky on right 2/3 for " +
      "brand wordmark overlay.",
    size: "1536x1024",
    file: "twitter-header-v1.png",
    crop: { width: 1500, height: 500 },
    notes: "1500x500 Twitter header",
  },
  "og-photographic": {
    prompt:
      "An arcade-futuristic anvil with molten orange metal being forged, " +
      "neon-lit workshop environment, deep blacks, cream highlights. " +
      "Centered composition, shallow depth of field. Nothing written anywhere.",
    size: "1536x1024",
    file: "og-photographic-v1.png",
    crop: { width: 1200, height: 630 },
    notes: "Photographic 1200x630 OG variant (complements the pixel one)",
  },
  "xhs-cover": {
    prompt:
      "A tall portrait-orientation forge scene: pixel-art knight mascot " +
      "holding a glowing hammer in front of a forge, orange sparks. " +
      "Negative space on top third for overlay title in Chinese.",
    size: "1024x1536",
    file: "xhs-cover-v1.png",
    notes: "小红书 cover 3:4 ratio",
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
