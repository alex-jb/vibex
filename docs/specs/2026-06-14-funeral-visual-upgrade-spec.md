# Funeral visual upgrade spec — Cult of the Lamb + Pillar serif

**Date:** 2026-06-14
**Author:** Claude (research subagent for Alex)
**Scope:** Visual identity upgrade for the already-shipped `/funeral` (dead repo) and `/funeral/idea` (dead idea) features, plus the public `/funeral/wall`. No backend / data model changes. CSS-first, no new dependencies.
**Status:** Spec only. Do NOT implement tonight. Alex reviews tomorrow.

---

## Goal

Transform the Funeral pages from "neutral dark Tailwind form" into a cohesive cult-of-mourning surface that reads as a deliberate ritual product in the first 5 seconds. Visual identity is the single difference between "one neat tweet" and "r/SideProject screenshots for 2 weeks" per the 2026-05-31 viral track research, and Funeral is the #1 breakout candidate in the stack.

## Current state

The feature is shipped and functional. Eulogy gen (`lib/funeral.ts:167`), ash image gen (`lib/funeral.ts:376`), revival judge (`lib/funeral.ts:323`), public wall with weekly stats + cause filter (`app/funeral/wall/page.tsx`), and OG cards (`app/funeral/[id]/opengraph-image.tsx`) all work. What is missing is identity. The landing (`app/funeral/page.tsx:62`) and memorial (`app/funeral/[id]/page.tsx:108`) both render on `bg-[#0a0a0a]` with `font-serif` (the default Tailwind serif stack), `text-zinc-200`, and orange accent. Every dark indie SaaS landing looks like this. The eulogy is read in the same body serif as the metadata. There is no mascot, no cult-script personality, no ritual moment. Mature implementation + flat presentation.

**Files in scope**

- `app/funeral/page.tsx` (212 lines) — dead-repo landing
- `app/funeral/idea/page.tsx` (213 lines) — dead-idea landing
- `app/funeral/[id]/page.tsx` (233 lines) — repo memorial
- `app/funeral/idea/[id]/page.tsx` — idea memorial (same shape)
- `app/funeral/wall/page.tsx` (327 lines) — public wall
- `components/funeral/revival-panel.tsx` (175 lines) — revival sidebar
- `app/funeral/[id]/opengraph-image.tsx` — OG card
- `app/funeral/idea/[id]/opengraph-image.tsx` — OG card
- `lib/funeral.ts` — backend, untouched by this spec

## Steal map

| Reference | What to steal | VibeXForge placement |
|---|---|---|
| Cult of the Lamb (game UI) | Cute mascot mourning a real-feeling dead thing; cult-script eulogy framing; "death as celebration not failure" tone; warm candle glow on otherwise dark scene | Landing hero mascot (lamb-coded but original); memorial page candle gutter; "Rest in peace" submit button voice |
| Pillar app (typography) | Heavy display serif for eulogy headers; tight leading on names; italic for the benediction line | Deceased name `H1` on memorial; eulogy block opening drop-cap; "amen" / final line italic |
| Cult of the Lamb (palette) | Parchment cream against deep burgundy + candle gold; never pure black for the ritual moment | Memorial page uses parchment scroll, NOT the current `#0a0a0a` flat dark |

## Typography

**Pick: Cormorant Garamond.** Loaded via `next/font/google` with `weight: ['400', '500', '600', '700']`, `style: ['normal', 'italic']`, `subsets: ['latin']`, `display: 'swap'`, exposed as `--font-eulogy`. Apply to a single new utility class `.font-eulogy` (no global swap).

Scale:

- Deceased name `H1` (memorial page): Cormorant Garamond 700 italic, 48px desktop / 36px mobile, letter-spacing `-0.01em`, line-height 1.05
- Landing hero (`H1`): Cormorant Garamond 600, 56px desktop / 40px mobile, letter-spacing `-0.015em`
- Eulogy body: Cormorant Garamond 400, 20px desktop / 18px mobile, line-height 1.7, with a single 56px drop-cap on the first letter (CSS `::first-letter`)
- Benediction line (last sentence of eulogy): Cormorant Garamond 500 italic, same size as body, centered, with a 1px parchment-gold divider above
- Section labels ("This week", "Top mourners"): keep Geist sans 12px uppercase tracking-widest — the contrast with serif is the design

**Why Cormorant Garamond over alternatives.** Playfair Display reads as wedding-blog (wrong). EB Garamond is correct but too narrow at display sizes for the deceased name moment. Cormorant has the prestige-serif gravity of Pillar app's typography but ships free via Google Fonts and renders well at both 20px body and 56px display. The italic cut is genuinely elegant which matters because half the eulogy moments use italic. Crimson Pro is a close second but Cormorant has more weight options at the 700 end which we need for the deceased name impact.

