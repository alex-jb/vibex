/**
 * ProjectTrailer — 10s parametric trailer for seed projects on /home.
 *
 * Renders into `projects.demo_video_url` for mock cards (id=3,5,9) so each
 * HeroCard plays a distinct, branded trailer instead of reusing the shared
 * vibex-demo-v1.mp4. Parametric: pass project-specific name/tagline/mockup
 * paths via --props at render time so one Composition serves all variants.
 *
 * Output: 720×720 square MP4 (matches HeroCard's objectFit:cover at 108×108
 * display; 720 gives headroom for /project/[id] detail-page scaling without
 * looking blurry). Duration 300f @ 30fps = 10s, loops seamlessly on /home.
 *
 * Timeline (300 frames):
 *   0-60     Sprite arrival: evolution sprite drops from top with spring
 *            bounce + forge ember glow bloom behind.
 *   60-150   Project name typewriter (VT323) + tagline fade.
 *   150-260  Three mockup frames crossfade (each ~36f visible + 4f fade).
 *            Scanline overlay on all three for retro-CRT cohesion with
 *            the rest of Direction A.
 *   260-300  End card: "Forged on VibeXForge" + URL pulse. Loops back
 *            to 0 smoothly because sprite re-enters with the same spring.
 *
 * Why parametric over 3 separate compositions: avoids triple-maintenance
 * when we tune animation timing. Render CLI --props is ergonomic and matches
 * the Vibex/DemoVC locale-prop precedent in Root.tsx.
 */

import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT_PIXEL, FONT_RETRO, FONT_UI } from "./tokens";

export type TrailerStage =
  | "Seed"
  | "Active"
  | "Growing"
  | "Breakout"
  | "Legend"
  | "Myth";

const STAGE_SPRITE: Record<TrailerStage, string> = {
  Seed: "/generated/evo-1-seed.png",
  Active: "/generated/evo-2-active.png",
  Growing: "/generated/evo-3-growing.png",
  Breakout: "/generated/evo-4-breakout.png",
  Legend: "/generated/evo-5-legend.png",
  Myth: "/generated/evo-6-myth.png",
};

const STAGE_GLOW: Record<TrailerStage, string> = {
  Seed: "#d4d4d8",
  Active: "#22c55e",
  Growing: COLORS.NEON_CYAN,
  Breakout: COLORS.NEON_PINK,
  Legend: "#EF4444",
  Myth: COLORS.NEON_ORANGE,
};

export type TrailerProps = {
  name: string;
  tagline: string;
  mockup1?: string;
  mockup2?: string;
  mockup3?: string;
  stage: TrailerStage;
};

