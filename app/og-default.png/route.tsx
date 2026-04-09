import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0c 0%, #1a0533 50%, #0a0a0c 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              background: "linear-gradient(135deg, #8b5cf6, #d946ef)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              color: "white",
              fontWeight: "bold",
            }}
          >
            V
          </div>
          <span style={{ fontSize: "64px", fontWeight: "bold", color: "white" }}>VibeX</span>
        </div>
        <p style={{ fontSize: "28px", color: "#a1a1aa", maxWidth: "600px", textAlign: "center" }}>
          The 16-bit RPG launch platform for AI-native creations
        </p>
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "40px",
            fontSize: "16px",
            color: "#7c3aed",
          }}
        >
          <span>Discover</span>
          <span style={{ color: "#555" }}>&#x2022;</span>
          <span>Battle</span>
          <span style={{ color: "#555" }}>&#x2022;</span>
          <span>Evolve</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
