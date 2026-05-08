import { ImageResponse } from "next/og";
import { projects } from "@/lib/mock-data";
import {
  EVOLUTION_CONFIG,
  RANK_BY_STAGE,
  pickTopAttrs,
  computeEvolutionStage,
} from "@/lib/rpg-utils";
import type { EvolutionStage } from "@/lib/types";

export const runtime = "edge";
export const alt = "VibeX Project — Claude Review";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SITE = "https://vibexforge.com";

const SPRITE_FILE: Record<EvolutionStage, string> = {
  Seed: "/generated/evo-1-seed.png",
  Active: "/generated/evo-2-active.png",
  Growing: "/generated/evo-3-growing.png",
  Breakout: "/generated/evo-4-breakout.png",
  Legend: "/generated/evo-5-legend.png",
  Myth: "/generated/evo-6-myth.png",
};

// Palette (satori can't resolve CSS vars — inline hex only).
const C = {
  BG_DEEP: "#0D0D0D",
  BG_PANEL: "#111114",
  BG_CARD: "#161619",
  BORDER: "#3A3A42",
  TEXT: "#E8E8EC",
  MUTED: "#8B7AA0",
  DIM: "#4A4050",
  GREEN: "#39FF14",
  ORANGE: "#F97316",
  PURPLE: "#9D00FF",
  YELLOW: "#FACC15",
};

