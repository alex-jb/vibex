/**
 * DemoVertical — 1080×1920 9:16 cut for 小红书 / TikTok / Instagram Reels.
 *
 * Strategy: embed the already-rendered 1920×1080 Demo as <OffthreadVideo>
 * scaled to 1080 wide, centered vertically. Brand strip at top, big
 * forge-orange CTA panel at bottom with mascot + URL.
 *
 * This avoids rebuilding all scenes at 9:16 — reuses the final 60s output
 * and adds branded chrome. Minor quality loss from re-encode is acceptable
 * for social auto-play silent viewing.
 *
 * Render:
 *   npm run remotion:demo-vertical     → EN (uses vibex-demo-v1.mp4 source)
 *   npm run remotion:demo-vertical-zh  → ZH (uses vibex-demo-v1-zh.mp4)
 *
 * Source: Vercel Blob (store: vibex-marketing). If you re-render the 60s
 * demos, upload with `npm run demo:sync-blob` before running this.
 */

import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { COLORS, FONT_PIXEL, FONT_RETRO } from "./tokens";
import type { Locale } from "./Demo";

const COPY = {
  en: {
    brand: "VIBEXFORGE",
    tagline: "Forge your AI project.",
    tagline2: "Critique it. Evolve it.",
    url: "vibexforge.com",
    cta: "▶ FORGE YOURS",
  },
  zh: {
    brand: "VIBEXFORGE",
    tagline: "锻造你的 AI 项目。",
    tagline2: "AI 评审。公开进化。",
    url: "vibexforge.com",
    cta: "▶ 开始锻造",
  },
} as const;

export const DemoVertical = ({ locale }: { locale: Locale }) => {
  const frame = useCurrentFrame();
  const copy = COPY[locale];
  const BLOB = "https://cgavxkhdjifwxoaw.public.blob.vercel-storage.com/demo";
  const videoSrc =
    locale === "zh"
      ? `${BLOB}/vibex-demo-v1-zh.mp4`
      : `${BLOB}/vibex-demo-v1.mp4`;

  // mascot bob for bottom element
  const mascotBob = Math.sin(frame * 0.15) * 4;

  // CTA pulse
  const ctaPulse = 1 + Math.sin(frame * 0.12) * 0.02;

  return (
    <AbsoluteFill style={{ background: COLORS.BG_DEEP }}>
      {/* Subtle grid bg across whole canvas */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${COLORS.BORDER_HAIR} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.BORDER_HAIR} 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          opacity: 0.4,
        }}
      />

      {/* Forge ambient glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 30%, ${COLORS.NEON_ORANGE}33, transparent 60%)`,
        }}
      />

      {/* Top brand strip — 0-240px */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          height: 180,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontFamily: FONT_PIXEL,
            fontSize: 56,
            color: COLORS.NEON_ORANGE,
            letterSpacing: 8,
            textShadow: `0 0 30px ${COLORS.NEON_ORANGE}AA, 4px 4px 0 #000`,
          }}
        >
          {copy.brand}
        </div>
        <div
          style={{
            fontFamily: FONT_RETRO,
            fontSize: 36,
            color: COLORS.TEXT_MUTED,
            letterSpacing: 2,
          }}
        >
          {copy.tagline}
        </div>
      </div>

      {/* Video in middle — 1080 × 607 centered around y=960 */}
      <div
        style={{
          position: "absolute",
          top: 280,
          left: 0,
          width: 1080,
          height: 607.5,
          overflow: "hidden",
          border: `4px solid ${COLORS.NEON_ORANGE}`,
          boxShadow: `0 0 60px ${COLORS.NEON_ORANGE}66, inset 0 0 0 2px rgba(0,0,0,0.5)`,
          zIndex: 3,
        }}
      >
        <OffthreadVideo
          src={videoSrc}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        {/* Corner brackets — retro TV feel */}
        {[
          { top: 8, left: 8, borderTop: true, borderLeft: true },
          { top: 8, right: 8, borderTop: true, borderRight: true },
          { bottom: 8, left: 8, borderBottom: true, borderLeft: true },
          { bottom: 8, right: 8, borderBottom: true, borderRight: true },
        ].map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 24,
              height: 24,
              ...(p.top !== undefined ? { top: p.top } : {}),
              ...(p.left !== undefined ? { left: p.left } : {}),
              ...(p.right !== undefined ? { right: p.right } : {}),
              ...(p.bottom !== undefined ? { bottom: p.bottom } : {}),
              ...(p.borderTop ? { borderTop: `3px solid ${COLORS.NEON_ORANGE}` } : {}),
              ...(p.borderLeft ? { borderLeft: `3px solid ${COLORS.NEON_ORANGE}` } : {}),
              ...(p.borderRight ? { borderRight: `3px solid ${COLORS.NEON_ORANGE}` } : {}),
              ...(p.borderBottom ? { borderBottom: `3px solid ${COLORS.NEON_ORANGE}` } : {}),
            }}
          />
        ))}
      </div>

      {/* Bottom brand + CTA panel — from y=920 to y=1900 */}
      <div
        style={{
          position: "absolute",
          top: 920,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 60,
          gap: 40,
          zIndex: 2,
        }}
      >
        {/* Tagline line 2 */}
        <div
          style={{
            fontFamily: FONT_PIXEL,
            fontSize: 44,
            color: COLORS.TEXT_CREAM,
            letterSpacing: 4,
            textShadow: `3px 3px 0 #000, 0 0 20px ${COLORS.NEON_ORANGE}66`,
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          {copy.tagline2}
        </div>

        {/* Mascot */}
        <div
          style={{
            transform: `translateY(${mascotBob}px)`,
            filter: `drop-shadow(0 10px 0 rgba(0,0,0,0.5)) drop-shadow(0 0 30px ${COLORS.NEON_ORANGE}AA)`,
          }}
        >
          <Img
            src={staticFile("generated/mascot-v1.png")}
            style={{
              width: 240,
              height: 240,
              imageRendering: "pixelated",
            }}
          />
        </div>

        {/* CTA pill */}
        <div
          style={{
            transform: `scale(${ctaPulse})`,
            padding: "28px 72px",
            background: COLORS.NEON_ORANGE,
            color: "#000",
            fontFamily: FONT_PIXEL,
            fontSize: 32,
            letterSpacing: 6,
            boxShadow: `0 0 50px ${COLORS.NEON_ORANGE}, 0 16px 32px rgba(0,0,0,0.6)`,
            border: `3px solid ${COLORS.FORGE_CREAM}`,
            textShadow: `2px 2px 0 rgba(0,0,0,0.2)`,
          }}
        >
          {copy.cta}
        </div>

        {/* URL */}
        <div
          style={{
            fontFamily: FONT_PIXEL,
            fontSize: 36,
            color: COLORS.FORGE_CREAM,
            letterSpacing: 4,
            textShadow: `0 0 30px ${COLORS.NEON_ORANGE}AA, 3px 3px 0 #000`,
          }}
        >
          {copy.url}
        </div>
      </div>
    </AbsoluteFill>
  );
};
