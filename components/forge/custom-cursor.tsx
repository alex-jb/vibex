"use client";

/* ═══════════════════════════════════════════════════════════════════════════
   <CustomCursor /> — Locomotive/Cuberto-style cursor for the /forge surface.

   - Fixed-position SVG follows mousemove via requestAnimationFrame (rAF lerp)
   - Native cursor hidden on the wrapper (`cursor: none`)
   - Three states driven by `data-cursor` on the hovered element:
       • default              → small forge-orange spark dot (16px)
       • data-cursor="hammer" → pixel-art hammer (32px), for anvil/submit CTAs
       • data-cursor="spark"  → spark burst (24px), for upvote/level-up CTAs
   - `prefers-reduced-motion` → snaps directly (no lerp lag)
   - Touch/coarse-pointer devices → renders nothing (mobile has no cursor)

   Mount once per page that wants the treatment, NOT in the root layout:
       export default function Page() {
         return (
           <>
             <CustomCursor />
             ... page content ...
           </>
         );
       }

   Then tag interactive surfaces with the data attribute on the closest
   ancestor that should switch the cursor:
       <button data-cursor="hammer">▶ PRESS START</button>
       <button data-cursor="spark">▲ UPVOTE</button>

   The hover lookup walks `event.target.closest("[data-cursor]")` so wrapping
   <Link><motion.button data-cursor="hammer">…</motion.button></Link> works
   even when the click target is the inner button.

   See `docs/custom-cursor-2026-06-14.md` for expansion notes.
   ═══════════════════════════════════════════════════════════════════════════ */

import { useEffect, useRef, useState } from "react";
import { CURSOR_COLORS, CURSOR_LERP, type CursorState } from "@/lib/cursor";

/** Detect touch / coarse pointer — server renders null, hydration confirms. */
function useIsPointerDevice(): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: fine)");
    setOk(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setOk(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return ok;
}

/** Detect prefers-reduced-motion — snap instead of lerp when true. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/* ─── Default cursor: small forge spark dot ─── */
function DefaultCursor() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ imageRendering: "pixelated" }}
    >
      <circle cx="8" cy="8" r="3" fill={CURSOR_COLORS.FORGE} />
      <circle
        cx="8"
        cy="8"
        r="6"
        fill="none"
        stroke={CURSOR_COLORS.FORGE}
        strokeOpacity="0.45"
        strokeWidth="1"
      />
    </svg>
  );
}

/* ─── Hammer cursor: pixel-art hammer matching app/page.tsx anvil hammer ─── */
function HammerCursor() {
  return (
    <svg
      width={32}
      height={32}
      viewBox="0 0 20 32"
      aria-hidden="true"
      style={{ imageRendering: "pixelated", transform: "rotate(-22deg)" }}
    >
      {/* Handle */}
      <rect x="9" y="10" width="2" height="22" fill="#B89A50" />
      <rect x="8" y="10" width="1" height="22" fill={CURSOR_COLORS.CREAM} />
      <rect x="11" y="10" width="1" height="22" fill="#8A6A30" />
      {/* Hammer head */}
      <rect x="2" y="2" width="16" height="9" fill="#4a4a50" />
      <rect x="2" y="2" width="16" height="1" fill="#6a6a70" />
      <rect x="2" y="10" width="16" height="1" fill="#2a2a30" />
      {/* Hot striking tip */}
      <rect x="14" y="3" width="4" height="7" fill={CURSOR_COLORS.FORGE} />
      <rect x="15" y="4" width="2" height="5" fill="#FF7A30" />
    </svg>
  );
}

/* ─── Spark cursor: 4-point burst for upvote / level-up ─── */
function SparkCursor() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ imageRendering: "pixelated" }}
    >
      {/* Center dot */}
      <rect x="10" y="10" width="4" height="4" fill={CURSOR_COLORS.CREAM} />
      {/* 4 cardinal sparks */}
      <rect x="11" y="2" width="2" height="5" fill={CURSOR_COLORS.FORGE} />
      <rect x="11" y="17" width="2" height="5" fill={CURSOR_COLORS.FORGE} />
      <rect x="2" y="11" width="5" height="2" fill={CURSOR_COLORS.FORGE} />
      <rect x="17" y="11" width="5" height="2" fill={CURSOR_COLORS.FORGE} />
      {/* Diagonal accents */}
      <rect x="5" y="5" width="2" height="2" fill={CURSOR_COLORS.FORGE} opacity="0.7" />
      <rect x="17" y="5" width="2" height="2" fill={CURSOR_COLORS.FORGE} opacity="0.7" />
      <rect x="5" y="17" width="2" height="2" fill={CURSOR_COLORS.FORGE} opacity="0.7" />
      <rect x="17" y="17" width="2" height="2" fill={CURSOR_COLORS.FORGE} opacity="0.7" />
    </svg>
  );
}

export function CustomCursor() {
  const isPointer = useIsPointerDevice();
  const reduced = usePrefersReducedMotion();

  const cursorRef = useRef<HTMLDivElement | null>(null);
  // Target mouse position (updated synchronously on every mousemove)
  const target = useRef({ x: 0, y: 0 });
  // Rendered cursor position (lerps toward target each rAF tick)
  const current = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  const [state, setState] = useState<CursorState>("default");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isPointer) return;

    const onMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (!visible) setVisible(true);

      // Walk up to find the nearest element carrying data-cursor.
      // closest() handles wrapped buttons (Link > motion.button > span) cleanly.
      const el = (e.target as Element | null)?.closest?.("[data-cursor]");
      const raw = el?.getAttribute("data-cursor") ?? "default";
      const next: CursorState =
        raw === "hammer" || raw === "spark" ? raw : "default";
      setState((prev) => (prev === next ? prev : next));
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    // rAF loop — lerp current toward target. Reduced-motion = snap.
    const tick = () => {
      if (reduced) {
        current.current.x = target.current.x;
        current.current.y = target.current.y;
      } else {
        current.current.x +=
          (target.current.x - current.current.x) * (1 - CURSOR_LERP);
        current.current.y +=
          (target.current.y - current.current.y) * (1 - CURSOR_LERP);
      }
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0) translate(-50%, -50%)`;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [isPointer, reduced, visible]);

  // Touch / coarse pointer → render nothing AND don't hide the native cursor.
  if (!isPointer) return null;

  return (
    <>
      {/* Hide native cursor across the page when the custom cursor mounts.
          Scoped to <html> with a class so it doesn't bleed into other tabs
          / SSR. The cursor: none also covers child elements via inheritance,
          which is what we want — no half-cursor flickers on buttons. */}
      <style jsx global>{`
        html.has-custom-cursor,
        html.has-custom-cursor * {
          cursor: none !important;
        }
      `}</style>
      <CursorClassToggle />

      <div
        ref={cursorRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 9999,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.15s linear",
          willChange: "transform",
          // translate(-50%, -50%) is baked into the rAF tick so the cursor
          // is centered on the mouse position.
        }}
      >
        {state === "hammer" && <HammerCursor />}
        {state === "spark" && <SparkCursor />}
        {state === "default" && <DefaultCursor />}
      </div>
    </>
  );
}

/** Toggles `html.has-custom-cursor` class on mount/unmount. Split into its
    own component so the cursor: none style only applies while <CustomCursor />
    is mounted — navigating away from /forge restores native cursors. */
function CursorClassToggle() {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("has-custom-cursor");
    return () => {
      html.classList.remove("has-custom-cursor");
    };
  }, []);
  return null;
}

export default CustomCursor;
