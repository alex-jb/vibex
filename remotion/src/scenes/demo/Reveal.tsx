/**
 * Reveal — 3-8s (150 frames, scene-local 0-150).
 *
 * Pivot scene. Hammer swings in from upper-right, strikes center
 * anvil on frame 40 (~1.3s into scene). On impact: white flash
 * (3 frames), 8 spark particles radiate, ground rumble (translate
 * shake), forge glow expands. VIBEXFORGE logo reveals letter-by-
 * letter from frames 60-120 in forge-orange with CRT shadow.
 *
 * Design note: Stripe motion rule — every animation here <500ms,
 * GPU-friendly transforms only.
 */

import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { COLORS, FONT_PIXEL } from "../../tokens";
import { Caption } from "./Caption";
import type { Locale } from "../../Demo";

const LOGO = "VIBEXFORGE";
const IMPACT_FRAME = 40;

export const Reveal = ({ locale }: { locale: Locale }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Hammer enters from upper-right (x=+400,y=-400,rot=-30deg) and lands
  // on center anvil at IMPACT_FRAME with spring settle.
  const hammerSwing = spring({
    frame,
    fps,
    config: { damping: 10, mass: 0.5 },
    durationInFrames: IMPACT_FRAME,
  });
  const hammerX = interpolate(hammerSwing, [0, 1], [400, 0]);
  const hammerY = interpolate(hammerSwing, [0, 1], [-380, 0]);
  const hammerRot = interpolate(hammerSwing, [0, 1], [-35, 0]);

  // Impact flash — frame 40 to 43.
  const impactFlash = interpolate(
    frame,
    [IMPACT_FRAME, IMPACT_FRAME + 1, IMPACT_FRAME + 3, IMPACT_FRAME + 8],
    [0, 1, 0.4, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Shake applied after impact, 10 frames.
  const shakeAmp = interpolate(
    frame,
    [IMPACT_FRAME, IMPACT_FRAME + 10],
    [6, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const shakeX = Math.sin(frame * 2.3) * shakeAmp;
  const shakeY = Math.cos(frame * 3.1) * shakeAmp * 0.7;

  // Forge glow expands from impact onward.
  const glowScale = interpolate(
    frame,
    [IMPACT_FRAME, IMPACT_FRAME + 20, 150],
    [0.2, 1.6, 2.2],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const glowOpacity = interpolate(
    frame,
    [IMPACT_FRAME, IMPACT_FRAME + 15, 120, 150],
    [0, 0.7, 0.5, 0.3],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Logo letter-by-letter reveal 60-120.
  const logoChars = Math.floor(
    interpolate(frame, [60, 120], [0, LOGO.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.2, 0.8, 0.1, 1),
    }),
  );
  const logo = LOGO.slice(0, logoChars);
  const logoOpacity = interpolate(frame, [55, 62], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Spark particles — 8 spokes from anvil, each with outward + fall.
  const sparks = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const life = interpolate(
      frame,
      [IMPACT_FRAME, IMPACT_FRAME + 18],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    const dist = interpolate(life, [0, 1], [0, 180]);
    const fall = interpolate(life, [0, 1], [0, 40]);
    const sparkOpacity = interpolate(life, [0, 0.3, 1], [0, 1, 0]);
    return {
      x: Math.cos(angle) * dist + shakeX,
      y: Math.sin(angle) * dist + fall + shakeY,
      opacity: sparkOpacity,
    };
  });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.BG_DEEP,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* forge glow behind everything */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(closest-side, ${COLORS.NEON_ORANGE} 0%, ${COLORS.NEON_ORANGE}88 25%, transparent 70%)`,
          transform: `scale(${glowScale})`,
          opacity: glowOpacity,
          filter: "blur(36px)",
          mixBlendMode: "screen",
        }}
      />

      {/* impact white flash */}
      <AbsoluteFill
        style={{
          background: "#ffffff",
          opacity: impactFlash,
          mixBlendMode: "screen",
        }}
      />

      {/* anvil — sized for 1920x1080 presence */}
      <div
        style={{
          position: "absolute",
          top: "62%",
          left: "50%",
          transform: `translate(-50%, -50%)`,
          width: 540,
          height: 140,
          background: `linear-gradient(to bottom, #2a2a30 0%, #141418 100%)`,
          border: `5px solid ${COLORS.BORDER}`,
          boxShadow: `0 0 60px ${COLORS.NEON_ORANGE}66, 0 40px 60px rgba(0,0,0,0.6)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -28,
            left: -52,
            right: -52,
            height: 42,
            background: `linear-gradient(to bottom, #3a3a42, #2a2a30)`,
            border: `5px solid ${COLORS.BORDER}`,
            borderBottom: "none",
          }}
        />
      </div>

      {/* hammer head + handle */}
      <div
        style={{
          position: "absolute",
          top: "52%",
          left: "50%",
          transform: `translate(calc(-50% + ${hammerX}px), calc(-50% + ${hammerY}px)) rotate(${hammerRot}deg)`,
          transformOrigin: "50% 100%",
        }}
      >
        <div
          style={{
            width: 280,
            height: 140,
            background: `linear-gradient(to bottom, #5a5a62, #2a2a30)`,
            border: `6px solid ${COLORS.BORDER}`,
            boxShadow: `0 0 30px ${COLORS.NEON_ORANGE}AA`,
          }}
        />
        <div
          style={{
            width: 24,
            height: 320,
            background: "#4a3020",
            margin: "0 auto",
            border: `4px solid #2a1a10`,
          }}
        />
      </div>

      {/* sparks */}
      {sparks.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "55%",
            left: "50%",
            width: 6,
            height: 6,
            background: COLORS.FORGE_CREAM,
            boxShadow: `0 0 8px ${COLORS.NEON_ORANGE}`,
            transform: `translate(calc(-50% + ${s.x}px), calc(-50% + ${s.y}px))`,
            opacity: s.opacity,
          }}
        />
      ))}

      {/* logo */}
      <div
        style={{
          position: "absolute",
          top: "28%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: logoOpacity,
        }}
      >
        <div
          style={{
            fontFamily: FONT_PIXEL,
            fontSize: 96,
            color: COLORS.NEON_ORANGE,
            letterSpacing: 10,
            textShadow: `0 0 40px ${COLORS.NEON_ORANGE}, 6px 6px 0 #000`,
            lineHeight: 1,
          }}
        >
          {logo}
          {logoChars < LOGO.length && (
            <span style={{ opacity: frame % 12 < 6 ? 1 : 0 }}>_</span>
          )}
        </div>
      </div>

      <Caption
        locale={locale}
        en="So I built a forge for AI makers."
        zh="所以我做了个锻造炉"
        inFrame={75}
        outFrame={150}
      />
    </AbsoluteFill>
  );
};
