"use client";

/**
 * ChapterBadge — pixel-art trophy unlocked per chapter completion.
 *
 * 3 designs, brand-locked:
 *   ai-drawing       — paintbrush + violet plate (Ch.1)
 *   prompt-engineering — scroll with amber wax seal (Ch.2)
 *   ai-agent         — gear with indigo glow (Ch.3)
 *
 * Used on /learn chapter cards (small 24px) + /learn/[slug] trophy panel
 * (large 64px). shape-rendering: crispEdges preserves the pixel look.
 *
 * Why inline SVG: zero asset cost, ships with the bundle, palette matches
 * brand tokens without a CSS variable indirection.
 */

import type { ChapterSlug } from "@/lib/learn";

interface Props {
  slug: ChapterSlug;
  size?: number;
  /** When true, draws a subtle radial glow behind the badge. */
  glow?: boolean;
}

export function ChapterBadge({ slug, size = 24, glow = false }: Props) {
  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {glow && (
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)",
            transform: "scale(1.8)",
          }}
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        shapeRendering="crispEdges"
        style={{ position: "relative" }}
      >
        {slug === "ai-drawing" && <PaintbrushBadge />}
        {slug === "prompt-engineering" && <ScrollBadge />}
        {slug === "ai-agent" && <GearBadge />}
      </svg>
    </div>
  );
}

/* ── Ch.1 — paintbrush on violet plate ─────────────────────────────── */
function PaintbrushBadge() {
  return (
    <>
      {/* violet plate (rounded square via 4 layered rects) */}
      <rect x="1" y="2"  width="14" height="12" fill="#6366F1" />
      <rect x="0" y="3"  width="16" height="10" fill="#6366F1" />
      <rect x="2" y="1"  width="12" height="14" fill="#6366F1" />
      {/* inner shadow */}
      <rect x="2" y="2"  width="12" height="1"  fill="#4F46E5" />
      <rect x="2" y="13" width="12" height="1"  fill="#818CF8" />
      {/* paintbrush handle */}
      <rect x="4" y="9"  width="2" height="4"  fill="#A1A1AA" />
      <rect x="5" y="11" width="2" height="2"  fill="#A1A1AA" />
      {/* ferrule */}
      <rect x="3" y="7"  width="4" height="2" fill="#F59E0B" />
      {/* bristles */}
      <rect x="2" y="4"  width="6" height="3" fill="#E8E8EC" />
      <rect x="2" y="3"  width="3" height="1" fill="#E8E8EC" />
      <rect x="5" y="3"  width="3" height="1" fill="#E8E8EC" />
      {/* paint dab on top corner */}
      <rect x="11" y="3" width="2" height="2" fill="#F59E0B" />
    </>
  );
}

/* ── Ch.2 — rolled scroll with amber wax seal ──────────────────────── */
function ScrollBadge() {
  return (
    <>
      {/* scroll body */}
      <rect x="2" y="3"  width="12" height="10" fill="#FEF3C7" />
      {/* top + bottom roll */}
      <rect x="1" y="2"  width="14" height="2" fill="#A1A1AA" />
      <rect x="1" y="12" width="14" height="2" fill="#A1A1AA" />
      <rect x="0" y="3"  width="1"  height="10" fill="#71717A" />
      <rect x="15" y="3" width="1"  height="10" fill="#71717A" />
      {/* text lines */}
      <rect x="4" y="5"  width="8" height="1" fill="#27272A" />
      <rect x="4" y="7"  width="6" height="1" fill="#27272A" />
      <rect x="4" y="9"  width="7" height="1" fill="#27272A" />
      {/* wax seal */}
      <rect x="11" y="9" width="3" height="3" fill="#DC2626" />
      <rect x="12" y="10" width="1" height="1" fill="#F59E0B" />
    </>
  );
}

/* ── Ch.3 — gear with indigo glow center ───────────────────────────── */
function GearBadge() {
  return (
    <>
      {/* outer teeth */}
      <rect x="6"  y="1"  width="4" height="2" fill="#A1A1AA" />
      <rect x="6"  y="13" width="4" height="2" fill="#A1A1AA" />
      <rect x="1"  y="6"  width="2" height="4" fill="#A1A1AA" />
      <rect x="13" y="6"  width="2" height="4" fill="#A1A1AA" />
      <rect x="3"  y="3"  width="2" height="2" fill="#A1A1AA" />
      <rect x="11" y="3"  width="2" height="2" fill="#A1A1AA" />
      <rect x="3"  y="11" width="2" height="2" fill="#A1A1AA" />
      <rect x="11" y="11" width="2" height="2" fill="#A1A1AA" />
      {/* body */}
      <rect x="4" y="2"  width="8" height="12" fill="#71717A" />
      <rect x="2" y="4"  width="12" height="8" fill="#71717A" />
      {/* inner highlight */}
      <rect x="3" y="5"  width="10" height="6" fill="#52525B" />
      {/* indigo core */}
      <rect x="6" y="6"  width="4" height="4" fill="#6366F1" />
      <rect x="7" y="7"  width="2" height="2" fill="#E8E8EC" />
    </>
  );
}
