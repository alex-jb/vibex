import { NextRequest, NextResponse } from "next/server";
import { generateDemoGif, isValidDemoUrl } from "@/lib/demo-generator";
import { supabase } from "@/lib/supabase";
import { USE_SUPABASE } from "@/lib/mock-adapter";

// Rate limit: 2 requests per 60 seconds per IP
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = 2;
const RATE_WINDOW = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW);
  rateLimitMap.set(ip, recent);
  if (recent.length >= RATE_LIMIT) return false;
  recent.push(now);
  return true;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in 60 seconds." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { url, projectId } = body;

  if (!url || !isValidDemoUrl(url)) {
    return NextResponse.json(
      { error: "Invalid URL. Please provide a valid http/https URL." },
      { status: 400 }
    );
  }

  try {
    const result = await generateDemoGif(url, {
      width: 1280,
      height: 720,
      frameDelay: 800,
      quality: 10,
      maxFrames: 6,
    });

    // Upload to Supabase Storage if available
    let gifUrl = "";
    const filename = `demo-${projectId || Date.now()}-${Date.now()}.gif`;

    if (USE_SUPABASE) {
      const { error } = await supabase.storage
        .from("thumbnails")
        .upload(filename, result.buffer, {
          contentType: "image/gif",
          cacheControl: "3600",
          upsert: true,
        });

      if (!error) {
        const { data } = supabase.storage
          .from("thumbnails")
          .getPublicUrl(filename);
        gifUrl = data.publicUrl;
      }
    }

    // If storage isn't available, return as base64 data URL
    if (!gifUrl) {
      gifUrl = `data:image/gif;base64,${result.buffer.toString("base64")}`;
    }

    return NextResponse.json({
      gifUrl,
      frames: result.frames,
      sizeKB: result.sizeKB,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Demo generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
