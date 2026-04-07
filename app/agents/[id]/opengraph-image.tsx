import { ImageResponse } from "next/og";
import { agents } from "@/lib/mock-data/agents";

export const alt = "VibeX Agent";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const modelLabels: Record<string, string> = {
  "claude-haiku-4-5": "Haiku 4.5",
  "claude-sonnet-4-6": "Sonnet 4.6",
  "claude-opus-4-6": "Opus 4.6",
};

const categoryLabels: Record<string, string> = {
  coding: "Coding",
  research: "Research",
  creative: "Creative",
  automation: "Automation",
  assistant: "Assistant",
  trading: "Trading",
  education: "Education",
  other: "Other",
};

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = agents.find((a) => a.id === id);

  const name = agent?.name ?? "Unknown Agent";
  const category = agent ? (categoryLabels[agent.category] ?? agent.category) : "Agent";
  const model = agent ? (modelLabels[agent.model] ?? agent.model) : "—";
  const runs = agent ? agent.runs.toLocaleString() : "0";

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
        {/* VibeX branding */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "linear-gradient(135deg, #8b5cf6, #d946ef)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              color: "white",
              fontWeight: "bold",
            }}
          >
            V
          </div>
          <span style={{ fontSize: "32px", color: "#7c3aed", fontWeight: "bold" }}>VibeX</span>
        </div>

        {/* Agent name */}
        <span style={{ fontSize: "56px", fontWeight: "bold", color: "white", marginBottom: "16px" }}>
          {name}
        </span>

        {/* Category badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginBottom: "32px",
            fontSize: "22px",
            color: "#a1a1aa",
          }}
        >
          <span
            style={{
              background: "rgba(139,92,246,0.2)",
              border: "1px solid rgba(139,92,246,0.4)",
              padding: "6px 16px",
              borderRadius: "8px",
              color: "#c4b5fd",
            }}
          >
            {category}
          </span>
          <span>{model}</span>
        </div>

        {/* Runs stat */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "20px", color: "#71717a" }}>
          <span style={{ color: "#8b5cf6", fontWeight: "bold", fontSize: "24px" }}>{runs}</span>
          <span>runs</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
