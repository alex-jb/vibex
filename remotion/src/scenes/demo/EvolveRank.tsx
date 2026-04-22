/**
 * EvolveRank — 28-38s (300 frames, scene-local 0-300).
 *
 * Core product mechanic reveal. Shows the evolution ladder
 * (Seed → Active → Rare → Epic → Legend → Myth) on the left,
 * with a project card on the right whose stage bar climbs
 * from Seed to Epic during the scene. Then the /hunt leaderboard
 * slides in from the bottom as an inset.
 *
 * Phase 1: screenshot of /hunt (`05-hunt.png`) used for leaderboard.
 * Phase 2: swap for <Video src="recordings/R4.mp4"> after record.
 */

import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { COLORS, STAGE_COLORS, FONT_PIXEL, FONT_RETRO } from "../../tokens";
import { Caption } from "./Caption";
import type { Locale } from "../../Demo";

const EASE = Easing.bezier(0.2, 0.8, 0.1, 1);

const STAGES = [
  { label: "SEED", color: STAGE_COLORS.Seed },
  { label: "ACTIVE", color: STAGE_COLORS.Active },
  { label: "RARE", color: STAGE_COLORS.Growing },
  { label: "EPIC", color: STAGE_COLORS.Breakout },
  { label: "LEGEND", color: STAGE_COLORS.Legend },
  { label: "MYTH", color: STAGE_COLORS.Myth },
];

export const EvolveRank = ({ locale }: { locale: Locale }) => {
  const frame = useCurrentFrame();

  // Ladder slides in from left, 0-24.
  const ladderEnter = interpolate(frame, [0, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  // Stage pointer climbs Seed → Epic between frames 30-150.
  // Map frame 30→0 (Seed), frame 150→3 (Epic).
  const stagePtr = interpolate(frame, [30, 60, 90, 120, 150], [0, 1, 2, 3, 3.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  const currentStageIdx = Math.min(5, Math.floor(stagePtr));
  const currentStage = STAGES[currentStageIdx];

  // Stats counters — plays, upvotes — count up matching stagePtr.
  const plays = Math.floor(
    interpolate(stagePtr, [0, 1, 2, 3, 4, 5], [12, 78, 546, 1834, 5270, 12400], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const upvotes = Math.floor(
    interpolate(stagePtr, [0, 1, 2, 3, 4, 5], [1, 8, 58, 210, 560, 1120], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  // Leaderboard slides in from bottom at frame 180.
  const leaderboardEnter = interpolate(frame, [180, 210], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  const leaderboardY = interpolate(leaderboardEnter, [0, 1], [120, 0]);

  return (
    <AbsoluteFill style={{ background: COLORS.BG_DEEP }}>
      {/* Left: Evolution ladder */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: "50%",
          transform: `translateY(-50%) translateX(${interpolate(ladderEnter, [0, 1], [-60, 0])}px)`,
          opacity: ladderEnter,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div
          style={{
            fontFamily: FONT_PIXEL,
            fontSize: 22,
            color: COLORS.NEON_ORANGE,
            letterSpacing: 4,
            marginBottom: 8,
          }}
        >
          ▸ EVOLUTION
        </div>
        {STAGES.map((stage, i) => {
          const reached = stagePtr >= i;
          const current = currentStageIdx === i;
          return (
            <div
              key={stage.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "10px 18px",
                background: reached ? `${stage.color}22` : "transparent",
                border: `2px solid ${reached ? stage.color : COLORS.BORDER}`,
                minWidth: 280,
                boxShadow: current
                  ? `0 0 20px ${stage.color}88`
                  : undefined,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  background: reached ? stage.color : "transparent",
                  border: `2px solid ${reached ? stage.color : COLORS.BORDER}`,
                }}
              />
              <div
                style={{
                  fontFamily: FONT_PIXEL,
                  fontSize: 18,
                  color: reached ? stage.color : COLORS.TEXT_DIM,
                  letterSpacing: 3,
                }}
              >
                {stage.label}
              </div>
              {current && (
                <div
                  style={{
                    marginLeft: "auto",
                    fontFamily: FONT_RETRO,
                    fontSize: 22,
                    color: stage.color,
                    opacity: frame % 30 < 15 ? 1 : 0.4,
                  }}
                >
                  ◀ YOU
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right: Stats pane */}
      <div
        style={{
          position: "absolute",
          right: 80,
          top: "50%",
          transform: "translateY(-50%)",
          width: 500,
          padding: 36,
          background: COLORS.BG_CARD,
          border: `2px solid ${currentStage.color}`,
          boxShadow: `0 0 40px ${currentStage.color}44`,
          opacity: interpolate(frame, [20, 44], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            fontFamily: FONT_PIXEL,
            fontSize: 18,
            color: currentStage.color,
            letterSpacing: 3,
            marginBottom: 20,
            paddingBottom: 10,
            borderBottom: `1px solid ${currentStage.color}66`,
          }}
        >
          ▸ {currentStage.label}
        </div>
        <StatRow label="PLAYS" value={plays.toLocaleString()} color={COLORS.NEON_GREEN} />
        <StatRow label="UPVOTES" value={upvotes.toLocaleString()} color={COLORS.NEON_CYAN} />
        <StatRow label="SHARES" value={Math.floor(plays / 12).toLocaleString()} color={COLORS.NEON_YELLOW} />
      </div>

      {/* Leaderboard inset slides up from bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          right: 80,
          width: 500,
          height: 160,
          transform: `translateY(${leaderboardY}px)`,
          opacity: leaderboardEnter,
          overflow: "hidden",
          borderRadius: 8,
          border: `2px solid ${COLORS.NEON_ORANGE_DIM}`,
          boxShadow: `0 20px 40px rgba(0,0,0,0.6), 0 0 30px ${COLORS.NEON_ORANGE}33`,
        }}
      >
        {/* PHASE-2 MARKER: replace with <Video src={staticFile("recordings/R4.mp4")} /> */}
        <Img
          src={staticFile("demo-assets/05-hunt.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 12,
            fontFamily: FONT_PIXEL,
            fontSize: 14,
            color: COLORS.NEON_ORANGE,
            letterSpacing: 2,
            padding: "4px 10px",
            background: "rgba(0,0,0,0.7)",
            border: `1px solid ${COLORS.NEON_ORANGE_DIM}`,
          }}
        >
          /hunt
        </div>
      </div>

      <Caption
        locale={locale}
        en="Every project evolves. Seed → Myth."
        zh="每个项目都在进化 Seed → Myth"
        inFrame={24}
        outFrame={300}
      />
    </AbsoluteFill>
  );
};

const StatRow = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 14,
      paddingBottom: 8,
      borderBottom: `1px solid ${COLORS.BORDER_HAIR}`,
    }}
  >
    <span
      style={{
        fontFamily: FONT_PIXEL,
        fontSize: 14,
        color: COLORS.TEXT_MUTED,
        letterSpacing: 2,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontFamily: FONT_RETRO,
        fontSize: 36,
        color,
        letterSpacing: 1,
        textShadow: `0 0 10px ${color}88`,
      }}
    >
      {value}
    </span>
  </div>
);
