/**
 * StrikeAnvil — 25-40s (15s).
 *
 * Visual: giant STRIKE THE ANVIL button centered, cursor approaches
 * from right, clicks, button depresses (-2px x/y), screen whites for
 * 3 frames on impact, then shake + 6 pixel sparks radiate + forge
 * glow intensifies. Ends with a cut to black for ForgeUnveil.
 *
 * TODO (round 2): add real cursor sprite (Cap exports cursor PNGs for
 * compositing). For now: static stylized cursor that moves via
 * interpolate.
 */

import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, FONT_PIXEL } from "../tokens";
import type { Locale } from "../Vibex";

const COPY = {
  en: {
    button: "▶ STRIKE THE ANVIL",
  },
  zh: {
    button: "▶ 落锤发布",
  },
} as const;

const SPARKS = [
  { x: -300, y: -200, delay: 0, color: "#FFE27D" },
  { x: 260, y: -180, delay: 3, color: "#FF4500" },
  { x: -220, y: 260, delay: 6, color: "#FACC15" },
  { x: 340, y: 160, delay: 9, color: "#FF4500" },
  { x: -340, y: 40, delay: 12, color: "#FFE27D" },
  { x: 240, y: -300, delay: 15, color: "#FACC15" },
];

// Key moments (within 450f scene = 15s @ 30fps):
const CURSOR_APPROACH_START = 0; // cursor comes from right
const CURSOR_APPROACH_END = 90; // lands on button @ 3s
const CLICK_FRAME = 100; // click impact @ 3.3s
const SHAKE_START = 105;
const SPARKS_START = 110;
const FADE_START = 420; // cut to black for ForgeUnveil

export const StrikeAnvil = ({ locale }: { locale: Locale }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const copy = COPY[locale];

  // Cursor position
  const cursorX = interpolate(
    frame,
    [CURSOR_APPROACH_START, CURSOR_APPROACH_END],
    [600, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const cursorY = interpolate(
    frame,
    [CURSOR_APPROACH_START, CURSOR_APPROACH_END],
    [-200, 40],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Button press on click
  const clickProgress = spring({
    frame: frame - CLICK_FRAME,
    fps,
    config: { damping: 8, mass: 0.4 },
    durationInFrames: 30,
  });
  const buttonOffset = interpolate(clickProgress, [0, 0.5, 1], [0, -8, -3]);

  // Shake — card oscillates x/rotation on 0.45s loop (13.5 frames @ 30fps)
  const shakePhase = frame - SHAKE_START;
  const shakeAmp = frame >= SHAKE_START && frame < FADE_START ? 1 : 0;
  const shakeX = shakeAmp * 6 * Math.sin(shakePhase * 0.5);
  const shakeRot = shakeAmp * 0.6 * Math.sin(shakePhase * 0.5 + 1);

  // Fade out on cut to black
  const sceneOpacity = interpolate(frame, [FADE_START, 450], [1, 0], {
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
        opacity: sceneOpacity,
      }}
    >
      {/* Forge glow — intensifies after click */}
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(closest-side, ${COLORS.NEON_ORANGE}${
            frame > CLICK_FRAME ? "CC" : "66"
          }, transparent 70%)`,
          filter: "blur(50px)",
          transition: "all 0.3s",
        }}
      />

      {/* Button */}
      <div
        style={{
          position: "relative",
          transform: `translate(${buttonOffset + shakeX}px, ${buttonOffset}px) rotate(${shakeRot}deg)`,
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontFamily: FONT_PIXEL,
            fontSize: 80,
            letterSpacing: 8,
            color: COLORS.FORGE_DARK,
            background: COLORS.NEON_ORANGE,
            border: `8px solid ${COLORS.FORGE_CREAM}`,
            padding: "40px 80px",
            boxShadow: `12px 12px 0 #000, inset 0 24px 0 rgba(255,255,255,0.15), inset 0 -24px 0 rgba(0,0,0,0.25)`,
            textShadow: "0 2px 0 rgba(255,255,255,0.4)",
          }}
        >
          {copy.button}
        </div>
      </div>

      {/* Sparks */}
      {SPARKS.map((s, i) => {
        const sparkStart = SPARKS_START + s.delay;
        const sparkProgress = interpolate(
          frame,
          [sparkStart, sparkStart + 33], // 1.1s fly-out
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        const sparkOpacity = interpolate(
          sparkProgress,
          [0, 0.2, 0.8, 1],
          [0, 1, 1, 0],
        );
        const sparkEase = 1 - Math.pow(1 - sparkProgress, 3); // cubic-out
        const sparkX = s.x * sparkEase;
        const sparkY = s.y * sparkEase;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 16,
              height: 16,
              background: s.color,
              boxShadow: `0 0 32px ${s.color}`,
              transform: `translate(${sparkX}px, ${sparkY}px)`,
              opacity: sparkOpacity * sceneOpacity,
            }}
          />
        );
      })}

      {/* Cursor (stylized pixel triangle) */}
      <div
        style={{
          position: "absolute",
          transform: `translate(${cursorX}px, ${cursorY}px)`,
          width: 0,
          height: 0,
          borderLeft: `24px solid ${COLORS.TEXT_CREAM}`,
          borderTop: "14px solid transparent",
          borderBottom: "14px solid transparent",
          filter: `drop-shadow(2px 2px 0 #000) drop-shadow(0 0 8px ${COLORS.NEON_ORANGE}88)`,
          zIndex: 3,
          opacity: frame < FADE_START ? 1 : 0,
        }}
      />
    </AbsoluteFill>
  );
};