export const ProjectTrailer = ({
  name,
  tagline,
  mockup1,
  mockup2,
  mockup3,
  stage,
}: TrailerProps) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const spriteSrc = staticFile(STAGE_SPRITE[stage]);
  const glowColor = STAGE_GLOW[stage];

  // Accept mockup props as `/generated-gpt/foo.png`-style paths and
  // wrap with staticFile() so Chromium fetches them from the bundle's
  // public/ dir. Absolute http(s) URLs (future CDN scenario) pass through.
  const toSrc = (p?: string) =>
    p ? (p.startsWith("http") ? p : staticFile(p)) : undefined;
  const mockup1Src = toSrc(mockup1);
  const mockup2Src = toSrc(mockup2);
  const mockup3Src = toSrc(mockup3);

  // Sprite drop: spring from top, settles at center-top. Re-enters near
  // loop point (frame > 280) so the transition back to 0 is seamless.
  const spriteProgress = spring({
    frame: frame < 280 ? frame : frame - 280,
    fps,
    config: { damping: 12, mass: 0.8 },
    durationInFrames: 40,
  });
  const spriteY = interpolate(spriteProgress, [0, 1], [-180, 0]);

  // Sprite gentle idle sway after landing.
  const idleFrame = Math.max(0, frame - 30);
  const spriteSway = Math.sin(idleFrame * 0.08) * 4;

  // Ember glow bloom pulse.
  const emberPulse = 0.55 + 0.2 * Math.sin(frame * 0.06);

  // Project name typewriter: frames 60-130.
  const nameChars = Math.floor(
    interpolate(frame, [60, 130], [0, name.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const nameVisible = name.slice(0, nameChars);

  // Tagline fades in after name completes.
  const taglineOpacity = interpolate(frame, [130, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Name/tagline fade OUT as mockups take over.
  const headerOpacity = interpolate(frame, [150, 170], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Three mockup windows: each gets ~36f visible + 4f overlap for crossfade.
  //   m1: 150-190  (fade-in 150-160, hold 160-186, fade-out 186-190)
  //   m2: 186-226  (fade-in 186-196, hold 196-222, fade-out 222-226)
  //   m3: 222-260  (fade-in 222-232, hold 232-256, fade-out 256-260)
  const mockup1Opacity = interpolate(
    frame,
    [150, 160, 186, 190],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const mockup2Opacity = interpolate(
    frame,
    [186, 196, 222, 226],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const mockup3Opacity = interpolate(
    frame,
    [222, 232, 256, 260],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // End card: 260-300. "Forged on VibeXForge" + URL with orange glow pulse.
  const endCardOpacity = interpolate(frame, [260, 275], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const urlGlow = 0.4 + 0.2 * Math.sin(frame * 0.12);

  // Loop-out fade on frames 295-300 so the seam back to frame 0 hides
  // any residual end-card pixels behind the fresh sprite drop.
  const loopFade = interpolate(
    frame,
    [295, durationInFrames],
    [1, 0.7],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        background: COLORS.BG_DEEP,
        opacity: loopFade,
        fontFamily: FONT_PIXEL,
      }}
    >
      {/* Forge ember bloom — always visible, modulates with frame */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 900,
          height: 900,
          marginLeft: -450,
          marginTop: -450,
          borderRadius: "50%",
          background: `radial-gradient(closest-side, ${COLORS.NEON_ORANGE}55, transparent 70%)`,
          filter: "blur(60px)",
          opacity: emberPulse,
        }}
      />

      {/* Corner brackets — Direction A signature frame */}
      <Corners color={COLORS.NEON_ORANGE} />

      {/* Sprite — top-center, drops in, gentle sway */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 80,
          transform: `translate(calc(-50% + ${spriteSway}px), ${spriteY}px)`,
          width: 256,
          height: 256,
          filter: `drop-shadow(0 0 30px ${glowColor}cc) drop-shadow(4px 4px 0 #000)`,
        }}
      >
        <Img
          src={spriteSrc}
          style={{
            width: "100%",
            height: "100%",
            imageRendering: "pixelated",
          }}
        />
      </div>

      {/* Name + tagline block — lower third */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 120,
          textAlign: "center",
          opacity: headerOpacity,
          zIndex: 3,
        }}
      >
        <div
          style={{
            fontFamily: FONT_PIXEL,
            fontSize: 56,
            letterSpacing: 4,
            color: COLORS.TEXT_CREAM,
            textShadow: `4px 4px 0 #000, 0 0 24px ${COLORS.NEON_ORANGE}66`,
            marginBottom: 20,
          }}
        >
          {nameVisible}
          <span style={{ opacity: frame % 30 < 15 ? 1 : 0 }}>_</span>
        </div>
        <div
          style={{
            fontFamily: FONT_RETRO,
            fontSize: 36,
            color: COLORS.TEXT_MUTED,
            opacity: taglineOpacity,
            letterSpacing: 1,
            padding: "0 60px",
            lineHeight: 1.3,
          }}
        >
          {tagline}
        </div>
      </div>

      {/* Mockup 1 */}
      {mockup1Src ? (
        <MockupFrame
          src={mockup1Src}
          opacity={mockup1Opacity}
          label="01"
          accent={glowColor}
        />
      ) : (
        <PlaceholderFrame
          opacity={mockup1Opacity}
          label="01"
          accent={glowColor}
          text={name}
        />
      )}

      {/* Mockup 2 */}
      {mockup2Src ? (
        <MockupFrame
          src={mockup2Src}
          opacity={mockup2Opacity}
          label="02"
          accent={glowColor}
        />
      ) : (
        <PlaceholderFrame
          opacity={mockup2Opacity}
          label="02"
          accent={glowColor}
          text={name}
        />
      )}

      {/* Mockup 3 */}
      {mockup3Src ? (
        <MockupFrame
          src={mockup3Src}
          opacity={mockup3Opacity}
          label="03"
          accent={glowColor}
        />
      ) : (
        <PlaceholderFrame
          opacity={mockup3Opacity}
          label="03"
          accent={glowColor}
          text={name}
        />
      )}

      {/* End card */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: endCardOpacity,
          gap: 24,
          zIndex: 5,
        }}
      >
        <div
          style={{
            fontFamily: FONT_UI,
            fontSize: 18,
            letterSpacing: 4,
            color: COLORS.TEXT_MUTED,
          }}
        >
          FORGED ON
        </div>
        <div
          style={{
            fontFamily: FONT_PIXEL,
            fontSize: 72,
            letterSpacing: 8,
            background: `linear-gradient(180deg, ${COLORS.FORGE_CREAM} 0%, ${COLORS.NEON_YELLOW} 50%, #B8860B 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(4px 4px 0 #000)",
          }}
        >
          VibeXForge
        </div>
        <div
          style={{
            fontFamily: FONT_PIXEL,
            fontSize: 24,
            letterSpacing: 3,
            color: COLORS.NEON_ORANGE,
            textShadow: `3px 3px 0 #000, 0 0 ${24 * urlGlow}px ${COLORS.NEON_ORANGE}`,
            marginTop: 12,
          }}
        >
          vibexforge.com
        </div>
      </div>

      {/* Scanline overlay — ties trailer to retro-game aesthetic */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 3px)",
          pointerEvents: "none",
          zIndex: 10,
          mixBlendMode: "multiply",
        }}
      />
    </AbsoluteFill>
  );
};

/* ═══ Subcomponents ═══════════════════════════════════════════════════════ */

const MockupFrame = ({
  src,
  opacity,
  label,
  accent,
}: {
  src: string;
  opacity: number;
  label: string;
  accent: string;
}) => (
  <div
    style={{
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      width: 560,
      height: 400,
      opacity,
      zIndex: 4,
      border: `4px solid ${accent}`,
      boxShadow: `0 0 40px ${accent}aa, 8px 8px 0 #000`,
      background: COLORS.BG_CARD,
      overflow: "hidden",
    }}
  >
    <Img
      src={src}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        imageRendering: "pixelated",
      }}
    />
    <div
      style={{
        position: "absolute",
        top: 8,
        left: 12,
        fontFamily: "'Silkscreen', 'Press Start TwoP', monospace",
        fontSize: 14,
        color: accent,
        letterSpacing: 2,
        textShadow: "2px 2px 0 #000",
      }}
    >
      {label}
    </div>
  </div>
);