**Where to NOT use it.** Form inputs, buttons, navigation, metadata chips, the entire `/funeral/wall` grid (already busy enough), and anything in the revival panel. Eulogy serif is reserved for the ritual moments only: deceased name, hero copy, eulogy body, benediction. Mixing it into UI chrome destroys the contrast.

## Color palette

Five swatches. Reuse existing tokens where they already match — adding only what's genuinely new.

| Token | Hex | Use | Reuses existing? |
|---|---|---|---|
| `--funeral-parchment` | `#F2E8D5` | Memorial page scroll background, ash image frame, eulogy card surface | NEW |
| `--funeral-burgundy` | `#4A1419` | Deep oxblood for memorial page surrounds, "RIP" badge fill, deceased name on parchment | NEW |
| `--funeral-candle` | `#FFE27D` | Candle flame glow, accent dividers above benediction, hover lift on share buttons | REUSE `--brand-cream` |
| `--funeral-smoke` | `#B5B7BD` | Subtitle text on parchment, metadata, "lived N days" stats | REUSE `--text-muted-safe` |
| `--brand-forge` | `#F97316` | Existing primary, kept only on landing form CTA + wall filter pills | REUSE `--brand-forge` |

**Notes on application.** Landing page (`/funeral`, `/funeral/idea`) stays on `--bg-deep` (`#0A0A0C`) so it feels like the threshold to a darker ritual — change happens AFTER submit. Memorial pages (`/funeral/[id]`, `/funeral/idea/[id]`) flip to a parchment surface with burgundy border ribbon top + bottom. Wall stays on `--bg-deep` because density matters there; identity comes from the cards using parchment chips. The orange CTA is preserved on the landing form so we don't regress the conversion path while gaining identity on the destination pages.

**Add to `app/globals.css` `@theme inline` block** (alongside lines 24-29 where brand tokens live):

```css
--funeral-parchment: #F2E8D5;
--funeral-burgundy:  #4A1419;
```

The other three already exist or are aliases.

## Mascot direction

A small lamb in a black mourning hood, eyes closed, holding a single lit candle in both front hooves. The lamb is rendered in the existing pixel-art style of `public/mascot-v1.png` (per memory `vibex_gen_tool.md`) so it sits inside the established VibeXForge mascot family, not as a foreign character. Pose: three-quarter front, head tilted slightly down. The candle wick has a 2-frame flicker animation (CSS `@keyframes`, 0.8s, infinite). No facial expression beyond closed eyes and a tiny stitched smile, which is the Cult of the Lamb cute+horror move: it should be slightly unsettling that the lamb seems serene about your dead project. The candle glow casts `--funeral-candle` light radially behind the lamb at 30% opacity. Size: 240px on the landing hero (above the H1), 96px badge on memorial pages (top left of parchment scroll).

**Generate via `scripts/gen.mjs`** (Gemini, per memory `vibex_gen_tool.md`, costs ~$0). Style-ref `public/mascot-v1.png`. Prompt: "pixel-art lamb in black mourning hood, eyes closed, holding a lit candle in both hooves, three-quarter front view, slight head tilt down, tiny stitched mouth, warm candle glow, transparent background, 512x512". Three rolls, Alex picks one. Skip Fiverr — the visual reference is already established and Gemini hits this aesthetic reliably (32 mascot-family assets already shipped per memory).

## Mock layouts

### (a) Landing hero (`/funeral` + `/funeral/idea`)

Full-bleed `--bg-deep`. Centered column max-width 640px. From top: type-tab pills (existing) at 32px. Mascot lamb 240px centered. Hero `H1` in Cormorant Garamond 600 56px reading "A Funeral for the Project You Stopped Shipping" with subtle text-shadow in `--funeral-candle` at 8% opacity creating soft halo. Subtitle Geist 16px `--funeral-smoke`, two lines. Form card unchanged in mechanics but now framed with 1px `--funeral-burgundy` border and inner `--bg-elev` fill, candle-gold inner highlight at top edge (1px). Submit button keeps `--brand-forge` orange — this is the only orange on the page now.

### (b) Memorial page (`/funeral/[id]` + `/funeral/idea/[id]`)

