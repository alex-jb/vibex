/**
 * ForgeUnveil — 40-70s (30s). The dramatic centerpiece.
 *
 * Expands the 3.5s in-product forge-unveil animation over 30 seconds so
 * each beat can breathe. Matches app/project/[id]/page.tsx EvoSigil +
 * compound counter + AttrRow stagger, but slowed 8× for cinematic pacing.
 *
 * Timeline (within the 900-frame scene):
 *   0-60    (0-2s)  · Fade in from black. EvoSigil appears as grey Seed.
 *   60-300  (2-10s) · Frame color transitions Seed grey → Myth pink.
 *   300-540 (10-18s) · Compound score counts 0 → 92 on big yellow number.
 *   540-840 (18-28s) · 5 attribute bars fill one by one with labels.
 *   840-900 (28-30s) · Hold on final composition before CTA.
 *
 * TODO (round 2): import the actual <HeroCard variant="share" /> and pass
 * a Myth-tier project. For now: hand-composed layout that matches the
 * share card visuals bit-for-bit.
 */

import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Img,
  staticFile,
} from "remotion";
import { COLORS, STAGE_COLORS, FONT_PIXEL, FONT_RETRO, FONT_UI } from "../tokens";
import type { Locale } from "../Vibex";

const COMPOUND_TARGET = 92;
const ATTRS = [
  { code: "VIR", label: "Virality Potential", value: 99 },
  { code: "INV", label: "Investor Curiosity", value: 97 },
  { code: "ORG", label: "Originality", value: 89 },
  { code: "CLR", label: "Clarity", value: 85 },
  { code: "UXP", label: "UX Potential", value: 81 },
];

const COPY = {
  en: {
    compoundLabel: "COMPOUND SCORE",
    rankLabel: "RANK",
    topAttrs: "▸ ATTRIBUTES",
    tier: "MYTH TIER",
    name: "AGENTFORGE",
    creator: "by @orallexa",
    category: "AI AGENT",
  },
  zh: {
    compoundLabel: "综合分",
    rankLabel: "等级",
    topAttrs: "▸ 属性",
    tier: "神话 阶",
    name: "AGENTFORGE",
    creator: "作者 @orallexa",
    category: "AI 智能体",
  },
} as const;

