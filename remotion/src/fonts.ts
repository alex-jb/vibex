/**
 * Font loader — imports Google Fonts via @remotion/google-fonts so the
 * rendering Chromium actually has the typefaces bundled instead of
 * falling back to ui-monospace.
 *
 * Imported once at Root.tsx top — triggers the loadFont() side effects
 * before any composition renders. Benefits both Vibex and Demo.
 *
 * Caveat: Remotion renames families to avoid starting with a digit.
 *   Press Start 2P  →  "Press Start TwoP"
 *   VT323           →  "VTThreeTwoThree"
 *   Silkscreen      →  "Silkscreen" (unchanged)
 */

import { loadFont as loadPressStart2P } from "@remotion/google-fonts/PressStart2P";
import { loadFont as loadVT323 } from "@remotion/google-fonts/VT323";
import { loadFont as loadSilkscreen } from "@remotion/google-fonts/Silkscreen";

loadPressStart2P();
loadVT323();
loadSilkscreen();

/**
 * Canonical font strings. Prefer importing these over string literals so
 * a future font swap doesn't miss a callsite.
 */
export const FONTS = {
  PIXEL: "'Press Start TwoP', 'Press Start 2P', monospace",
  RETRO: "'VTThreeTwoThree', 'VT323', monospace",
  UI: "'Silkscreen', 'Press Start TwoP', monospace",
} as const;