const PlaceholderFrame = ({
  opacity,
  label,
  accent,
  text,
}: {
  opacity: number;
  label: string;
  accent: string;
  text: string;
}) => (
  <div
    style={{
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      width: 560,
      height: 400,
      opacity,
      zIndex: 4,
      border: `4px solid ${accent}`,
      boxShadow: `0 0 40px ${accent}aa, 8px 8px 0 #000`,
      background: `linear-gradient(135deg, ${COLORS.BG_CARD} 0%, ${COLORS.BG_PANEL} 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 20,
    }}
  >
    <div
      style={{
        fontFamily: "'Silkscreen', 'Press Start TwoP', monospace",
        fontSize: 16,
        color: accent,
        letterSpacing: 4,
        opacity: 0.7,
      }}
    >
      PREVIEW {label}
    </div>
    <div
      style={{
        fontFamily: "'Press Start TwoP', monospace",
        fontSize: 36,
        color: COLORS.TEXT_CREAM,
        letterSpacing: 4,
        textShadow: `3px 3px 0 #000, 0 0 20px ${accent}88`,
      }}
    >
      {text}
    </div>
    <div
      style={{
        position: "absolute",
        top: 8,
        left: 12,
        fontFamily: "'Silkscreen', 'Press Start TwoP', monospace",
        fontSize: 14,
        color: accent,
        letterSpacing: 2,
        textShadow: "2px 2px 0 #000",
      }}
    >
      {label}
    </div>
  </div>
);

const Corners = ({ color }: { color: string }) => (
  <>
    {["tl", "tr", "bl", "br"].map((p) => (
      <div
        key={p}
        style={{
          position: "absolute",
          width: 40,
          height: 40,
          top: p.startsWith("t") ? 24 : "auto",
          bottom: p.startsWith("b") ? 24 : "auto",
          left: p.endsWith("l") ? 24 : "auto",
          right: p.endsWith("r") ? 24 : "auto",
          borderTop: p.startsWith("t") ? `4px solid ${color}` : undefined,
          borderBottom: p.startsWith("b") ? `4px solid ${color}` : undefined,
          borderLeft: p.endsWith("l") ? `4px solid ${color}` : undefined,
          borderRight: p.endsWith("r") ? `4px solid ${color}` : undefined,
        }}
      />
    ))}
  </>
);
