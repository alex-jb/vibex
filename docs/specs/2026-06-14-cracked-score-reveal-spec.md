# Cracked Score Reveal + Share Card Spec

**Date:** 2026-06-14
**Author:** spec doc (no code touched, no commits)
**Status:** PROPOSAL — Alex review tomorrow
**Source research:**
- `~/Desktop/Interview-Prep/Projects/alex-brain/research/2026-06-14-design-award-deep-research.md` §4 steal #3 ("Cracked Score = Balatro reveal + Spotify Wrapped distribution")
- `~/Desktop/Interview-Prep/Projects/alex-brain/research/2026-05-31-vibecoding-viral-tracks.md` viral candidate #2 ("Cracked Score")

---

## 1. Goal (2 sentences)

The score reveal is not a number flashing on a page — it is a 3-second crescendo with audio + screen-shake + chromatic flash that the user instinctively wants to screenshot. The Satori-rendered 1080×1080 share card IS the distribution model: a friend sees a tier badge in the wild on X or r/SideProject, types their handle, gets their own moment, posts it, loops.

---

## 2. Current state

**Already shipped** (per inventory, files relative to repo root):

- `app/cracked/page.tsx` — landing form with GitHub handle input + optional VibeXForge creator handle (which gives a +40 Creator Score bump under surface `revival`). Orange-on-black RPG-coded palette already locked.
- `app/cracked/[handle]/page.tsx` — Server Component, ISR `revalidate = 3600`. Calls `scoreHandle()`, shows: tier emoji header, `CountUp` 0 → overall over 1.6s, `DecryptedText` on tier name, 3-stat strip (stars / repos / followers), 12-axis bar list, compare input, X share intent, leaderboard link. Best-effort `bumpScore` if `?as=` creator handle present.
- `app/cracked/[handle]/opengraph-image.tsx` — 1200×630 social card (X / OG) with handle, score, tier badge, 3 stats. Uses `params: Promise<{ handle: string }>` per the Next 16 OG landmine.
- `app/cracked/leaderboard/page.tsx` + `app/cracked/leaderboard/opengraph-image.tsx`
- `app/cracked/vs/[a]/[b]/page.tsx` + `app/cracked/vs/[a]/[b]/opengraph-image.tsx`
- `lib/cracked-score.ts` — engine, 12 axes, 5-tier system with thresholds 80/65/45/25/0, calibrated on karpathy 71 / antirez 69 / gaearon 53 / alex-jb 38, 24h DB cache via `cracked_scores` table.
- `lib/score.ts` — separate Creator Score (cross-product tier ladder, different system, NOT the cracked tier).
- `lib/sound.ts` — Web Audio scaffold shipped today. Exposes `playForge(event)` with events `anvil-tap | submit | level-up | upvote | evolution-stage`. SSR-safe, honors `prefers-reduced-motion`, gated by `localStorage[vibex_sound_enabled]`. Procedural sine + envelope; no samples loaded.

**Honest visual assessment:** the page works and reads well but treats the reveal as a static dashboard. `CountUp` runs in parallel with the tier badge and the axis bars, so the eye has no focal point. There is no audio. No screen-shake. No chromatic flash on tier reveal. No 1080×1080 Instagram/Stories share card — only the 1200×630 OG image, which is the wrong aspect ratio for the share surfaces the research deck targets (r/SideProject screenshot, X image post, IG story). Tier names render in plain orange pill regardless of tier — `mythic` and `starting` look identical aside from emoji. The page is a B+ dashboard masquerading as a viral moment.

---

## 3. Reveal mechanic — frame by frame

The reveal lives in a new client component `components/cracked/score-reveal.tsx` that the `[handle]/page.tsx` Server Component renders as the hero section, replacing the current `CountUp` + tier pill block. Server still computes everything; the component receives `{ overall, tier, axes }` as props and orchestrates the timing.

**Total runtime:** 3500ms from mount to silent locked card. User can skip with any key / tap (writes `localStorage[vibex_cracked_seen] = handle` so returning visitors get the static end-state instantly).

### Phase 1 — 0 to 500 ms: "Calculating"

- Centered: `Calculating your cracked score` in zinc-400, 18px.
- Trailing typewriter dots: `.` → `..` → `...` → `.` cycle, 150ms per tick (3 ticks fit in 500ms).
- No audio. No motion in the rest of the page.
- The score number area renders `--` placeholder.
- Reason: 500ms is enough for the eye to land on the center but short enough not to feel like a loading state.

