/**
 * Demo — 60-second product demo composition for 小红书 / VC / hackathon.
 *
 * Distinct from the 90s Hero `Vibex` composition: this one is product-
 * walkthrough oriented and composes in Alex's screen recordings via
 * `<Video>` components (once available in /public/recordings/).
 *
 * Timeline (30fps, 1800 frames total):
 *   0    –  90   (0-3s)   · Hook            · "Shipped 12 AI projects. Zero caught fire."
 *   90   –  240  (3-8s)   · Reveal          · Hammer strikes anvil, VIBEXFORGE ignites
 *   240  –  540  (8-18s)  · ForgeAction     · /launch — paste repo, plates glow
 *   540  –  840  (18-28s) · ReviewStream    · AI review streams (Claude critique)
 *   840  –  1140 (28-38s) · EvolveRank      · Seed → Myth ladder + /hunt leaderboard
 *   1140 –  1440 (38-48s) · Differentiation · "Solo-built. Open source. Free."
 *   1440 –  1800 (48-60s) · CTAForge        · CRT monitor + vibexforge.com + mascot
 *
 * Render:
 *   npm run remotion:demo       → English primary
 *   npm run remotion:demo-zh    → Chinese primary
 *
 * Design references (applied in each scene):
 *   - Stripe: cubic-bezier(0.2, 0.8, 0.1, 1) easing, <500ms transitions
 *   - Vercel Ship: metallic ferrofluid tones, mix-blend-mode wipes
 *   - Arc Browser: authenticity > polish (especially Scene 1 hook)
 *   - Remotion SaaS Showcase: browser device frame + cursor guides
 */

import { AbsoluteFill, Sequence } from "remotion";
import { COLORS } from "./tokens";
import { Hook } from "./scenes/demo/Hook";
import { Reveal } from "./scenes/demo/Reveal";
import { ForgeAction } from "./scenes/demo/ForgeAction";
import { ReviewStream } from "./scenes/demo/ReviewStream";
import { EvolveRank } from "./scenes/demo/EvolveRank";
import { Differentiation } from "./scenes/demo/Differentiation";
import { CTAForge } from "./scenes/demo/CTAForge";

export type Locale = "en" | "zh";

export type DemoProps = {
  locale: Locale;
};

const SCENE = {
  hook: { from: 0, len: 90 },
  reveal: { from: 90, len: 150 },
  forgeAction: { from: 240, len: 300 },
  reviewStream: { from: 540, len: 300 },
  evolveRank: { from: 840, len: 300 },
  differentiation: { from: 1140, len: 300 },
  ctaForge: { from: 1440, len: 360 },
} as const;

export const Demo = ({ locale }: DemoProps) => {
  return (
    <AbsoluteFill
      style={{
        background: COLORS.BG_DEEP,
        fontFamily: "monospace",
      }}
    >
      {/* Subtle scanline overlay — same as Vibex composition for visual cohesion. */}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "repeating-linear-gradient(0deg, transparent 0 3px, rgba(0,0,0,0.12) 3px 4px)",
          opacity: 0.3,
          zIndex: 100,
        }}
      />

      <Sequence from={SCENE.hook.from} durationInFrames={SCENE.hook.len}>
        <Hook locale={locale} />
      </Sequence>

      <Sequence from={SCENE.reveal.from} durationInFrames={SCENE.reveal.len}>
        <Reveal locale={locale} />
      </Sequence>

      <Sequence
        from={SCENE.forgeAction.from}
        durationInFrames={SCENE.forgeAction.len}
      >
        <ForgeAction locale={locale} />
      </Sequence>

      <Sequence
        from={SCENE.reviewStream.from}
        durationInFrames={SCENE.reviewStream.len}
      >
        <ReviewStream locale={locale} />
      </Sequence>

      <Sequence
        from={SCENE.evolveRank.from}
        durationInFrames={SCENE.evolveRank.len}
      >
        <EvolveRank locale={locale} />
      </Sequence>

      <Sequence
        from={SCENE.differentiation.from}
        durationInFrames={SCENE.differentiation.len}
      >
        <Differentiation locale={locale} />
      </Sequence>

      <Sequence
        from={SCENE.ctaForge.from}
        durationInFrames={SCENE.ctaForge.len}
      >
        <CTAForge locale={locale} />
      </Sequence>
    </AbsoluteFill>
  );
};
