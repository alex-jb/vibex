/**
 * Root — declares the composition that Remotion Studio + the render CLI
 * can target. One canonical composition for now (Vibex). Add more as we
 * need per-locale or per-social-platform variants (Twitter 16:9, TikTok
 * 9:16, PH 16:9 with different CTA, etc).
 */

import { Composition } from "remotion";
import { Vibex } from "./Vibex";

const FPS = 30;
const DURATION_SECONDS = 90;
const WIDTH = 1920;
const HEIGHT = 1080;

export const RemotionRoot = () => (
  <>
    <Composition
      id="Vibex"
      component={Vibex}
      durationInFrames={FPS * DURATION_SECONDS}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{
        locale: "en" as const,
      }}
    />
  </>
);
