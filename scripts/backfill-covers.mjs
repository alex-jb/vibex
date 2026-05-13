#!/usr/bin/env node
/**
 * Backfill RPG pixel-art covers for projects missing a thumbnail.
 *
 * Architecture: this script reads projects via anon key (public RLS allows
 * SELECT), generates covers via OpenAI gpt-image-2, uploads them to Vercel
 * Blob, and emits JSONL of {id, url} to stdout. Database UPDATE is done
 * separately via Supabase MCP from the Claude session — this way we don't
 * need SUPABASE_SERVICE_ROLE_KEY local (it's not in .env.local or Vercel).
 *
 * Cost: ~$0.04 per project. Idempotent — only processes rows still empty.
 *
 * Usage:
 *   node scripts/backfill-covers.mjs                          # dry-run
 *   node scripts/backfill-covers.mjs --apply                  # gen + emit JSONL
 *   node scripts/backfill-covers.mjs --apply --id=2           # single project
 *   node scripts/backfill-covers.mjs --apply 2>covers.log >covers.jsonl
 *
 * Prereqs in .env.local: OPENAI_API_KEY, BLOB_READ_WRITE_TOKEN,
 * NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
import { config as loadEnv } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { put } from "@vercel/blob";
import OpenAI from "openai";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
loadEnv({ path: resolve(root, ".env.local") });

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const SINGLE_ID = args.find((a) => a.startsWith("--id="))?.split("=")[1];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

if (!url || !anonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}
if (!openaiKey) {
  console.error("Missing OPENAI_API_KEY");
  process.exit(1);
}

const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const openai = new OpenAI({ apiKey: openaiKey });
const MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";

const STYLE_SUFFIX = [
  "STYLE: 16-bit pixel art, NES/SNES retro game aesthetic.",
  "Crisp hard-edged pixels. No anti-aliasing, no smooth gradients, no photorealism, no 3D rendering.",
  "Palette: forge-orange #F97316 + warm cream #FFE27D highlights, deep charcoal #0a0a0c background, muted purple #9D00FF magical accent.",
  "Visible pixel grid. Blocky silhouettes. Think 'Shovel Knight' / 'Octopath Traveler' sprite art.",
  "Composition: single hero subject centered, square 1024×1024 frame, slight isometric top-down angle.",
  "Ambient detail: tiny sparks, ember pixels, code-rune glyphs floating in the dark.",
  "Strictly NO text, NO logos, NO UI chrome, NO watermarks, NO modern flat-design.",
].join(" ");

const CATEGORY_VISUAL = {
  "AI Agent":     "a pixel-art robotic familiar / autonomous mob creature standing next to a glowing forge anvil",
  "AI Tool":      "a pixel-art smith's tool (hammer / chisel / gear) hovering above a workbench, runes etched into the metal",
  "AI Game":      "a pixel-art arcade cabinet glowing with a fictional game on its screen, dark gameroom around it",
  "AI Workflow":  "a pixel-art conveyor of glowing scrolls / mana orbs moving between two enchanted machines",
  "AI Utility":   "a pixel-art toolbelt with magical instruments lit by forge-orange glow",
  "Experimental": "a pixel-art arcane laboratory with bubbling potions and a holographic rune diagram",
  "Demo":         "a pixel-art display pedestal showcasing a mysterious glowing artifact",
};

const STAGE_GLOW = {
  Seed:     "subdued, dim lantern glow, mostly cool grays with a single warm spark",
  Active:   "soft warm glow forming around the subject, small embers floating up",
  Growing:  "moderate forge-orange aura radiating outward, several spark streams",
  Breakout: "bright pulsing aura, embers raining around, magical purple highlights",
  Legend:   "intense bonfire glow, light beams piercing the dark, runes in air",
  Myth:     "ascended phoenix-tier blaze, mythical golden light, fully transcendent",
};

function buildPrompt(p) {
  const visual = CATEGORY_VISUAL[p.category] ?? "a pixel-art mystical artifact glowing on a forge anvil";
  const glow = STAGE_GLOW[p.evolution_stage] ?? STAGE_GLOW.Active;
  const tagline = (p.tagline ?? "").slice(0, 200);
  return [
    `Subject: ${visual}.`,
    `Inspired by an AI project called "${p.title}"${tagline ? ` — ${tagline}` : ""}.`,
    `Energy: ${glow}.`,
    STYLE_SUFFIX,
  ].join(" ");
}

async function genCover(p) {
  const prompt = buildPrompt(p);
  const t0 = Date.now();
  const res = await openai.images.generate({ model: MODEL, prompt, size: "1024x1024", n: 1 });
  const sec = ((Date.now() - t0) / 1000).toFixed(1);
  const b64 = res.data?.[0]?.b64_json;
  if (!b64) throw new Error("no image data returned");
  const buf = Buffer.from(b64, "base64");
  const blob = await put(`covers/v1/${p.id}.png`, buf, {
    access: "public",
    contentType: "image/png",
    allowOverwrite: true,
  });
  return { url: blob.url, sec };
}

let query = supabase
  .from("projects")
  .select("id, title, tagline, category, evolution_stage, thumbnail")
  .or("thumbnail.is.null,thumbnail.eq.")
  .order("score", { ascending: false });
if (SINGLE_ID) query = query.eq("id", SINGLE_ID);

const { data: rows, error } = await query;
if (error) {
  console.error("Query failed:", error);
  process.exit(1);
}

console.error(`Found ${rows.length} project(s) missing a thumbnail.`);
console.error(`Estimated cost: $${(rows.length * 0.04).toFixed(2)} (${rows.length} × $0.04)`);

if (!APPLY) {
  console.error("\nDry-run. Re-run with --apply to actually generate.");
  for (const r of rows) {
    console.error(`  - ${r.id.padEnd(28)} ${(r.category ?? "?").padEnd(14)} ${(r.evolution_stage ?? "?").padEnd(10)} ${r.title}`);
  }
  process.exit(0);
}

let ok = 0;
let failed = 0;
for (const r of rows) {
  process.stderr.write(`→ ${r.id} (${r.category}/${r.evolution_stage}) ${r.title} ... `);
  try {
    const { url, sec } = await genCover(r);
    // stdout = JSONL of {id, url} for downstream MCP UPDATE batch
    process.stdout.write(JSON.stringify({ id: r.id, url }) + "\n");
    process.stderr.write(`✓ ${sec}s\n`);
    ok++;
  } catch (err) {
    process.stderr.write(`✗ ${err.message ?? err}\n`);
    failed++;
  }
}

console.error(`\nDone. ${ok} ok, ${failed} failed. ~$${(ok * 0.04).toFixed(2)} spent on OpenAI.`);
