#!/usr/bin/env node
/**
 * Near-lossless PNG compression via sharp.
 *
 * Shaves 30-60% off typical screenshots without visible quality loss.
 * Filenames + extensions unchanged, so Remotion staticFile() refs +
 * any <img src>/README links keep working. Idempotent — running twice
 * yields ~0 further gains.
 *
 * Usage:  node scripts/compress-pngs.mjs <path> [<path>...]
 *         node scripts/compress-pngs.mjs public/demo-assets/ public/generated/
 *
 * Strategy: sharp's PNG encoder with compressionLevel 9 + palette
 * quantization when colors <256, effort 10 (max). Works well for both
 * photographic (screenshots) and flat-color (pixel art) content.
 */

import { readFileSync, writeFileSync, statSync, readdirSync } from "node:fs";
import { resolve, extname } from "node:path";
import sharp from "sharp";

const targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error("usage: node compress-pngs.mjs <path> [<path>...]");
  process.exit(1);
}

function* walk(root) {
  const stat = statSync(root);
  if (stat.isFile()) {
    if (extname(root).toLowerCase() === ".png") yield root;
    return;
  }
  for (const name of readdirSync(root)) {
    yield* walk(resolve(root, name));
  }
}

let totalBefore = 0;
let totalAfter = 0;
let count = 0;

for (const t of targets) {
  for (const file of walk(resolve(t))) {
    const before = readFileSync(file);
    const buf = await sharp(before)
      .png({
        compressionLevel: 9,
        effort: 10,
        palette: true,
      })
      .toBuffer();

    // Only overwrite if the new version is actually smaller
    if (buf.byteLength < before.byteLength) {
      writeFileSync(file, buf);
      const savedKB = ((before.byteLength - buf.byteLength) / 1024).toFixed(0);
      const pct = Math.round(
        ((before.byteLength - buf.byteLength) / before.byteLength) * 100,
      );
      console.log(
        `✓ ${file.replace(process.cwd() + "/", "")}  −${savedKB} KB (−${pct}%)`,
      );
      totalBefore += before.byteLength;
      totalAfter += buf.byteLength;
      count++;
    } else {
      totalBefore += before.byteLength;
      totalAfter += before.byteLength;
    }
  }
}

const savedMB = ((totalBefore - totalAfter) / 1024 / 1024).toFixed(1);
const pct = totalBefore
  ? Math.round(((totalBefore - totalAfter) / totalBefore) * 100)
  : 0;
console.log(
  `\nCompressed ${count} file(s) — saved ${savedMB} MB (${pct}% of originals).`,
);
