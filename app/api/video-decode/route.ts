/**
 * POST /api/video-decode
 *
 * Body: multipart/form-data with `video` field (mp4 binary, ≤50MB recommended)
 *
 * Response: { ok: true, result: VideoDecodeResult } or { ok: false, error }
 *
 * Phase 1 (today): only accepts user-supplied mp4 upload. The user must
 * download from Douyin/Xiaohongshu themselves (open-source helpers:
 * NanmiCoder/MediaCrawler for power users, browser-extensions for casuals).
 *
 * Phase 2 (next): accept URL too. yt-dlp behind a Railway Python sidecar
 * for Douyin, ReaJason/xhs Python lib for Xiaohongshu. Sidecar returns mp4
 * blob → we run the same decodeVideo() path. Sidecar fronts the legal
 * gray-area; we stay an analysis layer.
 *
 * Cost: ~$0.015 per 60s video at Gemini 2.5 Flash. We don't auth-gate yet
 * because total spend at <100 calls/day is ≤$1.50, cheaper than building a
 * paywall before validating demand.
 */
import { NextRequest, NextResponse } from "next/server";
import { decodeVideo } from "@/lib/gemini-video";

export const runtime = "nodejs";
export const maxDuration = 60; // Vercel Pro: 300s. Hobby: 60s. Most clips fit.

const MAX_BYTES = 100 * 1024 * 1024; // 100 MB — Gemini File API hard cap is 2GB but Vercel body is the real limit

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { ok: false, error: "expected multipart/form-data with `video` field" },
        { status: 400 },
      );
    }

    const form = await req.formData();
    const file = form.get("video");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "missing `video` file field" },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          error: `video too large (${(file.size / 1024 / 1024).toFixed(1)}MB > 100MB cap)`,
        },
        { status: 413 },
      );
    }

    const mimeType = file.type || "video/mp4";
    if (!mimeType.startsWith("video/")) {
      return NextResponse.json(
        { ok: false, error: `unsupported mime type: ${mimeType}` },
        { status: 415 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await decodeVideo(buffer, {
      mimeType,
      displayName: file.name,
    });

    return NextResponse.json({ ok: true, result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    console.error("[video-decode] failed:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
