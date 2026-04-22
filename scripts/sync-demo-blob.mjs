#!/usr/bin/env node
/**
 * Uploads rendered MP4s from out/ to Vercel Blob (store: vibex-marketing)
 * so the /investors page and DemoVertical Remotion composition can
 * reference them via public CDN URL instead of checking 42 MB into git.
 *
 * Why: /investors embeds a 13 MB VC video inline. Committing the MP4 to
 * public/ would bloat every repo clone forever. Blob serves the same file
 * from edge CDN with 30-day cache, range-bytes for scrubbing, and CORS
 * open for cross-origin embed.
 *
 * Prereq: BLOB_READ_WRITE_TOKEN in env (from `vercel env pull .env.production.local --environment production`)
 *
 * Usage:
 *   npm run demo:sync-blob              # uploads all 4 MP4s from out/
 *   npm run demo:sync-blob -- --vc      # only the 2 VC cuts
 *   npm run demo:sync-blob -- --demo    # only the 2 60s cuts
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { put } from "@vercel/blob";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

loadEnv({ path: resolve(root, ".env.production.local") });

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error("Missing BLOB_READ_WRITE_TOKEN.");
  console.error("Run: vercel env pull .env.production.local --environment production");
  process.exit(1);
}

const FILES_VC = ["vibex-demo-vc-v1.mp4", "vibex-demo-vc-v1-zh.mp4"];
const FILES_DEMO = ["vibex-demo-v1.mp4", "vibex-demo-v1-zh.mp4"];

const args = process.argv.slice(2);
const wantVC = args.length === 0 || args.includes("--vc");
const wantDemo = args.length === 0 || args.includes("--demo");

const files = [
  ...(wantVC ? FILES_VC : []),
  ...(wantDemo ? FILES_DEMO : []),
];

for (const file of files) {
  const path = resolve(root, "out", file);
  if (!existsSync(path)) {
    console.warn(`⚠  skipping ${file} — not found in out/. Run the remotion render first.`);
    continue;
  }
  const buf = readFileSync(path);
  const size = (buf.byteLength / 1024 / 1024).toFixed(1);
  console.log(`↑ uploading ${file} (${size} MB)...`);
  const result = await put(`demo/${file}`, buf, {
    access: "public",
    contentType: "video/mp4",
    addRandomSuffix: false,
    allowOverwrite: true,
    token,
  });
  console.log(`✓ ${result.url}`);
}

console.log("\nDone. /investors + DemoVertical will pick up the new MP4s on next request.");
