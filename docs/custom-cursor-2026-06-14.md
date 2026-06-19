# Custom cursor — Locomotive/Cuberto-style — 2026-06-14

Scaffold landed 2026-06-14 for the VibeXForge forge surface. **Not pushed**;
sitting on the working tree for Alex's review (Splunk Loom recording 9pm same
night — the vibex tree was kept clean).

## What was scaffolded

| File | Role |
| --- | --- |
| `lib/cursor.ts` | Shared types + constants (`CursorState`, `CURSOR_COLORS`, lerp factor) |
| `components/forge/custom-cursor.tsx` | `<CustomCursor />` client component — rAF lerp follow, 3 SVG states, native cursor hide |
| `app/page.tsx` | Demo wire-up: imports `<CustomCursor />`, mounts at top of the page wrapper, adds `data-cursor="hammer"` to the `▶ PRESS START` button |

No new dependencies. No new files in `public/` — every SVG is inline. No
changes to `package.json`, `next.config.*`, `lib/ai.ts`, `lib/sound.ts`,
`lib/haptics.ts`. The second background agent's territory is untouched.

## Why the landing page (and not /forge)

There is no `/forge` route in the app. The forge aesthetic — anvil, hammer
swing, ember sparks, FORGE TEMP 1850°F status — lives on `app/page.tsx` (the
landing hero). That's the surface that earns the cursor treatment. Other
routes (`/settings`, `/messages`, `/privacy`, etc.) are intentionally
out-of-scope: a swinging pixel hammer over the privacy policy reads as broken,
not as polish.

`<CustomCursor />` only hides the native cursor while it is mounted. The
`html.has-custom-cursor` class is added on mount and removed on unmount, so
navigating to `/home` or anywhere else restores the OS cursor cleanly.

## The three cursor states

Driven by the `data-cursor` attribute on the closest ancestor of the hovered
element. The component walks `event.target.closest("[data-cursor]")`, so
wrapping `<Link><motion.button data-cursor="hammer">…</motion.button></Link>`
works — you don't have to put the attribute on every nested span.

| State | Trigger | Visual | When to use |
| --- | --- | --- | --- |
| `default` | nothing (fallback) | 16px forge-orange dot + 6px halo | base / non-interactive |
| `hammer` | `data-cursor="hammer"` | 32px pixel-art hammer rotated -22° (matches the `app/page.tsx` anvil hammer) | submit / forge / "press start" CTAs |
| `spark` | `data-cursor="spark"` | 24px 4-point burst (cream center + forge points) | upvote / level-up / reward CTAs |

## How to add `data-cursor` to more elements

Pure DOM attribute. No React state. No prop drilling. Just slap it on the
closest ancestor that semantically owns the interaction:

```tsx
// Submit-the-forge style CTA → hammer
<button data-cursor="hammer">▶ FORGE PROJECT</button>

// Upvote / cheer style → spark
<button data-cursor="spark">▲ UPVOTE</button>

// Wrapped Link is fine — closest() walks up the tree
<Link href="/submit">
  <motion.button data-cursor="hammer">SUBMIT</motion.button>
</Link>
```

Effort to expand a single page (e.g. wire the anvil submit on `/home`, upvote
buttons on `/feed`, level-up on `/profile`): ~30 min of tagging + a quick
visual pass.

## Cuberto / Locomotive references

- https://cuberto.com — cursor morphs based on what's hovered. We do the same
  via `data-cursor`. Their version uses GSAP + dedicated React state; ours
  uses raw rAF + a single `ref` for the transform (~80 LOC, zero deps).
- https://locomotive.ca — cursor follows with a slight lag. We use a `lerp`
  factor of `0.18` (≈3-frame trail at 60fps) which reads as "smooth but
  responsive". Tunable in `lib/cursor.ts`.

## Accessibility / device handling

- `prefers-reduced-motion: reduce` → cursor snaps directly to the mouse
  position (no lerp lag). Tested via the `usePrefersReducedMotion` hook.
- `(pointer: fine)` media query → on touch / coarse-pointer devices the
  component renders `null` and does NOT hide the native cursor (mobile has no
  cursor, so there is nothing to hide and no animation to run).
- The cursor div carries `aria-hidden="true"` and `pointer-events: none` so
  it never blocks clicks or shows up in the accessibility tree.

## What Alex decides

1. **Keep it / kill it?** The component is 100% additive — pulling the
   `<CustomCursor />` line + the `data-cursor="hammer"` attr from
   `app/page.tsx` and deleting two new files reverts everything.
2. **Expand it now or later?** If you want it on `/launch`, `/home` HeroCards,
   or `/profile` level-up surfaces, ~30 min per page.
3. **Tune the lag?** `CURSOR_LERP` in `lib/cursor.ts`. Bigger number = more
   lag. `0` = snap. Current `0.18` matches Locomotive defaults.

## Conflict potential with the parallel agent

None expected. The other agent (`ae2a2c0c91852754f`) owns `lib/ai.ts`,
`lib/sound.ts`, `lib/haptics.ts`, and `package.json`. This scaffold only
touched `lib/cursor.ts` (new), `components/forge/custom-cursor.tsx` (new),
this doc (new), and `app/page.tsx` (3 small edits: 1 import, 1 mount, 1
attribute). No overlapping files, no new deps, no build kick-off.
