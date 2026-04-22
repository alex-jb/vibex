/**
 * Differentiation — 38-48s (300 frames, scene-local 0-300).
 *
 * Black frame. Three feature cards stagger-fade in, each with a pixel
 * icon above the label. Mascot-v1.png walks across the bottom carrying
 * the hammer (subtle callback to Reveal scene).
 */

import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Easing,
} from "remotion";
import { COLORS, FONT_PIXEL, FONT_RETRO } from "../../tokens";
import { Caption } from "./Caption";
import type { Locale } from "../../Demo";

const EASE = Easing.bezier(0.2, 0.8, 0.1, 1);

const CARDS = {
  en: [
    { tag: "SOLO-BUILT", sub: "one dev · built in public", icon: "◉" },
    { tag: "OPEN SOURCE", sub: "MIT on GitHub", icon: "⬢" },
    { tag: "FREE", sub: "zero-dollar launch", icon: "∞" },
  ],
  zh: [
    { tag: "一人做的", sub: "solo 独立开发", icon: "◉" },
    { tag: "开源", sub: "GitHub · MIT", icon: "⬢" },
    { tag: "免费", sub: "零成本上线", icon: "∞" },
  ],
};

export const Differentiation = ({ locale }: { locale: Locale }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cards = CARDS[locale];

  // Each card enters at its own stagger: 20, 50, 80.
  const cardProgress = (idx: number) => {
    const start = 20 + idx * 30;
    return spring({
      frame: frame - start,
      fps,
      config: { damping: 14, mass: 0.6 },
      durationInFrames: 24,
    });
  };

  // Mascot walks left-to-right across the bottom, frames 60-270.
  const mascotWalk = interpolate(frame, [60, 270], [-200, 2120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.linear,
  });
  // Mascot bobs up-down as if walking.
  const mascotBob = Math.sin(frame * 0.35) * 8;
  // Horizontal flip happens at the end.
  const mascotVisible = interpolate(frame, [54, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.BG_DEEP,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Subtle grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${COLORS.BORDER_HAIR} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.BORDER_HAIR} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          opacity: 0.7,
        }}
      />

      {/* 3-card triptych */}
      <div
        style={{
          display: "flex",
          gap: 48,
          position: "relative",
          zIndex: 2,
        }}
      >
        {cards.map((card, i) => {
          const p = cardProgress(i);
          const translateY = interpolate(p, [0, 1], [40, 0]);
          return (
            <div
              key={i}
              style={{
                opacity: p,
                transform: `translateY(${translateY}px)`,
                width: 360,
                height: 380,
                padding: 36,
                background: COLORS.BG_CARD,
                border: `2px solid ${COLORS.NEON_ORANGE_DIM}`,
                boxShadow: `0 30px 60px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.04), 0 0 40px ${COLORS.NEON_ORANGE}22`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 24,
              }}
            >
              <div
                style={{
                  fontSize: 100,
                  color: COLORS.NEON_ORANGE,
                  textShadow: `0 0 30px ${COLORS.NEON_ORANGE}, 4px 4px 0 #000`,
                  lineHeight: 1,
                }}
              >
                {card.icon}
              </div>
              <div
                style={{
                  fontFamily: FONT_PIXEL,
                  fontSize: 28,
                  color: COLORS.TEXT_CREAM,
                  letterSpacing: 4,
                  textShadow: `3px 3px 0 #000`,
                  textAlign: "center",
                  lineHeight: 1.2,
                }}
              >
                {card.tag}
              </div>
              <div
                style={{
                  fontFamily: FONT_RETRO,
                  fontSize: 22,
                  color: COLORS.TEXT_MUTED,
                  letterSpacing: 1,
                  textAlign: "center",
                }}
              >
                {card.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mascot walking across below the cards — above the caption band */}
      <div
        style={{
          position: "absolute",
          bottom: 220,
          left: 0,
          opacity: mascotVisible,
          transform: `translate(${mascotWalk}px, ${mascotBob}px)`,
          imageRendering: "pixelated",
        }}
      >
        <Img
          src={staticFile("generated/mascot-v1.png")}
          style={{
            width: 140,
            height: 140,
            imageRendering: "pixelated",
            filter: `drop-shadow(0 8px 0 rgba(0,0,0,0.5))`,
          }}
        />
      </div>

      <Caption
        locale={locale}
        en="Solo-built. Open source. Free."
        zh="一人做的 开源 免费"
        inFrame={24}
        outFrame={300}
      />
    </AbsoluteFill>
  );
};
