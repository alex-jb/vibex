"use client";

import { useRef, useState, type CSSProperties } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Video wrapper that emits PostHog events for investor-funnel analysis.
 *
 * Events (name prefix "investor_video_"):
 *   - played       — first time user clicks play (once per session)
 *   - 25_percent   — user watched 25% of the duration
 *   - 50_percent   — 50%
 *   - 75_percent   — 75%
 *   - completed    — ended event fired
 *   - paused       — user paused (deliberate drop-off signal)
 *
 * Each event includes the duration seconds + current time so we can
 * reconstruct drop-off curves in PostHog.
 */
export function TrackedVideo({
  src,
  poster,
  style,
}: {
  src: string;
  poster: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  // Track which milestones fired so we don't spam the same event on every tick.
  const [fired, setFired] = useState<Set<string>>(new Set());

  const mark = (name: string, extra?: Record<string, unknown>) => {
    if (fired.has(name)) return;
    const v = ref.current;
    trackEvent(`investor_video_${name}`, {
      duration: v?.duration ?? null,
      current: v?.currentTime ?? null,
      src,
      ...extra,
    });
    setFired((prev) => {
      const next = new Set(prev);
      next.add(name);
      return next;
    });
  };

  return (
    <video
      ref={ref}
      src={src}
      controls
      preload="metadata"
      playsInline
      poster={poster}
      crossOrigin="anonymous"
      style={style}
      onPlay={() => mark("played")}
      onPause={() => {
        // Don't fire "paused" on natural end — the ended handler covers that.
        const v = ref.current;
        if (v && v.ended) return;
        trackEvent("investor_video_paused", {
          current: v?.currentTime ?? null,
          duration: v?.duration ?? null,
        });
      }}
      onEnded={() => mark("completed")}
      onTimeUpdate={() => {
        const v = ref.current;
        if (!v || !v.duration) return;
        const pct = (v.currentTime / v.duration) * 100;
        if (pct >= 25) mark("25_percent");
        if (pct >= 50) mark("50_percent");
        if (pct >= 75) mark("75_percent");
      }}
    />
  );
}
