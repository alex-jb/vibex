import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Memory Wall — Druckenmiller AI inference basket";
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

const TICKERS = ["AVGO", "INTC", "ARM", "MU", "STX", "WDC"];

export default async function MemoryWallOG() {
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
          Memory Wall · VibeXForge
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1.05,
            color: C.TEXT,
          }}
        >
          Druckenmiller&apos;s Q1 2026
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1.05,
            color: C.INDIGO,
          }}
        >
          AI inference memory basket
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 40,
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          {TICKERS.map((sym) => (
            <div
              key={sym}
              style={{
                display: "flex",
                background: C.PANEL,
                border: `1px solid ${C.BORDER}`,
                borderRadius: 16,
                padding: "18px 28px",
                fontSize: 32,
                fontWeight: 700,
                color: C.TEXT,
                letterSpacing: 2,
                fontFamily: "ui-monospace, SFMono-Regular, monospace",
              }}
            >
              {sym}
            </div>
          ))}
        </div>

        <div style={{ flexGrow: 1 }} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 22,
            color: C.MUTED,
          }}
        >
          <div style={{ display: "flex" }}>
            <span style={{ color: C.EMERALD }}>Brier-audited</span>
            <span style={{ marginLeft: 12 }}>· daily research · 14:00 ET</span>
          </div>
          <div style={{ display: "flex" }}>github.com/alex-jb/memory-wall-tracker</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
