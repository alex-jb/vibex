/* ═══════════════════════════════════════════════════════════════════════════
   Custom cursor — shared types + constants.

   Used by `components/forge/custom-cursor.tsx`. Gated to the /forge surface
   (currently `app/page.tsx` since /forge route doesn't exist yet; the
   landing hero IS the forge page). Do NOT mount site-wide — the RPG-forge
   vocabulary doesn't apply to settings / admin / messages, and a swinging
   hammer cursor over /privacy reads as broken, not as polish.

   Cuberto / Locomotive reference:
   - https://cuberto.com — cursor morphs based on hovered element
   - https://locomotive.ca — cursor follows with slight lag (rAF lerp)

   Add a new cursor state by:
   1) Adding the type to `CursorState`
   2) Adding the SVG branch in `custom-cursor.tsx`
   3) Tagging an element with `data-cursor="<state>"`
   ═══════════════════════════════════════════════════════════════════════════ */

export type CursorState = "default" | "hammer" | "spark";

/** Brand palette — keep the cursor inside the forge vocabulary. */
export const CURSOR_COLORS = {
  /** Primary forge orange — matches C.FORGE in app/page.tsx */
  FORGE: "#F97316",
  /** Cream highlight — matches C.CREAM */
  CREAM: "#FFE27D",
  /** Outline (dark) for pixel-art legibility on bright bg */
  OUTLINE: "#0A0A0C",
} as const;

/** Lag factor for the Locomotive feel. 0 = snap, 1 = no movement.
    0.18 ≈ a 3-frame trail at 60fps which reads as "smooth but responsive". */
export const CURSOR_LERP = 0.18;

/** data-cursor attribute name — typed so refactors are findable. */
export const CURSOR_DATA_ATTR = "data-cursor";
