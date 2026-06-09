import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Brier-Audited Index — VibeXForge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const C = {
  BG: "#0A0A0A",
  PANEL: "#161619",
  BORDER: "#3A3A42",
  TEXT: "#E8E8EC",
  MUTED: "#8B7AA0",
  INDIGO: "#6366F1",
  EMERALD: "#34D399",
};

const ROUTES = [
  { label: "Council Diff", desc: "5-voice verdict" },
  { label: "Memory Wall", desc: "AI inference basket" },
  { label: "Quant Bench", desc: "Resume scoring" },
  { label: "Predictions", desc: "Public log" },
];

export default async function BrierOG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: C.BG,
          padding: 56,
          color: C.TEXT,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: C.MUTED,
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          Brier-Audited · VibeXForge
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.05,
          }}
        >
          Every prediction
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.05,
            color: C.INDIGO,
          }}
        >
          gets a date and a score.
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 44,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {ROUTES.map((r) => (
            <div
              key={r.label}
              style={{
                display: "flex",
                flexDirection: "column",
                background: C.PANEL,
                border: `1px solid ${C.BORDER}`,
                borderRadius: 14,
                padding: "16px 22px",
                minWidth: 220,
              }}
            >
              <div style={{ display: "flex", fontSize: 24, fontWeight: 700, color: C.TEXT }}>
                {r.label}
              </div>
              <div style={{ display: "flex", fontSize: 18, color: C.MUTED, marginTop: 4 }}>
                {r.desc}
              </div>
            </div>
          ))}
        </div>

        <div style={{ flexGrow: 1 }} />

        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: C.EMERALD,
          }}
        >
          Brier &lt; 0.25 = better than coin-flip · open audit · vibexforge.com/brier
        </div>
      </div>
    ),
    { ...size }
  );
}
