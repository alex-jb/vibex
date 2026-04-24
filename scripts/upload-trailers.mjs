#!/usr/bin/env node
/**
 * Upload the 3 rendered ProjectTrailer MP4s to Vercel Blob and print the
 * SQL UPDATE block for Alex to paste into the Supabase Dashboard SQL
 * Editor. Mirrors the pattern from scripts/auto-capture-demo.mjs (trust
 * boundary: this script uses the anon client surface, can't UPDATE
 * through RLS, so it prints SQL instead of writing the DB).
 *
 * Expects:
 *   out/trailer-dreamboard.mp4
 *   out/trailer-sketchtoapp.mp4
 *   out/trailer-pixelmind.mp4
 *
 * These map to mock projects on /home by numeric id:
 *   id=5 → DreamBoard
 *   id=9 → SketchToApp
 *   id=3 → PixelMind
 *
 * Prereq: BLOB_READ_WRITE_TOKEN in .env.local.
 *
 * Usage:
 *   npm run remotion:trailers-all     (renders all 3 MP4s)
 *   node scripts/upload-trailers.mjs  (then runs this)
 */

import { put } from "@vercel/blob";
import { readFileSync, statSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
loadEnv({ path: resolve(root, ".env.local") });

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error(
    "✗ Missing BLOB_READ_WRITE_TOKEN in .env.local.\n" +
      "  Pull with: vercel env pull .env.production.local --environment production\n" +
      "  Then grep BLOB_READ_WRITE_TOKEN .env.production.local >> .env.local",
  );
  process.exit(1);
}

const TARGETS = [
  { mp4: "out/trailer-dreamboard.mp4",  id: "5", slug: "dreamboard"  },
  { mp4: "out/trailer-sketchtoapp.mp4", id: "9", slug: "sketchtoapp" },
  { mp4: "out/trailer-pixelmind.mp4",   id: "3", slug: "pixelmind"   },
];

const results = [];
for (const t of TARGETS) {
  const mp4Path = resolve(root, t.mp4);
  if (!existsSync(mp4Path)) {
    console.warn(`⚠ skipping ${t.slug} — ${t.mp4} not found. Did remotion:trailer-${t.slug} run?`);
    continue;
  }
  const buf = readFileSync(mp4Path);
  const sizeMb = (statSync(mp4Path).size / 1024 / 1024).toFixed(2);
  console.log(`→ uploading ${t.slug} (${sizeMb} MB)...`);
  const blob = await put(
    `demo-videos/trailer-${t.slug}-${Date.now()}.mp4`,
    buf,
    {
      access: "public",
      contentType: "video/mp4",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
    },
  );
  console.log(`  ✓ ${blob.url}`);
  results.push({ id: t.id, slug: t.slug, blobUrl: blob.url, sizeMb });
}

if (results.length === 0) {
  console.error("\n✗ Nothing uploaded. Render trailers first:");
  console.error("  npm run remotion:trailers-all");
  process.exit(1);
}

console.log("\n═══ Ready-to-run SQL ═══");
console.log("Paste the block below into the Supabase Dashboard SQL Editor:\n");
for (const r of results) {
  const safeUrl = r.blobUrl.replace(/'/g, "''");
  console.log(
    `UPDATE projects SET demo_video_url = '${safeUrl}' WHERE id = '${r.id}';  -- ${r.slug}`,
  );
}
console.log("");
