/**
 * Caption — bilingual burn-in subtitle (shared across demo scenes).
 *
 * Caller passes scene-local in/out frames. Fade-in 8 frames (0.27s),
 * fade-out 8 frames. Rest is hold. Primary locale string shows large;
 * the other is a thin secondary line beneath (can be hidden).
 *
 * Matches `captions/en.srt` + `captions/zh.srt` timings — do not desync.
 */

import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONT_PIXEL, FONT_RETRO } from "../../tokens";
import type { Locale } from "../../Demo";

type CaptionProps = {
  locale: Locale;
  en: string;
  zh: string;
  inFrame?: number;
  outFrame: number;
  showSecondary?: boolean;
};

export const Caption = ({
  locale,
  en,
  zh,
  inFrame = 0,
  outFrame,
  showSecondary = true,
}: CaptionProps) => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [inFrame, inFrame + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [outFrame - 8, outFrame], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);

  if (opacity <= 0) return null;

  const primary = locale === "zh" ? zh : en;
  const secondary = locale === "zh" ? en : zh;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 64,
        zIndex: 50,
      }}
    >
      <div
        style={{
          opacity,
          textAlign: "center",
          maxWidth: "82%",
          padding: "20px 44px",
          background: "rgba(0, 0, 0, 0.62)",
          border: `2px solid ${COLORS.NEON_ORANGE_DIM}`,
          boxShadow: `0 0 40px ${COLORS.NEON_ORANGE}33, inset 0 0 0 1px rgba(255,255,255,0.04)`,
        }}
      >
        <div
          style={{
            fontFamily: FONT_PIXEL,
            fontSize: 44,
            color: COLORS.TEXT_CREAM,
            textShadow: `3px 3px 0 #000, 0 0 16px ${COLORS.NEON_ORANGE}AA`,
            letterSpacing: 3,
            lineHeight: 1.25,
          }}
        >
          {primary}
        </div>
        {showSecondary && (
          <div
            style={{
              fontFamily: FONT_RETRO,
              fontSize: 26,
              color: COLORS.TEXT_MUTED,
              letterSpacing: 1,
              marginTop: 8,
              opacity: 0.7,
            }}
          >
            {secondary}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
