/**
 * OgImage — 1200×630 Open Graph / GitHub repo social preview.
 *
 * Static render (single frame). Used for:
 *   - GitHub repo "social preview" (Settings → General → Social preview)
 *   - Twitter / X link card when someone shares vibexforge.com
 *   - LinkedIn / Slack / Discord link unfurls
 *   - Email cover image for VC cold emails
 *
 * Render:
 *   npm run remotion:og-image  → out/vibex-og-image.png
 */

import { AbsoluteFill, Img, staticFile } from "remotion";
import { COLORS, FONT_PIXEL, FONT_RETRO } from "./tokens";

export const OgImage = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.BG_DEEP }}>
      {/* Background grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${COLORS.BORDER_HAIR} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.BORDER_HAIR} 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          opacity: 0.5,
        }}
      />

      {/* Forge radial glow bottom-right */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 85% 75%, ${COLORS.NEON_ORANGE}66 0%, ${COLORS.NEON_ORANGE}22 25%, transparent 55%)`,
        }}
      />

      {/* Scanlines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,0.2) 2px 3px)",
          pointerEvents: "none",
        }}
      />

      {/* Corner brackets — arcade frame */}
      {[
        { top: 28, left: 28, borderTop: true, borderLeft: true },
        { top: 28, right: 28, borderTop: true, borderRight: true },
        { bottom: 28, left: 28, borderBottom: true, borderLeft: true },
        { bottom: 28, right: 28, borderBottom: true, borderRight: true },
      ].map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 44,
            height: 44,
            ...(p.top !== undefined ? { top: p.top } : {}),
            ...(p.left !== undefined ? { left: p.left } : {}),
            ...(p.right !== undefined ? { right: p.right } : {}),
            ...(p.bottom !== undefined ? { bottom: p.bottom } : {}),
            ...(p.borderTop ? { borderTop: `4px solid ${COLORS.NEON_ORANGE}` } : {}),
            ...(p.borderLeft ? { borderLeft: `4px solid ${COLORS.NEON_ORANGE}` } : {}),
            ...(p.borderRight ? { borderRight: `4px solid ${COLORS.NEON_ORANGE}` } : {}),
            ...(p.borderBottom ? { borderBottom: `4px solid ${COLORS.NEON_ORANGE}` } : {}),
          }}
        />
      ))}

      {/* Top-left tag */}
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 80,
          fontFamily: FONT_PIXEL,
          fontSize: 14,
          color: COLORS.NEON_ORANGE,
          letterSpacing: 4,
          opacity: 0.8,
        }}
      >
        ▸ VIBEXFORGE://OG
      </div>

      {/* Main content — left-aligned brand + tagline */}
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 80,
          right: 300,
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        {/* Brand */}
        <div
          style={{
            fontFamily: FONT_PIXEL,
            fontSize: 68,
            color: COLORS.NEON_ORANGE,
            letterSpacing: 6,
            lineHeight: 1,
            textShadow: `0 0 40px ${COLORS.NEON_ORANGE}AA, 5px 5px 0 ${COLORS.FORGE_DARK}`,
          }}
        >
          VIBEXFORGE
        </div>

        {/* Tagline — 3 verbs */}
        <div
          style={{
            display: "flex",
            gap: 28,
            alignItems: "baseline",
          }}
        >
          {["FORGE.", "CRITIQUE.", "EVOLVE."].map((word, i) => (
            <div
              key={word}
              style={{
                fontFamily: FONT_PIXEL,
                fontSize: 28,
                color: i === 0 ? COLORS.FORGE_CREAM : COLORS.TEXT_CREAM,
                letterSpacing: 4,
                textShadow: `2px 2px 0 #000`,
              }}
            >
              {word}
            </div>
          ))}
        </div>

        {/* Sub-tagline */}
        <div
          style={{
            fontFamily: FONT_RETRO,
            fontSize: 30,
            color: COLORS.TEXT_MUTED,
            letterSpacing: 1,
            maxWidth: 620,
            lineHeight: 1.3,
          }}
        >
          The growth layer for AI creators.<br />
          Claude critiques your project in 30 seconds.
        </div>
      </div>

      {/* Mascot right side */}
      <div
        style={{
          position: "absolute",
          top: 180,
          right: 90,
          width: 200,
          height: 200,
          filter: `drop-shadow(0 14px 0 rgba(0,0,0,0.6)) drop-shadow(0 0 36px ${COLORS.NEON_ORANGE})`,
        }}
      >
        <Img
          src={staticFile("generated/mascot-v1.png")}
          style={{
            width: "100%",
            height: "100%",
            imageRendering: "pixelated",
          }}
        />
      </div>

      {/* Bottom strip — URL + github */}
      <div
        style={{
          position: "absolute",
          bottom: 64,
          left: 80,
          right: 80,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 20,
          borderTop: `2px solid ${COLORS.NEON_ORANGE_DIM}`,
        }}
      >
        <div
          style={{
            fontFamily: FONT_PIXEL,
            fontSize: 22,
            color: COLORS.FORGE_CREAM,
            letterSpacing: 3,
            textShadow: `0 0 20px ${COLORS.NEON_ORANGE}88`,
          }}
        >
          ▶ vibexforge.com
        </div>
        <div
          style={{
            fontFamily: FONT_RETRO,
            fontSize: 22,
            color: COLORS.TEXT_MUTED,
            letterSpacing: 1,
          }}
        >
          github.com/alex-jb/vibex · open source
        </div>
      </div>
    </AbsoluteFill>
  );
};
