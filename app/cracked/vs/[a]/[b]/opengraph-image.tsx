import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const alt = "Cracked Score — Head-to-Head";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const C = {
  BG: "#0A0A0A",
  PANEL: "#161619",
  PANEL_WIN: "#1f1408",
  BORDER: "#3A3A42",
  BORDER_WIN: "#F97316",
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

async function load(handle: string): Promise<Row | null> {
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!SUPA_URL || !SUPA_ANON_KEY) return null;
  const supa = createClient(SUPA_URL, SUPA_ANON_KEY);
  const { data } = await supa
    .from("cracked_scores")
    .select("github_handle, overall, tier")
    .eq("github_handle", handle.toLowerCase())
    .maybeSingle();
  return (data as Row | null) || null;
}

export default async function CrackedVsOG({
  params,
}: {
  params: Promise<{ a: string; b: string }>;
}) {
  const { a: rawA, b: rawB } = await params;
  const [rowA, rowB] = await Promise.all([load(rawA), load(rawB)]);
  const aOverall = rowA?.overall ?? 0;
  const bOverall = rowB?.overall ?? 0;
  const aHandle = rowA?.github_handle ?? rawA;
  const bHandle = rowB?.github_handle ?? rawB;
  const aTier = rowA?.tier ?? "starting";
  const bTier = rowB?.tier ?? "starting";
  const aTierEmoji = TIER_EMOJI[aTier] ?? "🥚";
  const bTierEmoji = TIER_EMOJI[bTier] ?? "🥚";
  const aWin = aOverall > bOverall;
  const bWin = bOverall > aOverall;
  const margin = Math.abs(aOverall - bOverall);

  const panel = (
    handle: string,
    overall: number,
    tierName: string,
    tierEmoji: string,
    won: boolean,
  ) => (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        background: won ? C.PANEL_WIN : C.PANEL,
        borderRadius: 24,
        border: `3px solid ${won ? C.BORDER_WIN : C.BORDER}`,
      }}
    >
      <div style={{ display: "flex", fontSize: 36, fontWeight: 700, marginBottom: 8 }}>
        @{handle}
      </div>
      <div style={{ display: "flex", fontSize: 56, marginBottom: 8 }}>{tierEmoji}</div>
      <div
        style={{
          display: "flex",
          fontSize: 140,
          fontWeight: 800,
          color: C.ORANGE,
          lineHeight: 1,
        }}
      >
        {overall}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 12,
          padding: "8px 20px",
          borderRadius: 999,
          background: won ? C.ORANGE : C.BORDER,
          color: won ? "#0A0A0A" : C.MUTED,
          fontSize: 24,
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        {tierName}
      </div>
    </div>
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: C.BG,
          padding: 48,
          color: C.TEXT,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", fontSize: 22, color: C.MUTED, letterSpacing: 6, textTransform: "uppercase" }}>
            Cracked Score · Head-to-Head
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, gap: 20, alignItems: "stretch" }}>
          {panel(aHandle, aOverall, aTier, aTierEmoji, aWin)}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 48,
              fontWeight: 800,
              color: C.MUTED,
            }}
          >
            <div style={{ display: "flex" }}>VS</div>
            {margin > 0 && (
              <div style={{ display: "flex", marginTop: 12, fontSize: 22, color: C.ORANGE }}>
                +{margin}
              </div>
            )}
          </div>
          {panel(bHandle, bOverall, bTier, bTierEmoji, bWin)}
        </div>

        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", fontSize: 20, color: C.MUTED }}>
            vibexforge.com/cracked/vs/{aHandle}/{bHandle}
          </div>
          <div style={{ display: "flex", fontSize: 20, color: C.ORANGE }}>
            12-axis · Live from GitHub
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