### Phase 2 — 500 to 2500 ms: number roll-up

- The `--` becomes `0` and rolls to `overall`.
- Easing curve: `cubic-bezier(0.16, 1, 0.3, 1)` — known as "expo out" / "expo-strong out". Front-loaded so the number flies past the small digits and slows dramatically into the final value. Reference: Material 3 "emphasized decelerate" uses the same shape.
- Duration: 2000ms (replaces current 1600ms).
- Implementation: `requestAnimationFrame` loop computing `value = Math.round(overall * easeOutExpo(t))`. No library.
- **Every time the displayed number crosses a multiple of 10**, fire `playForge("upvote")`. The recipe in `lib/sound.ts` for `upvote` (1200Hz sine, 80ms, chime envelope) is already tuned for "small ka-ching" feel — this is the Balatro v1.0 percussive tick.
- Visual per tick: the score number does a tiny scale-bump `transform: scale(1) → scale(1.04) → scale(1)` in 80ms (matches sound length). Use `transform-origin: center bottom` so the bottom edge stays put.
- Tension build: a score of 71 (karpathy) fires 7 ticks. A score of 38 (alex-jb baseline) fires 3 ticks. A score of 92 fires 9 ticks. Long roll-ups feel earned; short ones feel honest. This is the asymmetry Balatro relies on.

### Phase 3 — 2500 to 2700 ms: lock + shake

- The number arrives at its final value and locks.
- Fire `playForge("submit")` (440Hz + 660Hz overtone, 220ms metal envelope) — re-purposed as the "thud" on lock (see §5 for why we reuse `submit` instead of adding a new event).
- Screen shake: a CSS keyframe applied to `<main>` for 200ms:
  ```
  @keyframes cracked-shake {
    0%   { transform: translate(0, 0); }
    20%  { transform: translate(-3px, 2px); }
    40%  { transform: translate(4px, -1px); }
    60%  { transform: translate(-2px, -2px); }
    80%  { transform: translate(2px, 1px); }
    100% { transform: translate(0, 0); }
  }
  ```
  Disabled when `prefers-reduced-motion`. Disabled if `overall < 45` (only Solid+ tiers earn the shake — keeps it special).
- Chromatic aberration on the tier badge: a 200ms one-shot CSS class that layers two pseudo-elements with `mix-blend-mode: screen`, one shifted -3px and tinted `#FF3333` (red channel), one shifted +3px tinted `#33FFFF` (cyan), bringing them back to 0 by 100ms. This is the Igloo Inc SOTY 2024 trick. Only fires for `cracked` and `mythic` tiers — see §4.

### Phase 4 — 2700 to 3500 ms: tier name fade-in

- The tier badge, which was empty during Phase 1-3, fades in from `opacity: 0` to `opacity: 1` over 600ms with `transform: translateY(8px) → translateY(0)`.
- Tier name uses an outlined display font — see §4 for the Balatro-style treatment per tier.
- Fire `playForge("level-up")` if the user's score crossed a tier threshold versus their stored last value (read from the existing `cracked_scores` row on the server, pass `previousTier` as a prop). If no previous value, fire it for any tier `solid+`.
- 800ms total feels generous; gives the screen time to settle.

### Skip behavior

- Any keypress, tap, or click during Phases 1-3 jumps straight to Phase 4's end-state and writes `localStorage[vibex_cracked_seen_<handle>] = "1"`.
- If that key is already set on mount, the component renders the end-state immediately with no animation and no audio.
- This protects against the share-loop bug where someone clicks a friend's share link, sees the reveal once, refreshes, and gets annoyed by the second play.

---

## 4. Tier scale — visual treatment per tier

The 5 tiers are already defined in `lib/cracked-score.ts`. The spec adds a visual vocabulary that the `score-reveal.tsx` component and the Satori share card both consume from a shared `lib/cracked-tier-style.ts` (new file).

