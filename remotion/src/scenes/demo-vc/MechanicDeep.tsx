/**
 * MechanicDeep — 20s (600 frames, scene-local 0-600).
 *
 * VC scene explaining the moat: evolution ladder from Seed to Myth,
 * each stage with its threshold. Ends with the punchline pull-quote
 * that frames the flywheel as the moat.
 *
 * This is THE mechanic slide for VC pitches — it's what differentiates
 * VibeXForge from Product Hunt (one-shot) and GitHub (flat stars).
 */

import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { COLORS, STAGE_COLORS, FONT_PIXEL, FONT_RETRO } from "../../tokens";
import type { Locale } from "../../Demo";

const EASE = Easing.bezier(0.2, 0.8, 0.1, 1);

type Stage = {
  label: string;
  threshold: { en: string; zh: string };
  color: string;
};

const STAGES: Stage[] = [
  {
    label: "SEED",
    threshold: { en: "submitted", zh: "刚提交" },
    color: STAGE_COLORS.Seed,
  },
  {
    label: "ACTIVE",
    threshold: { en: "50 plays", zh: "50 播放" },
    color: STAGE_COLORS.Active,
  },
  {
    label: "RARE",
    threshold: { en: "500 plays · 50 upvotes", zh: "500 播放 · 50 赞" },
    color: STAGE_COLORS.Growing,
  },
  {
    label: "EPIC",
    threshold: { en: "1K plays · breakout", zh: "1K 播放 · 爆发" },
    color: STAGE_COLORS.Breakout,
  },
  {
    label: "LEGEND",
    threshold: { en: "5K plays · 500 upvotes", zh: "5K 播放 · 500 赞" },
    color: STAGE_COLORS.Legend,
  },
  {
    label: "MYTH",
    threshold: { en: "10K plays · 1K upvotes · VC interest", zh: "10K 播放 · 1K 赞 · VC 关注" },
    color: STAGE_COLORS.Myth,
  },
];

const PUNCHLINE = {
  en: ["Product Hunt gives you 48 hours.", "We give you a flywheel."],
  zh: ["Product Hunt 给你 48 小时。", "我们给你一个飞轮。"],
};

export const MechanicDeep = ({ locale }: { locale: Locale }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header fades in.
  const headerOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Each stage enters staggered from frame 30.
  const stageProgress = (idx: number) => {
    const start = 30 + idx * 22;
    return spring({
      frame: frame - start,
      fps,
      config: { damping: 14, mass: 0.5 },
      durationInFrames: 24,
    });
  };

  // Punchline appears at frame 380.
  const punchProgress = interpolate(frame, [380, 420, 460], [0, 1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  const line1Progress = Math.floor(
    interpolate(frame, [380, 430], [0, PUNCHLINE[locale][0].length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const line2Progress = Math.floor(
    interpolate(frame, [460, 510], [0, PUNCHLINE[locale][1].length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const punch = PUNCHLINE[locale];

  return (
    <AbsoluteFill style={{ background: COLORS.BG_DEEP }}>
      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT_PIXEL,
          fontSize: 28,
          color: COLORS.NEON_ORANGE,
          letterSpacing: 8,
          opacity: headerOpacity,
          textShadow: `0 0 20px ${COLORS.NEON_ORANGE}88`,
        }}
      >
        ▸ THE MOAT · EVOLUTION
      </div>

      {/* Ladder — centered, 6 stages vertically */}
      <div
        style={{
          position: "absolute",
          top: 140,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: 1000,
        }}
      >
        {STAGES.map((stage, i) => {
          const p = stageProgress(i);
          const lift = interpolate(p, [0, 1], [24, 0]);
          const slideX = interpolate(p, [0, 1], [-60, 0]);
          return (
            <div
              key={stage.label}
              style={{
                opacity: p,
                transform: `translate(${slideX}px, ${lift}px)`,
                display: "flex",
                alignItems: "center",
                gap: 28,
                padding: "18px 32px",
                background: `linear-gradient(90deg, ${stage.color}11 0%, transparent 100%)`,
                border: `2px solid ${stage.color}`,
                boxShadow: `0 0 24px ${stage.color}33`,
              }}
            >
              {/* stage indicator */}
              <div
                style={{
                  width: 20,
                  height: 20,
                  background: stage.color,
                  boxShadow: `0 0 16px ${stage.color}`,
                  flexShrink: 0,
                }}
              />

              {/* stage label */}
              <div
                style={{
                  fontFamily: FONT_PIXEL,
                  fontSize: 24,
                  color: stage.color,
                  letterSpacing: 4,
                  minWidth: 180,
                  textShadow: `0 0 10px ${stage.color}88`,
                }}
              >
                {stage.label}
              </div>

              {/* separator */}
              <div
                style={{
                  width: 2,
                  height: 28,
                  background: `${stage.color}44`,
                }}
              />

              {/* threshold */}
              <div
                style={{
                  fontFamily: FONT_RETRO,
                  fontSize: 28,
                  color: COLORS.TEXT,
                  letterSpacing: 1,
                  flex: 1,
                }}
              >
                {stage.threshold[locale]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Punchline pull-quote at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: punchProgress,
        }}
      >
        <div
          style={{
            fontFamily: FONT_RETRO,
            fontSize: 36,
            color: COLORS.TEXT_DIM,
            letterSpacing: 1,
            marginBottom: 12,
          }}
        >
          {punch[0].slice(0, line1Progress)}
        </div>
        <div
          style={{
            fontFamily: FONT_PIXEL,
            fontSize: 32,
            color: COLORS.NEON_ORANGE,
            letterSpacing: 4,
            textShadow: `0 0 20px ${COLORS.NEON_ORANGE}AA, 3px 3px 0 #000`,
          }}
        >
          {punch[1].slice(0, line2Progress)}
          {line2Progress < punch[1].length && line2Progress > 0 && (
            <span style={{ opacity: frame % 12 < 6 ? 1 : 0 }}>_</span>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
