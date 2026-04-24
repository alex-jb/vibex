"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   LazyVideo — viewport-gated <video> wrapper.
   Only plays when the element intersects the viewport (+100px rootMargin),
   pauses the moment it scrolls out, and uses preload="none" so off-screen
   videos never fetch even metadata. Prevents a /home or /hunt grid of
   demo_video_url cards from starting 20 decoders at once.

   Usage:
     <LazyVideo src={demoVideoUrl} style={{ width: 108, height: 108, objectFit: 'cover' }} />

   Caller controls sizing + any filters via `style`. The wrapper only
   enforces the muted/loop/playsInline flags that every auto-play
   <video> needs to satisfy browser autoplay policies.
   ═══════════════════════════════════════════════════════════════════════════ */

export function LazyVideo({
  src,
  style,
  className,
  poster,
}: {
  src: string;
  style?: CSSProperties;
  className?: string;
  /** Optional still image shown before the first frame decodes. Pass the
      evo sprite URL so a card transitioning from sprite → video never
      flashes black on first paint. */
  poster?: string;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void v.play().catch(() => {
            /* autoplay rejection (iOS silent-mode strict) — acceptable */
          });
        } else {
          v.pause();
        }
      },
      { threshold: 0.01, rootMargin: "100px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      className={className}
      style={style}
    />
  );
}