export const ForgeUnveil = ({ locale }: { locale: Locale }) => {
  const frame = useCurrentFrame();
  const copy = COPY[locale];

  // Fade in 0-60f
  const sceneOpacity = interpolate(frame, [0, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Frame color transition 60-300f (Seed grey → Myth pink)
  const colorProgress = interpolate(frame, [60, 300], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const frameColor = lerpColor(
    STAGE_COLORS.Seed,
    STAGE_COLORS.Myth,
    colorProgress,
  );

  // Compound count-up 300-540f
  const compoundRaw = interpolate(frame, [300, 540], [0, COMPOUND_TARGET], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eased = 1 - Math.pow(1 - compoundRaw / COMPOUND_TARGET, 3); // cubic-out
  const compound = Math.round(eased * COMPOUND_TARGET);
  const rankVisible = frame > 420; // rank S+ appears halfway through compound

  return (
    <AbsoluteFill
      style={{
        background: COLORS.BG_DEEP,
        padding: 80,
        opacity: sceneOpacity,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          background: COLORS.BG_PANEL,
          border: `12px solid ${frameColor}`,
          boxShadow: `16px 16px 0 #000, 0 0 120px ${frameColor}55`,
          padding: 60,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 60,
        }}
      >
        {/* LEFT — portrait */}
        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          <div
            style={{
              fontFamily: FONT_UI,
              fontSize: 24,
              letterSpacing: 6,
              color: COLORS.NEON_GREEN,
              textShadow: `0 0 8px rgba(57,255,20,0.6)`,
            }}
          >
            [ C ] CLAUDE REVIEW
          </div>

          <div
            style={{
              flex: 1,
              background: COLORS.BG_DEEP,
              border: `6px solid ${frameColor}`,
              boxShadow: `inset 0 0 120px ${frameColor}22`,
              display: "grid",
              placeItems: "center",
              minHeight: 400,
              position: "relative",
            }}
          >
            <Img
              src={staticFile(
                frame > 180
                  ? "generated/evo-6-myth.png"
                  : "generated/evo-1-seed.png",
              )}
              style={{
                width: 400,
                height: 400,
                imageRendering: "pixelated",
                filter: `drop-shadow(0 0 48px ${frameColor}AA)`,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 24,
                left: 24,
                right: 24,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontFamily: FONT_PIXEL,
                fontSize: 22,
                color: frameColor,
                letterSpacing: 4,
              }}
            >
              <span>{copy.tier}</span>
              <span style={{ fontFamily: FONT_RETRO, color: COLORS.TEXT_MUTED }}>
                #002
              </span>
            </div>
          </div>

          <div>
            <div
              style={{
                fontFamily: FONT_PIXEL,
                fontSize: 56,
                color: COLORS.TEXT_CREAM,
                letterSpacing: 2,
                textShadow: "4px 4px 0 #000",
              }}
            >
              {copy.name}
            </div>
            <div
              style={{
                marginTop: 16,
                fontFamily: FONT_RETRO,
                fontSize: 40,
                color: COLORS.TEXT_MUTED,
              }}
            >
              {copy.creator}
              <span
                style={{
                  marginLeft: 20,
                  fontFamily: FONT_PIXEL,
                  fontSize: 20,
                  color: COLORS.NEON_PURPLE,
                  padding: "6px 14px",
                  background: "rgba(157,0,255,0.12)",
                  border: "2px solid rgba(157,0,255,0.4)",
                  letterSpacing: 2,
                }}
              >
                {copy.category}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT — stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 50 }}>
          <div
            style={{
              background: COLORS.BG_CARD,
              border: `6px solid ${COLORS.BORDER}`,
              padding: "40px 50px",
            }}
          >
            <div
              style={{
                fontFamily: FONT_PIXEL,
                fontSize: 22,
                letterSpacing: 6,
                color: COLORS.TEXT_MUTED,
                marginBottom: 20,
              }}
            >
              {copy.compoundLabel}
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 40 }}>
              <span
                style={{
                  fontFamily: FONT_PIXEL,
                  fontSize: 220,
                  color: COLORS.NEON_YELLOW,
                  lineHeight: 0.9,
                  textShadow: `10px 10px 0 #000, 0 0 48px rgba(250,204,21,0.4)`,
                }}
              >
                {compound}
              </span>
              <span
                style={{
                  fontFamily: FONT_RETRO,
                  fontSize: 64,
                  color: COLORS.TEXT_MUTED,
                  marginBottom: 20,
                }}
              >
                / 100
              </span>
              {rankVisible && (
                <div
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONT_PIXEL,
                      fontSize: 20,
                      letterSpacing: 5,
                      color: COLORS.TEXT_MUTED,
                    }}
                  >
                    {copy.rankLabel}
                  </span>
                  <span
                    style={{
                      fontFamily: FONT_PIXEL,
                      fontSize: 128,
                      color: COLORS.NEON_YELLOW,
                      lineHeight: 0.9,
                      letterSpacing: 4,
                      textShadow: `6px 6px 0 #000, 0 0 32px rgba(250,204,21,0.5)`,
                    }}
                  >
                    S+
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <div
              style={{
                fontFamily: FONT_PIXEL,
                fontSize: 22,
                letterSpacing: 5,
                color: COLORS.NEON_GREEN,
                marginBottom: 28,
              }}
            >
              {copy.topAttrs}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {ATTRS.map((attr, i) => {
                const attrStart = 540 + i * 60;
                const attrProgress = interpolate(
                  frame,
                  [attrStart, attrStart + 60],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                );
                const width = attrProgress * attr.value;
                return (
                  <div
                    key={attr.code}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "180px 1fr 100px",
                      alignItems: "center",
                      columnGap: 24,
                      opacity: attrProgress > 0 ? 1 : 0,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: FONT_PIXEL,
                          fontSize: 28,
                          color: COLORS.NEON_PURPLE,
                          letterSpacing: 3,
                        }}
                      >
                        {attr.code}
                      </div>
                      <div
                        style={{
                          fontFamily: FONT_RETRO,
                          fontSize: 22,
                          color: COLORS.TEXT_MUTED,
                        }}
                      >
                        {attr.label}
                      </div>
                    </div>
                    <div
                      style={{
                        height: 32,
                        background: COLORS.BG_DEEP,
                        border: `2px solid ${COLORS.BORDER}`,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${width}%`,
                          background: COLORS.NEON_PURPLE,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: FONT_RETRO,
                        fontSize: 56,
                        color: COLORS.NEON_PURPLE,
                        textAlign: "right",
                      }}
                    >
                      {Math.round(attrProgress * attr.value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Color lerp helper ─────────────────────────────────────────────────
function lerpColor(a: string, b: string, t: number): string {
  const ra = parseInt(a.slice(1, 3), 16);
  const ga = parseInt(a.slice(3, 5), 16);
  const ba = parseInt(a.slice(5, 7), 16);
  const rb = parseInt(b.slice(1, 3), 16);
  const gb = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);
  const r = Math.round(ra + (rb - ra) * t);
  const g = Math.round(ga + (gb - ga) * t);
  const bl = Math.round(ba + (bb - ba) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}
