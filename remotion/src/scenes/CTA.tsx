/**
 * CTA — 70-90s (20s). Close scene.
 *
 * Visual: big pixel title "VibeX" with gold gradient. vibexforge.com URL
 * in large VT323. A QR code for the launch URL (rendered client-side via
 * qrcode.react or baked in as an SVG). Held on screen for 20s so Product
 * Hunt viewers have time to copy the URL.
 *
 * TODO (round 2): add the VibeX logomark (mascot-v1.png) animating in
 * from bottom. Add QR code generation.
 */

import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONT_PIXEL, FONT_RETRO } from "../tokens";
import type { Locale } from "../Vibex";

const COPY = {
  en: {
    tagline: "Launch your AI project.",
    subtitle: "Claude scores it. You forge it. It evolves.",
    url: "vibexforge.com",
  },
  zh: {
    tagline: "发布你的 AI 项目。",
    subtitle: "Claude 打分,你来锻造,它会进化。",
    url: "vibexforge.com",
  },
} as const;

export const CTA = ({ locale }: { locale: Locale }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const copy = COPY[locale];

  const titleScale = spring({
    frame,
    fps,
    config: { damping: 10, mass: 0.8 },
    durationInFrames: 30,
  });

  const taglineOpacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const urlOpacity = interpolate(frame, [60, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // URL pulse — subtle orange glow throb to draw eyes
  const urlGlow = 0.4 + 0.2 * Math.sin(frame * 0.08);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.BG_DEEP,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
      }}
    >
      {/* Forge ember behind everything */}
      <div
        style={{
          position: "absolute",
          width: 1400,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(closest-side, ${COLORS.NEON_ORANGE}55, transparent 70%)`,
          filter: "blur(80px)",
        }}
      />

      {/* VibeX wordmark */}
      <div
        style={{
          fontFamily: FONT_PIXEL,
          fontSize: 200,
          letterSpacing: 12,
          transform: `scale(${titleScale})`,
          background: `linear-gradient(180deg, ${COLORS.FORGE_CREAM} 0%, ${COLORS.NEON_YELLOW} 40%, #B8860B 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(8px 8px 0 #000) drop-shadow(0 0 40px rgba(250,204,21,0.5))",
        }}
      >
        VibeX
      </div>

      {/* Tagline */}
      <div
        style={{
          fontFamily: FONT_PIXEL,
          fontSize: 44,
          letterSpacing: 4,
          color: COLORS.TEXT_CREAM,
          textShadow: "4px 4px 0 #000",
          opacity: taglineOpacity,
          textAlign: "center",
        }}
      >
        {copy.tagline}
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontFamily: FONT_RETRO,
          fontSize: 56,
          color: COLORS.TEXT_MUTED,
          opacity: taglineOpacity,
          textAlign: "center",
        }}
      >
        {copy.subtitle}
      </div>

      {/* URL with subtle pulse */}
      <div
        style={{
          fontFamily: FONT_PIXEL,
          fontSize: 80,
          letterSpacing: 6,
          color: COLORS.NEON_ORANGE,
          textShadow: `6px 6px 0 #000, 0 0 ${60 * urlGlow}px ${COLORS.NEON_ORANGE}`,
          opacity: urlOpacity,
          marginTop: 60,
        }}
      >
        {copy.url}
      </div>
    </AbsoluteFill>
  );
};
