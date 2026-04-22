/**
 * DemoVC — 2:20 VC-specific cut. Self-contained pitch video.
 *
 * Reuses the first 6 scenes from the 60s Demo composition (through
 * Differentiation) and replaces the consumer CTAForge with 4 new
 * VC-specific scenes: TractionBloom, MechanicDeep, MarketThesis,
 * VCCTAAsk. Leaves the 60s Demo composition untouched.
 *
 * Timeline (30fps, 4200 frames = 2:20):
 *   0    –  90   (0-3s)    · Hook            [reuse]
 *   90   –  240  (3-8s)    · Reveal          [reuse]
 *   240  –  540  (8-18s)   · ForgeAction     [reuse]
 *   540  –  840  (18-28s)  · ReviewStream    [reuse]
 *   840  –  1140 (28-38s)  · EvolveRank      [reuse]
 *   1140 –  1440 (38-48s)  · Differentiation [reuse]
 *   1440 –  2040 (48-68s)  · TractionBloom    — NEW: "43 / 57 / 119 / 925"
 *   2040 –  2640 (68-88s)  · MechanicDeep     — NEW: Seed→Myth ladder + pull-quote
 *   2640 –  3240 (88-108s) · MarketThesis     — NEW: "AI made building easy..." + 1.3M stat
 *   3240 –  4200 (108-140s)· VCCTAAsk         — NEW: 3 ask cards + contact + book-15-min closer
 *
 * Render:
 *   npm run remotion:demo-vc      → English primary
 *   npm run remotion:demo-vc-zh   → Chinese primary
 *
 * Edit contact: scenes/demo-vc/VCCTAAsk.tsx → CONTACT in COPY constant.
 */

import { AbsoluteFill, Sequence } from "remotion";
import { COLORS } from "./tokens";
import { Hook } from "./scenes/demo/Hook";
import { Reveal } from "./scenes/demo/Reveal";
import { ForgeAction } from "./scenes/demo/ForgeAction";
import { ReviewStream } from "./scenes/demo/ReviewStream";
import { EvolveRank } from "./scenes/demo/EvolveRank";
import { Differentiation } from "./scenes/demo/Differentiation";
import { TractionBloom } from "./scenes/demo-vc/TractionBloom";
import { MechanicDeep } from "./scenes/demo-vc/MechanicDeep";
import { MarketThesis } from "./scenes/demo-vc/MarketThesis";
import { VCCTAAsk } from "./scenes/demo-vc/VCCTAAsk";
import type { Locale, DemoProps } from "./Demo";

const SCENE = {
  hook: { from: 0, len: 90 },
  reveal: { from: 90, len: 150 },
  forgeAction: { from: 240, len: 300 },
  reviewStream: { from: 540, len: 300 },
  evolveRank: { from: 840, len: 300 },
  differentiation: { from: 1140, len: 300 },
  tractionBloom: { from: 1440, len: 600 },
  mechanicDeep: { from: 2040, len: 600 },
  marketThesis: { from: 2640, len: 600 },
  vcCtaAsk: { from: 3240, len: 960 },
} as const;

export const DemoVC = ({ locale }: DemoProps) => {
  return (
    <AbsoluteFill
      style={{
        background: COLORS.BG_DEEP,
        fontFamily: "monospace",
      }}
    >
      {/* shared scanline overlay */}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "repeating-linear-gradient(0deg, transparent 0 3px, rgba(0,0,0,0.12) 3px 4px)",
          opacity: 0.3,
          zIndex: 100,
        }}
      />

      {/* reused demo scenes */}
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

      {/* new VC scenes */}
      <Sequence
        from={SCENE.tractionBloom.from}
        durationInFrames={SCENE.tractionBloom.len}
      >
        <TractionBloom locale={locale} />
      </Sequence>
      <Sequence
        from={SCENE.mechanicDeep.from}
        durationInFrames={SCENE.mechanicDeep.len}
      >
        <MechanicDeep locale={locale} />
      </Sequence>
      <Sequence
        from={SCENE.marketThesis.from}
        durationInFrames={SCENE.marketThesis.len}
      >
        <MarketThesis locale={locale} />
      </Sequence>
      <Sequence
        from={SCENE.vcCtaAsk.from}
        durationInFrames={SCENE.vcCtaAsk.len}
      >
        <VCCTAAsk locale={locale} />
      </Sequence>
    </AbsoluteFill>
  );
};

export type { Locale, DemoProps };
