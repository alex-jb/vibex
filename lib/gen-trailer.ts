/**
 * lib/gen-trailer.ts — 30-second product trailer pipeline.
 *
 * Wraps harry0703/MoneyPrinterTurbo (Python, 69k stars) as a subprocess
 * to generate a 30s mp4 from a project's title + tagline + description.
 *
 * Pipeline:
 *   1. Compose script from tagline + 2-3 description sentences
 *   2. Call MoneyPrinterTurbo:
 *      - TTS narration (Azure Neural or open-source piper)
 *      - Stock footage matched by keywords (Pexels API)
 *      - ffmpeg merge with title card + watermark
 *   3. Upload mp4 to Vercel Blob (public, ~3-5MB per trailer)
 *   4. Return public URL → caller persists to projects.trailer_url
 *
 * Cost per trailer (Azure TTS + Pexels free + Vercel compute + Blob):
 *   ~$0.02 estimated. LaunchKit charges $5 premium for trailer add-on
 *   = 99% margin.
 *
 * Spec: alex-brain research/2026-05-31-7repos-cross-stack-upgrade-audit.md
 *
 * Operational notes:
 *   - MoneyPrinterTurbo must be cloned + venv set up on the Vercel
 *     build env. For MVP, we run it in a separate Python service
 *     (Fly.io or Modal) and call via HTTPS — see TRAILER_SERVICE_URL
 *     env var.
 *   - If TRAILER_SERVICE_URL is missing, this returns null gracefully
 *     so caller can fall back to "cover image only" behavior.
 */
import { put } from "@vercel/blob";

const TRAILER_SERVICE_URL = process.env.TRAILER_SERVICE_URL;
const TRAILER_SERVICE_TOKEN = process.env.TRAILER_SERVICE_TOKEN;

export interface TrailerProject {
  id: string;
  title: string;
  tagline: string;
  description?: string;
  category?: string;
  /** Hex color for title card background. Defaults to brand orange. */
  brandColor?: string;
}

export interface TrailerResult {
  ok: true;
  url: string;
  durationSeconds: number;
  sizeBytes: number;
  cost: number;
}

export interface TrailerError {
  ok: false;
  error: string;
}

/**
 * Compose narration script from project fields. ~80-100 words = ~30s read.
 */
export function composeScript(project: TrailerProject): string {
  const desc = (project.description || "").slice(0, 240);
  return [
    project.title + ".",
    project.tagline.trim() + ".",
    desc,
    "Try it today.",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Pull 30s of stock footage keywords from the project. Used by the
 * MoneyPrinterTurbo service to match Pexels videos.
 */
export function deriveKeywords(project: TrailerProject): string[] {
  const candidates: string[] = [];
  if (project.category) candidates.push(project.category);
  // Pull nouns from tagline (naive — first 3 words ≥ 4 chars)
  for (const word of project.tagline.split(/\s+/)) {
    const cleaned = word.replace(/[^a-zA-Z]/g, "");
    if (cleaned.length >= 4) candidates.push(cleaned.toLowerCase());
    if (candidates.length >= 6) break;
  }
  // Add generic fallback so we always have keyword coverage
  candidates.push("technology", "abstract", "modern");
  return Array.from(new Set(candidates)).slice(0, 6);
}

/**
 * Generate a trailer for `project`. Returns { ok:true, url } on success
 * or { ok:false, error } on failure (graceful — caller can fall back to
 * cover-only).
 *
 * Implementation note: This MVP runs MoneyPrinterTurbo on an external
 * Python service (TRAILER_SERVICE_URL). Phase 2 inlines via Vercel
 * Functions when the build can accommodate the ~2GB Python deps.
 */
export async function generateTrailer(
  project: TrailerProject,
): Promise<TrailerResult | TrailerError> {
  if (!TRAILER_SERVICE_URL) {
    return {
      ok: false,
      error: "TRAILER_SERVICE_URL not configured; trailer generation skipped",
    };
  }

  const script = composeScript(project);
  const keywords = deriveKeywords(project);

  const startMs = Date.now();
  try {
    const resp = await fetch(`${TRAILER_SERVICE_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(TRAILER_SERVICE_TOKEN
          ? { Authorization: `Bearer ${TRAILER_SERVICE_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        project_id: project.id,
        title: project.title,
        script,
        keywords,
        duration_seconds: 30,
        brand_color: project.brandColor || "#F97316",
        watermark: "vibexforge.com",
      }),
    });
    if (!resp.ok) {
      const errText = await resp.text();
      return {
        ok: false,
        error: `Trailer service ${resp.status}: ${errText.slice(0, 200)}`,
      };
    }
    // Service returns mp4 binary directly
    const buf = Buffer.from(await resp.arrayBuffer());
    if (buf.byteLength < 10_000) {
      return { ok: false, error: "Trailer too small (<10KB), likely empty" };
    }

    // Upload to Vercel Blob
    const blob = await put(
      `trailers/${project.id}.mp4`,
      buf,
      { access: "public", contentType: "video/mp4" },
    );

    const wallSeconds = (Date.now() - startMs) / 1000;
    return {
      ok: true,
      url: blob.url,
      durationSeconds: 30,
      sizeBytes: buf.byteLength,
      cost: estimateCost(wallSeconds),
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Rough cost estimate per trailer: Azure TTS + Pexels (free) + Vercel
 * compute time + Blob storage. ~$0.02 typical.
 */
function estimateCost(_wallSeconds: number): number {
  // Azure neural TTS ~$0.016 per 1000 chars; ~600 chars/trailer = $0.01
  // ffmpeg compute time: Vercel Fluid Compute ~$0.000002/s × 30s = $0.0001
  // Stock footage: free (Pexels)
  // Blob storage: $0.005/GB-month, ~5MB/trailer = $0.000025/month
  // Wall-time mostly TTS+download, not compute.
  return Math.round(0.012 * 100) / 100;
}
