import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

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

const TIER_EMOJI: Record<string, string> = {
  mythic: "👑",
  cracked: "⚡",
  solid: "💪",
  rising: "🌱",
  starting: "🥚",
};

interface ScoreRow {
  github_handle: string;
  overall: number;
  tier: string;
  total_stars: number;
  total_repos: number;
  followers: number;
}

async function load(handle: string): Promise<ScoreRow | null> {
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!SUPA_URL || !SUPA_ANON_KEY) return null;
  const supa = createClient(SUPA_URL, SUPA_ANON_KEY);
  const { data } = await supa
    .from("cracked_scores")
    .select("github_handle, overall, tier, total_stars, total_repos, followers")
    .eq("github_handle", handle.toLowerCase())
    .maybeSingle();
  return (data as ScoreRow | null) || null;
}

export default async function CrackedOG({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle: rawHandle } = await params;
  const row = await load(rawHandle);
  const handle = row?.github_handle ?? rawHandle;
  const overall = row?.overall ?? 0;
  const tierName = row?.tier ?? "starting";
  const tierEmoji = TIER_EMOJI[tierName] ?? "🥚";
  const totalStars = row?.total_stars ?? 0;
  const totalRepos = row?.total_repos ?? 0;
  const followers = row?.followers ?? 0;

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
            <div style={{ display: "flex", fontSize: 24, color: C.MUTED, letterSpacing: 6, textTransform: "uppercase" }}>
              Cracked Score · VibeXForge
            </div>
            <div style={{ display: "flex", fontSize: 72, fontWeight: 800, marginTop: 8 }}>@{handle}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", fontSize: 120 }}>{tierEmoji}</div>
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
            <div style={{ display: "flex", fontSize: 28, color: C.MUTED }}>OVERALL</div>
            <div style={{ display: "flex", fontSize: 120, fontWeight: 800, color: C.ORANGE, lineHeight: 1 }}>
              {overall}
            </div>
            <div style={{ display: "flex", fontSize: 22, color: C.MUTED }}>/ 100</div>
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
            {tierName}
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
              <div style={{ display: "flex", fontSize: 52, fontWeight: 800 }}>{b.v.toLocaleString()}</div>
              <div style={{ display: "flex", fontSize: 20, color: C.MUTED, marginTop: 6 }}>{b.label}</div>
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
          <div style={{ display: "flex", fontSize: 22, color: C.MUTED }}>vibexforge.com/cracked/{handle}</div>
          <div style={{ display: "flex", fontSize: 22, color: C.ORANGE }}>
            12-axis dev profile score
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
