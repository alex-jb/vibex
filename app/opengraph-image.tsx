import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "VibeXForge — The forge for AI creators";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const C = {
  BG: "#0A0A0C",
  TEXT: "#E8E8EC",
  MUTED: "#8B7AA0",
  FORGE: "#FF4500",
  CREAM: "#FFE27D",
  GREEN: "#39FF14",
  BORDER: "#3A3A42",
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

  const verbs = ["FORGE", "CRITIQUE", "EVOLVE"];

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: C.BG,
          padding: 60,
          position: "relative",
          fontFamily: "VT323",
          color: C.TEXT,
        }}
      >
        {/* Forge glow */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 50% 60%, ${C.FORGE}28, transparent 60%)`,
          }}
        />

        {/* L-corners */}
        {[
          { top: 0, left: 0, borderTop: `6px solid ${C.FORGE}`, borderLeft: `6px solid ${C.FORGE}` },
          { top: 0, right: 0, borderTop: `6px solid ${C.FORGE}`, borderRight: `6px solid ${C.FORGE}` },
          { bottom: 0, left: 0, borderBottom: `6px solid ${C.FORGE}`, borderLeft: `6px solid ${C.FORGE}` },
          { bottom: 0, right: 0, borderBottom: `6px solid ${C.FORGE}`, borderRight: `6px solid ${C.FORGE}` },
        ].map((s, i) => (
          <div
            key={i}
            style={{ display: "flex", position: "absolute", width: 36, height: 36, ...s }}
          />
        ))}

        {/* Brand wordmark — centered */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 30,
            gap: 24,
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Press Start 2P",
              fontSize: 80,
              letterSpacing: 6,
              color: C.CREAM,
            }}
          >
            <span>VIBE</span>
            <span style={{ color: C.FORGE }}>X</span>
            <span style={{ color: C.FORGE }}>FORGE</span>
          </div>

          <div
            style={{
              display: "flex",
              fontFamily: "Press Start 2P",
              fontSize: 22,
              letterSpacing: 4,
              color: C.TEXT,
              marginTop: 8,
            }}
          >
            THE FORGE FOR AI CREATORS
          </div>
        </div>

        {/* Verb trio */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 40,
            marginTop: 50,
            zIndex: 1,
          }}
        >
          {verbs.map((v, i) => (
            <div key={v} style={{ display: "flex", alignItems: "center", gap: 40 }}>
              <span
                style={{
                  fontFamily: "Press Start 2P",
                  fontSize: 26,
                  letterSpacing: 5,
                  color: i === 0 ? C.FORGE : C.MUTED,
                }}
              >
                {v}
              </span>
              {i < verbs.length - 1 && (
                <span style={{ fontFamily: "VT323", fontSize: 36, color: C.BORDER }}>▸</span>
              )}
            </div>
          ))}
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
            OPEN BETA · LIVE
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Press Start 2P",
              fontSize: 14,
              letterSpacing: 3,
              color: C.FORGE,
            }}
          >
            VIBEXFORGE.COM
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
