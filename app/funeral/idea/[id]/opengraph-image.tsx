import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const alt = "Idea Funeral — Memorial";
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

async function loadMemorial(id: string) {
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!SUPA_URL || !SUPA_ANON_KEY) return null;
  const supa = createClient(SUPA_URL, SUPA_ANON_KEY);
  const { data } = await supa
    .from("idea_funerals")
    .select("deceased_name, category, age_when_buried, eulogy")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return {
    deceased: data.deceased_name as string,
    category: (data.category as string) || "",
    age: (data.age_when_buried as string) || "",
    snippet: ((data.eulogy as string) || "").split(".")[0] + ".",
  };
}

export default async function IdeaFuneralOG({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = await loadMemorial(id);
  if (!m) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: C.BG,
            color: C.MUTED,
            fontSize: 32,
            fontFamily: "ui-sans-serif",
          }}
        >
          💭 Memorial not found
        </div>
      ),
      { ...size },
    );
  }
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
          fontFamily: "ui-serif, Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 56 }}>💭</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 22, color: C.MUTED, letterSpacing: 4, textTransform: "uppercase" }}>
              Funeral for an Idea
            </div>
            <div style={{ fontSize: 18, color: C.MUTED }}>vibexforge.com/funeral/idea</div>
          </div>
        </div>

        <div style={{ marginTop: 36, fontSize: 76, fontWeight: 700, lineHeight: 1.1, display: "flex" }}>
          {m.deceased}
        </div>

        <div style={{ marginTop: 12, fontSize: 26, color: C.MUTED, display: "flex" }}>
          {m.category && `${m.category}`}
          {m.age && (m.category ? ` · ${m.age}` : m.age)}
        </div>

        <div
          style={{
            marginTop: 36,
            padding: 32,
            background: C.PANEL,
            borderRadius: 24,
            border: `2px solid ${C.BORDER}`,
            fontSize: 30,
            lineHeight: 1.4,
            fontStyle: "italic",
            color: C.TEXT,
            display: "flex",
          }}
        >
          &ldquo;{m.snippet.slice(0, 220)}&rdquo;
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: C.MUTED,
          }}
        >
          <div>Every founder has 100 of these. Closure shouldn&apos;t be scarce.</div>
          <div style={{ color: C.ORANGE }}>vibexforge.com/funeral/idea →</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
