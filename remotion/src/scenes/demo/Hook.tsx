/**
 * Hook — 0-3s (90 frames).
 *
 * Arc-Browser-style authentic opener. Dark screen. Three rapid-flicker
 * "fake social posts" appear with 0/0/0 engagement numbers, each
 * crossed out with a red slash. Then cut to black before Reveal.
 *
 * Design: leans on negative space + text rhythm, not graphics.
 */

import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { COLORS, FONT_PIXEL, FONT_RETRO } from "../../tokens";
import { Caption } from "./Caption";
import type { Locale } from "../../Demo";

const EASE_OUT = Easing.bezier(0.2, 0.8, 0.1, 1);

type FakePost = {
  platform: string;
  title: string;
  metric: string;
};

const POSTS: FakePost[] = [
  { platform: "HN", title: "Show HN: AgentForge — AI agent builder", metric: "3 points · 0 comments" },
  { platform: "r/SideProject", title: "I built a Claude-powered launch tool", metric: "2 upvotes · 0 comments" },
  { platform: "X", title: "ship 🚀 https://ai-thing.com", metric: "4 views · 0 retweets" },
];

export const Hook = ({ locale }: { locale: Locale }) => {
  const frame = useCurrentFrame();

  // Each post gets ~25 frames of stage time, overlapping slightly.
  // Post i: visible from i*20 to i*20 + 30.
  const postTimings = POSTS.map((_, i) => ({
    in: i * 20,
    out: i * 20 + 30,
    slashIn: i * 20 + 14,
  }));

  return (
    <AbsoluteFill
      style={{
        background: COLORS.BG_DEEP,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Posts stack vertically, each with its own timing */}
      <div
        style={{
          position: "relative",
          width: 1100,
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        {POSTS.map((post, i) => {
          const t = postTimings[i];
          const appear = interpolate(frame, [t.in, t.in + 6], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: EASE_OUT,
          });
          const translateY = interpolate(appear, [0, 1], [18, 0]);
          const slashProgress = interpolate(
            frame,
            [t.slashIn, t.slashIn + 10],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
          );

          return (
            <div
              key={i}
              style={{
                opacity: appear,
                transform: `translateY(${translateY}px)`,
                padding: "18px 26px",
                background: COLORS.BG_CARD,
                border: `1px solid ${COLORS.BORDER}`,
                display: "flex",
                alignItems: "center",
                gap: 22,
                position: "relative",
              }}
            >
              {/* platform tag */}
              <div
                style={{
                  fontFamily: FONT_PIXEL,
                  fontSize: 16,
                  color: COLORS.NEON_ORANGE,
                  padding: "6px 10px",
                  border: `1px solid ${COLORS.NEON_ORANGE_DIM}`,
                  minWidth: 130,
                  textAlign: "center",
                  letterSpacing: 1,
                }}
              >
                {post.platform}
              </div>

              {/* post content */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: FONT_RETRO,
                    fontSize: 30,
                    color: COLORS.TEXT,
                    lineHeight: 1.2,
                    marginBottom: 4,
                  }}
                >
                  {post.title}
                </div>
                <div
                  style={{
                    fontFamily: "ui-monospace, monospace",
                    fontSize: 16,
                    color: COLORS.TEXT_DIM,
                  }}
                >
                  {post.metric}
                </div>
              </div>

              {/* red diagonal slash — single rotated line that scales
                  in from the left edge (more precise than the old
                  clip-path polygon and renders cleaner). */}
              <div
                style={{
                  position: "absolute",
                  top: "52%",
                  left: "-6%",
                  width: "112%",
                  height: 4,
                  background: "#ff3b3b",
                  boxShadow: "0 0 10px #ff3b3b, 0 0 2px #fff",
                  transform: `rotate(-6deg) scaleX(${slashProgress})`,
                  transformOrigin: "left center",
                  opacity: slashProgress,
                  pointerEvents: "none",
                }}
              />
            </div>
          );
        })}
      </div>

      <Caption
        locale={locale}
        en="Shipped 12 AI projects. Zero caught fire."
        zh="做了 12 个 AI 项目，零火"
        inFrame={12}
        outFrame={90}
      />
    </AbsoluteFill>
  );
};
