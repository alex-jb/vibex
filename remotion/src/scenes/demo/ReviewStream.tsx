/**
 * ReviewStream — 18-28s (300 frames, scene-local 0-300).
 *
 * Product scene: /project/:id?forged=1 with the AI Review Panel on the
 * right streaming a Claude critique character-by-character. Score reveals
 * at the end.
 *
 * Phase 1 (this file): left side is the forged project screenshot
 * (`docs/screenshots-v3/04-project-forged.png`). Right side is a
 * standalone simulated "AI REVIEW" terminal panel that streams real
 * text — so scene reads even without a live recording.
 *
 * Phase 2 (after Alex records R2 + R3): replace screenshot with video
 * of the forge-unveil animation, and optionally overlay the real
 * streaming panel from the recording.
 */

import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { COLORS, FONT_PIXEL, FONT_RETRO } from "../../tokens";
import { Caption } from "./Caption";
import type { Locale } from "../../Demo";

const EASE = Easing.bezier(0.2, 0.8, 0.1, 1);

const CRITIQUE = [
  "> Analyzing repo structure...",
  "> Reading README + code samples...",
  "",
  "▸ STRENGTHS",
  "  · Clean separation of concerns (forge/hunt/creators)",
  "  · Real Supabase integration, not mocked",
  "  · Bilingual i18n (708 keys) built in from day one",
  "",
  "▸ GAPS",
  "  · Homepage hook doesn't convey the evolution mechanic",
  "  · No onboarding for first-time forge action",
  "",
  "▸ SCORE",
  "  Technical:     8.5 / 10",
  "  Positioning:   6.0 / 10",
  "  Launch-ready:  9.0 / 10",
  "",
  "  OVERALL: 8.2 / 10",
];

// Full text as one string; stream characters based on frame.
const FULL_TEXT = CRITIQUE.join("\n");
const CHARS_PER_FRAME = 2.2; // ~66 chars/s

export const ReviewStream = ({ locale }: { locale: Locale }) => {
  const frame = useCurrentFrame();

  // Panel slide-in from right edge, 0-24.
  const panelEnter = interpolate(frame, [0, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  const panelX = interpolate(panelEnter, [0, 1], [400, 0]);

  // Stream starts at frame 30.
  const streamFrame = Math.max(0, frame - 30);
  const charsShown = Math.min(
    FULL_TEXT.length,
    Math.floor(streamFrame * CHARS_PER_FRAME),
  );
  const visibleText = FULL_TEXT.slice(0, charsShown);

  // Score highlight pulse at the end.
  const scoreRevealed = charsShown >= FULL_TEXT.length - 20;
  const scorePulse = scoreRevealed
    ? interpolate(
        (frame - (30 + FULL_TEXT.length / CHARS_PER_FRAME)) % 40,
        [0, 20, 40],
        [0, 1, 0],
      )
    : 0;

  return (
    <AbsoluteFill style={{ background: COLORS.BG_DEEP }}>
      {/* Left 60%: the forged project */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "60%",
          height: "100%",
          padding: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            aspectRatio: "16 / 10",
            overflow: "hidden",
            borderRadius: 12,
            border: `1px solid ${COLORS.BORDER}`,
            boxShadow: `0 40px 80px rgba(0,0,0,0.5), 0 0 40px ${COLORS.NEON_ORANGE}22`,
          }}
        >
          {/* PHASE-2 MARKER: replace with <Video src={staticFile("recordings/R2.mp4")} /> */}
          <Img
            src={staticFile("demo-assets/04-project-forged.png")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top",
            }}
          />
        </div>
      </div>

      {/* Right 40%: AI review panel */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 80,
          bottom: 80,
          width: "38%",
          marginRight: 40,
          background: `linear-gradient(180deg, ${COLORS.BG_PANEL}, ${COLORS.BG_DEEP})`,
          border: `2px solid ${COLORS.NEON_ORANGE_DIM}`,
          boxShadow: `0 0 40px ${COLORS.NEON_ORANGE}33, inset 0 0 0 1px rgba(255,255,255,0.03)`,
          padding: 28,
          transform: `translateX(${panelX}px)`,
          opacity: panelEnter,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* panel header */}
        <div
          style={{
            fontFamily: FONT_PIXEL,
            fontSize: 20,
            color: COLORS.NEON_ORANGE,
            letterSpacing: 3,
            marginBottom: 18,
            borderBottom: `1px solid ${COLORS.NEON_ORANGE_DIM}`,
            paddingBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span>▸ AI REVIEW</span>
          <span
            style={{
              fontSize: 12,
              color: COLORS.TEXT_MUTED,
              letterSpacing: 1,
              marginLeft: "auto",
            }}
          >
            claude-opus-4.7
          </span>
        </div>

        {/* stream body */}
        <pre
          style={{
            fontFamily: FONT_RETRO,
            fontSize: 22,
            color: COLORS.TEXT,
            lineHeight: 1.4,
            margin: 0,
            whiteSpace: "pre-wrap",
            flex: 1,
            overflow: "hidden",
            letterSpacing: 0.5,
            textShadow: scoreRevealed
              ? `0 0 ${8 + scorePulse * 6}px ${COLORS.NEON_ORANGE}99`
              : undefined,
          }}
        >
          {visibleText}
          {charsShown < FULL_TEXT.length && (
            <span style={{ opacity: frame % 10 < 5 ? 1 : 0 }}>▍</span>
          )}
        </pre>
      </div>

      <Caption
        locale={locale}
        en="30-second AI critique. No sugarcoat."
        zh="30 秒 AI 评审 不讲情面"
        inFrame={30}
        outFrame={300}
      />
    </AbsoluteFill>
  );
};
