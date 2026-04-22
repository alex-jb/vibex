/**
 * VCCTAAsk — 32s (960 frames, scene-local 0-960).
 *
 * VC-specific closer. Replaces CTAForge for the DemoVC composition.
 * Three "WHAT I'M LOOKING FOR" cards (seed / design partner / advisor),
 * then contact info types in, then hold on a clean close card with
 * URL + mascot pointing.
 */

import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { COLORS, FONT_PIXEL, FONT_RETRO } from "../../tokens";
import type { Locale } from "../../Demo";

const EASE = Easing.bezier(0.2, 0.8, 0.1, 1);

const COPY = {
  en: {
    header: "▸ WHAT I'M LOOKING FOR",
    cards: [
      { tag: "SEED", sub: "pre-seed to seed · $250K–$1M", icon: "◉" },
      { tag: "DESIGN PARTNER", sub: "AI maker · ship alongside us", icon: "⬢" },
      { tag: "ADVISOR", sub: "growth, community, gamification", icon: "✦" },
    ],
    contact: [
      { label: "SITE", value: "vibexforge.com/investors" },
      { label: "EMAIL", value: "xji1@mail.yu.edu" },
      { label: "GITHUB", value: "alex-jb/vibex" },
    ],
    closer: "▶ email to book 15 min",
    closerUrl: "xji1@mail.yu.edu",
  },
  zh: {
    header: "▸ 我在找什么",
    cards: [
      { tag: "SEED 投资", sub: "pre-seed 到 seed · $250K–$1M", icon: "◉" },
      { tag: "DESIGN PARTNER", sub: "AI 创作者 · 一起 ship", icon: "⬢" },
      { tag: "顾问", sub: "增长 · 社区 · 游戏化", icon: "✦" },
    ],
    contact: [
      { label: "网站", value: "vibexforge.com/investors" },
      { label: "邮箱", value: "xji1@mail.yu.edu" },
      { label: "GITHUB", value: "alex-jb/vibex" },
    ],
    closer: "▶ 邮件预约 15 分钟",
    closerUrl: "xji1@mail.yu.edu",
  },
} as const;

export const VCCTAAsk = ({ locale }: { locale: Locale }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const copy = COPY[locale];

  // Header fades in 0-20.
  const headerOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Each card enters at 40, 80, 120.
  const cardProgress = (idx: number) => {
    const start = 40 + idx * 40;
    return spring({
      frame: frame - start,
      fps,
      config: { damping: 14, mass: 0.6 },
      durationInFrames: 24,
    });
  };

  // Contact rows stagger in from 280.
  const contactRowProgress = (idx: number) => {
    const start = 280 + idx * 30;
    return interpolate(frame, [start, start + 20], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASE,
    });
  };

  // Mascot arrives at 500.
  const mascotEnter = interpolate(frame, [500, 560], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  const mascotX = interpolate(mascotEnter, [0, 1], [-120, 0]);

  // Book-time closer pill appears at 620.
  const closerOpacity = interpolate(frame, [620, 680], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  const closerPulse =
    1 + Math.sin((frame - 680) * 0.1) * 0.03 * (frame > 680 ? 1 : 0);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.BG_DEEP,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 88,
        paddingBottom: 72,
      }}
    >
      {/* ambient forge glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, ${COLORS.NEON_ORANGE}18, transparent 60%)`,
        }}
      />

      {/* header */}
      <div
        style={{
          fontFamily: FONT_PIXEL,
          fontSize: 28,
          color: COLORS.NEON_ORANGE,
          letterSpacing: 8,
          marginBottom: 52,
          opacity: headerOpacity,
          textShadow: `0 0 20px ${COLORS.NEON_ORANGE}88`,
          zIndex: 2,
        }}
      >
        {copy.header}
      </div>

      {/* 3 ask cards */}
      <div
        style={{
          display: "flex",
          gap: 36,
          marginBottom: 56,
          zIndex: 2,
        }}
      >
        {copy.cards.map((card, i) => {
          const p = cardProgress(i);
          const lift = interpolate(p, [0, 1], [32, 0]);
          return (
            <div
              key={i}
              style={{
                opacity: p,
                transform: `translateY(${lift}px)`,
                width: 360,
                padding: 32,
                background: COLORS.BG_CARD,
                border: `2px solid ${COLORS.NEON_ORANGE_DIM}`,
                boxShadow: `0 24px 50px rgba(0,0,0,0.5), 0 0 30px ${COLORS.NEON_ORANGE}22`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 18,
              }}
            >
              <div
                style={{
                  fontSize: 64,
                  color: COLORS.NEON_ORANGE,
                  textShadow: `0 0 22px ${COLORS.NEON_ORANGE}, 3px 3px 0 #000`,
                  lineHeight: 1,
                }}
              >
                {card.icon}
              </div>
              <div
                style={{
                  fontFamily: FONT_PIXEL,
                  fontSize: 20,
                  color: COLORS.TEXT_CREAM,
                  letterSpacing: 3,
                  textAlign: "center",
                  textShadow: `2px 2px 0 #000`,
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
                  lineHeight: 1.3,
                }}
              >
                {card.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* contact info — terminal-style rows */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          alignItems: "flex-start",
          padding: "20px 36px",
          background: "rgba(0,0,0,0.5)",
          border: `1px solid ${COLORS.BORDER}`,
          zIndex: 2,
        }}
      >
        {copy.contact.map((row, i) => {
          const p = contactRowProgress(i);
          return (
            <div
              key={row.label}
              style={{
                opacity: p,
                transform: `translateX(${interpolate(p, [0, 1], [-16, 0])}px)`,
                display: "flex",
                alignItems: "baseline",
                gap: 18,
                fontFamily: "ui-monospace, monospace",
                fontSize: 22,
                letterSpacing: 0.5,
              }}
            >
              <span
                style={{
                  color: COLORS.NEON_ORANGE,
                  minWidth: 90,
                  fontFamily: FONT_PIXEL,
                  fontSize: 14,
                  letterSpacing: 2,
                }}
              >
                ▸ {row.label}
              </span>
              <span style={{ color: COLORS.TEXT_CREAM }}>{row.value}</span>
            </div>
          );
        })}
      </div>

      {/* closer pill */}
      <div
        style={{
          marginTop: "auto",
          opacity: closerOpacity,
          transform: `scale(${closerPulse})`,
          padding: "18px 44px",
          background: COLORS.NEON_ORANGE,
          color: "#000",
          fontFamily: FONT_PIXEL,
          fontSize: 22,
          letterSpacing: 4,
          boxShadow: `0 0 40px ${COLORS.NEON_ORANGE}, 0 20px 40px rgba(0,0,0,0.6)`,
          border: `2px solid ${COLORS.FORGE_CREAM}`,
          zIndex: 3,
        }}
      >
        {copy.closer} · {copy.closerUrl}
      </div>

      {/* mascot pointing from left */}
      <div
        style={{
          position: "absolute",
          bottom: 140,
          left: 120,
          opacity: mascotEnter,
          transform: `translateX(${mascotX}px)`,
          filter: `drop-shadow(0 10px 0 rgba(0,0,0,0.5)) drop-shadow(0 0 24px ${COLORS.NEON_ORANGE}88)`,
          zIndex: 2,
        }}
      >
        <Img
          src={staticFile("generated/mascot-v1.png")}
          style={{
            width: 160,
            height: 160,
            imageRendering: "pixelated",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
