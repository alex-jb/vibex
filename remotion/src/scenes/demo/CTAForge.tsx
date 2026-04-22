/**
 * CTAForge — 48-60s (360 frames, scene-local 0-360).
 *
 * Closing CTA. Forge-orange sweep wipes in from the right, revealing
 * a CRT monitor with scanlines. The URL `vibexforge.com` types in
 * terminal-style with a blinking cursor. Mascot appears next to the
 * monitor pointing at the URL. Final hold on a clean "forge something"
 * subline + mascot grin.
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

const URL_TEXT = "vibexforge.com";
const SUB_EN = "▸ forge something";
const SUB_ZH = "▸ 去锻造点什么";

export const CTAForge = ({ locale }: { locale: Locale }) => {
  const frame = useCurrentFrame();

  // Forge-orange sweep wipes from right to left, 0-20.
  const wipeProgress = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  // CRT monitor reveals at frame 22.
  const crtEnter = interpolate(frame, [22, 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  const crtScale = interpolate(crtEnter, [0, 1], [0.85, 1]);

  // URL types in char-by-char, 50-110.
  const urlCharsShown = Math.min(
    URL_TEXT.length,
    Math.floor(
      interpolate(frame, [50, 110], [0, URL_TEXT.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    ),
  );
  const urlText = URL_TEXT.slice(0, urlCharsShown);

  // Mascot arrives from right at frame 130.
  const mascotEnter = interpolate(frame, [130, 160], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  const mascotX = interpolate(mascotEnter, [0, 1], [400, 0]);

  // Mascot pulses (scale 1 → 1.08 → 1) around its point-gesture moment.
  const mascotPulse =
    1 +
    Math.sin((frame - 160) * 0.12) *
      0.04 *
      Math.max(0, Math.min(1, (frame - 160) / 30));

  // Final brand mark appears at frame 250.
  const brandEnter = interpolate(frame, [250, 280], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.BG_DEEP,
      }}
    >
      {/* Forge-orange wipe — persists as ambient background glow after wipe */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(90deg, ${COLORS.NEON_ORANGE} 0%, ${COLORS.NEON_ORANGE}66 50%, transparent 100%)`,
          transform: `translateX(${(1 - wipeProgress) * 100}%)`,
          opacity: frame < 22 ? 1 : Math.max(0, 1 - (frame - 22) / 20),
          mixBlendMode: "screen",
        }}
      />

      {/* Background radial ember */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, ${COLORS.NEON_ORANGE}33, transparent 70%)`,
          opacity: crtEnter,
        }}
      />

      {/* CRT monitor */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${crtScale})`,
          opacity: crtEnter,
          width: 1200,
          aspectRatio: "16 / 9",
          padding: 44,
          background: `linear-gradient(135deg, #3a2a1a 0%, #1a1008 100%)`,
          border: `4px solid #2a1a08`,
          borderRadius: 32,
          boxShadow:
            `0 60px 120px rgba(0,0,0,0.7), inset 0 0 0 4px #4a3420, inset 0 0 60px ${COLORS.NEON_ORANGE}44`,
        }}
      >
        {/* Screen */}
        <div
          style={{
            width: "100%",
            height: "100%",
            background: `radial-gradient(ellipse at 50% 40%, #0a0600 0%, #000 100%)`,
            borderRadius: 12,
            position: "relative",
            overflow: "hidden",
            boxShadow: `inset 0 0 80px ${COLORS.NEON_ORANGE}22`,
          }}
        >
          {/* CRT scanlines */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,0.3) 2px 3px)",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
          {/* CRT vignette */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />

          {/* Terminal prompt + URL */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 60,
              zIndex: 1,
            }}
          >
            <div
              style={{
                fontFamily: FONT_PIXEL,
                fontSize: 22,
                color: COLORS.NEON_ORANGE,
                letterSpacing: 3,
                marginBottom: 28,
                opacity: 0.7,
              }}
            >
              ▸ READY
            </div>
            <div
              style={{
                fontFamily: FONT_PIXEL,
                fontSize: 80,
                color: COLORS.FORGE_CREAM,
                letterSpacing: 8,
                textShadow: `0 0 40px ${COLORS.NEON_ORANGE}, 6px 6px 0 ${COLORS.FORGE_DARK}`,
                lineHeight: 1,
              }}
            >
              {urlText}
              {urlCharsShown < URL_TEXT.length && (
                <span style={{ opacity: frame % 12 < 6 ? 1 : 0 }}>_</span>
              )}
            </div>
            <div
              style={{
                fontFamily: FONT_RETRO,
                fontSize: 36,
                color: COLORS.TEXT_MUTED,
                letterSpacing: 2,
                marginTop: 28,
                opacity: urlCharsShown >= URL_TEXT.length ? brandEnter : 0,
              }}
            >
              {locale === "zh" ? SUB_ZH : SUB_EN}
            </div>
          </div>
        </div>
      </div>

      {/* Mascot next to monitor */}
      <div
        style={{
          position: "absolute",
          bottom: "18%",
          right: 80,
          opacity: mascotEnter,
          transform: `translateX(${mascotX}px) scale(${mascotPulse})`,
          filter: `drop-shadow(0 12px 0 rgba(0,0,0,0.4)) drop-shadow(0 0 30px ${COLORS.NEON_ORANGE}66)`,
        }}
      >
        <Img
          src={staticFile("generated/mascot-v1.png")}
          style={{
            width: 220,
            height: 220,
            imageRendering: "pixelated",
          }}
        />
      </div>

      {/* footer attribution */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: brandEnter * 0.6,
          fontFamily: "ui-monospace, monospace",
          fontSize: 16,
          color: COLORS.TEXT_DIM,
          letterSpacing: 2,
        }}
      >
        @alex-jb · built in public · 2026
      </div>

      {/* Caption suppressed — URL is already the hero visual on the CRT. */}
    </AbsoluteFill>
  );
};
