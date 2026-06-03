import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";
import { tierFromScore } from "@/lib/score";

export const runtime = "edge";
export const alt = "Creator Score Card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const C = {
  BG: "#0A0A0A",
  PANEL: "#161619",
  BORDER: "#3A3A42",
  TEXT: "#E8E8EC",
  MUTED: "#8B7AA0",
  ORANGE: "#F97316",
  GOLD: "#FACC15",
  GREEN: "#39FF14",
};

interface Stats {
  validations: number;
  funerals: number;
  ideaFunerals: number;
  launchkits: number;
  revivals: number;
  ships: number;
}

async function loadStats(handle: string): Promise<{
  handle: string;
  score: number;
  tier: string;
  stats: Stats;
} | null> {
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!SUPA_URL || !SUPA_ANON_KEY) return null;
  const supa = createClient(SUPA_URL, SUPA_ANON_KEY);
  const { data } = await supa
    .from("creator_scores")
    .select(
      "handle, score, validations_count, launchkits_count, funerals_count, idea_funerals_count, revivals_triggered_count, vibex_submits_count",
    )
    .eq("handle", handle.toLowerCase())
    .maybeSingle();
  if (!data) return null;
  return {
    handle: data.handle,
    score: data.score,
    tier: tierFromScore(data.score).label,
    stats: {
      validations: data.validations_count ?? 0,
      funerals: data.funerals_count ?? 0,
      ideaFunerals: data.idea_funerals_count ?? 0,
      launchkits: data.launchkits_count ?? 0,
      revivals: data.revivals_triggered_count ?? 0,
      ships: data.vibex_submits_count ?? 0,
    },
  };
}

export default async function ScoreOG({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle: rawHandle } = await params;
  const data = await loadStats(rawHandle);
  const handle = data?.handle ?? rawHandle;
  const score = data?.score ?? 0;
  const tier = data?.tier ?? "Unranked";
  const meta = tierFromScore(score);
  const s = data?.stats ?? {
    validations: 0,
    funerals: 0,
    ideaFunerals: 0,
    launchkits: 0,
    revivals: 0,
    ships: 0,
  };

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
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 24, color: C.MUTED, letterSpacing: 6, textTransform: "uppercase" }}>
              VibeXForge · Creator Score
            </div>
            <div style={{ display: "flex", fontSize: 72, fontWeight: 800, marginTop: 8 }}>@{handle}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", fontSize: 120 }}>{meta.emoji}</div>
        </div>

        {/* Score bar */}
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
            <div style={{ display: "flex", fontSize: 28, color: C.MUTED }}>SCORE</div>
            <div style={{ display: "flex", fontSize: 96, fontWeight: 800, color: C.ORANGE, lineHeight: 1 }}>
              {score}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "16px 40px",
              borderRadius: 999,
              background: C.ORANGE,
              color: "#0A0A0A",
              fontSize: 48,
              fontWeight: 700,
            }}
          >
            {tier.toUpperCase()}
          </div>
        </div>

        {/* Stat grid */}
        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {[
            { label: "📝 ideas", v: s.validations },
            { label: "🚀 kits", v: s.launchkits },
            { label: "🪦 repos", v: s.funerals },
            { label: "💭 ideas†", v: s.ideaFunerals },
            { label: "🔄 revivals", v: s.revivals },
            { label: "⚡ ships", v: s.ships },
          ].map((b) => (
            <div
              key={b.label}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "20px 12px",
                background: C.PANEL,
                borderRadius: 16,
                border: `1px solid ${C.BORDER}`,
              }}
            >
              <div style={{ display: "flex", fontSize: 48, fontWeight: 800 }}>{b.v}</div>
              <div style={{ display: "flex", fontSize: 18, color: C.MUTED, marginTop: 6 }}>{b.label}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", fontSize: 22, color: C.MUTED }}>vibexforge.com/score/{handle}</div>
          <div style={{ display: "flex", fontSize: 22, color: C.ORANGE }}>
            Validator → LaunchKit → Funeral → Revival → Ship
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