Background flips to `--funeral-parchment`. Centered scroll: max-width 720px, rendered as a parchment card with `--funeral-burgundy` 4px top and bottom borders (the "ribbon ends" of an unrolled scroll), inner shadow at the top suggesting curl. Mascot lamb 96px positioned top-left inside the scroll. Deceased name in Cormorant Garamond 700 italic 48px in `--funeral-burgundy`, centered. Metadata line in Geist 12px `--funeral-smoke`. Ash image (existing) framed in a thin `--funeral-burgundy` border instead of the current ring-zinc-800. Eulogy article: Cormorant Garamond 400 20px in `#1a0508` on parchment, drop-cap on first letter (56px, `--funeral-burgundy`, float left). Benediction (last sentence) detected by client-side last-sentence split, rendered in italic centered with `--funeral-candle` divider above. Share buttons row stays at bottom but uses `--funeral-burgundy` borders + parchment fill instead of zinc. Revival panel keeps dark `--bg-elev` block — this is the modern intrusion that breaks the ritual on purpose, signaling "back to product reality".

### (c) Shareable obituary card (OG image at `/funeral/[id]/opengraph-image.tsx`)

1200x630 Satori. Background `--funeral-parchment`. `--funeral-burgundy` ribbon borders top (24px) and bottom (24px). Top center: small lamb mascot 80px (load PNG from `public/`). Centered Cormorant Garamond 700 italic, deceased name in `--funeral-burgundy`, font-size 88px. Below: thin candle-gold divider 240px wide. Below divider: metadata in Geist 24px `--funeral-smoke` reading e.g. "lived 412 days. died of `no_users`. 47 stars at death." Bottom right: `vibexforge.com/funeral` in Geist 18px `--funeral-burgundy`. No emojis on this card — the type and ribbon do the work. This is the screenshot that ships on X / r/SideProject.

## Sensory layer

`lib/sound.ts` already ships with `playForge('submit')` as a procedural double-thock metal envelope (`lib/sound.ts:61`). For the Funeral submit, the metal anvil tap is wrong tonally — wrong ceremony, wrong room. Add ONE new event to the recipe map: `'funeral-toll'`.

```ts
// In lib/sound.ts RECIPES map
"funeral-toll": {
  freq: 174,                                  // F3, deep bell fundamental
  durationMs: 1800,                           // long sustain
  overtone: { freq: 261, gain: 0.06 },        // C4 5th harmonic for bell character
  envelope: "chime",                          // already supports slow decay
},
```

Trigger on `bury()` submit (`app/funeral/page.tsx:28` and `app/funeral/idea/page.tsx:33`), called once at the moment the request fires, NOT on result return. The 1.8s tail covers the eulogy generation latency so the page feels like the bell tolled and the eulogy emerged from the silence after.

**Recommend single low bell toll over alternatives.** Wind chime is too pagan-yoga-app. Single low note is too synth-mournful and reads as "error sound". Bell toll is universally read as funeral, pairs with the cult-of-the-lamb cult-script visual register, and works on every device because Web Audio API renders the recipe procedurally with no asset to load. Volume tuned at peak gain 0.14 (already capped at 0.18 in current code) — present but not jarring. Honors `prefers-reduced-motion` automatically because `playForge()` already checks (`lib/sound.ts:131`).

## Implementation breakdown

Total estimate: 6.5 hours. CSS-first. No new deps beyond `next/font/google` Cormorant Garamond.

1. **Add font + tokens** (30 min). Import Cormorant Garamond via `next/font/google` in `app/layout.tsx`, expose as CSS var `--font-eulogy`. Add `--funeral-parchment` and `--funeral-burgundy` to `app/globals.css` `@theme inline` block. Add `.font-eulogy` utility class. Verify `npm run build` passes (per AGENTS.md red-line).

2. **Generate mascot** (45 min). Run `node scripts/gen.mjs` with the mourning lamb prompt + `public/mascot-v1.png` style-ref. Three rolls. Save the winner as `public/funeral-lamb-v1.png` (240px primary) and `public/funeral-lamb-v1-sm.png` (96px memorial badge).

3. **Add `funeral-toll` sound recipe** (15 min). One entry in `RECIPES` map (`lib/sound.ts:42`). Call `playForge('funeral-toll')` from `bury()` in both landing pages. Verify Chrome + Safari + iOS Safari (Web Audio context resume on user gesture is already handled at `lib/sound.ts:172`).

4. **Landing redesign** (90 min). Update `app/funeral/page.tsx` hero block (lines 78-88): add mascot image above H1, swap H1 to `.font-eulogy` 600 56px, add candle-gold text-shadow, update subtitle to `--funeral-smoke`. Frame form card with `--funeral-burgundy` border + candle-gold top edge. Mirror exact changes in `app/funeral/idea/page.tsx`. Keep orange submit button.

