import { ImageResponse } from "next/og";
import { HOOK_ARCHETYPES } from "@/lib/hook-archetypes";

// nodejs runtime (not edge) because the parent route uses
// generateStaticParams. Next.js currently disallows edge runtime alongside
// SSG params on the same dynamic segment.
export const alt = "Hook archetype · VibeXForge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateImageMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const a = HOOK_ARCHETYPES.find((x) => x.slug === params.slug);
  if (!a) return [{ id: "missing", alt: "Archetype not found", size, contentType }];
  return [
    {
      id: a.slug,
      alt: `${a.display_en} · ${a.display_zh} — Chinese short-form viral hook pattern`,
      size,
      contentType,
    },
  ];
}

const C = {
  BG: "#0A0A0C",
  PANEL: "#161619",
  BORDER: "#3A3A42",
  TEXT: "#E8E8EC",
  MUTED: "#8B7AA0",
  INDIGO: "#6366F1",
  CREAM: "#FFE27D",
  GREEN: "#39FF14",
  AMBER: "#F59E0B",
};

async function loadGoogleFont(family: string, weight = 400): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family,
  )}:wght@${weight}&display=swap`;
  const css = await (await fetch(url)).text();
  const match = css.match(/src:\s*url\(([^)]+)\)\s*format\(['"](?:opentype|truetype)['"]\)/);
  if (!match) throw new Error(`font src not found: ${family}`);
  const res = await fetch(match[1]);
  return res.arrayBuffer();
}

export default async function Image({ params }: { params: { slug: string } }) {
  const a = HOOK_ARCHETYPES.find((x) => x.slug === params.slug);
  if (!a) {
    // Render a generic "archetype not found" card rather than throw, so
    // sharing a stale URL still works as a soft 404.
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background: C.BG,
            color: C.TEXT,
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui",
            fontSize: 48,
          }}
        >
          archetype not found · vibexforge.com/hooks
        </div>
      ),
      { ...size },
    );
  }

  const idx = HOOK_ARCHETYPES.findIndex((x) => x.slug === params.slug);
  const [pressStart, vt323] = await Promise.all([
    loadGoogleFont("Press Start 2P", 400),
    loadGoogleFont("VT323", 400),
  ]);

  // Title sizing: shorter archetype names get larger type; longer titles
  // shrink to stay one line. Press Start 2P doesn't auto-wrap cleanly so we
  // pick the size at render time.
  const titleSize = a.display_en.length > 16 ? 56 : a.display_en.length > 11 ? 72 : 88;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: C.BG,
          padding: 48,
          position: "relative",
          fontFamily: "VT323",
          color: C.TEXT,
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 30% 40%, ${C.INDIGO}40, transparent 60%)`,
          }}
        />
        <div style={{ display: "flex", position: "absolute", width: 32, height: 32, top: 0, left: 0, borderTop: `5px solid ${C.INDIGO}`, borderLeft: `5px solid ${C.INDIGO}` }} />
        <div style={{ display: "flex", position: "absolute", width: 32, height: 32, top: 0, right: 0, borderTop: `5px solid ${C.INDIGO}`, borderRight: `5px solid ${C.INDIGO}` }} />
        <div style={{ display: "flex", position: "absolute", width: 32, height: 32, bottom: 0, left: 0, borderBottom: `5px solid ${C.INDIGO}`, borderLeft: `5px solid ${C.INDIGO}` }} />
        <div style={{ display: "flex", position: "absolute", width: 32, height: 32, bottom: 0, right: 0, borderBottom: `5px solid ${C.INDIGO}`, borderRight: `5px solid ${C.INDIGO}` }} />

        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: "Press Start 2P",
              fontSize: 18,
              letterSpacing: 4,
              color: C.TEXT,
            }}
          >
            <span style={{ color: C.INDIGO }}>▸</span>
            <span>VIBEX</span>
            <span style={{ color: C.INDIGO }}>FORGE</span>
            <span style={{ color: C.MUTED, marginLeft: 12 }}>·</span>
            <span style={{ color: C.MUTED, marginLeft: 12, fontSize: 14 }}>
              HOOKS
            </span>
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Press Start 2P",
              fontSize: 11,
              letterSpacing: 2,
              color: C.AMBER,
              padding: "8px 12px",
              border: `2px solid ${C.AMBER}`,
              background: "rgba(245,158,11,0.08)",
            }}
          >
            #{String(idx + 1).padStart(2, "0")} OF 12
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 40,
            gap: 16,
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontFamily: "Press Start 2P",
              fontSize: titleSize,
              lineHeight: 1.05,
              color: C.CREAM,
              letterSpacing: 2,
              maxWidth: 1100,
            }}
          >
            {a.display_en.toUpperCase()}
          </div>
          <div
            style={{
              fontFamily: "VT323",
              fontSize: 56,
              lineHeight: 1.0,
              color: C.INDIGO,
            }}
          >
            {a.display_zh}
          </div>
          <div
            style={{
              fontFamily: "VT323",
              fontSize: 30,
              lineHeight: 1.2,
              color: C.MUTED,
              maxWidth: 1080,
              marginTop: 10,
            }}
          >
            {a.description_en}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            marginTop: "auto",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 22,
            borderTop: `1px solid ${C.BORDER}`,
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                fontFamily: "Press Start 2P",
                fontSize: 9,
                letterSpacing: 2,
                color: C.MUTED,
              }}
            >
              COMMON IN
            </span>
            <span
              style={{
                fontFamily: "VT323",
                fontSize: 28,
                color: C.TEXT,
              }}
            >
              {a.common_in}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Press Start 2P",
              fontSize: 12,
              letterSpacing: 3,
              color: C.GREEN,
            }}
          >
            VIBEXFORGE.COM/HOOKS/{a.slug.toUpperCase()}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Press Start 2P", data: pressStart, weight: 400, style: "normal" },
        { name: "VT323", data: vt323, weight: 400, style: "normal" },
      ],
    },
  );
}
