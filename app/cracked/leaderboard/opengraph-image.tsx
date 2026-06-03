import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const alt = "Cracked Score Leaderboard";
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

const TIER_EMOJI: Record<string, string> = {
  mythic: "👑",
  cracked: "⚡",
  solid: "💪",
  rising: "🌱",
  starting: "🥚",
};

interface Row {
  github_handle: string;
  overall: number;
  tier: string;
}

async function topFive(): Promise<Row[]> {
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!SUPA_URL || !SUPA_ANON_KEY) return [];
  const supa = createClient(SUPA_URL, SUPA_ANON_KEY);
  const { data } = await supa
    .from("cracked_scores")
    .select("github_handle, overall, tier")
    .order("overall", { ascending: false })
    .limit(5);
  return (data as Row[] | null) || [];
}

export default async function LeaderboardOG() {
  const rows = await topFive();

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
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 24, color: C.MUTED, letterSpacing: 6, textTransform: "uppercase" }}>
            Cracked Score · VibeXForge
          </div>
          <div style={{ fontSize: 64, fontWeight: 800, marginTop: 8 }}>
            Who&apos;s the most cracked dev?
          </div>
        </div>

        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
          {rows.map((r, i) => (
            <div
              key={r.github_handle}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "16px 28px",
                background: C.PANEL,
                borderRadius: 16,
                border: `1px solid ${C.BORDER}`,
                gap: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 60,
                  fontSize: 32,
                  fontWeight: 800,
                  color: i === 0 ? C.ORANGE : i < 3 ? "#FFA94D" : C.MUTED,
                }}
              >
                #{i + 1}
              </div>
              <div style={{ display: "flex", flex: 1, fontSize: 36, fontWeight: 700 }}>
                @{r.github_handle}
              </div>
              <div style={{ display: "flex", fontSize: 28, color: C.MUTED }}>
                {TIER_EMOJI[r.tier] || ""} {r.tier}
              </div>
              <div style={{ display: "flex", fontSize: 44, fontWeight: 800, color: C.ORANGE, width: 100, justifyContent: "flex-end" }}>
                {r.overall}
              </div>
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
          <div style={{ fontSize: 22, color: C.MUTED }}>vibexforge.com/cracked/leaderboard</div>
          <div style={{ fontSize: 22, color: C.ORANGE }}>
            12-axis · Live from GitHub
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
