/**
 * ForgeAction — 8-18s (300 frames, scene-local 0-300).
 *
 * Product walk-through scene. Shows /launch in a browser device frame.
 * URL types into the repo field, then 3 forge plates glow orange in
 * cascade.
 *
 * Phase 1 (this file): placeholder that uses the existing screenshot
 * `docs/screenshots-v3/03-launch-filled.png` as a static background,
 * with animated forge plates overlaid on top. Reads cleanly as-is.
 *
 * Phase 2 (after Alex records R1): swap the screenshot <Img> for a
 * <Video> of `public/recordings/R1.mp4`. Search for the PHASE-2 marker
 * below — just replace those 3 lines.
 */

import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { COLORS, FONT_PIXEL } from "../../tokens";
import { Caption } from "./Caption";
import { DeviceFrame } from "./DeviceFrame";
import type { Locale } from "../../Demo";

const EASE = Easing.bezier(0.2, 0.8, 0.1, 1);

export const ForgeAction = ({ locale }: { locale: Locale }) => {
  const frame = useCurrentFrame();

  // Device frame entry: slides up from below + fades in, 0-18.
  const deviceEnter = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  const deviceY = interpolate(deviceEnter, [0, 1], [40, 0]);

  // Forge plates cascade: 3 plates, each lights up at a stagger.
  const plateOn = (plateIdx: number) => {
    const startFrame = 80 + plateIdx * 20;
    return interpolate(frame, [startFrame, startFrame + 10], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASE,
    });
  };

  // Hammer strike effect right after all 3 plates lit — frame 150.
  const strikeFlash = interpolate(
    frame,
    [150, 152, 155, 162],
    [0, 1, 0.3, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        background: COLORS.BG_DEEP,
        opacity: deviceEnter,
        transform: `translateY(${deviceY}px)`,
      }}
    >
      {/* Ambient forge glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 60%, ${COLORS.NEON_ORANGE}22, transparent 60%)`,
          opacity: Math.min(1, interpolate(frame, [70, 150], [0.3, 1])),
        }}
      />

      <DeviceFrame url="vibexforge.com/launch">
        {/* PHASE-2 MARKER: replace with <Video src={staticFile("recordings/R1.mp4")} /> */}
        <Img
          src={staticFile("demo-assets/03-launch-filled.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top",
          }}
        />

        {/* Horizontal forge-orange sweep that passes left-to-right across
            the screenshot, simulating plates lighting up in cascade. One
            wide pass from frame 70 through 160 — more cinematic than the
            earlier 3-orb grid. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `linear-gradient(90deg,
              transparent 0%,
              ${COLORS.NEON_ORANGE}00 ${Math.max(0, frame - 90)}%,
              ${COLORS.NEON_ORANGE}88 ${Math.max(0, frame - 82)}%,
              ${COLORS.NEON_ORANGE}22 ${Math.max(0, frame - 74)}%,
              transparent ${Math.max(0, frame - 66)}%)`,
            mixBlendMode: "screen",
            opacity: interpolate(frame, [60, 80, 160, 180], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            filter: "blur(20px)",
          }}
        />

        {/* Three discrete plate glows beneath the sweep — bottom row
            of the launch page where the forge plates visually live. */}
        {[0, 1, 2].map((i) => {
          const on = plateOn(i);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                bottom: "12%",
                left: `${24 + i * 18}%`,
                width: 220,
                height: 160,
                pointerEvents: "none",
                opacity: on * 0.9,
                background: `radial-gradient(closest-side, ${COLORS.NEON_ORANGE}CC 0%, ${COLORS.NEON_ORANGE}55 35%, transparent 75%)`,
                filter: "blur(22px)",
                mixBlendMode: "screen",
              }}
            />
          );
        })}

        {/* Strike flash overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#ffffff",
            opacity: strikeFlash * 0.4,
            mixBlendMode: "screen",
            pointerEvents: "none",
          }}
        />
      </DeviceFrame>

      {/* annotation: labels the forge plates for the audience */}
      <div
        style={{
          position: "absolute",
          top: 72,
          left: 64,
          fontFamily: FONT_PIXEL,
          fontSize: 20,
          color: COLORS.NEON_ORANGE,
          opacity: interpolate(frame, [60, 78], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          letterSpacing: 3,
          padding: "10px 18px",
          border: `2px solid ${COLORS.NEON_ORANGE_DIM}`,
          background: "rgba(0,0,0,0.5)",
        }}
      >
        ▸ PLATES IGNITE
      </div>

      <Caption
        locale={locale}
        en="Paste your repo → it gets forged"
        zh="贴上 repo → 立即锻造"
        inFrame={30}
        outFrame={300}
      />
    </AbsoluteFill>
  );
};
