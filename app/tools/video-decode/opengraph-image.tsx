import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AI Video Decoder — paste 抖音/小红书 link, get the hook structure";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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

export default async function Image() {
  const [pressStart, vt323] = await Promise.all([
    loadGoogleFont("Press Start 2P", 400),
    loadGoogleFont("VT323", 400),
  ]);

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
        {/* Indigo glow */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 30% 50%, ${C.INDIGO}33, transparent 65%)`,
          }}
        />

        {/* L-corners */}
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
              gap: 14,
              fontFamily: "Press Start 2P",
              fontSize: 22,
              letterSpacing: 4,
              color: C.TEXT,
            }}
          >
            <span style={{ color: C.INDIGO }}>▸</span>
            <span>VIBEX</span>
            <span style={{ color: C.INDIGO }}>FORGE</span>
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Press Start 2P",
              fontSize: 11,
              letterSpacing: 3,
              color: C.GREEN,
              padding: "8px 14px",
              border: `2px solid ${C.GREEN}`,
              background: "rgba(57,255,20,0.08)",
            }}
          >
            GEMINI 2.5 FLASH · ALPHA
          </div>
        </div>

        {/* Huge title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 44,
            gap: 14,
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontFamily: "Press Start 2P",
              fontSize: 20,
              letterSpacing: 6,
              color: C.INDIGO,
            }}
          >
            🎬 AI VIDEO DECODER
          </div>
          <div
            style={{
              fontFamily: "Press Start 2P",
              fontSize: 52,
              lineHeight: 1.15,
              color: C.CREAM,
              letterSpacing: 2,
              maxWidth: 1080,
            }}
          >
            PASTE A 抖音 / 小红书
          </div>
          <div
            style={{
              fontFamily: "Press Start 2P",
              fontSize: 52,
              lineHeight: 1.15,
              color: C.TEXT,
              letterSpacing: 2,
              maxWidth: 1080,
            }}
          >
            LINK · GET THE HOOK
          </div>
          <div
            style={{
              fontFamily: "VT323",
              fontSize: 34,
              lineHeight: 1.1,
              color: C.MUTED,
              maxWidth: 1080,
              marginTop: 6,
            }}
          >
            AI watches · returns hook formula + rhythm beats + CTA + 3 remix scripts
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            marginTop: "auto",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 24,
            borderTop: `1px solid ${C.BORDER}`,
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", gap: 40 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontFamily: "Press Start 2P", fontSize: 22, color: C.AMBER, letterSpacing: 1 }}>
                ~30s
              </span>
              <span style={{ fontFamily: "Press Start 2P", fontSize: 9, letterSpacing: 2, color: C.MUTED }}>
                PER DECODE
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontFamily: "Press Start 2P", fontSize: 22, color: C.GREEN, letterSpacing: 1 }}>
                3/DAY
              </span>
              <span style={{ fontFamily: "Press Start 2P", fontSize: 9, letterSpacing: 2, color: C.MUTED }}>
                FREE TIER
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontFamily: "Press Start 2P", fontSize: 22, color: C.INDIGO, letterSpacing: 1 }}>
                $5
              </span>
              <span style={{ fontFamily: "Press Start 2P", fontSize: 9, letterSpacing: 2, color: C.MUTED }}>
                = 100 DECODES
              </span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Press Start 2P",
              fontSize: 14,
              letterSpacing: 3,
              color: C.GREEN,
            }}
          >
            VIBEXFORGE.COM/TOOLS/VIDEO-DECODE
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
