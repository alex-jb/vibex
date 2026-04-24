/**
 * Root — declares the compositions that Remotion Studio + the render CLI
 * can target.
 *
 * - Vibex  · 90s hero motion-graphics composition (branding reel, no product UI)
 * - Demo   · 60s product demo (Scenes 3/4/5 slot in screen recordings from
 *            public/recordings/ once Alex captures them; until then, they
 *            render with post-Direction-A screenshots as backgrounds)
 *
 * Each is bilingual via the `locale` prop. Render targets:
 *   npm run remotion:render       → Vibex EN
 *   npm run remotion:render-zh    → Vibex ZH
 *   npm run remotion:demo         → Demo EN
 *   npm run remotion:demo-zh      → Demo ZH
 */

import { Composition } from "remotion";
// Side-effect import: loads Press Start 2P / VT323 / Silkscreen via
// @remotion/google-fonts so compositions render with the bundled
// typefaces instead of ui-monospace fallback.
import "./fonts";
import { Vibex } from "./Vibex";
import { Demo } from "./Demo";
import { DemoVC } from "./DemoVC";
import { DemoVertical } from "./DemoVertical";
import { OgImage } from "./OgImage";
import { ProjectTrailer } from "./ProjectTrailer";

const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;

export const RemotionRoot = () => (
  <>
    <Composition
      id="Vibex"
      component={Vibex}
      durationInFrames={FPS * 90}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{
        locale: "en" as const,
      }}
    />

    <Composition
      id="Demo"
      component={Demo}
      durationInFrames={FPS * 60}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{
        locale: "en" as const,
      }}
    />

    <Composition
      id="DemoVC"
      component={DemoVC}
      durationInFrames={FPS * 140}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{
        locale: "en" as const,
      }}
    />

    <Composition
      id="DemoVertical"
      component={DemoVertical}
      durationInFrames={FPS * 60}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{
        locale: "en" as const,
      }}
    />

    {/* Static composition — renders one frame via `remotion still`. */}
    <Composition
      id="OgImage"
      component={OgImage}
      durationInFrames={1}
      fps={30}
      width={1200}
      height={630}
    />

    {/* ProjectTrailer — parametric 10s seed-card trailer for /home.
        Rendered 3x with different --props for DreamBoard / SketchToApp /
        PixelMind. Square 720×720 to match HeroCard objectFit:cover. */}
    <Composition
      id="ProjectTrailer"
      component={ProjectTrailer}
      durationInFrames={FPS * 10}
      fps={FPS}
      width={720}
      height={720}
      defaultProps={{
        name: "Project",
        tagline: "A tagline goes here.",
        stage: "Active" as const,
      }}
    />
  </>
);