| Tier | Threshold | Emoji | Badge background | Outline color | Font weight on name | Effects on reveal |
|---|---|---|---|---|---|---|
| mythic | ≥ 80 | 👑 | animated conic-gradient gold (`#FFD700` → `#FFAA00` → `#FFD700`, 360deg, 8s loop) | `#FFFFFF` 3px outline | 900 (Anton) | screen-shake + chromatic + 6 sparkle particles |
| cracked | ≥ 65 | ⚡ | solid `#C0C0C0` silver | `#0A0A0A` 2px outline | 900 (Anton) | screen-shake + chromatic |
| solid | ≥ 45 | 💪 | solid `#CD7F32` bronze | `#FFFFFF` 2px outline | 900 (Anton) | screen-shake only |
| rising | ≥ 25 | 🌱 | solid `#6B6B6B` stone | `#0A0A0A` 2px outline | 800 (Anton) | no shake, no chromatic |
| starting | ≥ 0 | 🥚 | solid `#5A3B1F` wood (warm brown) | `#FFFFFF` 2px outline | 800 (Anton) | no shake, no chromatic, gentler audio (skip `submit` thud) |

**Why these colors specifically:**
- Gold `#FFD700` is the canonical browser-named gold, not the muted "olive" gold trap.
- Silver `#C0C0C0` is the browser-named silver — high contrast on black background.
- Bronze `#CD7F32` is the Wikipedia "bronze" reference value.
- Stone `#6B6B6B` deliberately desaturated — feels concrete, not glossy.
- Wood `#5A3B1F` is dark walnut, not a saturated brown that competes with bronze.

**Mythic conic-gradient animation** (CSS only, no JS):
```
@keyframes cracked-mythic-spin {
  to { --angle: 360deg; }
}
.cracked-mythic-badge {
  --angle: 0deg;
  background: conic-gradient(from var(--angle), #FFD700, #FFAA00, #FFD700);
  animation: cracked-mythic-spin 8s linear infinite;
}
@property --angle { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
```
For the Satori share card (static frame), capture a single snapshot of the gradient at `angle: 45deg` — Satori cannot animate.

**Mythic sparkles:** 6 CSS-only `::before` siblings positioned around the badge with `animation: cracked-sparkle 1.2s ease-out forwards`, each offset by a random rotation (computed at component mount, persisted for the session). Sparkle keyframe is opacity 0 → 1 → 0 with `scale(0.4) → scale(1) → scale(0.6)`. Pure CSS, no canvas.

**Tier name font:** Anton (Google Fonts, free, single weight 400 but very bold by nature). Display-only condensed sans-serif, used by Spotify Wrapped 2024 wherever they show year totals. Fallback stack: `'Anton', 'Bebas Neue', 'Impact', 'Helvetica Neue Condensed Bold', sans-serif`. Loaded via `next/font/google` on the reveal page; for Satori use the TTF (see §6) since Satori rejects woff2 per the existing landmine memory.

---

## 5. Web Audio sound design

The reveal needs three distinct sound events. Rather than adding 3 new entries to `lib/sound.ts`'s `RECIPES` and bloating the public API, **reuse 3 existing recipes** that already match the spec acoustically:

| Reveal moment | Existing recipe | Frequency / shape | Tweak needed? |
|---|---|---|---|
| per +10 tick (Phase 2) | `upvote` | 1200Hz sine, 80ms, chime envelope | none — already matches Balatro's bright tick |
| number lock thud (Phase 3) | `submit` | 440Hz + 660Hz, 220ms, metal envelope | none — the existing two-tone "thock" reads as a lock |
| tier reveal chord (Phase 4) | `level-up` | 660Hz + 990Hz, 280ms, chime envelope | tier-dependent post-processing — see below |

**Tier-dependent chord on reveal:**

The `playForge("level-up")` recipe is a perfect fifth (660 + 990 = ratio 3:2). For tier flavor, layer a second `playForge` call 40ms later at a different fundamental, hand-tuned per tier. This requires a new helper `playCrackedTierReveal(tier)` in a new file `lib/cracked-sound.ts` that internally calls `playForge` twice with delays — no changes to `lib/sound.ts`.

| Tier | Second note delay | Effect (musically) |
|---|---|---|
| mythic | +0ms (simultaneous) | trigger `level-up` + a manual oscillator at 1320Hz (perfect fifth + octave above) — full triadic stacked-fifths shimmer |
| cracked | +40ms | trigger `level-up` + a manual oscillator at 1056Hz (major third above the fifth) — bright resolved chord |
| solid | +60ms | trigger `level-up` alone — clean fifth, no embellishment |
| rising | +80ms | trigger `level-up` at lower master gain (0.7×) — quieter, encouraging |
| starting | — | DO NOT play tier reveal at all. The egg should feel like a beginning, not a verdict. Only Phase 1-2 plays; Phase 3 thud is suppressed too. |