5. **Memorial page parchment surface** (2 hours). Update `app/funeral/[id]/page.tsx`: change `main` background from `bg-[#0a0a0a]` to `bg-[var(--funeral-parchment)]`. Add parchment scroll card with burgundy ribbon borders. Mascot badge top-left. Deceased name in `.font-eulogy` 700 italic burgundy. Eulogy article with drop-cap (CSS `::first-letter`) and benediction detection (split last sentence by `.` or `!`, render italic + centered with candle-gold divider). Update share buttons row to parchment+burgundy color. Mirror to `app/funeral/idea/[id]/page.tsx`. Leave revival panel dark on purpose.

6. **OG card upgrade** (60 min). Update `app/funeral/[id]/opengraph-image.tsx` + idea variant. Parchment background, burgundy ribbons, lamb PNG, Cormorant Garamond 700 italic deceased name (load TTF per memory `feedback_satori_ttf_not_woff2.md` — Google Fonts TTF download required, `.woff2` won't work). Remove emoji prefix.

7. **Wall card chips** (30 min). In `app/funeral/wall/page.tsx`, swap the cause-of-death pill styling on memorial cards to use parchment fill + burgundy border so wall thumbnails preview the same identity. Leave the wall background and stats banner unchanged.

8. **QA + verify** (30 min). Run `npm run lint && npm run build` locally before any push (AGENTS.md red-line). Dogfood on `npm run dev`: bury one real dead repo, confirm bell tolls, confirm parchment renders, confirm OG card via `https://www.opengraph.xyz`.

## Distribution hook

The Funeral mechanic is already the right insight — the visual identity is what makes the screenshot worth sharing. Right now if someone tweets the memorial page, the screenshot reads "another dark Tailwind landing with an orange button", which is forgettable. With the parchment scroll + Cormorant Garamond deceased name + the mourning lamb mascot watching from the corner, the screenshot reads "wait what is this product" in under a second, which is exactly the cognitive gap that drives r/SideProject screenshot threads to 500+ upvotes. Cult of the Lamb's loss screen is iconic specifically because it's a coherent visual moment that makes you stop scrolling. The 2026-05-31 viral tracks research called Funeral the #1 breakout candidate because the emotional hook is strong; this spec finishes the loop by giving it a visual hook of equal strength.

## Anti-patterns

1. **Don't go full Cult of the Lamb dark.** Parchment warmth is the differentiator. If the memorial page flips to pure black-and-burgundy goth, it becomes generic dark-fantasy aesthetic and loses the "actually feels like a real ritual room" quality. The cream parchment is what separates this from a metal album cover.

2. **Don't use Inter or Geist for the eulogy body.** The serif moment IS the design. Geist is the chrome around the moment. If someone "simplifies" the eulogy block to sans for "readability", they have killed the entire concept. Cormorant Garamond at 20px line-height 1.7 reads better than Geist at 18px line-height 1.6 because the eyes engage longer per word, which is the point.

3. **Don't auto-play the bell toll.** It triggers on user submit only, never on page load, never on memorial page view. Audio that plays without intent reads as broken and bounces users. The bell is the reward for the action, not the ambient bed.

## Verification checklist

Alex confirms the spec is met when shipped page shows all of:

- [ ] `/funeral` landing: mourning lamb mascot 240px visible above-fold, H1 reads in Cormorant Garamond 600 56px desktop, subtitle in `--funeral-smoke` `#B5B7BD`, form card has burgundy border, orange submit button preserved
- [ ] `/funeral/idea` landing: same treatment, lamb + serif H1 + smoke subtitle + burgundy-bordered form
- [ ] Submit on either landing fires single low bell-toll note via `playForge('funeral-toll')`, ~1.8s tail, audible but not jarring at default system volume
- [ ] `/funeral/[id]` memorial: page background is `--funeral-parchment` `#F2E8D5`, NOT `#0a0a0a`, with burgundy ribbon borders top and bottom of the centered scroll card
- [ ] Deceased name renders Cormorant Garamond 700 italic 48px in `--funeral-burgundy` color
- [ ] Eulogy body has a 56px burgundy drop-cap on the first letter
- [ ] Last sentence of eulogy renders italic + centered with a candle-gold divider above it
- [ ] 96px lamb badge in top-left of memorial scroll
- [ ] OG card at `/funeral/[id]/opengraph-image` renders parchment background, burgundy ribbons, Cormorant Garamond name, no emoji prefix — verified via opengraph.xyz
- [ ] Revival panel still renders on dark surface inside the parchment page (intentional contrast moment)
- [ ] `npm run lint && npm run build` both pass locally before any push
- [ ] No new npm dependencies added (Cormorant via `next/font/google` is built in)
- [ ] `prefers-reduced-motion` users hear no bell (verified via Chrome DevTools rendering tab)
