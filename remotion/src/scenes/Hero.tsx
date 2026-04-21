/**
 * Hero — 0-8s opening hook.
 *
 * Visual: black background. L-corner frame closes in from offscreen (0-1s).
 * "You shipped." types in VT323 (1-3s). "Nobody clicked." appears offset (3-5s).
 * Forge ember glows in center (5-8s). Cut to LaunchFill.
 */

import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, FONT_PIXEL, FONT_RETRO } from "../tokens";
import type { Locale } from "../Vibex";

const COPY = {
  en: {
    line1: "You shipped.",
    line2: "Nobody clicked.",
  },
  zh: {
    line1: "你 ship 了。",
    line2: "没人点进来。",
  },
} as const;

export const Hero = ({ locale }: { locale: Locale }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const copy = COPY[locale];

  // L-corner frame slides in from 0-30f (0-1s) with spring bounce.
  const cornerProgress = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.7 },
    durationInFrames: 30,
  });
  const cornerOffset = interpolate(cornerProgress, [0, 1], [80, 0]);

  // Line 1 typing: 30-90f (1-3s).
  const line1Chars = Math.floor(
    interpolate(frame, [30, 90], [0, copy.line1.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const line1 = copy.line1.slice(0, line1Chars);

  // Line 2 typing: 100-160f (3.3-5.3s). Slightly offset dramatic pause.
  const line2Chars = Math.floor(
    interpolate(frame, [100, 160], [0, copy.line2.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const line2 = copy.line2.slice(0, line2Chars);

  // Forge ember grows from center 150-240f (5-8s).
  const emberScale = interpolate(frame, [150, 240], [0, 1.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const emberOpacity = interpolate(
    frame,
    [150, 200, 220, 240],
    [0, 0.6, 0.5, 0.3],
    { extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        background: COLORS.BG_DEEP,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Forge ember behind text */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(closest-side, ${COLORS.NEON_ORANGE}AA, transparent 70%)`,
          transform: `scale(${emberScale})`,
          opacity: emberOpacity,
          filter: "blur(30px)",
        }}
      />

      {/* L-corners — 4 explicit divs (unrolled because TS narrowing the
          as-const union is uglier than just writing the positions out). */}
      <div
        style={{
          position: "absolute",
          width: 80,
          height: 80,
          top: 80,
          left: 80,
          transform: `translate(${-cornerOffset}px, ${-cornerOffset}px)`,
          borderTop: `8px solid ${COLORS.NEON_ORANGE}`,
          borderLeft: `8px solid ${COLORS.NEON_ORANGE}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 80,
          height: 80,
          top: 80,
          right: 80,
          transform: `translate(${cornerOffset}px, ${-cornerOffset}px)`,
          borderTop: `8px solid ${COLORS.NEON_ORANGE}`,
          borderRight: `8px solid ${COLORS.NEON_ORANGE}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 80,
          height: 80,
          bottom: 80,
          left: 80,
          transform: `translate(${-cornerOffset}px, ${cornerOffset}px)`,
          borderBottom: `8px solid ${COLORS.NEON_ORANGE}`,
          borderLeft: `8px solid ${COLORS.NEON_ORANGE}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 80,
          height: 80,
          bottom: 80,
          right: 80,
          transform: `translate(${cornerOffset}px, ${cornerOffset}px)`,
          borderBottom: `8px solid ${COLORS.NEON_ORANGE}`,
          borderRight: `8px solid ${COLORS.NEON_ORANGE}`,
        }}
      />
      {/* cleanup hint: `spring` is imported for future sub-animations
          but only `cornerProgress` needs it today. */}

      {/* Copy */}
      <div
        style={{
          position: "relative",
          textAlign: "center",
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontFamily: FONT_PIXEL,
            fontSize: 96,
            color: COLORS.TEXT_CREAM,
            letterSpacing: 6,
            lineHeight: 1.15,
            textShadow: `6px 6px 0 #000, 0 0 40px ${COLORS.NEON_ORANGE}66`,
            marginBottom: 20,
          }}
        >
          {line1}
          <span style={{ opacity: frame % 30 < 15 ? 1 : 0 }}>_</span>
        </div>
        <div
          style={{
            fontFamily: FONT_RETRO,
            fontSize: 72,
            color: COLORS.TEXT_MUTED,
            letterSpacing: 2,
          }}
        >
          {line2}
        </div>
      </div>
    </AbsoluteFill>
  );
};