async function loadGoogleFont(family: string, weight = 400): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family,
  )}:wght@${weight}&display=swap`;
  const css = await (await fetch(url)).text();
  const match = css.match(/src:\s*url\(([^)]+)\)\s*format\(['"](?:opentype|truetype)['"]\)/);
  if (!match) throw new Error(`font src not found: ${family}`);
  const res = await fetch(match[1]);
  return res.arrayBuffer();
}

type Shape = {
  title: string;
  creator: string;
  category: string;
  stage: EvolutionStage;
  compound: number;
  rank: string;
  top: Array<{ code: string; label: string; value: number }>;
  traction: { glyph: string; label: string; value: string };
  sprite: string;
  idTail: string;
};

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
}

function computeShape(id: string): Shape {
  const p = projects.find((x) => x.id === id);
  if (!p) {
    return {
      title: "VibeX Project",
      creator: "anon",
      category: "AI TOOL",
      stage: "Seed",
      compound: 0,
      rank: "D",
      top: [
        { code: "ORG", label: "Originality", value: 0 },
        { code: "CLR", label: "Clarity", value: 0 },
      ],
      traction: { glyph: "▲", label: "PLAYS", value: "0" },
      sprite: `${SITE}${SPRITE_FILE.Seed}`,
      idTail: (id || "000").slice(-3).toUpperCase(),
    };
  }
  const stage: EvolutionStage =
    (p.hero?.evolutionStage as EvolutionStage | undefined) ??
    computeEvolutionStage(p);
  const topAttrs = pickTopAttrs(p.aiReview, 2);
  const traction =
    p.plays >= p.upvotes * 10
      ? { glyph: "▲", label: "PLAYS", value: fmt(p.plays) }
      : p.upvotes >= p.shares
        ? { glyph: "★", label: "UPVOTES", value: fmt(p.upvotes) }
        : { glyph: "◉", label: "SHARES", value: fmt(p.shares) };
  const idTail = p.id.replace(/[^a-zA-Z0-9]/g, "").slice(-3).toUpperCase().padStart(3, "0");
  return {
    title: p.title,
    creator: p.creatorName || "anon",
    category: p.category.toUpperCase(),
    stage,
    compound: p.score,
    rank: RANK_BY_STAGE[stage],
    top: topAttrs,
    traction,
    sprite: `${SITE}${SPRITE_FILE[stage]}`,
    idTail,
  };
}

function Bar({ value, evoColor: _evoColor }: { value: number; evoColor: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      style={{
        display: "flex",
        height: 16,
        background: C.BG_DEEP,
        border: `1px solid ${C.BORDER}`,
        position: "relative",
        overflow: "hidden",
        flex: 1,
      }}
    >
      <div
        style={{
          display: "flex",
          height: "100%",
          width: `${v}%`,
          background: C.PURPLE,
        }}
      />
    </div>
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = computeShape(id);
  const evoColor = EVOLUTION_CONFIG[s.stage].color;

  const [pressStart, vt323] = await Promise.all([
    loadGoogleFont("Press Start 2P", 400),
    loadGoogleFont("VT323", 400),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: C.BG_PANEL,
          border: `6px solid ${evoColor}`,
          padding: 48,
          color: C.TEXT,
          position: "relative",
          fontFamily: "VT323",
        }}
      >
        {/* L-corners */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            width: 28,
            height: 28,
            top: -2,
            left: -2,
            borderTop: `5px solid ${C.ORANGE}`,
            borderLeft: `5px solid ${C.ORANGE}`,
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            width: 28,
            height: 28,
            top: -2,
            right: -2,
            borderTop: `5px solid ${C.ORANGE}`,
            borderRight: `5px solid ${C.ORANGE}`,
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            width: 28,
            height: 28,
            bottom: -2,
            left: -2,
            borderBottom: `5px solid ${C.ORANGE}`,
            borderLeft: `5px solid ${C.ORANGE}`,
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            width: 28,
            height: 28,
            bottom: -2,
            right: -2,
            borderBottom: `5px solid ${C.ORANGE}`,
            borderRight: `5px solid ${C.ORANGE}`,
          }}
        />

        {/* LEFT — portrait column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            gap: 20,
            marginRight: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 18,
              letterSpacing: 4,
              color: C.GREEN,
              fontFamily: "Press Start 2P",
            }}
          >
            <span>[ C ]</span>
            <span>CLAUDE REVIEW</span>
          </div>

          <div
            style={{
              display: "flex",
              flex: 1,
              position: "relative",
              background: C.BG_DEEP,
              border: `4px solid ${evoColor}`,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <img
              src={s.sprite}
              alt=""
              width={300}
              height={300}
              style={{ imageRendering: "pixelated" }}
            />
            <div
              style={{
                display: "flex",
                position: "absolute",
                bottom: 16,
                left: 16,
                right: 16,
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "Press Start 2P",
                  fontSize: 14,
                  color: evoColor,
                  letterSpacing: 2,
                }}
              >
                {s.stage.toUpperCase()} TIER
              </span>
              <span style={{ fontFamily: "VT323", fontSize: 20, color: C.MUTED }}>
                #{s.idTail}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                fontFamily: "Press Start 2P",
                fontSize: 32,
                color: C.TEXT,
                letterSpacing: 1,
                lineHeight: 1.15,
              }}
            >
              {s.title}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                fontFamily: "VT323",
                fontSize: 26,
                color: C.MUTED,
              }}
            >
              <span>by</span>
              <span style={{ color: C.TEXT }}>@{s.creator}</span>
              <span
                style={{
                  display: "flex",
                  fontFamily: "Press Start 2P",
                  fontSize: 12,
                  color: C.PURPLE,
                  letterSpacing: 2,
                  padding: "6px 10px",
                  border: `2px solid ${C.PURPLE}`,
                  background: "rgba(157,0,255,0.1)",
                  marginLeft: 8,
                }}
              >
                {s.category}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT — stat column */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 28 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: C.BG_CARD,
              border: `3px solid ${C.BORDER}`,
              padding: 28,
            }}
          >
            <div
              style={{
                fontFamily: "Press Start 2P",
                fontSize: 12,
                letterSpacing: 4,
                color: C.MUTED,
                marginBottom: 18,
              }}
            >
              COMPOUND SCORE
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <span
                style={{
                  fontFamily: "Press Start 2P",
                  fontSize: 120,
                  color: C.YELLOW,
                  lineHeight: 0.9,
                }}
              >
                {s.compound}
              </span>
              <span
                style={{
                  fontFamily: "VT323",
                  fontSize: 36,
                  color: C.MUTED,
                  marginLeft: 10,
                  marginBottom: 8,
                }}
              >
                / 100
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginLeft: "auto",
                  alignItems: "flex-end",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    fontFamily: "Press Start 2P",
                    fontSize: 11,
                    letterSpacing: 3,
                    color: C.MUTED,
                  }}
                >
                  RANK
                </span>
                <span
                  style={{
                    fontFamily: "Press Start 2P",
                    fontSize: 72,
                    color: C.YELLOW,
                    lineHeight: 0.9,
                    letterSpacing: 2,
                  }}
                >
                  {s.rank}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                fontFamily: "Press Start 2P",
                fontSize: 12,
                letterSpacing: 3,
                color: C.GREEN,
              }}
            >
              {"▸"} TOP ATTRIBUTES
            </div>
            {s.top.map((a) => (
              <div
                key={a.code}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", width: 96 }}>
                  <span
                    style={{
                      fontFamily: "Press Start 2P",
                      fontSize: 14,
                      color: C.PURPLE,
                      letterSpacing: 2,
                    }}
                  >
                    {a.code}
                  </span>
                  <span
                    style={{
                      fontFamily: "VT323",
                      fontSize: 16,
                      color: C.MUTED,
                    }}
                  >
                    {a.label}
                  </span>
                </div>
                <Bar value={a.value} evoColor={evoColor} />
                <span
                  style={{
                    fontFamily: "VT323",
                    fontSize: 36,
                    color: C.PURPLE,
                    width: 56,
                    textAlign: "right",
                  }}
                >
                  {a.value}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "auto",
              paddingTop: 18,
              borderTop: `1px solid ${C.BORDER}`,
              gap: 16,
            }}
          >
            <span style={{ fontSize: 32, color: evoColor }}>{s.traction.glyph}</span>
            <span
              style={{
                fontFamily: "Press Start 2P",
                fontSize: 22,
                color: C.TEXT,
              }}
            >
              {s.traction.value}
            </span>
            <span
              style={{
                fontFamily: "Press Start 2P",
                fontSize: 12,
                letterSpacing: 3,
                color: C.MUTED,
              }}
            >
              {s.traction.label}
            </span>
            <span
              style={{
                display: "flex",
                marginLeft: "auto",
                fontFamily: "Press Start 2P",
                fontSize: 14,
                letterSpacing: 3,
                color: C.GREEN,
              }}
            >
              VIBEXFORGE.COM
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Press Start 2P", data: pressStart, weight: 400, style: "normal" },
        { name: "VT323", data: vt323, weight: 400, style: "normal" },
      ],
    },
  );
}
