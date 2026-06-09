import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * /api/img — server-side image generation proxy.
 *
 * Phase 0 (no Pollinations token): returns a deterministic gradient PNG seed
 * URL that browser-decodes into a unique placeholder per prompt. Cost: $0.
 *
 * Phase 1 (POLLINATIONS_TOKEN env set): proxies to Pollinations x402 paid tier.
 *
 * Phase 2 fallback: if Pollinations 4xx/5xx, return seeded placeholder.
 *
 * Why server-side: brain rule — Pollinations free tier turned paid in 2026 H1;
 * client-direct calls 402. Proxy keeps token off the client + allows fallback.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const prompt = (url.searchParams.get("prompt") || "").slice(0, 500);
  const width = Math.min(parseInt(url.searchParams.get("w") || "640", 10), 1024);
  const height = Math.min(parseInt(url.searchParams.get("h") || "640", 10), 1024);

  if (!prompt) {
    return NextResponse.json({ error: "missing prompt" }, { status: 400 });
  }

  const token = process.env.POLLINATIONS_TOKEN;
  if (token) {
    try {
      const polUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true&token=${token}`;
      const upstream = await fetch(polUrl, {
        headers: { "User-Agent": "vibexforge/1.0 (+https://vibexforge.com)" },
        signal: AbortSignal.timeout(20_000),
      });
      if (upstream.ok) {
        const buf = await upstream.arrayBuffer();
        return new NextResponse(buf, {
          headers: {
            "Content-Type": upstream.headers.get("Content-Type") || "image/jpeg",
            "Cache-Control": "public, max-age=86400, immutable",
          },
        });
      }
    } catch {
      // fall through to placeholder
    }
  }

  // Deterministic seeded placeholder — SVG gradient keyed off prompt hash.
  // Visitor still gets unique-per-prompt visual; no API cost.
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    hash = ((hash << 5) - hash + prompt.charCodeAt(i)) | 0;
  }
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 60) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${h1},70%,55%)"/>
      <stop offset="100%" stop-color="hsl(${h2},65%,30%)"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g)"/>
  <text x="50%" y="50%" font-family="ui-monospace,SFMono-Regular,monospace" font-size="14" fill="rgba(255,255,255,0.7)" text-anchor="middle" dy="0.35em">${prompt.slice(0, 40).replace(/[<>&]/g, "")}</text>
  <text x="50%" y="${height - 16}" font-family="ui-monospace,SFMono-Regular,monospace" font-size="10" fill="rgba(255,255,255,0.4)" text-anchor="middle">vibexforge · placeholder · set POLLINATIONS_TOKEN</text>
</svg>`;
  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
