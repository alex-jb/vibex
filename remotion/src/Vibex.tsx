/**
 * Vibex — canonical hero video composition.
 *
 * Timeline (30fps):
 *   0  –  240  (0-8s)   · Hero            · "You shipped. Nobody clicked."
 *   240 – 750 (8-25s)   · LaunchFill      · Forge plates + live preview
 *   750 – 1200 (25-40s) · StrikeAnvil     · Button press + hammer shake
 *   1200 – 2100 (40-70s) · ForgeUnveil    · 3.5s product unveil stretched
 *   2100 – 2700 (70-90s) · CTA            · vibexforge.com + QR
 */

import { AbsoluteFill, Sequence, Audio, staticFile } from "remotion";
import { COLORS } from "./tokens";
import { Hero } from "./scenes/Hero";
import { LaunchFill } from "./scenes/LaunchFill";
import { StrikeAnvil } from "./scenes/StrikeAnvil";
import { ForgeUnveil } from "./scenes/ForgeUnveil";
import { CTA } from "./scenes/CTA";

const SCENE = {
  heroStart: 0,
  heroLen: 240,
  launchFillStart: 240,
  launchFillLen: 510,
  strikeAnvilStart: 750,
  strikeAnvilLen: 450,
  forgeUnveilStart: 1200,
  forgeUnveilLen: 900,
  ctaStart: 2100,
  ctaLen: 600,
} as const;

export type Locale = "en" | "zh";

export type VibexProps = {
  locale: Locale;
};

export const Vibex = ({ locale }: VibexProps) => {
  return (
    <AbsoluteFill
      style={{
        background: COLORS.BG_DEEP,
        fontFamily: "monospace",
      }}
    >
      {/* Scanline overlay — applied once, persists through all scenes. */}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "repeating-linear-gradient(0deg, transparent 0 3px, rgba(0,0,0,0.15) 3px 4px)",
          opacity: 0.4,
          zIndex: 10,
        }}
      />

      <Sequence from={SCENE.heroStart} durationInFrames={SCENE.heroLen}>
        <Hero locale={locale} />
      </Sequence>

      <Sequence
        from={SCENE.launchFillStart}
        durationInFrames={SCENE.launchFillLen}
      >
        <LaunchFill locale={locale} />
      </Sequence>

      <Sequence
        from={SCENE.strikeAnvilStart}
        durationInFrames={SCENE.strikeAnvilLen}
      >
        <StrikeAnvil locale={locale} />
      </Sequence>

      <Sequence
        from={SCENE.forgeUnveilStart}
        durationInFrames={SCENE.forgeUnveilLen}
      >
        <ForgeUnveil locale={locale} />
      </Sequence>

      <Sequence from={SCENE.ctaStart} durationInFrames={SCENE.ctaLen}>
        <CTA locale={locale} />
      </Sequence>

      {/* Background track — 8-bit ambient at low volume. Drop in
          public/remotion-bg.mp3 (the existing record-demo-ultimate.mjs
          ambient track is reusable). Uncomment when the file is in place. */}
      {/* <Audio src={staticFile("remotion-bg.mp3")} volume={0.15} /> */}
    </AbsoluteFill>
  );
};
