/**
 * MarketThesis — 20s (600 frames, scene-local 0-600).
 *
 * VC scene: positioning / thesis. Terminal CRT aesthetic. Two-line
 * thesis types out, then a macro stat grounds the opportunity size.
 * Intended as the "why now" slide between the mechanic moat and the
 * explicit ask.
 */

import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { COLORS, FONT_PIXEL, FONT_RETRO } from "../../tokens";
import type { Locale } from "../../Demo";

const EASE = Easing.bezier(0.2, 0.8, 0.1, 1);

const THESIS = {
  en: {
    line1: "AI made building easy.",
    line2: "VibeXForge makes growing inevitable.",
    prompt: "> thesis.txt",
    stat: {
      number: "1.3M",
      label: "AI projects launched · 2025",
      tail: "99% invisible within 24h.",
    },
  },
  zh: {
    line1: "AI 让 \"做出来\" 变简单。",
    line2: "VibeXForge 让 \"长起来\" 变必然。",
    prompt: "> thesis.txt",
    stat: {
      number: "130 万",
      label: "2025 年上线的 AI 项目",
      tail: "99% 在 24 小时内沉没。",
    },
  },
} as const;

export const MarketThesis = ({ locale }: { locale: Locale }) => {
  const frame = useCurrentFrame();
  const t = THESIS[locale];

  // Terminal prompt fades in.
  const promptOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Line 1 types out 40-130.
  const l1Chars = Math.floor(
    interpolate(frame, [40, 130], [0, t.line1.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  // Line 2 types out 170-290.
  const l2Chars = Math.floor(
    interpolate(frame, [170, 290], [0, t.line2.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  // Stat appears at 340.
  const statProgress = interpolate(frame, [340, 380], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  // Tail line fades in at 440.
  const tailOpacity = interpolate(frame, [440, 480], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: COLORS.BG_DEEP }}>
      {/* CRT scanline overlay over whole scene */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,0.25) 2px 3px)",
          pointerEvents: "none",
          zIndex: 5,
        }}
      />
      {/* CRT vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)",
          pointerEvents: "none",
          zIndex: 4,
        }}
      />
      {/* Ambient forge glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 40%, ${COLORS.NEON_ORANGE}22, transparent 60%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: 120,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 24,
        }}
      >
        {/* terminal prompt */}
        <div
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 24,
            color: COLORS.NEON_ORANGE,
            letterSpacing: 1,
            opacity: promptOpacity,
            marginBottom: 12,
          }}
        >
          {t.prompt}
        </div>

        {/* thesis line 1 */}
        <div
          style={{
            fontFamily: FONT_PIXEL,
            fontSize: 56,
            color: COLORS.TEXT_DIM,
            letterSpacing: 3,
            lineHeight: 1.3,
            textShadow: `3px 3px 0 ${COLORS.FORGE_DARK}`,
          }}
        >
          {t.line1.slice(0, l1Chars)}
          {l1Chars > 0 && l1Chars < t.line1.length && (
            <span style={{ opacity: frame % 12 < 6 ? 1 : 0 }}>_</span>
          )}
        </div>

        {/* thesis line 2 — the payoff, in forge-orange */}
        <div
          style={{
            fontFamily: FONT_PIXEL,
            fontSize: 60,
            color: COLORS.NEON_ORANGE,
            letterSpacing: 3,
            lineHeight: 1.3,
            textShadow: `0 0 30px ${COLORS.NEON_ORANGE}88, 4px 4px 0 #000`,
          }}
        >
          {t.line2.slice(0, l2Chars)}
          {l2Chars > 0 && l2Chars < t.line2.length && (
            <span style={{ opacity: frame % 12 < 6 ? 1 : 0 }}>_</span>
          )}
        </div>

        {/* macro stat, right-aligned at the bottom */}
        <div
          style={{
            marginTop: 64,
            opacity: statProgress,
            transform: `translateY(${interpolate(statProgress, [0, 1], [20, 0])}px)`,
            display: "flex",
            alignItems: "baseline",
            gap: 32,
            paddingTop: 32,
            borderTop: `1px solid ${COLORS.BORDER}`,
          }}
        >
          <div
            style={{
              fontFamily: FONT_RETRO,
              fontSize: 110,
              color: COLORS.FORGE_CREAM,
              letterSpacing: 2,
              textShadow: `0 0 30px ${COLORS.NEON_ORANGE}AA`,
              lineHeight: 1,
            }}
          >
            {t.stat.number}
          </div>
          <div
            style={{
              fontFamily: FONT_PIXEL,
              fontSize: 18,
              color: COLORS.TEXT_MUTED,
              letterSpacing: 3,
            }}
          >
            {t.stat.label}
          </div>
        </div>

        {/* tail line */}
        <div
          style={{
            fontFamily: FONT_RETRO,
            fontSize: 32,
            color: "#ff3b3b",
            letterSpacing: 1,
            opacity: tailOpacity,
            marginTop: 12,
          }}
        >
          ▸ {t.stat.tail}
        </div>
      </div>
    </AbsoluteFill>
  );
};
