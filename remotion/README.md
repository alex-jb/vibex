# Remotion — VibeX canonical hero video

This subdirectory contains the Remotion project that renders the 60-90s
canonical hero video used for:

- Product Hunt featured video (required hero asset on launch day)
- vibexforge.com landing page embedded video
- Twitter pinned tweet attachment
- GitHub release page video
- DEV.to article cover GIF (first 8 seconds loop)

## Why Remotion over screen recording

Screen recording (Cap, Screen Studio) gives ~85% polish for ~10% effort —
that's the right call for Twitter / HN clips. For the one canonical video
that sits on Product Hunt forever, we want:

1. **Pixel-perfect visual continuity with the product.** Remotion lets us
   `import { HeroCard } from "@/components/home/hero-card"` directly into
   the video composition. The card that renders in the video is literally
   the same React component that renders on /home. No "approximately close"
   screenshots — bit-exact match.
2. **Deterministic animation timing.** Framer-motion timings inside the
   product are non-deterministic at 30fps — they'll rarely render exactly
   the same twice. Remotion renders each frame pure, so the forge-unveil
   happens at 40.0s every single render.
3. **Multi-language rendering.** Same codebase, different locale →
   different subtitle track. Swap `<CTA />` copy between EN / ZH via a
   composition prop.
4. **Versionable.** Future HeroCard changes auto-propagate into the video
   when we re-render. Screen recordings go stale after the first visual
   sweep.

## Setup

Remotion deps are declared in the root `package.json`. First time:

```bash
npm install
npm run remotion:dev
```

This opens Remotion Studio at http://localhost:3000 with live preview.

## Render

```bash
# Full 90s 1080p60 MP4:
npm run remotion:render

# Preview frame at any time (faster iteration):
npx remotion still remotion/src/index.ts Vibex out/frame.png --frame=1200
```

Output lands in `out/vibex-hero-v3.mp4`.

## Scene timeline (90s total, 30fps = 2700 frames)

| Range | Scene | Length | Purpose |
|---|---|---|---|
| 0–8s | `Hero` | 8s (240f) | Hook. "You shipped. Nobody clicked." Pixel title card. |
| 8–25s | `LaunchFill` | 17s (510f) | Filling the forge plates, live preview builds. |
| 25–40s | `StrikeAnvil` | 15s (450f) | The button press + hammer shake + sparks. |
| 40–70s | `ForgeUnveil` | 30s (900f) | The 3.5s unveil animation expanded to 30s on-screen with pause moments so each attribute bar reads. |
| 70–90s | `CTA` | 20s (600f) | "Launch your AI project. vibexforge.com" + QR code. |

## Fonts

Press Start 2P + VT323 loaded via Google Fonts CSS2 API at build time (see
`remotion.config.ts`). Same fonts as the live product for continuity.

## Colors

All colors inlined from `app/retro-game.css` design tokens to match the
Direction A palette. Do not re-define colors in scene files — import from
`remotion/src/tokens.ts`.
