#!/usr/bin/env node
/**
 * Generate the 9 mockup PNGs consumed by ProjectTrailer compositions
 * (3 projects × 3 frames each). Distinct from scripts/gen-openai.mjs so
 * `--preset-all` on the main brand pipeline doesn't re-bill these every
 * time we regenerate a 404 illustration.
 *
 * Each mockup is a pixel-art interpretation of "what this app looks like
 * in use" — NOT a real UI screenshot. Real UIs don't fit the forge
 * aesthetic; the trailer sits next to sprite + forge cream + scanlines
 * so the mockups need to be in the same visual universe.
 *
 * Output: public/generated-gpt/trailer-{project}-{nn}.png at 1536x1024
 *         (matches MockupFrame's 560×400 aspect after objectFit:cover).
 *
 * Prereq: OPENAI_API_KEY + OPENAI_IMAGE_MODEL=gpt-image-1 in .env.local
 *         (gpt-image-2 requires org verification per memory 2026-04-22).
 *
 * Usage:
 *   node scripts/gen-trailer-mockups.mjs --project dreamboard
 *   node scripts/gen-trailer-mockups.mjs --project sketchtoapp
 *   node scripts/gen-trailer-mockups.mjs --project pixelmind
 *   node scripts/gen-trailer-mockups.mjs --all
 *
 * Cost: gpt-image-1 at 1536x1024 HD ≈ $0.19/image × 9 = ~$1.71 total.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import OpenAI from "openai";

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

// Same brand suffix as gen-openai.mjs to keep visual cohesion.
const BRAND_SUFFIX = [
  "STYLE: strict 16-bit pixel art, NES/SNES retro game aesthetic.",
  "Crisp hard-edged pixels, no anti-aliasing, no smooth gradients.",
  "Palette: forge-orange (#FF4500) + cream (#FFE27D) highlights,",
  "deep charcoal (#0D0D0D) bg, accent color per project.",
  "Visible pixel grid. Blocky silhouettes.",
  "No real text, no real logos, no watermarks.",
].join(" ");

const MOCKUPS = {
  dreamboard: {
    accent: "cyan/teal (#06B6D4) for palette highlights",
    // Real product (per lib/mock-data/projects.ts id=5): AI mood-board
    // generator — color palettes, typography suggestions, layout refs,
    // AI-generated imagery, exports to Figma. NOT a whiteboard.
    frames: [
      {
        file: "trailer-dreamboard-01.png",
        prompt:
          "16-bit pixel art dark workspace window with a single centered " +
          "prompt-input box at the top — a cream-bordered rectangular " +
          "pixel panel with a tiny blinking cursor inside (no real text). " +
          "Below it, a faint ghosted outline of a 2x2 empty grid where " +
          "a mood board will appear. A small pixel-art paintbrush icon " +
          "and color-palette-swatch icon flank the prompt. Dark charcoal " +
          "background. Calm, 'waiting for a vision' feel. Wide 3:2.",
      },
      {
        file: "trailer-dreamboard-02.png",
        prompt:
          "16-bit pixel art mid-generation scene. Center of frame: a " +
          "horizontal strip of 6 color swatches (pixel rectangles in " +
          "varied muted tones — cream, dusty-rose, sage, charcoal, " +
          "cyan, amber) rendered as a palette. Above the palette: 3 " +
          "pixel-art font-sample cards (each showing a different " +
          "chunky-pixel letterform like 'Aa' in different weights, no " +
          "real text). Below: 2 placeholder image thumbnails with " +
          "pixel-art landscape hints (mountain silhouette in one, city " +
          "in other). Glowing cyan sparkle pixels float between elements " +
          "signifying AI curation in progress. Dark charcoal bg. Wide 3:2.",
      },
      {
        file: "trailer-dreamboard-03.png",
        prompt:
          "16-bit pixel art finished mood board laid out on dark canvas. " +
          "Top: a horizontal pixel-art color palette bar with 6 distinct " +
          "swatches. Middle: a 3x2 grid of pixel-art reference images " +
          "(one showing pixel mountain landscape, one showing pixel " +
          "interior scene, one abstract gradient, one geometric pattern, " +
          "one pixel portrait silhouette, one pixel typography specimen). " +
          "Bottom-right corner: small cream pixel-art rectangular button " +
          "with a tiny pixel-art Figma-diamond-shape icon (3 colored " +
          "rhombuses), no real text. Dark charcoal background. Wide 3:2.",
      },
    ],
  },
  sketchtoapp: {
    accent: "pink/magenta (#EC4899) for transformation rays",
    frames: [
      {
        file: "trailer-sketchtoapp-01.png",
        prompt:
          "16-bit pixel art scene of a messy hand-drawn wireframe on a " +
          "dark surface, seen from above. Cream-colored pixel lines form " +
          "a rough webpage layout: a rectangle for a header, 3 boxes in " +
          "a row for cards, a few squiggly pixel-art lines standing in " +
          "for text, a circle labeled as an avatar placeholder. A " +
          "pixel-art pencil sprite rests in the lower-right. Casual, " +
          "'napkin sketch' feel. Wide 3:2.",
      },
      {
        file: "trailer-sketchtoapp-02.png",
        prompt:
          "16-bit pixel art transformation scene. Left half of frame: " +
          "the same hand-drawn pixel wireframe as before (header + cards + " +
          "squiggle lines), faded / translucent. Right half: the same " +
          "layout but rendered as clean pixel-art UI cards with crisp " +
          "forge-orange and cream pixel blocks filling them. Between " +
          "the two halves, 4-6 glowing pink/magenta pixel rays shoot " +
          "left-to-right with sparkle pixels trailing. A pixel wand or " +
          "magic-effect element adds drama. 'Sketch-becoming-app' feel. " +
          "Wide 3:2.",
      },
      {
        file: "trailer-sketchtoapp-03.png",
        prompt:
          "16-bit pixel art rendered web browser frame showing a finished " +
          "landing page app. The browser chrome (3 tiny dots + a URL bar " +
          "pixel silhouette, no real text) sits at the top. Inside the " +
          "browser, a forge-orange hero block, a row of 3 cream cards " +
          "with small pixel icons (rocket, chart, gear), and a " +
          "cream CTA-button shape at the bottom. Pink glowing border " +
          "around the whole browser suggesting it's freshly generated. " +
          "Dark charcoal background. Wide 3:2.",
      },
    ],
  },
  pixelmind: {
    accent: "neon-green (#39FF14) for generation glow",
    frames: [
      {
        file: "trailer-pixelmind-01.png",
        prompt:
          "16-bit pixel art retro terminal window centered on a dark bg. " +
          "The window has a cream-colored 1-pixel border and a dark " +
          "interior. Inside: a simple pixel-art text-input cursor " +
          "blinking after a small prompt-icon (> symbol made of pixels). " +
          "Below the input, faint dotted pixel lines suggest preset " +
          "suggestion chips (no real text). A small pixel-art brain icon " +
          "in the upper-right corner of the window glows neon-green. " +
          "Calm 'waiting for a prompt' atmosphere. Wide 3:2.",
      },
      {
        file: "trailer-pixelmind-02.png",
        prompt:
          "16-bit pixel art mid-generation scene. A large dark grid fills " +
          "most of the frame. Lower-left quarter of the grid has already " +
          "filled in with bright pixel art — a tiny pixel village (thatched " +
          "roofs, grass tiles, smoke). The rest of the grid is still " +
          "empty dark. A glowing neon-green 'scanline' sweeps diagonally " +
          "across the grid, with new pixels materializing along the line. " +
          "Tiny cream sparkles trail the scanline. 'Generating in progress' " +
          "feel. Wide 3:2.",
      },
      {
        file: "trailer-pixelmind-03.png",
        prompt:
          "16-bit pixel art completed scene: a cozy pixel-art village at " +
          "sunset. Thatched-roof houses, pixel-grass tiles, small pixel " +
          "trees, a pixel cat sprite, a curl of pixel smoke rising from " +
          "one chimney. Forge-orange sunset sky with pink cloud pixels. " +
          "In one corner, a small pixel-art frame / inspector panel " +
          "showing the sprite in zoomed-in view (a little window-in-window). " +
          "Finished, warm, 'art delivered' feel. Wide 3:2.",
      },
    ],
  },
};

const SIZE = "1536x1024";

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { project: null, all: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--project") out.project = args[++i];
    else if (a === "--all") out.all = true;
  }
  return out;
}

async function generate(frame, accent) {
  const fullPrompt =
    `${frame.prompt}\n\n` +
    `ACCENT COLOR for this project: ${accent}.\n` +
    `STYLE: ${BRAND_SUFFIX}`;
  console.log(`\n→ ${frame.file}`);
  const t0 = Date.now();
  const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
  const res = await client.images.generate({
    model,
    prompt: fullPrompt,
    size: SIZE,
    n: 1,
  });
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  const b64 = res.data?.[0]?.b64_json;
  if (!b64) {
    console.error(`  ✗ no image data. Response preview:`);
    console.error(JSON.stringify(res, null, 2).slice(0, 500));
    return;
  }
  const buf = Buffer.from(b64, "base64");
  const dst = resolve(OUT_DIR, frame.file);
  writeFileSync(dst, buf);
  const kb = (buf.byteLength / 1024).toFixed(0);
  console.log(`  ✓ ${dst.replace(root + "/", "")} (${kb} KB, ${elapsed}s)`);
}

async function generateProject(key) {
  const proj = MOCKUPS[key];
  if (!proj) {
    console.error(`Unknown project: ${key}. Options: ${Object.keys(MOCKUPS).join(", ")}`);
    process.exit(1);
  }
  console.log(`\n═══ ${key.toUpperCase()} (accent: ${proj.accent}) ═══`);
  for (const frame of proj.frames) {
    await generate(frame, proj.accent);
  }
}

const args = parseArgs();

if (args.all) {
  for (const key of Object.keys(MOCKUPS)) {
    await generateProject(key);
  }
} else if (args.project) {
  await generateProject(args.project);
} else {
  console.error(
    "Usage:\n" +
      "  node scripts/gen-trailer-mockups.mjs --project <dreamboard|sketchtoapp|pixelmind>\n" +
      "  node scripts/gen-trailer-mockups.mjs --all",
  );
  process.exit(1);
}

console.log("\nDone.");
