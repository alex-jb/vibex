/**
 * Server-only project cover generator.
 *
 * When a project lands in the `projects` table without a thumbnail URL,
 * this module asks OpenAI gpt-image-2 to render a 1024×1024 RPG pixel-art
 * cover from the project's title + tagline + category + evolution stage,
 * uploads the PNG to Vercel Blob at a stable path, and returns the URL.
 *
 * Called from:
 *   - app/api/projects/submit/route.ts  (fire-and-forget after insert)
 *   - app/api/admin/regen-cover/[id]    (manual re-roll)
 *   - scripts/backfill-covers.mjs       (one-shot for legacy null rows)
 *
 * Cost: ~$0.04 per call (gpt-image-2 standard 1024×1024). Logged in
 * console.info so cost-audit-agent can scrape it.
 *
 * Style is locked here, not user-controllable, to keep visual cohesion
 * across the whole Feed. If the brand evolves, edit STYLE_SUFFIX +
 * bump the cover version path (`covers/v2/<id>.png`) so all rows regen.
 */
import OpenAI from "openai";
import { put } from "@vercel/blob";

export type ProjectCoverInput = {
  id: string;
  title: string;
  tagline?: string | null;
  category?: string | null;
  evolutionStage?: string | null;
};

const COVER_VERSION = "v1";

/**
 * Locked style suffix appended to every cover prompt. Same family as
 * scripts/gen-openai.mjs BRAND_SUFFIX but tuned for square 1024 thumbnail
 * shapes and the current brand palette (#F97316 forge-orange, post task #166).
 */
const STYLE_SUFFIX = [
  "STYLE: 16-bit pixel art, NES/SNES retro game aesthetic.",
  "Crisp hard-edged pixels. No anti-aliasing, no smooth gradients, no photorealism, no 3D rendering.",
  "Palette: forge-orange #F97316 + warm cream #FFE27D highlights, deep charcoal #0a0a0c background, muted purple #9D00FF magical accent.",
  "Visible pixel grid. Blocky silhouettes. Think 'Shovel Knight' / 'Octopath Traveler' sprite art.",
  "Composition: single hero subject centered, square 1024×1024 frame, slight isometric top-down angle.",
  "Ambient detail: tiny sparks, ember pixels, code-rune glyphs floating in the dark.",
  "Strictly NO text, NO logos, NO UI chrome, NO watermarks, NO modern flat-design.",
].join(" ");

/**
 * Category → visual hint for the hero subject. Keeps each cover distinguishable
 * even when titles are abstract ("AgentForge" / "DreamBoard" alone don't tell
 * the model what to draw).
 */
const CATEGORY_VISUAL: Record<string, string> = {
  "AI Agent":      "a pixel-art robotic familiar / autonomous mob creature standing next to a glowing forge anvil",
  "AI Tool":       "a pixel-art smith's tool (hammer / chisel / gear) hovering above a workbench, runes etched into the metal",
  "AI Game":       "a pixel-art arcade cabinet glowing with a fictional game on its screen, dark gameroom around it",
  "AI Workflow":   "a pixel-art conveyor of glowing scrolls / mana orbs moving between two enchanted machines",
  "AI Utility":    "a pixel-art toolbelt with magical instruments lit by forge-orange glow",
  "Experimental":  "a pixel-art arcane laboratory with bubbling potions and a holographic rune diagram",
  "Demo":          "a pixel-art display pedestal showcasing a mysterious glowing artifact",
};

/**
 * Stage → glow intensity hint. Seed = barely visible spark; Myth = ascended
 * fire-dragon energy. Reinforces the RPG progression visually on the cover.
 */
const STAGE_GLOW: Record<string, string> = {
  Seed:      "subdued, dim lantern glow, mostly cool grays with a single warm spark",
  Active:    "soft warm glow forming around the subject, small embers floating up",
  Growing:   "moderate forge-orange aura radiating outward, several spark streams",
  Breakout:  "bright pulsing aura, embers raining around, magical purple highlights",
  Legend:    "intense bonfire glow, light beams piercing the dark, runes in air",
  Myth:      "ascended phoenix-tier blaze, mythical golden light, fully transcendent",
};

function buildPrompt(p: ProjectCoverInput): string {
  const visual = CATEGORY_VISUAL[p.category ?? ""] ?? "a pixel-art mystical artifact glowing on a forge anvil";
  const glow = STAGE_GLOW[p.evolutionStage ?? ""] ?? STAGE_GLOW.Active;
  const tagline = (p.tagline ?? "").slice(0, 200);
  return [
    `Subject: ${visual}.`,
    `Inspired by an AI project called "${p.title}"${tagline ? ` — ${tagline}` : ""}.`,
    `Energy: ${glow}.`,
    STYLE_SUFFIX,
  ].join(" ");
}

/**
 * Generate + upload a cover for one project. Returns the public Blob URL.
 * Throws on any failure (caller can swallow or retry).
 */
export async function generateProjectCover(p: ProjectCoverInput): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("[gen-cover] OPENAI_API_KEY missing in env");
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";
  const prompt = buildPrompt(p);

  const t0 = Date.now();
  const res = await client.images.generate({
    model,
    prompt,
    size: "1024x1024",
    n: 1,
  });
  const elapsedSec = ((Date.now() - t0) / 1000).toFixed(1);

  const b64 = res.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error(`[gen-cover] no image data returned for project ${p.id}`);
  }
  const buf = Buffer.from(b64, "base64");

  const path = `covers/${COVER_VERSION}/${p.id}.png`;
  const blob = await put(path, buf, {
    access: "public",
    contentType: "image/png",
    allowOverwrite: true,
  });

  console.info(
    `[gen-cover] ${p.id} (${p.category ?? "?"}/${p.evolutionStage ?? "?"}) → ${blob.url} | ${elapsedSec}s | ~$0.04`,
  );
  return blob.url;
}
