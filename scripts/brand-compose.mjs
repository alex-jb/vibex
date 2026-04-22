#!/usr/bin/env node
/**
 * Compose brand text overlays onto gen-openai pixel images using sharp + SVG.
 *
 * AI image gen can't reliably render pixel-style text. This script bakes
 * typographically-correct wordmarks / labels onto AI-generated backgrounds.
 *
 * Presets:
 *   ladder-labels   — 6 stage codes (SEED · ACTIVE · …) baked under the
 *                     evolution-ladder-v1 image
 *   twitter-wordmark — VIBEXFORGE wordmark on twitter-header-pixel-v2
 *
 * Output: public/generated-gpt/{preset}.png (review, then promote manually).
 *
 * Usage:
 *   node scripts/brand-compose.mjs --preset ladder-labels
 *   node scripts/brand-compose.mjs --preset-all
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Press Start 2P TTF — downloaded once to public/fonts/ (see below).
// SVG text needs either font-family string (system fonts only) OR an
// embedded @font-face with base64 data URI. For node sharp-SVG renders,
// we fall back to a generic monospace. Output is still visually fine —
// the AI-generated pixel bg + clean monospace label is on-brand.
const FONT_STACK = "'Press Start 2P', 'VT323', 'Silkscreen', 'Courier New', monospace";

// Colors matching retro-game.css palette
const C = {
  FORGE: "#FF4500",
  CREAM: "#FFE27D",
  BG: "#0A0A0C",
  TEXT: "#E8E8EC",
  SEED: "#d4d4d8",
  ACTIVE: "#22c55e",
  GROWING: "#06B6D4",
  BREAKOUT: "#D946EF",
  LEGEND: "#EF4444",
  MYTH: "#FF69B4",
};

async function composeLadderLabels() {
  const src = resolve(root, "public/generated-gpt/evolution-ladder-v1.png");
  const base = sharp(readFileSync(src));
  const meta = await base.metadata();
  const W = meta.width;
  const H = meta.height;

  // Bake a label strip at the bottom that extends the canvas by 80px.
  const labelH = 80;
  const stages = [
    { code: "SEED", color: C.SEED },
    { code: "ACTIVE", color: C.ACTIVE },
    { code: "GROWING", color: C.GROWING },
    { code: "BREAKOUT", color: C.BREAKOUT },
    { code: "LEGEND", color: C.LEGEND },
    { code: "MYTH", color: C.MYTH },
  ];

  const colW = W / stages.length;
  const svgLabels = stages
    .map((s, i) => {
      const cx = Math.round(colW * (i + 0.5));
      return `<text x="${cx}" y="50" font-family="${FONT_STACK}" font-size="24" font-weight="bold" letter-spacing="2" fill="${s.color}" text-anchor="middle">${s.code}</text>`;
    })
    .join("");

  const svg = `
    <svg width="${W}" height="${labelH}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${W}" height="${labelH}" fill="${C.BG}"/>
      <rect width="${W}" height="1" fill="${C.FORGE}" opacity="0.4"/>
      ${svgLabels}
    </svg>
  `;

  const labelImg = await sharp(Buffer.from(svg)).png().toBuffer();

  const out = await sharp({
    create: {
      width: W,
      height: H + labelH,
      channels: 4,
      background: C.BG,
    },
  })
    .composite([
      { input: await base.toBuffer(), top: 0, left: 0 },
      { input: labelImg, top: H, left: 0 },
    ])
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();

  const dst = resolve(root, "public/generated-gpt/evolution-ladder-labeled-v1.png");
  await sharp(out).toFile(dst);
  console.log(`✓ ${dst.replace(root + "/", "")}  (${(out.byteLength / 1024).toFixed(0)} KB)`);
}

async function composeTwitterWordmark() {
  const src = resolve(root, "public/generated-gpt/twitter-header-pixel-v2.png");
  const base = sharp(readFileSync(src));
  const meta = await base.metadata();
  const W = meta.width;
  const H = meta.height;

  // Bake "VIBEXFORGE" wordmark across the starfield upper band (top third).
  // Split color: "VIBE" cream + "X" forge-orange + "FORGE" forge-orange.
  const svg = `
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <text x="${Math.round(W / 2)}" y="${Math.round(H * 0.38)}"
            font-family="${FONT_STACK}" font-size="72" font-weight="bold"
            letter-spacing="8" text-anchor="middle">
        <tspan fill="${C.CREAM}">VIBE</tspan><tspan fill="${C.FORGE}">X</tspan><tspan fill="${C.FORGE}">FORGE</tspan>
      </text>
      <text x="${Math.round(W / 2)}" y="${Math.round(H * 0.58)}"
            font-family="${FONT_STACK}" font-size="24"
            letter-spacing="6" text-anchor="middle" fill="${C.TEXT}">
        THE FORGE FOR AI CREATORS
      </text>
    </svg>
  `;

  const out = await base
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();

  const dst = resolve(root, "public/generated-gpt/twitter-header-wordmark-v1.png");
  await sharp(out).toFile(dst);
  console.log(`✓ ${dst.replace(root + "/", "")}  (${(out.byteLength / 1024).toFixed(0)} KB)`);
}

const args = process.argv.slice(2);
const all = args.includes("--preset-all");
const preset = args.find((a, i) => args[i - 1] === "--preset");

if (all || preset === "ladder-labels") await composeLadderLabels();
if (all || preset === "twitter-wordmark") await composeTwitterWordmark();

if (!all && !preset) {
  console.error("usage:  node scripts/brand-compose.mjs --preset <ladder-labels|twitter-wordmark>");
  console.error("        node scripts/brand-compose.mjs --preset-all");
  process.exit(1);
}
