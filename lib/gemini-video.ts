/**
 * Server-only video understanding via Gemini 2.5 Flash File API,
 * plus URL extraction via the vibex-video-extractor Railway sidecar.
 *
 * Takes an mp4 buffer, uploads it to Gemini's file store, polls until ACTIVE,
 * runs a structured prompt that extracts viral-hook anatomy (前 3 秒 hook /
 * 节奏切点 / CTA / 情感钩 / 仿写脚本), and returns parsed JSON.
 *
 * Why Gemini 2.5 Flash specifically (over Claude / GPT):
 *   - Native video input (no frame extraction needed)
 *   - Reads audio too — Douyin / Xiaohongshu virality is largely音频驱动
 *   - ~$0.01 per 60s video — 5-8× cheaper than Claude frames
 *   - 24h File API cache lets us re-prompt the same upload for free
 *
 * Legal posture: this module never fetches a URL itself. The caller must
 * supply an mp4 buffer the user already has (uploaded via browser file
 * picker, or — Phase 2 — by a server route that calls yt-dlp). We're an
 * analysis layer, not a scraper.
 *
 * Cost log line is console.info so cost-audit-agent can scrape it.
 */
import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";

const MODEL = "gemini-2.5-flash";
const POLL_INTERVAL_MS = 1500;
const POLL_MAX_ATTEMPTS = 40; // ~60s max wait — most ≤90s clips ACTIVE in 10-20s

export interface VideoHookAnalysis {
  language: "zh" | "en" | "mixed";
  duration_sec_estimate: number;
  hook_first_3s: {
    formula: string; // "shock + question" / "pain reveal" / "speed run" etc
    archetype_slug?: string; // matches one of HOOK_ARCHETYPES slugs in lib/hook-archetypes.ts
    transcript: string;
    why_it_works: string;
  };
  rhythm: {
    beat_timestamps_sec: number[]; // major cuts / energy shifts
    avg_shot_length_sec: number;
  };
  cta: {
    type: "follow" | "comment" | "save" | "buy" | "click_link" | "none";
    placement_sec: number | null;
    line: string;
  };
  emotional_hook: string; // dominant feeling 求职焦虑 / FOMO / 优越感 / 共鸣
  remix_scripts: string[]; // 3 同质化改编脚本
  virality_score: number; // 0-100 Gemini's own estimate
  red_flags: string[]; // 版权 / 涉政 / 涉医 / 仿冒 等 risk markers
}

export interface VideoDecodeResult {
  analysis: VideoHookAnalysis;
  model: string;
  cost_usd_estimate: number;
  duration_ms: number;
  file_uri: string; // for follow-up re-prompts within 24h
}

const PROMPT = `你是抖音/小红书爆款拆解师 (Cantonese-style 直率, no hedging)。看完这条视频,严格按 schema 输出 JSON。不要 markdown fence,不要解释。

Schema:
{
  "language": "zh" | "en" | "mixed",
  "duration_sec_estimate": <number>,
  "hook_first_3s": {
    "formula": "<one phrase: e.g. 'shock+question' / 'pain reveal' / 'speed run' / 'before-after'>",
    "archetype_slug": "<MUST be exactly one of: shock_question | pain_reveal | speed_run | before_after | contrarian_take | list_with_count | story_arc | authority_proof | viewer_jealousy | ai_dare | emotional_resonance | controversy_bait. Pick the best match. If none clearly fit, return empty string.>",
    "transcript": "<exact words spoken or shown in first 3 seconds>",
    "why_it_works": "<1-2 sentences in Chinese>"
  },
  "rhythm": {
    "beat_timestamps_sec": [<numbers>],
    "avg_shot_length_sec": <number>
  },
  "cta": {
    "type": "follow" | "comment" | "save" | "buy" | "click_link" | "none",
    "placement_sec": <number or null>,
    "line": "<exact CTA copy or empty string>"
  },
  "emotional_hook": "<1-3 chars Chinese, e.g. '求职焦虑' / 'FOMO' / '优越感' / '共鸣'>",
  "remix_scripts": [
    "<改编脚本 1, 60-90 words Chinese>",
    "<改编脚本 2, different angle>",
    "<改编脚本 3, more contrarian>"
  ],
  "virality_score": <0-100, your honest estimate>,
  "red_flags": [<short Chinese strings, empty array if none>]
}

要诚实: 如果 virality_score 低就给 <40, 不要为了让 user 高兴而 inflate。`;

