import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Council Diff Verdict";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const C = {
  BG: "#0A0A0A",
  PANEL: "#161619",
  BORDER: "#3A3A42",
  TEXT: "#E8E8EC",
  MUTED: "#8B7AA0",
  INDIGO: "#6366F1",
};

interface PageProps {
  searchParams: Promise<{ domain?: string; decision?: string }>;
}

export default async function CouncilOG({ searchParams }: PageProps) {
  const sp = await searchParams;
  const domain = (sp.domain ?? "founder").slice(0, 20);
  const decision = (sp.decision ?? "5-voice AI council").slice(0, 140);

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
          Council Diff · VibeXForge
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 24,
            gap: 12,
          }}
        >
          {["Bull", "Bear", "Judge", "Critic", "Auditor"].map((voice) => (
            <div
              key={voice}
              style={{
                display: "flex",
                background: C.PANEL,
                border: `1px solid ${C.BORDER}`,
                borderRadius: 12,
                padding: "10px 18px",
                fontSize: 20,
                color: C.MUTED,
                letterSpacing: 1,
              }}
            >
              {voice}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 48,
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.05,
            color: C.TEXT,
          }}
        >
          {decision}
        </div>

        <div style={{ flexGrow: 1 }} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 24,
            color: C.MUTED,
          }}
        >
          <div style={{ display: "flex" }}>
            Domain: <span style={{ color: C.INDIGO, marginLeft: 12 }}>{domain}</span>
          </div>
          <div style={{ display: "flex" }}>Brier-audited · open source</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