The manual oscillator code is ~15 lines, lives in `lib/cracked-sound.ts`, and reuses the same `getCtx()` pattern by importing the (currently un-exported) shared context. **Decision needed:** either export `getCtx` from `lib/sound.ts` or duplicate the 8-line audio context allocator. Recommend exporting it as `getSharedAudioContext()` since other surfaces (Funeral reveal, LaunchKit success) will want the same trick.

**`prefers-reduced-motion` handling:** `lib/sound.ts` already short-circuits all `playForge` calls when reduced-motion is set. The reveal component must also short-circuit the visual screen-shake and the chromatic flash under the same media query. **Important:** the typewriter dots in Phase 1 are fine to keep — they are text-only, not motion. Skip Phase 2's per-digit `scale` bump.

---

## 6. Share card spec

Two Satori-rendered images, both new files. Both honor the Next 16 OG landmine: `params: Promise<{ handle: string }>` then `await params`. Both honor the TTF-not-woff2 landmine: load Anton.ttf via `fetch(new URL("./Anton.ttf", import.meta.url))` and pass as `fonts: [{ name: "Anton", data, weight: 400, style: "normal" }]` to `ImageResponse`.

### 6.1 Instagram square — `app/cracked/[handle]/share-square/opengraph-image.tsx`

- Dimensions: `1080 × 1080`.
- File location is unconventional (a sub-route) because Next OG image conventions require the file to live in a route. The route `cracked/[handle]/share-square/page.tsx` exists only to anchor the OG generator — the page itself just redirects to `/cracked/[handle]` so search engines don't index a half-page.
- Layout, top to bottom:
  - **Top 30%** (320px): project preview / handle banner. Background: solid black `#0A0A0A`. Centered: `@handle` in Anton 96px white, with a thin orange `#F97316` underline 4px tall, 120px wide, centered below the handle. Above the handle: small orange uppercase eyebrow `CRACKED SCORE · VIBEXFORGE` in 18px letter-spacing 8.
  - **Middle 40%** (432px): score + tier badge. Background: tier-driven (see table in §4). Centered vertically: the score `71` in Anton 280px white with 4px black outline. To the right of the number: tier badge — a rounded 999 pill, 80px tall, padded 24/40, containing the tier name in Anton 56px with the tier's badge background and outline. Below the score, 28px small white text: `OUT OF 100`.
  - **Bottom 30%** (320px): CTA strip. Background: solid black. Centered: small uppercase white text `GET YOUR SCORE`, 24px, letter-spacing 6, with 16px margin. Below it: `VIBEX.COM/CRACKED` in Anton 48px orange `#F97316`. Below that: a small 18px zinc-400 text `Live from GitHub public data · 12 axes`.
- For mythic tier specifically: the middle background uses a static conic gradient frame baked at `from 45deg` (no animation possible in Satori).
- For starting tier: replace the orange underline in the top section with a soft warm brown `#5A3B1F` so the egg doesn't get inappropriately hyped.

### 6.2 Instagram Stories — `app/cracked/[handle]/share-story/opengraph-image.tsx`

- Dimensions: `1080 × 1920`.
- Same vertical layout but with rebalanced proportions:
  - **Top 25%** (480px): handle banner, same content as square but with project preview thumbnail (if `cracked_scores.preview_url` exists — schema addition deferred; for v1 use a tiled forge texture as background).
  - **Middle 50%** (960px): score + tier badge stacked vertically. Score `71` in Anton 360px. Tier badge below score, centered, full-width 80% margin.
  - **Bottom 25%** (480px): same CTA strip as square + an additional `Tap to score yours →` line in 32px white at the very bottom, since Stories users tap-through more than they screenshot.
- Mythic conic-gradient animation: same static-frame fallback as square.

### 6.3 Existing 1200×630 OG card

Keep `app/cracked/[handle]/opengraph-image.tsx` as-is for X / Discord / iMessage previews — those surfaces want landscape. Two small upgrades:

- Replace the orange-tier pill with tier-driven styling per §4 so a `mythic` X share preview looks visually different from a `starting` one.
- Add Anton font load — the current font fallback `ui-sans-serif, system-ui, sans-serif` reads as generic dashboard. Anton fixes this in 5 lines.

---

## 7. Implementation breakdown (2-3 days)

### Day 1 — reveal animation + sound wiring

