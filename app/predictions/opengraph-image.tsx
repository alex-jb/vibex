import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Predictions — AI-quant picks, Brier-audited";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Palette — inlined hex, satori can't resolve CSS vars.
const C = {
  BG: "#0A0A0C",
  PANEL: "#161619",
  BORDER: "#3A3A42",
  TEXT: "#E8E8EC",
  MUTED: "#8B7AA0",
  FORGE: "#F97316",
  CREAM: "#FFE27D",
  GREEN: "#39FF14",
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

  const stats = [
    { value: "0.221", label: "BRIER · OURS" },
    { value: "0.234", label: "BRIER · MARKET" },
    { value: "+0.013", label: "EDGE" },
    { value: "87", label: "SETTLED N" },
  ];

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
        {/* Forge glow ambient */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 70% 50%, ${C.FORGE}22, transparent 65%)`,
          }}
        />

        {/* L-corners */}
        <div style={{ display: "flex", position: "absolute", width: 32, height: 32, top: 0, left: 0, borderTop: `5px solid ${C.FORGE}`, borderLeft: `5px solid ${C.FORGE}` }} />
        <div style={{ display: "flex", position: "absolute", width: 32, height: 32, top: 0, right: 0, borderTop: `5px solid ${C.FORGE}`, borderRight: `5px solid ${C.FORGE}` }} />
        <div style={{ display: "flex", position: "absolute", width: 32, height: 32, bottom: 0, left: 0, borderBottom: `5px solid ${C.FORGE}`, borderLeft: `5px solid ${C.FORGE}` }} />
        <div style={{ display: "flex", position: "absolute", width: 32, height: 32, bottom: 0, right: 0, borderBottom: `5px solid ${C.FORGE}`, borderRight: `5px solid ${C.FORGE}` }} />

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
            <span style={{ color: C.FORGE }}>▸</span>
            <span>VIBEX</span>
            <span style={{ color: C.FORGE }}>FORGE</span>
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
            BRIER-AUDITED · LIVE
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
              color: C.FORGE,
            }}
          >
            PREDICTIONS
          </div>
          <div
            style={{
              fontFamily: "Press Start 2P",
              fontSize: 56,
              lineHeight: 1.1,
              color: C.CREAM,
              letterSpacing: 2,
              maxWidth: 1080,
            }}
          >
            NBA · WORLD CUP
          </div>
          <div
            style={{
              fontFamily: "Press Start 2P",
              fontSize: 56,
              lineHeight: 1.1,
              color: C.TEXT,
              letterSpacing: 2,
              maxWidth: 1080,
            }}
          >
            SPACEX · POLYMARKET
          </div>
          <div
            style={{
              fontFamily: "VT323",
              fontSize: 36,
              lineHeight: 1.1,
              color: C.MUTED,
              maxWidth: 1080,
              marginTop: 6,
            }}
          >
            Brier-audited daily picks · no paywall · solo founder
          </div>
        </div>

        {/* Stats row pushed to bottom */}
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
          <div style={{ display: "flex", gap: 36 }}>
            {stats.map((s) => (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    fontFamily: "Press Start 2P",
                    fontSize: 22,
                    color: C.FORGE,
                    letterSpacing: 1,
                  }}
                >
                  {s.value}
                </span>
                <span
                  style={{
                    fontFamily: "Press Start 2P",
                    fontSize: 9,
                    letterSpacing: 2,
                    color: C.MUTED,
                  }}
                >
                  {s.label}
                </span>
              </div>
            ))}
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
            VIBEXFORGE.COM/PREDICTIONS
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