export async function decodeVideo(
  videoBuffer: Buffer,
  opts: { mimeType?: string; displayName?: string } = {},
): Promise<VideoDecodeResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY not set — get one at ai.google.dev then add to .env.local + Vercel env",
    );
  }

  const start = Date.now();
  const ai = new GoogleGenAI({ apiKey });
  const mimeType = opts.mimeType ?? "video/mp4";

  // 1. Upload to Gemini Files API. Blob → File-like wrapper.
  const blob = new Blob([new Uint8Array(videoBuffer)], { type: mimeType });
  let uploaded = await ai.files.upload({
    file: blob,
    config: {
      mimeType,
      displayName: opts.displayName ?? `video-${Date.now()}`,
    },
  });

  // 2. Poll until state=ACTIVE — short clips usually 10-20s
  let attempts = 0;
  while (uploaded.state !== "ACTIVE") {
    if (uploaded.state === "FAILED") {
      throw new Error(`Gemini file processing FAILED for ${uploaded.name}`);
    }
    if (++attempts > POLL_MAX_ATTEMPTS) {
      throw new Error(
        `Gemini file still PROCESSING after ${(POLL_MAX_ATTEMPTS * POLL_INTERVAL_MS) / 1000}s — try shorter clip`,
      );
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    if (!uploaded.name) throw new Error("Uploaded file missing name");
    uploaded = await ai.files.get({ name: uploaded.name });
  }

  if (!uploaded.uri || !uploaded.mimeType) {
    throw new Error("Uploaded file ACTIVE but missing uri/mimeType");
  }

  // 3. generateContent with structured prompt
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: createUserContent([
      createPartFromUri(uploaded.uri, uploaded.mimeType),
      PROMPT,
    ]),
  });

  const text = response.text ?? "";
  const cleaned = stripFences(text);
  let analysis: VideoHookAnalysis;
  try {
    analysis = JSON.parse(cleaned) as VideoHookAnalysis;
  } catch {
    throw new Error(
      `Gemini returned non-JSON output: ${cleaned.slice(0, 200)}...`,
    );
  }

  const durationMs = Date.now() - start;
  // Rough cost estimate: gemini-2.5-flash at 60s ≈ $0.01. We don't know
  // input/output tokens precisely here, so log a conservative high-end.
  const costUsdEstimate = 0.015;
  console.info(
    `[gemini-video] decode ok model=${MODEL} ms=${durationMs} cost~$${costUsdEstimate}`,
  );

  return {
    analysis,
    model: MODEL,
    cost_usd_estimate: costUsdEstimate,
    duration_ms: durationMs,
    file_uri: uploaded.uri,
  };
}

function stripFences(text: string): string {
  let s = text.trim();
  if (s.startsWith("```json")) s = s.slice(7);
  else if (s.startsWith("```")) s = s.slice(3);
  if (s.endsWith("```")) s = s.slice(0, -3);
  return s.trim();
}

export interface ExtractedVideo {
  buffer: Buffer;
  platform: string;
  title?: string;
  duration_sec?: number;
}

/**
 * Pull a video from a Douyin / Xiaohongshu URL via the Railway sidecar.
 *
 * The sidecar (github.com/alex-jb/vibex-video-extractor) runs yt-dlp +
 * Python in a $5/mo Railway container because Vercel can't host it.
 * Returns the raw mp4 buffer + platform metadata so the caller can hand
 * it straight to decodeVideo().
 *
 * Throws with a tidy message on:
 *   - missing env (sidecar not configured)
 *   - sidecar down
 *   - 401 token rejection
 *   - 403 cookies needed (Douyin session expired — Alex re-export task)
 *   - 501 Xiaohongshu Phase 2 not implemented
 */
export async function extractFromUrl(url: string): Promise<ExtractedVideo> {
  const base = process.env.VIDEO_EXTRACTOR_URL;
  const token = process.env.VIDEO_EXTRACTOR_TOKEN;
  if (!base) {
    throw new Error(
      "VIDEO_EXTRACTOR_URL not set — Railway sidecar required for URL decode. " +
        "Deploy github.com/alex-jb/vibex-video-extractor and set the env var.",
    );
  }

  const res = await fetch(`${base.replace(/\/$/, "")}/extract`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const body = (await res.json()) as { detail?: string };
      detail = body.detail ?? "";
    } catch {
      detail = await res.text().catch(() => "");
    }
    throw new Error(
      `extractor returned ${res.status}: ${detail.slice(0, 200)}`,
    );
  }

  const arrayBuf = await res.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuf),
    platform: res.headers.get("x-video-platform") ?? "unknown",
    title: res.headers.get("x-video-title") ?? undefined,
    duration_sec: res.headers.get("x-video-duration")
      ? Number(res.headers.get("x-video-duration"))
      : undefined,
  };
}