- [ ] Create `lib/cracked-tier-style.ts` with the per-tier color tokens, badge backgrounds, effect flags. Single source of truth for components AND Satori cards.
- [ ] Create `components/cracked/score-reveal.tsx` (client component) implementing the 4-phase sequence. Refactor `app/cracked/[handle]/page.tsx` hero section to use it. Keep the rest of the page (axes, compare, CTA) untouched.
- [ ] Create `lib/cracked-sound.ts` with `playCrackedTierReveal(tier)`. Export `getSharedAudioContext` from `lib/sound.ts` to allow the second-oscillator layering. Add tests for tier-dependent silence on `starting`.
- [ ] Add the CSS keyframes (`cracked-shake`, `cracked-mythic-spin`, `cracked-sparkle`, chromatic aberration class) to `app/globals.css` under a `@layer utilities` block (avoid the nes.css layer trap).
- [ ] Add `localStorage[vibex_cracked_seen_<handle>]` skip logic so refreshes are instant.
- [ ] Smoke test: hit `/cracked/karpathy` (71 = cracked tier) and `/cracked/torvalds` (mythic candidate) and `/cracked/alex-jb` (38 = rising) — confirm tier-specific audio + visual differ.

### Day 2 — Satori share cards

- [ ] Vendor `Anton-Regular.ttf` into `app/cracked/_fonts/Anton-Regular.ttf` (single file, no font-tools conversion needed since Google Fonts ships TTF directly for Anton). Verify NOT woff2.
- [ ] Create `app/cracked/[handle]/share-square/page.tsx` (redirect-only) + `opengraph-image.tsx` (1080×1080 Satori). Params is Promise.
- [ ] Create `app/cracked/[handle]/share-story/page.tsx` + `opengraph-image.tsx` (1080×1920).
- [ ] Upgrade the existing `app/cracked/[handle]/opengraph-image.tsx` with tier-driven styling + Anton font.
- [ ] Test by visiting all three OG image URLs directly (e.g. `vibexforge.com/cracked/karpathy/share-square/opengraph-image`) and screenshotting — confirm no missing-glyph squares, no Satori "failed to pipe" error.

### Day 3 — share integration + distribution test

