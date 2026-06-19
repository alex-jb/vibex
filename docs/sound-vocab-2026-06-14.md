# Sound + Haptics Vocabulary — scaffold 2026-06-14

Status: **scaffold only, uncommitted, not pushed.** Alex to review and decide ship timing + Fiverr commission.

## What scaffolded

- `lib/sound.ts` — Web Audio API, zero deps, procedural placeholder sounds keyed by 5 event names. SSR-safe + `prefers-reduced-motion` honored + localStorage `vibex_sound_enabled` toggle.
- `lib/haptics.ts` — `navigator.vibrate` wrapper, same 5 event names, silent no-op on iOS Safari + desktop.
- One proof-point wire-up: `app/launch/page.tsx::handleSubmit` triggers `playForge("submit") + vibrate("submit")` on form submission.

Nothing else is wired. Plays + vibrations on anvil-tap / level-up / upvote / evolution-stage are defined in the recipe tables but no component calls them yet.

## The 5 events

| Event | Procedural placeholder | Where it should fire (phase 2) |
|---|---|---|
| `anvil-tap` | 880 Hz triangle, 120ms, metal envelope, +1320 Hz overtone | `app/page.tsx` forge anvil hover/tap on `/` |
| `submit` | 440 Hz triangle, 220ms, metal env, +660 Hz overtone | `/launch` submit (LIVE — proof point) |
| `level-up` | 660 Hz chime, 280ms, +990 Hz harmonic | `components/rpg/evolution-burst.tsx` when stage advances |
| `upvote` | 1200 Hz chime, 80ms, soft tink | upvote buttons across `/`, `/project/[id]`, feed |
| `evolution-stage` | 220 Hz sine thud, 300ms, +330 Hz harmonic | `components/rpg/typewriter-text.tsx` stage banner |

## Why procedural placeholders, not silent stubs

If the procedural sound feels annoying when fired at the proof-point (every project submission), the trigger location is the bug — not the sample quality. Buying fancier samples won't fix a wrong trigger. Validate the rhythm of the sensory layer with the placeholder first; only commission real audio once 3-5 testers say "yeah this feels good, just less tinny please".

## Fiverr brief (when Alex is ready to commission)

**Budget:** $50 (per design research note in alex-brain `feedback_vibex_visual_density`).

**Deliverable:** 5 short MP3 files, each ≤30 KB, drop into `public/sounds/`. Names:

```
public/sounds/anvil-tap.mp3       (~120ms — single sharp metal clang)
public/sounds/submit.mp3          (~220ms — two-tap "your work is forged" thock)
public/sounds/level-up.mp3        (~280ms — ascending optimistic chime, not video-gamey)
public/sounds/upvote.mp3          (~80ms — soft tink, super subtle, hear it not feel it)
public/sounds/evolution-stage.mp3 (~300ms — deep resonant thud, weight of progression)
```

**Brief copy to paste into the Fiverr order:**

> I need 5 short UI sounds for a retro-RPG-themed AI startup launch site. Aesthetic reference: NES/SNES era, Shovel Knight, Octopath Traveler. NOT modern flat SaaS notification beeps. Forge/anvil/blacksmith vocabulary. Each sound ≤30KB MP3, ≤300ms duration. The names tell you the vibe: anvil-tap, submit (a "forging complete" thock), level-up, upvote (a tiny tink, not a chime), evolution-stage (deep resonant impact). No voice, no music — just the percussive/tonal cues. Mono is fine.

**Swap-in code:** when MP3s exist, edit `lib/sound.ts` to detect `public/sounds/<event>.mp3` and play via `HTMLAudioElement` instead of generating the procedural sine. Keep the procedural path as fallback if the audio fails to load. (TODO comment lives in `lib/sound.ts` itself.)

## Next sprint after Alex approves the pattern

Phase 2 wire-up (each is a one-line `onClick` or `useEffect` insertion):

1. `components/rpg/evolution-burst.tsx` — `useEffect(() => playForge("level-up"), [active])`
2. `components/rpg/typewriter-text.tsx` — fire `evolution-stage` when the stage banner mounts
3. `/` forge anvil — `onMouseDown={() => playForge("anvil-tap")}`
4. Upvote buttons (3+ surfaces: feed cards, project page, leaderboard) — `playForge("upvote")` + `vibrate("upvote")` on click

Total expected diff ≈ 20 lines across 4-6 files. Don't ship in one sprint; A/B test that submit + level-up are actually positive before adding the rest. Subtle is the point.

## How to test in local dev

```bash
npm run dev
# → open /launch, fill the form, hit Submit → hear the "submit" thock
# → on Android Chrome: feel the double-tap vibration
```

To silence during dev:

```js
// In browser DevTools console:
localStorage.setItem("vibex_sound_enabled", "false")
```

To debug missed plays:

```js
localStorage.setItem("vibex_sound_debug", "1")
// reload — console.warn fires on any failed playForge call
```

## Settings UI (TODO — not scaffolded)

Need a `/settings` toggle that calls `setSoundEnabled(true|false)`. Until that lands, only browser DevTools or `prefers-reduced-motion` system setting can mute the sounds. Acceptable for the proof point; not acceptable before fully wiring all 5 events into prod.

## Files touched

- NEW: `lib/sound.ts`
- NEW: `lib/haptics.ts`
- MODIFIED: `app/launch/page.tsx` (3 lines: import + 2 calls in handleSubmit)
- NEW: this file
