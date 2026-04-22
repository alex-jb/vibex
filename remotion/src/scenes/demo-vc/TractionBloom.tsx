/**
 * TractionBloom — 20s (600 frames, scene-local 0-600).
 *
 * VC scene: "not slides — shipped code". 4 big numbers count up from
 * zero and settle with glow, staggered. Status pill at bottom says
 * the product is live.
 *
 * Numbers verified 2026-04-21 against repo:
 *   43 DB tables (`.private/migrations/*.sql`)
 *   57 API routes (`app/api/.../route.ts`)
 *   119 React components (`components/**`)
 *   925 bilingual i18n keys (EN+ZH in `lib/i18n.ts`)
 */

import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { COLORS, FONT_PIXEL, FONT_RETRO } from "../../tokens";
import { Caption } from "../demo/Caption";
import type { Locale } from "../../Demo";

const EASE = Easing.bezier(0.2, 0.8, 0.1, 1);

type Stat = {
  label: { en: string; zh: string };
  value: number;
  suffix?: string;
  color: string;
};

const STATS: Stat[] = [
  { label: { en: "DB TABLES", zh: "数据库表" }, value: 43, color: "#39FF14" },
  { label: { en: "API ROUTES", zh: "API 路由" }, value: 57, color: "#06B6D4" },
  { label: { en: "COMPONENTS", zh: "React 组件" }, value: 119, color: "#FACC15" },
  { label: { en: "i18n KEYS", zh: "双语 i18n", }, value: 925, suffix: "+", color: "#EC4899" },
];

export const TractionBloom = ({ locale }: { locale: Locale }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header fades in, frames 0-20.
  const headerOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Each stat enters with a stagger: 30, 70, 110, 150.
  const statProgress = (idx: number) => {
    const start = 30 + idx * 40;
    return spring({
      frame: frame - start,
      fps,
      config: { damping: 16, mass: 0.7 },
      durationInFrames: 30,
    });
  };

  // Count-up: each stat counts 0 → value over 40 frames after entry.
  const statCount = (idx: number, maxValue: number) => {
    const start = 30 + idx * 40 + 8;
    return Math.floor(
      interpolate(frame, [start, start + 40], [0, maxValue], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: EASE,
      }),
    );
  };

  // Status pill appears at frame 320.
  const pillEnter = interpolate(frame, [320, 360], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.BG_DEEP,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${COLORS.BORDER_HAIR} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.BORDER_HAIR} 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          opacity: 0.5,
        }}
      />

      {/* Section header */}
      <div
        style={{
          fontFamily: FONT_PIXEL,
          fontSize: 28,
          color: COLORS.NEON_ORANGE,
          letterSpacing: 8,
          marginBottom: 60,
          opacity: headerOpacity,
          textShadow: `0 0 20px ${COLORS.NEON_ORANGE}88`,
        }}
      >
        ▸ TRACTION · SHIPPED
      </div>

      {/* 2x2 grid of stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 40,
          width: 1200,
        }}
      >
        {STATS.map((stat, i) => {
          const p = statProgress(i);
          const count = statCount(i, stat.value);
          const lift = interpolate(p, [0, 1], [32, 0]);
          const showSuffix = count >= stat.value && stat.suffix;
          return (
            <div
              key={i}
              style={{
                opacity: p,
                transform: `translateY(${lift}px)`,
                padding: "36px 48px",
                background: COLORS.BG_CARD,
                border: `2px solid ${stat.color}`,
                boxShadow: `0 0 40px ${stat.color}44, inset 0 0 0 1px rgba(255,255,255,0.03)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <div
                style={{
                  fontFamily: FONT_PIXEL,
                  fontSize: 16,
                  color: stat.color,
                  letterSpacing: 3,
                  opacity: 0.9,
                }}
              >
                ▸ {stat.label[locale]}
              </div>
              <div
                style={{
                  fontFamily: FONT_RETRO,
                  fontSize: 110,
                  color: COLORS.TEXT_CREAM,
                  letterSpacing: 2,
                  textShadow: `0 0 30px ${stat.color}AA, 4px 4px 0 ${COLORS.FORGE_DARK}`,
                  lineHeight: 1,
                }}
              >
                {count.toLocaleString()}
                {showSuffix && stat.suffix}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status pill */}
      <div
        style={{
          marginTop: 48,
          opacity: pillEnter,
          transform: `translateY(${interpolate(pillEnter, [0, 1], [16, 0])}px)`,
          display: "flex",
          gap: 12,
          alignItems: "center",
          padding: "14px 28px",
          background: "rgba(0,0,0,0.6)",
          border: `2px solid ${COLORS.NEON_GREEN}`,
          boxShadow: `0 0 30px ${COLORS.NEON_GREEN}66`,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            background: COLORS.NEON_GREEN,
            boxShadow: `0 0 12px ${COLORS.NEON_GREEN}`,
            opacity: frame % 30 < 15 ? 1 : 0.3,
          }}
        />
        <div
          style={{
            fontFamily: FONT_PIXEL,
            fontSize: 16,
            color: COLORS.NEON_GREEN,
            letterSpacing: 4,
          }}
        >
          {locale === "zh"
            ? "公开 BETA · 每周发版 · 2026-04"
            : "OPEN BETA · SHIPPING WEEKLY · 2026-04"}
        </div>
      </div>

      <Caption
        locale={locale}
        en="Not slides — shipped code."
        zh="不是 PPT —— 是发出去的代码"
        inFrame={420}
        outFrame={600}
      />
    </AbsoluteFill>
  );
};
