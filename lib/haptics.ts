/**
 * Haptic vibration scaffold — SCAFFOLD 2026-06-14
 *
 * Companion to lib/sound.ts. Same event vocabulary. Use them together
 * for the full sensory layer:
 *
 *   import { playForge } from "@/lib/sound";
 *   import { vibrate } from "@/lib/haptics";
 *
 *   function onSubmit() {
 *     playForge("submit");
 *     vibrate("submit");
 *     ...
 *   }
 *
 * Browser support reality:
 * - Android Chrome / Firefox / Samsung Browser: navigator.vibrate works.
 * - iOS Safari: navigator.vibrate is a no-op (Apple removed it). Sound
 *   carries the sensory load on iOS until iOS adds the Web Vibration API.
 * - Desktop: no-op everywhere.
 *
 * No "fallback" — silent no-op is the correct behavior. Don't try to
 * fake haptics with a screen-shake animation; that just gets in the way.
 */

import type { ForgeEvent } from "./sound";

/**
 * Per-event vibration pattern. Numbers are milliseconds.
 * Single-number = single pulse. Array = pulse/pause/pulse/pause.
 */
const PATTERNS: Record<ForgeEvent, number | number[]> = {
  "anvil-tap": 18, // crisp tick
  submit: [25, 30, 25], // double-tap confirmation
  "level-up": [10, 40, 10, 40, 60], // ascending celebration
  upvote: 12, // subtle feedback
  "evolution-stage": [40, 80, 80], // weighty stage-change
  // Funeral toll: single slow weighted pulse. Not multi-pulse — the spec
  // is "single low bell", a one-tap haptic matches that tonal register.
  "funeral-toll": 80,
};

/**
 * Trigger a haptic pulse for an RPG-forge event.
 *
 * No-op on server, no-op on browsers without Vibration API, no-op when
 * the page isn't user-activated yet. Never throws.
 */
export function vibrate(event: ForgeEvent): void {
  if (typeof window === "undefined") return;
  if (typeof navigator === "undefined") return;
  // navigator.vibrate is missing on iOS Safari + desktop browsers.
  if (typeof navigator.vibrate !== "function") return;

  const pattern = PATTERNS[event];
  if (pattern === undefined) return;

  try {
    navigator.vibrate(pattern);
  } catch {
    // Some browsers throw if the page isn't user-activated. Swallow.
  }
}
