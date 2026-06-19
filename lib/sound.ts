/**
 * Web Audio sound vocabulary — SCAFFOLD 2026-06-14
 *
 * Procedural placeholder sounds for the RPG forge aesthetic. Real
 * sounds will come from a Fiverr designer ($50 budget); see
 * docs/sound-vocab-2026-06-14.md for the brief.
 *
 * Design constraints (per AGENTS.md):
 * - Zero new deps. Uses Web Audio API directly.
 * - SSR-safe: every export early-returns on the server.
 * - Honors prefers-reduced-motion (treats it as "reduced sensory load"
 *   too — same flag covers audio noise).
 * - Honors a localStorage flag `vibex_sound_enabled` (default true). UI
 *   toggle for this lives on /settings (TODO — Alex to add).
 *
 * Why procedural placeholders instead of silent stubs:
 * The shape of the sensory layer needs to feel right BEFORE Alex pays
 * a sound designer. Procedural sine+decay envelopes are good enough to
 * validate that "anvil tap at submit time" feels rewarding vs annoying.
 * If the procedural version annoys testers, swapping to fancier samples
 * won't save the UX — the trigger point itself is wrong.
 */

export type ForgeEvent =
  | "anvil-tap"
  | "submit"
  | "level-up"
  | "upvote"
  | "evolution-stage"
  | "funeral-toll";

const STORAGE_KEY = "vibex_sound_enabled";

/**
 * Per-event procedural recipe. Each entry describes a short tone burst:
 * frequency in Hz, duration in seconds, envelope decay curve, optional
 * second tone for "thock" character on percussive events.
 *
 * Recipes are tuned to be ≤300ms total, peak gain ≤0.18 so they don't
 * blow out users on max system volume. Tweak in dev (set
 * vibex_sound_debug=1 in localStorage to log every play).
 */
const RECIPES: Record<
  ForgeEvent,
  {
    freq: number;
    durationMs: number;
    /** Optional harmonic second tone for percussive feel. */
    overtone?: { freq: number; gain: number };
    /** "metal" = sharp attack + fast decay; "chime" = slow decay. */
    envelope: "metal" | "chime" | "thud";
  }
> = {
  // Anvil tap: short bright clang. Like hitting hot steel.
  "anvil-tap": {
    freq: 880,
    durationMs: 120,
    overtone: { freq: 1320, gain: 0.08 },
    envelope: "metal",
  },
  // Submit: confirming "your work is forged" double-thock.
  submit: {
    freq: 440,
    durationMs: 220,
    overtone: { freq: 660, gain: 0.1 },
    envelope: "metal",
  },
  // Level-up: ascending chime, optimistic.
  "level-up": {
    freq: 660,
    durationMs: 280,
    overtone: { freq: 990, gain: 0.12 },
    envelope: "chime",
  },
  // Upvote: tiny soft "tink" — feedback without being loud.
  upvote: {
    freq: 1200,
    durationMs: 80,
    envelope: "chime",
  },
  // Evolution stage: deep resonant thud, weight of progression.
  "evolution-stage": {
    freq: 220,
    durationMs: 300,
    overtone: { freq: 330, gain: 0.14 },
    envelope: "thud",
  },
  // Funeral toll: single low bell. F3 fundamental + C4 5th harmonic for
  // bell character. 1.8s sustain covers the eulogy generation latency so
  // the page feels like the bell tolled and the eulogy emerged from the
  // silence after. Triggered on bury() submit only — NEVER on page load.
  // Per docs/specs/2026-06-14-funeral-visual-upgrade-spec.md sensory layer.
  "funeral-toll": {
    freq: 174,
    durationMs: 1800,
    overtone: { freq: 261, gain: 0.06 },
    envelope: "chime",
  },
};

/**
 * Lazy-allocated shared AudioContext. Browsers throttle the count and
 * Safari fails after ~5 simultaneous contexts. One per page is plenty.
 */
let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (sharedCtx) return sharedCtx;
  // Lint will moan about `any` here, but webkit prefix is a real-world
  // Safari requirement on older iOS.
  const W = window as Window & {
    webkitAudioContext?: typeof AudioContext;
  };
  const Ctx = window.AudioContext ?? W.webkitAudioContext;
  if (!Ctx) return null;
  try {
    sharedCtx = new Ctx();
    return sharedCtx;
  } catch {
    return null;
  }
}

/**
 * Returns true when the user (or their OS) opted into sound. Default true.
 *
 * Three "off" conditions, any of which short-circuits playForge():
 * 1. Server-side (no window).
 * 2. localStorage `vibex_sound_enabled` === "false".
 * 3. prefers-reduced-motion = reduce.
 */
export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "false") return false;
  } catch {
    // localStorage can throw in incognito / blocked-cookies modes.
    // Treat as default (enabled).
  }
  try {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return false;
    }
  } catch {
    /* matchMedia missing — older browsers; just continue */
  }
  return true;
}

/** Toggle persistence. Call from a /settings UI toggle. */
export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
  } catch {
    /* incognito etc — best-effort */
  }
}

/**
 * Play a short procedural sound for an RPG-forge event.
 *
 * No-op on server. No-op when sound disabled. No-op when Web Audio
 * isn't available. Never throws — the call site doesn't need a try/catch.
 *
 * Usage:
 *   onClick={() => { playForge("submit"); handleSubmit(); }}
 */
export function playForge(event: ForgeEvent): void {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  if (!ctx) return;

  const recipe = RECIPES[event];
  if (!recipe) return;

  try {
    // Resume context if user gesture happened. Required by Chrome's
    // autoplay policy — first call from a click handler will succeed,
    // first call from a useEffect mount will fail silently (correct).
    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    const now = ctx.currentTime;
    const durSec = recipe.durationMs / 1000;

    // Master gain envelope.
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, now);

    if (recipe.envelope === "metal") {
      // Hard attack + exponential decay — bright like steel.
      master.gain.linearRampToValueAtTime(0.18, now + 0.005);
      master.gain.exponentialRampToValueAtTime(0.0001, now + durSec);
    } else if (recipe.envelope === "chime") {
      // Softer attack + longer tail.
      master.gain.linearRampToValueAtTime(0.14, now + 0.02);
      master.gain.exponentialRampToValueAtTime(0.0001, now + durSec);
    } else {
      // Thud: punchy attack, very fast decay.
      master.gain.linearRampToValueAtTime(0.22, now + 0.01);
      master.gain.exponentialRampToValueAtTime(0.0001, now + durSec * 0.6);
    }

    master.connect(ctx.destination);

    // Fundamental.
    const osc = ctx.createOscillator();
    osc.type = recipe.envelope === "thud" ? "sine" : "triangle";
    osc.frequency.setValueAtTime(recipe.freq, now);
    osc.connect(master);
    osc.start(now);
    osc.stop(now + durSec);

    // Optional overtone for percussive character.
    if (recipe.overtone) {
      const over = ctx.createOscillator();
      const overGain = ctx.createGain();
      over.type = "sine";
      over.frequency.setValueAtTime(recipe.overtone.freq, now);
      overGain.gain.setValueAtTime(recipe.overtone.gain, now);
      overGain.gain.exponentialRampToValueAtTime(0.0001, now + durSec);
      over.connect(overGain).connect(ctx.destination);
      over.start(now);
      over.stop(now + durSec);
    }
  } catch (err) {
    // Web Audio occasionally throws on devices with audio routing issues.
    // Never let a sound failure break a click handler.
    if (
      typeof window !== "undefined" &&
      window.localStorage?.getItem("vibex_sound_debug") === "1"
    ) {
      console.warn("[sound] playForge failed:", event, err);
    }
  }
}
