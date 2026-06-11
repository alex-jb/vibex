/**
 * POST /api/video-decode
 *
 * Two modes:
 *
 *   1. multipart/form-data { video: File }   ← user mp4 upload (Phase 1)
 *   2. application/json    { url: string }   ← Douyin/XHS link (Phase 2)
 *
 * Mode 2 calls the vibex-video-extractor Railway sidecar to fetch the mp4,
 * then runs the same Gemini decode path.
 *
 * Response: { ok: true, result: VideoDecodeResult, source: { mode, ... } }
 *           or { ok: false, error }
 *
 * Cost: ~$0.015 per 60s video at Gemini 2.5 Flash. URL mode adds ~$0.001
 * in sidecar bandwidth.
 */
import { NextRequest, NextResponse } from "next/server";
import { decodeVideo, extractFromUrl } from "@/lib/gemini-video";

export const runtime = "nodejs";
export const maxDuration = 60; // Vercel Pro: 300s, Hobby: 60s.

const MAX_BYTES = 100 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      return await handleUrl(req);
    }
    if (contentType.includes("multipart/form-data")) {
      return await handleUpload(req);
    }

    return NextResponse.json(
      {
        ok: false,
        error: "expected application/json {url} or multipart/form-data {video}",
      },
      { status: 400 },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    console.error("[video-decode] failed:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

async function handleUrl(req: NextRequest) {
  const body = (await req.json()) as { url?: string };
  if (!body.url || typeof body.url !== "string") {
    return NextResponse.json(
      { ok: false, error: "missing `url` string field" },
      { status: 400 },
    );
  }
  try {
    new URL(body.url);
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid URL" },
      { status: 400 },
    );
  }

  const extracted = await extractFromUrl(body.url);
  if (extracted.buffer.byteLength > MAX_BYTES) {
    return NextResponse.json(
      {
        ok: false,
        error: `extracted video too large (${(extracted.buffer.byteLength / 1024 / 1024).toFixed(1)}MB > 100MB cap)`,
      },
      { status: 413 },
    );
  }

  const result = await decodeVideo(extracted.buffer, {
    mimeType: "video/mp4",
    displayName: extracted.title ?? body.url,
  });

  return NextResponse.json({
    ok: true,
    result,
    source: {
      mode: "url",
      platform: extracted.platform,
      title: extracted.title,
      duration_sec: extracted.duration_sec,
      url: body.url,
    },
  });
}

async function handleUpload(req: NextRequest) {
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
  const result = await decodeVideo(buffer, { mimeType, displayName: file.name });

  return NextResponse.json({
    ok: true,
    result,
    source: { mode: "upload", filename: file.name, bytes: file.size },
  });
}
