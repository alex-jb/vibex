/**
 * lib/visual-generator.ts — generate platform-native cover images for
 * project drafts using OpenAI gpt-image-2.
 *
 * D3 v1 (2026-05-08): Xiaohongshu only. The platform that lives by
 * cover-image aesthetics — text alone gets buried, the right cover
 * triples scroll-stop rate. Other platforms (X OG card, Bilibili
 * thumbnail, Reddit header) ship as Round 2 once we see Xiaohongshu
 * drives signal.
 *
 * Cost: ~$0.04-0.08 per gpt-image-2 call. Cost gate at 10 draft
 * credits per cover (D5).
 *
 * Storage: Vercel Blob, public access. URL written back to
 * project_drafts.cover_image_url.
 */

import OpenAI from "openai";
import { put } from "@vercel/blob";

const MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";

// Xiaohongshu cover convention: portrait 3:4, eye-stop hook in upper
// third (number / contrast / face), text overlay sparse, color block
// not photo-real. gpt-image-2 sizes: 1024x1024, 1024x1536, 1536x1024.
// 1024×1536 = 2:3, close enough to Xiaohongshu's 3:4 standard.
const XHS_SIZE = "1024x1536" as const;

// Style prompt fragments. Kept here so we can tune them in one place
// after Alex eyeballs the first generated batch.
const XHS_STYLE_BASE =
  "Style: minimal flat-design illustration in 小红书 (Xiaohongshu) note-cover aesthetic. " +
  "Soft pastel palette with one accent color. Strong central visual element. " +
  "Bold sans-serif headline in upper third, max 8 Chinese characters. " +
  "Generous negative space. NO stock-photo realism. NO logos. NO English text in body. " +
  "Vertical 2:3 portrait composition, mobile-first.";

export type Platform =
  | "xiaohongshu"; // expand later

export interface VisualGenInput {
  projectTitle: string;
  projectTagline: string;
  draftBody: string;
  language: "en" | "zh";
}

interface VisualGenResult {
  url: string;
  prompt: string;
}

/**
 * Build the gpt-image-2 prompt for a Xiaohongshu cover. Distills the
 * draft into a 1-2 sentence visual brief that the image model can
 * actually reason about. Keeps the actual draft text out of the
 * generated image (image models are bad at long Chinese typography);
 * pulls the most striking 6-8 Chinese characters as a headline hint.
 */
function buildXiaohongshuPrompt(input: VisualGenInput): string {
  const headlineHint =
    input.language === "zh"
      ? extractZhHeadlineHint(input.draftBody) || input.projectTagline
      : input.projectTitle;

  return [
    `Cover image for a Xiaohongshu (小红书) note about: ${input.projectTitle}.`,
    `Tagline: ${input.projectTagline}.`,
    headlineHint
      ? `Visual headline (place in upper third, ≤ 8 Chinese characters): "${truncate(headlineHint, 16)}".`
      : "",
    `Subject: a single iconic visual representing the AI tool — abstract geometric, minimal, not literal.`,
    XHS_STYLE_BASE,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function extractZhHeadlineHint(body: string): string | null {
  // Pull the first phrase that ends in a Chinese punctuation mark.
  // Bounds: 4-16 Chinese chars. Skips emoji-only opens.
  const match = body.match(/([一-龥][^。!?！？\n]{3,15}[。!?！？])/);
  if (!match) return null;
  return match[1].replace(/[。!?！？]$/, "").trim();
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) : s;
}

/**
 * Generate one cover image and upload to Vercel Blob.
 *
 * Returns { url, prompt }. Caller writes both to the draft row so we
 * can review prompts later when tuning quality.
 *
 * Throws on API or blob failure — caller handles.
 */
export async function generateCoverImage(
  platform: Platform,
  input: VisualGenInput,
  blobKeyPrefix: string,
): Promise<VisualGenResult> {
  if (platform !== "xiaohongshu") {
    throw new Error(`unsupported platform for cover generation: ${platform}`);
  }
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY missing");
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN missing");
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = buildXiaohongshuPrompt(input);

  const res = await client.images.generate({
    model: MODEL,
    prompt,
    size: XHS_SIZE,
    n: 1,
  });
  const b64 = res.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("image generation returned no data");
  }
  const buf = Buffer.from(b64, "base64");
  const blob = await put(
    `${blobKeyPrefix}-${Date.now()}.png`,
    buf,
    {
      access: "public",
      contentType: "image/png",
      cacheControlMaxAge: 60 * 60 * 24 * 30, // 30 days
    },
  );

  return { url: blob.url, prompt };
}
