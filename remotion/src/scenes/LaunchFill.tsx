/**
 * LaunchFill — 8-25s (17s).
 *
 * TODO (Alex + Claude round 2): port the forge-plate form UI from
 * app/launch/page.tsx into a static composition. Type text into each
 * plate on a staggered schedule so they heat from grey → orange one by
 * one. Show the live HeroCard preview on the right populating as text
 * appears. End with cursor hovering over STRIKE THE ANVIL.
 *
 * For now: placeholder scene with the 5-line intent so the composition
 * still renders end-to-end at 90s.
 */

import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONT_PIXEL, FONT_RETRO } from "../tokens";
import type { Locale } from "../Vibex";

const COPY = {
  en: {
    heading: "FILL THE FORGE PLATES",
    lines: [
      "▸ Project title",
      "▸ Tagline",
      "▸ Description",
      "▸ Category",
      "▸ Demo type",
    ],
    caption: "Plates heat orange as they fill. Live preview builds on the right.",
  },
  zh: {
    heading: "填满锻造板",
    lines: [
      "▸ 项目标题",
      "▸ 标语",
      "▸ 描述",
      "▸ 类别",
      "▸ 演示类型",
    ],
    caption: "填好一格,锻板变橙。右侧预览实时成型。",
  },
} as const;

export const LaunchFill = ({ locale }: { locale: Locale }) => {
  const frame = useCurrentFrame();
  const copy = COPY[locale];

  const headingOpacity = interpolate(frame, [0, 20, 450, 510], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.BG_DEEP,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
      }}
    >
      <div
        style={{
          fontFamily: FONT_PIXEL,
          fontSize: 44,
          color: COLORS.NEON_ORANGE,
          letterSpacing: 6,
          textShadow: `0 0 20px ${COLORS.NEON_ORANGE}66`,
          marginBottom: 40,
          opacity: headingOpacity,
        }}
      >
        {copy.heading}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          fontFamily: FONT_PIXEL,
          fontSize: 28,
          opacity: headingOpacity,
        }}
      >
        {copy.lines.map((line, i) => {
          const start = 30 + i * 60;
          const lit = frame > start;
          return (
            <div
              key={line}
              style={{
                padding: "16px 32px",
                border: `3px solid ${lit ? COLORS.NEON_ORANGE : COLORS.BORDER}`,
                background: lit
                  ? `linear-gradient(180deg, ${COLORS.BG_PANEL}, ${COLORS.BG_DEEP})`
                  : COLORS.BG_PANEL,
                color: lit ? COLORS.NEON_ORANGE : COLORS.TEXT_DIM,
                minWidth: 600,
                letterSpacing: 2,
                boxShadow: lit ? `4px 4px 0 #000` : `4px 4px 0 rgba(0,0,0,0.5)`,
                transition: "all 0.3s ease",
              }}
            >
              {line}
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 60,
          fontFamily: FONT_RETRO,
          fontSize: 32,
          color: COLORS.TEXT_MUTED,
          opacity: headingOpacity,
        }}
      >
        {copy.caption}
      </div>
    </AbsoluteFill>
  );
};
