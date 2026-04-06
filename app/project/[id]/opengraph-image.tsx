import { ImageResponse } from "next/og";
import { projects } from "@/lib/mock-data";

export const alt = "VibeX Project";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = projects.find(p => p.id === id);
  const title = project?.title || "Project";
  const tagline = project?.tagline || "";
  const category = project?.category || "";
  const score = project?.score || 0;

  return new ImageResponse(
    (
      <div style={{
        background: "linear-gradient(135deg, #0a0a0c 0%, #1a0533 50%, #0a0a0c 100%)",
        width: "100%", height: "100%",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "sans-serif", padding: "60px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <span style={{ fontSize: "18px", color: "#8b5cf6", fontWeight: "bold" }}>VibeX</span>
          <span style={{ fontSize: "14px", color: "#555" }}>•</span>
          <span style={{ fontSize: "16px", color: "#a1a1aa" }}>{category}</span>
        </div>
        <h1 style={{ fontSize: "56px", fontWeight: "bold", color: "white", textAlign: "center", margin: "0 0 16px 0" }}>
          {title}
        </h1>
        <p style={{ fontSize: "24px", color: "#71717a", textAlign: "center", maxWidth: "800px" }}>
          {tagline}
        </p>
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          marginTop: "40px", padding: "12px 24px",
          background: "rgba(139, 92, 246, 0.15)",
          borderRadius: "12px", border: "1px solid rgba(139, 92, 246, 0.3)",
        }}>
          <span style={{ fontSize: "28px", fontWeight: "bold", color: "#8b5cf6" }}>{score}</span>
          <span style={{ fontSize: "14px", color: "#a1a1aa" }}>AI Score</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
