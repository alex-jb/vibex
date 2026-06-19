import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "Idea Funeral — Memorial";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Funeral palette per docs/specs/2026-06-14-funeral-visual-upgrade-spec.md
const C = {
  PARCHMENT: "#F2E8D5",
  BURGUNDY:  "#4A1419",
  CANDLE:    "#FFE27D",
  SMOKE:     "#6b6258",
  INK:       "#1a0508",
};

async function loadMemorial(id: string) {
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!SUPA_URL || !SUPA_ANON_KEY) return null;
  const supa = createClient(SUPA_URL, SUPA_ANON_KEY);
  const { data } = await supa
    .from("idea_funerals")
    .select("deceased_name, category, age_when_buried, cause_of_death")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const cause = data.cause_of_death
    ? `died of ${(data.cause_of_death as string).replace(/_/g, " ")}`
    : "";
  return {
    deceased: data.deceased_name as string,
    category: (data.category as string) || "",
    age: (data.age_when_buried as string) || "",
    cause,
  };
}

// Cormorant Garamond TTF loaders — Satori requires TTF, not WOFF2
// per memory rule feedback_satori_ttf_not_woff2.md. Variable font with
// wght axis; Satori reads the weight option per font registration.
async function loadCormorant(italic: boolean): Promise<Buffer> {
  const filename = italic
    ? "CormorantGaramond-Italic-wght.ttf"
    : "CormorantGaramond-wght.ttf";
  const path = join(process.cwd(), "public", "fonts", filename);
  return readFile(path);
}

export default async function IdeaFuneralOG({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = await loadMemorial(id);

  const [cormorantItalic, cormorantRegular] = await Promise.all([
    loadCormorant(true),
    loadCormorant(false),
  ]);

  const fonts = [
    { name: "CormorantItalic",  data: cormorantItalic,  weight: 700 as const, style: "italic" as const },
    { name: "CormorantRegular", data: cormorantRegular, weight: 400 as const, style: "normal" as const },
  ];

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
            background: C.PARCHMENT,
            color: C.SMOKE,
            fontSize: 32,
            fontFamily: "CormorantRegular",
          }}
        >
          Memorial not found
        </div>
      ),
      { ...size, fonts },
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
          background: C.PARCHMENT,
          color: C.INK,
        }}
      >
        <div style={{ width: "100%", height: 24, background: C.BURGUNDY, display: "flex" }} />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 64px",
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: C.SMOKE,
              letterSpacing: 6,
              textTransform: "uppercase",
              fontFamily: "CormorantRegular",
              marginBottom: 18,
            }}
          >
            Funeral for an Idea
          </div>

          <div
            style={{
              fontSize: 80,
              fontFamily: "CormorantItalic",
              fontStyle: "italic",
              fontWeight: 700,
              color: C.BURGUNDY,
              lineHeight: 1.0,
              textAlign: "center",
              maxWidth: 1000,
              display: "flex",
              padding: "0 24px",
            }}
          >
            {m.deceased}
          </div>

          <div
            style={{
              width: 240,
              height: 2,
              background: C.CANDLE,
              marginTop: 28,
              marginBottom: 28,
              display: "flex",
            }}
          />

          <div
            style={{
              fontSize: 26,
              color: C.SMOKE,
              fontFamily: "CormorantRegular",
              textAlign: "center",
              display: "flex",
            }}
          >
            {m.category}{m.category && m.age ? "  ·  " : ""}{m.age}{(m.category || m.age) && m.cause ? "  ·  " : ""}{m.cause}
          </div>
        </div>

        <div
          style={{
            width: "100%",
            height: 24,
            background: C.BURGUNDY,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingRight: 32,
            color: C.PARCHMENT,
            fontSize: 14,
            fontFamily: "CormorantRegular",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          vibexforge.com/funeral/idea
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