- [ ] Add a `<ShareSheet />` component below the hero on `app/cracked/[handle]/page.tsx` exposing three buttons: "Copy Instagram square", "Copy Story", "Share on X". The first two use `navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])` after fetching the OG image. Fallback for browsers without ClipboardItem image support: direct download.
- [ ] Add Web Share API integration `navigator.share({ files: [pngFile], text, url })` behind feature detection — iOS Safari + Android Chrome get the native share sheet.
- [ ] Post a calibration share of karpathy / antirez / gaearon to r/SideProject as test content (Alex's call on timing, NOT auto-post from this spec). Track CTRs via `vibex_analytics_stack` (OpenPanel + HyperDX already in place).

**Net effort:** 2 days of focused work, day 3 is half-day distribution. Total ~16 hours.

---

## 8. Distribution loop (concrete)

1. User A types `karpathy` on `/cracked` → reveal hits, sees 71/100 CRACKED tier with chromatic flash + screen-shake.
2. User A scrolls to ShareSheet → taps "Copy Instagram square".
3. PNG is on their clipboard. They paste into IG Story / X post / r/SideProject screenshot. The 1080×1080 contains the score, the tier badge, and `VIBEX.COM/CRACKED` in foot-tall Anton.
4. User B (a friend) sees the post in their feed, recognizes the format, types their own GitHub handle at `vibex.com/cracked`.
5. User B's reveal triggers. If User B's tier > User A's tier, they share to brag. If lower, they share to be self-deprecating (Funeral product DNA). Either way they post.
6. Cracked Scores table grows. Leaderboard at `/cracked/leaderboard` updates. The `?as=<creator-handle>` parameter quietly drives Creator Score upgrades, pulling power users into VibeXForge proper.

**Why this loops vs. dies:** the share card encodes the *tier*, not just the number. A `MYTHIC 👑` shared from a top-10 GitHub account is a flex; a `STARTING 🥚` shared self-deprecatingly is a meme. Both share. Only `solid` (the median) has no inherent reason to share — and that's the audience the side-by-side battle URL (`/cracked/vs/[a]/[b]`) catches.

---

## 9. Anti-patterns (3 don'ts)

1. **DO NOT auto-trigger reveal without user gesture.** Chrome's autoplay policy will silently kill the audio, but the visual shake/chromatic will still fire — creating an audio-less broken reveal. The reveal must start on user navigation INTO the handle page (the click on "Get my Cracked Score" IS the gesture, and the AudioContext resumes inside that click handler before navigation). If the user lands via direct link (X share click), use a 200ms one-tap "Tap to reveal" overlay rather than auto-firing.
2. **DO NOT make mythic achievable on first try for normal accounts.** The Cracked engine already calibrates karpathy to 71 — meaning the bar for `mythic` (≥ 80) is intentionally above the most-cracked person most users know. This is correct. Resist the temptation to recalibrate so 50% of new users hit cracked tier on signup. The share economy depends on `MYTHIC` being a rare flex — like Spotify Wrapped's "Top 0.1% listener" badges that gate real virality.
3. **DO NOT skip the `prefers-reduced-motion` checks.** The shake + chromatic + per-digit scale bumps are all behind the same media query that gates audio. Failing this is a real accessibility regression and Awwwards / Webby juries (per the source research) flag it on first audit. The typewriter dots in Phase 1 are text-only and can remain; everything else short-circuits.

---

## 10. Verification checklist (Alex's smoke test)

- [ ] On a fresh incognito window (no `vibex_cracked_seen` localStorage), visit `/cracked/karpathy` — confirm Phase 1 dots, then number rolls 0 → 71 over ~2s with ~7 audible ticks, then thud + screen-shake + chromatic flash on the `CRACKED ⚡` badge, then tier name fades in with chord.
- [ ] Same window, refresh `/cracked/karpathy` — confirm no animation, no audio, end-state renders immediately.
- [ ] Clear localStorage, visit `/cracked/torvalds` — confirm mythic conic-gradient gold badge animates (8s loop) + 6 sparkles + stacked-fifths chord.
- [ ] Visit `/cracked/alex-jb` (38 = rising) — confirm 4 ticks, no screen-shake, no chromatic, quieter chord, gentler vibe overall.
- [ ] Visit `/cracked/somebody-with-low-score` (any handle that scores < 25) — confirm starting tier: dots → number → fade-in tier with NO thud, NO chord, just the typewriter and roll-up. The egg should feel inviting, not punishing.
- [ ] Open DevTools, enable `prefers-reduced-motion: reduce`, refresh — confirm no shake, no chromatic, no audio, but the typewriter dots + final number + tier name still render correctly.
- [ ] Visit `/cracked/karpathy/share-square/opengraph-image` — confirm 1080×1080 PNG renders, Anton font loaded, no missing glyphs, tier badge is silver cracked styling.
- [ ] Visit `/cracked/torvalds/share-story/opengraph-image` — confirm 1080×1920 PNG, mythic gold conic gradient frame.
- [ ] On a phone (real device), visit `/cracked/karpathy`, tap the ShareSheet "Copy Instagram square" — confirm clipboard gets the PNG (paste into Notes app to verify).
- [ ] On iOS Safari + Android Chrome, tap "Native share" — confirm native share sheet opens with image attached.
- [ ] After 24 hours of organic traffic, check OpenPanel: confirm the share-square clipboard event fires at > 5% of `/cracked/[handle]` views. Below 5% = the ShareSheet UX needs another pass.

---

## 11. Open questions for Alex

- Anton vs Bebas Neue — Anton is slightly more compressed and reads as more Wrapped-coded; Bebas Neue is more poster-coded. Recommend Anton; happy to switch. Both are free, both ship as TTF.
- Whether to background-blur the project preview in the Story format top section, or leave the forge-texture tile. Forge-texture is on-brand but less personal; project preview is personal but requires a schema column.
- Whether `starting` tier should get NO audio at all, OR just the typewriter dots audio (a soft typing tick at 600Hz). Recommend none for v1 — silence is a stronger statement.
- Whether to write the leaderboard share card (1080×1080 of the top-10 list) in Day 2 scope, or defer. Defer recommended — leaderboard isn't a first-share surface.

---

## 12. Out of scope (explicit)

- Real sound samples (still using procedural Web Audio; Fiverr $50 brief deferred to post-launch).
- iOS haptic API (`navigator.vibrate`) — Safari shipped support 2024 but coverage is uneven; defer to v2.
- Animated screenshot / GIF export of the reveal — interesting but a 2-day side project of its own.
- WebGL / shader-based aberration — the CSS pseudo-element trick is 95% as good and ships in 30 minutes.
- Replacing the existing `CountUp` / `DecryptedText` components elsewhere in the codebase. This spec only touches the `/cracked/[handle]` hero.

---

**End of spec.** No code touched, no commits made.
