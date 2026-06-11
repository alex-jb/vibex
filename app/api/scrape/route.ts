import { NextResponse } from "next/server";
import { promises as dns } from "node:dns";

/**
 * Scrape URL metadata for the /launch quick start.
 * Fetches the target URL, parses basic Open Graph + meta tags, returns
 * { title, description, image, siteName } for pre-filling the form.
 *
 * Intentionally lightweight — no headless browser, just HTML regex parsing.
 * Timeout: 8s. Returns 400 on invalid URL, 502 on fetch failure.
 */

interface ScrapedMetadata {
  title: string;
  description: string;
  image: string;
  siteName: string;
  url: string;
}

function extractMetaTag(html: string, pattern: RegExp): string {
  const match = html.match(pattern);
  return match?.[1]?.trim() ?? "";
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function parseMetadata(html: string, url: string): ScrapedMetadata {
  // Open Graph tags (preferred)
  const ogTitle = extractMetaTag(
    html,
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
  );
  const ogDescription = extractMetaTag(
    html,
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
  );
  const ogImage = extractMetaTag(
    html,
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
  );
  const ogSiteName = extractMetaTag(
    html,
    /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i,
  );

  // Twitter card fallback
  const twTitle = extractMetaTag(
    html,
    /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i,
  );
  const twDescription = extractMetaTag(
    html,
    /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i,
  );
  const twImage = extractMetaTag(
    html,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
  );

  // Generic fallback
  const htmlTitle = extractMetaTag(html, /<title[^>]*>([^<]+)<\/title>/i);
  const metaDescription = extractMetaTag(
    html,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
  );

  const title = ogTitle || twTitle || htmlTitle || "";
  const description = ogDescription || twDescription || metaDescription || "";
  const image = ogImage || twImage || "";

  return {
    title: cleanTitle(decodeEntities(title)).slice(0, 60),
    description: decodeEntities(description).slice(0, 2000),
    image: image,
    siteName: decodeEntities(ogSiteName),
    url,
  };
}

/**
 * Clean a scraped page title down to something usable as a project name.
 *
 * Examples:
 *  "GitHub - alex-jb/orallexa-ai-trading-agent: Multi-agent AI..."
 *    → "orallexa-ai-trading-agent"
 *  "Vercel – Build and deploy the best web experiences"
 *    → "Vercel"
 *  "Framer | Every interface is an interaction"
 *    → "Framer"
 *  "Next.js by Vercel - The React Framework"
 *    → "Next.js"
 */
/**
 * Returns true for any IPv4/IPv6 address that should never be reachable
 * from a public scrape endpoint. Stdlib-only, no `ipaddr.js` dep.
 *
 * Covers (per RFC 1918 / 4193 / 3927 / 6890):
 *   IPv4: 0.0.0.0/8, 10/8, 127/8, 169.254/16, 172.16/12, 192.168/16,
 *         100.64/10 (CGNAT), 198.18/15, 224/4 (multicast)
 *   IPv6: ::1, ::, fc00::/7 (ULA), fe80::/10 (link-local), ::ffff:0:0/96
 *         (IPv4-mapped — defer to v4 check)
 */
function isPrivateAddress(addr: string): boolean {
  if (addr.includes(":")) return isPrivateIPv6(addr);
  return isPrivateIPv4(addr);
}

function isPrivateIPv4(addr: string): boolean {
  const parts = addr.split(".").map((p) => Number.parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
    // Unparseable — treat as private (fail closed)
    return true;
  }
  const [a, b] = parts;
  if (a === 0) return true;                         // 0.0.0.0/8
  if (a === 10) return true;                        // 10.0.0.0/8
  if (a === 127) return true;                       // 127.0.0.0/8 loopback
  if (a === 169 && b === 254) return true;          // 169.254.0.0/16 link-local (IMDS!)
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true;          // 192.168.0.0/16
  if (a === 100 && b >= 64 && b <= 127) return true;// 100.64.0.0/10 CGNAT
  if (a === 198 && (b === 18 || b === 19)) return true; // 198.18.0.0/15 benchmarking
  if (a >= 224) return true;                        // 224/4 multicast + 240/4 reserved
  return false;
}

function isPrivateIPv6(addr: string): boolean {
  const a = addr.toLowerCase();
  if (a === "::" || a === "::1") return true;
  // IPv4-mapped (::ffff:1.2.3.4) — extract and re-check
  const mapped = a.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  // fc00::/7 ULA, fd00::/8 covered too
  if (/^f[cd][0-9a-f]{2}:/.test(a)) return true;
  // fe80::/10 link-local
  if (/^fe[89ab][0-9a-f]:/.test(a)) return true;
  return false;
}

function cleanTitle(raw: string): string {
  let t = raw.trim();

  // GitHub repo pages: "GitHub - owner/repo: description" → owner/repo, then repo
  const ghMatch = t.match(/^GitHub\s*[-–—:]\s*([^/]+\/([^:]+?))(?::.*)?$/);
  if (ghMatch) {
    const repo = ghMatch[2]?.trim();
    if (repo) return repo;
  }

  // Strip common "SiteName - Tagline" / "SiteName | Tagline" patterns —
  // keep the part before the first dash/pipe/bullet if it's short enough
  // to look like a brand name (< 30 chars).
  const sepMatch = t.match(/^(.{1,30}?)\s*[-–—|·•]\s*.+$/);
  if (sepMatch) {
    const name = sepMatch[1]?.trim();
    if (name) t = name;
  }

  return t;
}

export async function POST(request: Request) {
  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawUrl = body.url?.trim();
  if (!rawUrl) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  // Normalize URL — add https:// if missing
  let normalizedUrl = rawUrl;
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(normalizedUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // Reject non-http(s) schemes
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return NextResponse.json({ error: "Only http(s) URLs are supported" }, { status: 400 });
  }

  // SSRF protection — resolve hostname and reject any private/link-local/
  // loopback target. The old string-prefix blocklist missed:
  //   - 169.254.169.254 (AWS/Vercel IMDS metadata endpoint)
  //   - 0x7f.0.0.1 / decimal-encoded IPs
  //   - IPv6 ::1 / fc00::/7
  //   - DNS rebinding (foo.attacker.com → 127.0.0.1)
  // And it had a bug: hostname.startsWith("172.") blocks 172.0.0.0/8,
  // not the correct 172.16.0.0/12.
  const hostname = parsedUrl.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".local")) {
    return NextResponse.json({ error: "Internal addresses are not allowed" }, { status: 400 });
  }

  let resolved: { address: string; family: number }[];
  try {
    resolved = await dns.lookup(hostname, { all: true, verbatim: true });
  } catch {
    return NextResponse.json({ error: "Could not resolve host" }, { status: 400 });
  }

  if (resolved.some((r) => isPrivateAddress(r.address))) {
    return NextResponse.json({ error: "Internal addresses are not allowed" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    // redirect: "manual" — `follow` would re-resolve the redirect target
    // bypassing the SSRF check above (DNS rebinding via 302 to localhost).
    // 3xx responses are returned as-is; we treat them as failures below.
    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; VibeXBot/1.0; +https://www.vibexforge.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "manual",
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status}` },
        { status: 502 },
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json(
        { error: "URL did not return HTML content" },
        { status: 400 },
      );
    }

    // Limit response size to 1MB
    const html = await response.text();
    const limitedHtml = html.slice(0, 1_000_000);

    const metadata = parseMetadata(limitedHtml, parsedUrl.toString());

    // Require at least a title — if we got nothing, the scrape failed
    if (!metadata.title) {
      return NextResponse.json(
        { error: "Could not extract title from URL", metadata },
        { status: 200 },
      );
    }

    return NextResponse.json(metadata);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timed out after 8s" },
        { status: 504 },
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch URL" },
      { status: 502 },
    );
  }
}
