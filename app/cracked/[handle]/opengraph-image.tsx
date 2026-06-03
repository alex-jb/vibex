import { ImageResponse } from "next/og";
import { scoreHandle } from "@/lib/cracked-score";

export const runtime = "nodejs";
export const alt = "Cracked Score";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const C = {
  BG: "#0A0A0A",
  PANEL: "#161619",
  BORDER: "#3A3A42",
  TEXT: "#E8E8EC",
  MUTED: "#8B7AA0",
  ORANGE: "#F97316",
};

export default async function CrackedOG({
  params,
}: {
  params: { handle: string };
}) {
  const r = await scoreHandle(params.handle);
  const handle = r?.handle ?? params.handle;
  const overall = r?.overall ?? 0;
  const tier = r?.tier ?? { name: "starting", emoji: "🥚", threshold: 0 };
  const totalStars = r?.totalStars ?? 0;
  const totalRepos = r?.totalRepos ?? 0;
  const followers = r?.followers ?? 0;

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 24, color: C.MUTED, letterSpacing: 6, textTransform: "uppercase" }}>
              Cracked Score · VibeXForge
            </div>
            <div style={{ fontSize: 72, fontWeight: 800, marginTop: 8 }}>@{handle}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", fontSize: 120 }}>{tier.emoji}</div>
        </div>

        <div
          style={{
            marginTop: 28,
            padding: 32,
            background: C.PANEL,
            borderRadius: 24,
            border: `2px solid ${C.BORDER}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 28, color: C.MUTED }}>OVERALL</div>
            <div style={{ fontSize: 120, fontWeight: 800, color: C.ORANGE, lineHeight: 1 }}>
              {overall}
            </div>
            <div style={{ fontSize: 22, color: C.MUTED }}>/ 100</div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "16px 40px",
              borderRadius: 999,
              background: C.ORANGE,
              color: "#0A0A0A",
              fontSize: 56,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            {tier.name}
          </div>
        </div>

        <div style={{ marginTop: 28, display: "flex", justifyContent: "space-between", gap: 16 }}>
          {[
            { label: "⭐ total stars", v: totalStars },
            { label: "📦 public repos", v: totalRepos },
            { label: "👥 followers", v: followers },
          ].map((b) => (
            <div
              key={b.label}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "24px 12px",
                background: C.PANEL,
                borderRadius: 16,
                border: `1px solid ${C.BORDER}`,
              }}
            >
              <div style={{ fontSize: 52, fontWeight: 800 }}>{b.v.toLocaleString()}</div>
              <div style={{ fontSize: 20, color: C.MUTED, marginTop: 6 }}>{b.label}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 22, color: C.MUTED }}>vibexforge.com/cracked/{handle}</div>
          <div style={{ fontSize: 22, color: C.ORANGE }}>
            12-axis dev profile score
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
