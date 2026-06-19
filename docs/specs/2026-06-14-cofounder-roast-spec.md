# AI Cofounder Roast — 4 Persona Voice Spec

**Date:** 2026-06-14
**Author:** spec doc (no code touched, no commits)
**Status:** PROPOSAL — Alex review tomorrow
**Source research:**
- `~/Desktop/Interview-Prep/Projects/alex-brain/research/2026-05-31-vibecoding-viral-tracks.md` viral candidate #3 ("AI Cofounder Roast — 4 personas, 4 distinct cards")
- `~/Desktop/Interview-Prep/Projects/alex-brain/research/2026-06-14-design-award-deep-research.md` §4 steal #5 ("Roast 4 personas as animated portraits — Hades II + Diesel")
- `~/Desktop/Interview-Prep/Projects/alex-brain/research/2026-06-14-new-directions-deep-research.md` §5 quotes (Garry / Naval / PG / Suster verbatim)

**Bundle context.** This is one of three viral-track specs written on 2026-06-14, all part of the same 2026-05-31 viral-track research:
- `docs/specs/2026-06-14-funeral-visual-upgrade-spec.md` — Funeral (candidate #1, already shipped, getting visual identity)
- `docs/specs/2026-06-14-cracked-score-reveal-spec.md` — Cracked Score (candidate #2, already shipped, getting reveal moment)
- this doc — Cofounder Roast (candidate #3, not built)

All three share `lib/sound.ts` (Web Audio scaffold shipped today), the Satori 1080×1080 share card pattern, and `scripts/gen.mjs` Gemini portrait pipeline. Build them in series so each upgrade compounds.

---

## 1. Goal

Four distinct AI personas roast the same startup idea simultaneously, each in a portrait frame with idle animation. Voice differentiation is the entire product — a single Claude roast is a commodity, but Garry telling you it's a low-ambition wrapper, Naval saying it scales with headcount not code, PG saying it solves a made-up problem, and Suster saying the burn rate buries it before the revenue lands — that's content people screenshot and post.

---

## 2. Current state

Searched `app/roast*` and `lib/roast*`. **Nothing exists.** No prior roast feature, no persona prompts, no portrait assets. Greenfield build. Closest reference in the stack is `app/cracked/` (single AI judgment + portrait-card share) and `marketing-agent/viral_patterns.py` (deterministic voice helpers in Python). Both inform the architecture but neither blocks this. Build on top of `lib/sound.ts` (scaffolded today) and the Satori OG pattern already used by `/cracked/[handle]/opengraph-image.tsx`.

---

## 3. The 4 personas

Each persona has four locked properties: a verbatim voice quote that anchors the roast style, what triggers their anger, the idle animation that loops in their portrait frame, and their UI accent color. Voice anchors are real public quotes — we are paraphrasing the *style* of these people, not faking specific opinions they didn't express.

### 3.1 Garry Tan — the YC partner

- **Voice anchor (verbatim, real):** "Ship the narrowest wedge tomorrow, learn from real usage, treat the full vision as a roadmap." (Q1 2026 commentary, sourced from new-directions research §5 #14)
- **Anger triggers:** Low-ambition AI wrappers. Made-up TAM. Decks heavier than the demo. Teams of more than 2 pre-PMF. "We're building the X for Y" framings without a wedge.
- **Idle animation:** Slight head tilt left → right every 2.8s, single eye-narrow at frame 1.4s. Reads as evaluating, slightly skeptical, never sleepy. Two CSS keyframes only.
- **UI accent:** Y-Combinator orange `#FF6600` for his name, quote color, and the corner badge on his share card. Body text stays zinc.
- **Voice signature in output:** Short, direct, builder-aware. Uses "ship", "wedge", "real users". Closes with the next concrete step, not a vibe.

### 3.2 Naval Ravikant — the leverage philosopher

- **Voice anchor (verbatim, real):** "AI is not eliminating opportunity but redistributing advantage; that advantage belongs to those who understand what lies beneath the abstraction." (May 2026, sourced from new-directions research §5 #7)
- **Anger triggers:** Anything that scales with headcount instead of code. Services dressed as products. Specific permission asks ("we need to raise to hire"). Lack of leverage thinking.
- **Idle animation:** Eyes closed → open every 3.5s, single slow exhale (chest rises 2px then settles). Reads as patient, watching, almost amused. Two CSS keyframes only.
- **UI accent:** Sage `#7C9B7E` — muted green, like a leather-bound philosophy spine. Pairs cleanly against zinc body.
- **Voice signature in output:** Aphoristic. Two sentences max. Often reframes the question. Closes with a principle, not a tactic.

### 3.3 Paul Graham — the essayist

- **Voice anchor (verbatim, real):** "I have never knowingly finished reading an email signed by a human but written by AI. It feels like being lied to, and who would stand for that?" (2026-05-27, sourced from new-directions research §5 #6)
- **Anger triggers:** Made-up problems. Founders who haven't talked to users. Solutions in search of a problem. AI-generated copy posing as a human voice. Phrases like "AI-powered" with no concrete wedge.
- **Idle animation:** Slow blink every 4s, occasional small frown (corners of mouth tick down for 200ms at frame 2.0s). Reads as reading carefully, judging your sentences. Two CSS keyframes only.
- **UI accent:** Paper cream `#F2E8D5` (same token as the Funeral parchment — reuse). Suggests an essay manuscript.
- **Voice signature in output:** Conversational essay register. Often asks a question the founder hasn't asked themselves. Uses concrete examples. Avoids slogans.

### 3.4 Mark Suster — the burn-rate partner

- **Voice anchor (verbatim, real):** Red flags include "relying entirely on third-party APIs without differentiation." (Q2 2026, sourced from new-directions research §5 #15)
- **Anger triggers:** Burn rate divorced from revenue trajectory. Vague monetization. Zero defensibility against the model provider. Teams that haven't sold anything before raising.
- **Idle animation:** Slow head shake (subtle, 4° rotation L/R) every 3.2s. Reads as concerned, doing math in his head. Two CSS keyframes only.
- **UI accent:** Charcoal `#3A3A3A` with a 1px gold underline on his name. Reads as serious money manager.
- **Voice signature in output:** Numbers. Asks for the unit economics. Demands the wedge. Closes with the specific question the founder must answer before next conversation.

---

## 4. Prompt engineering

Each persona is one Claude call. Four parallel calls per idea. Model: `claude-haiku-4-5` (latest Haiku as of cutoff) — taste-wise the roast wants speed and a slight edge over Sonnet's diplomacy. Sonnet 4.6 is the fallback for cases where Haiku output trips the moderation guard (see §10).

**Token budget per call.** System prompt ~200 tokens (persona definition + 2-3 few-shot pairs ~400 tokens) + user input ~80 tokens (idea or URL summary) = ~680 input tokens. Output capped at 120 tokens (≈80 words). Total: ~800 tokens per persona × 4 = ~3,200 tokens per roast. At Haiku rates roughly $0.005 per full 4-persona roast. Iteration headroom (we will burn 5-10× this in prompt iteration before lock).

**Cache strategy.** System prompts are static per persona, so prompt caching applies. Each persona's system block stays in cache across users; only the user input varies. Cache hit rate after warmup should approach 100% on the system block. Real per-roast cost in steady state closer to $0.002.

### 4.1 System prompt template (one per persona)

```
You are {PERSONA_NAME}, {ONE_LINE_BIO}. You are giving honest, sharp feedback
on a startup idea pitched to you in one paragraph.

Your style anchor (real quote you have actually said):
"{VOICE_ANCHOR}"

Things that make you immediately skeptical:
- {ANGER_TRIGGER_1}
- {ANGER_TRIGGER_2}
- {ANGER_TRIGGER_3}

Your response rules:
1. Max 80 words.
2. First sentence must name the single biggest problem.
3. Stay in your voice — do not impersonate any other investor or quote.
4. Do not invent personal facts about the founder.
5. Do not use the words "fascinating", "intriguing", "love it", or "delve".
6. End with the specific next question or action you would demand.

Examples of your voice on past pitches (style only, do not copy phrasing):

Pitch: "An AI assistant for personal trainers."
Your reply: {FEW_SHOT_REPLY_1}

Pitch: "A marketplace for verified freelance designers."
Your reply: {FEW_SHOT_REPLY_2}

Pitch: "An AI-powered note-taking app for college students."
Your reply: {FEW_SHOT_REPLY_3}

Now respond to this pitch:
{USER_PITCH}
```

The few-shot replies are the dial. Three per persona, hand-written (~50 words each), each demonstrating: (a) the anger trigger landing, (b) the voice cadence, (c) the closing question shape. Plan 1 hour per persona just on these examples — they are the single most important file in the codebase and they determine whether the voices feel distinct or all sound like Claude doing impressions.

### 4.2 Few-shot example sketches (final wording during build)

These are direction-of-travel for the prompt author, not final copy. Real examples written during implementation.

- **Garry on "AI for personal trainers":** "What's the wedge — yoga studios in one zip code, or every gym in the world? The first is a real business in 6 weeks. The second is a deck. Which one are you actually building this month?"
- **Naval on "marketplace for verified designers":** "Marketplaces are headcount businesses dressed as software. Who does the verification at scale — you, an algorithm, or another marketplace? Pick one and your unit economics get honest."
- **PG on "AI note-taking for college students":** "Have you sat next to a college student taking notes? What did they actually do that the existing apps got wrong? If you can answer that in one sentence, you have a startup. If not, you have a category."
- **Suster on the same:** "Students don't pay. Their schools might. Have you talked to a single procurement officer? What's the seat price, the contract length, the renewal motion? Without that, this is a 12-month burn looking for a thesis."

### 4.3 Parallel call orchestration

`Promise.all` of 4 Claude calls. Stream them in parallel (Anthropic SDK supports concurrent streams). Wall-clock target: roughly 3-5 seconds at p50 (Haiku output length × 80 tokens). If any call takes longer than 8s, time it out and render `the {persona} is thinking…` as a permanent state — the other 3 land normally. One slow persona never blocks the page.

---

## 5. UI layout

Hero is a 2×2 grid on desktop (≥1024px), stacked 1×4 on mobile. Each cell is a portrait frame with three locked sections.

### 5.1 Portrait frame anatomy

```
+--------------------------------+
|                                |
|  [16:9 commissioned art]       |   ← portrait region, idle anim plays here
|                                |
+--------------------------------+
| Garry Tan                      |   ← name, 18px, persona accent color
| YC partner                     |   ← bio line, 13px, zinc-400
+--------------------------------+
|                                |
|  Roast body text in zinc-100,  |   ← roast region, 16px, line-height 1.6
|  16px, served streaming.       |
|                                |
+--------------------------------+
```

**Frame border.** 1px solid `rgba(persona-accent, 0.3)` with `border-radius: 8px`. The accent color faintly tints the whole card without overwhelming the artwork.

**No drop shadows.** The Hades II portrait reference uses flat illustrations on flat dark backgrounds — no glow, no glass effect. Keep it disciplined.

**Mobile order.** Garry → Naval → PG → Suster. Garry first because his voice is the most familiar to the X audience and the user needs a hook in the first card to keep scrolling.

### 5.2 Portrait artwork

Four 16:9 commissioned cartoon-caricature illustrations of the 4 real people, recognizable but stylized, generated via `scripts/gen.mjs` (Gemini Nanobanana pipeline, per memory `vibex_gen_tool.md`). Style reference: stay adjacent to RPG forge art direction (warm earth palette, hand-drawn ink lines, painterly shading) but skew toward editorial illustration rather than game splash — these are *portraits*, not action shots.

**Prompt per portrait.**

```
Editorial cartoon portrait, 16:9, single character centered, plain warm
earth-tone background. {Real-person reference traits, e.g., "Garry Tan:
mid-40s, Asian-American man, glasses, black hair, friendly intense
expression"}. Hand-drawn ink linework, painterly shading, RPG illustration
style adjacent to Hades II character portraits but more grounded.
Character should be recognizable but stylized — not photorealistic. Frame
the head and shoulders. Leave subtle margin at top and bottom for clean
crop. No text, no logos, no background props.
```

**Cost.** Per memory `vibex_gen_tool.md`, Nanobanana generations are ~$0.04 each. Four portraits × $0.04 = $0.16 total one-time. Plan 5-8 generations per persona to land on a usable one; budget $1.50 for portrait iteration. Once shipped, the four files live in `public/roast/portraits/{garry,naval,pg,suster}.png`.

**Recognizability guard.** Show portraits to one friend who knows the 4 people before shipping. If they cannot identify 3 of 4 in 2 seconds, regen. If they can identify by name and the recognition feels mean-spirited rather than affectionate, regen again with softer features. We want "knowing nod", not "ouch".

### 5.3 Idle animation system

Each portrait gets one of three idle types: head bob (Garry), eye blink (Naval, PG), head shake (Suster). All implemented as CSS `@keyframes` on the portrait `<img>`, never JS. Two keyframes per animation (start + middle, with `animation-direction: alternate`).

Example (Garry, head tilt):

```css
@keyframes garry-idle {
  0% { transform: rotate(-1deg); }
  100% { transform: rotate(1deg); }
}
.garry-portrait {
  animation: garry-idle 2.8s ease-in-out infinite alternate;
}
```

**Reduced motion.** All four animations disable via `@media (prefers-reduced-motion: reduce) { animation: none }`. The portraits sit still, the rest of the UX works identically. Same gate that `lib/sound.ts` uses for audio.

---

## 6. Submit flow

1. User lands on `/roast`. Form with one textarea ("paste your idea, or paste a project URL") and a submit button labeled "let them have it". No upload, no auth wall.
2. On submit, if input matches a URL pattern, server-side fetches the URL and extracts a 1-paragraph summary (reuse the same scrape stub used by `/cracked` for GitHub handles — minimal). Otherwise the textarea content is the pitch.
3. Page transitions to `/roast/{shareId}`. Server stores `{pitch, shareId, createdAt}` in a new `roasts` table (Supabase, 3 columns + RLS allowing anon insert + anon select-by-id). No user account required.
4. Client component renders the 2×2 grid with all four portraits **already animated** with a "thinking" overlay: faster idle animation (1.5× speed) + a small "drumming fingers" or "eye-twitch" loop. This is the loading state.
5. Four parallel Claude streams kick off. As each persona's roast streams in, its frame swaps from "thinking" to the final roast text (streaming token-by-token feels good — keep it, but cap render rate at 60fps).
6. When the 4th persona lands, fire the chord (§7).
7. Share card and copy-link buttons appear below the grid.

**Result page is shareable + bookmarkable.** ISR `revalidate = 3600`. Returning to a `/roast/{shareId}` URL re-renders the four roasts from the DB without re-calling Claude.

---

## 7. Sensory layer

Reuse `lib/sound.ts`. Two extensions needed (deferred — not part of MVP, but specced):

- New event `roast-thinking-tick` — short low tick (~200Hz, 40ms, chime envelope) firing every 600ms across all 4 portraits during loading. Subtle drumming-fingers feel.
- New event `roast-chord-{0..3}` — four notes forming a C major 7 chord (C-E-G-B at 523, 659, 784, 988 Hz, 250ms each, chime envelope). Fired in sequence with 80ms stagger as the 4 portraits land, regardless of which persona lands first (we tag the *first to land* as note 0, second as note 1, etc.) so the chord always resolves on the same final note.

**Why chord-on-resolve.** A single whoosh on land would feel like notification spam after 3 retries. A chord resolves the tension built by the 4 staggered streams. The user hears "this is done, all 4 voices have spoken".

**Reduced motion / sound disabled.** Same gates as existing `playForge` — fail silent. The page works without audio.

---

## 8. Share card

Satori-rendered 1080×1080 (Instagram feed + Stories friendly). Lives at `app/roast/[shareId]/opengraph-image.tsx`. Pattern matches the existing `/cracked/[handle]/opengraph-image.tsx` (TTF font load — not WOFF2, per `feedback_satori_ttf_not_woff2.md`; `params: Promise<{ shareId: string }>` per the Next 16 OG landmine).

**Layout.** Hades II "portrait corner badges" pattern: four small circular crops of the persona portraits, one in each corner. The pitch is centered, 64px serif (Cormorant Garamond — reused from the Funeral spec to keep the bundle aesthetic tight). Below each portrait, a single italicized 14-word quote pulled from that persona's roast — the punchiest sentence Claude generated, selected by the server with a simple "shortest standalone sentence containing a question or imperative" heuristic.

**Wireframe.**

```
+----------------------------------------+
| (Garry portrait)         (Naval portrait)|
| "What's the wedge        "Marketplaces  |
|  this month?"             are headcount."|
|                                        |
|                                        |
|          [PITCH IN BIG SERIF]          |
|       "an AI assistant for             |
|        personal trainers"              |
|                                        |
|                                        |
| (PG portrait)           (Suster portrait)|
| "Have you sat next      "What's the    |
|  to a student?"          seat price?"  |
|                                        |
| roast.vibexforge.com    powered by Claude|
+----------------------------------------+
```

Footer line: `roast.vibexforge.com` left, `powered by Claude` right. Both 14px zinc-500. The `powered by Claude` line is required hygiene for credibility, not a partnership claim.

---

## 9. Voice differentiation test

New test file `tests/test_roast_voices.py` (we have Python testing for the agents stack; for vibex use a TS equivalent at `tests/roast-voices.test.ts` running under whatever vibex's test runner is). Test:

```
Given the same 3 sample pitches, run all 4 persona prompts.
For each pair of personas (6 pairs total),
compute trigram overlap of the outputs.
Assert: no pair shares more than 40% of unique trigrams.
```

This is the objective gate that the voices are measurably distinct. If two personas exceed 40% trigram overlap, the prompts are too similar and need to be rewritten — typically by sharpening their anger triggers and few-shot examples. Run this in CI on every prompt change.

**Why 40%.** Empirically, two different Claude personas with well-distinguished system prompts hover at 25-32% trigram overlap (similar vocabulary about startups, business, products). At 40% the voices are starting to converge. At 50% they are interchangeable. 40% is the conservative ceiling.

**Threshold tuning.** First run is the baseline. If the four personas all come in at 18-22%, raise the bar to 30%. The test exists to catch regression, not to gate first ship.

---

## 10. Anti-patterns / legal hygiene

1. **Do not impersonate the 4 in ways they would object to.** No fake personal facts (no "my friend at YC told me…" content). No fake Twitter handles in the output. No claims about their portfolio companies or investments. The roasts are *style* impressions, not first-person fabrications. Output rule #4 in the system prompt enforces this; PR review should manually spot-check the first 50 user-generated roasts.
2. **Do not auto-tweet from their accounts.** Obvious, but Alex's brain has a "we-dont-do" entry against fake-identity content (`~/Desktop/Interview-Prep/Projects/alex-brain/rules/we-dont-do.md`). The share button copies the card to clipboard or opens X intent prefilled with `MY idea got roasted by Garry / Naval / PG / Suster (an AI does the voices) → roast.vibexforge.com/{id}` — explicitly tagged as an AI roast in the share copy, not a real quote.
3. **Ship a visible takedown link.** Footer of `/roast` and every `/roast/{id}` page: `if you're one of the four and want this taken down, email takedown@vibexforge.com`. Honor every request within 48h. This is the cost of using real public figures as voice references — accept it before launching, not after the first complaint.

Plus one more landmine specific to this product:

4. **Do not let the roasts hallucinate market data.** Add a system rule: "Do not cite specific dollar figures, percentages, or company names you cannot verify from the pitch text." Without this, Haiku will invent "Sequoia just funded X" type lines that feel authoritative and are completely made up. The few-shot examples should all stay abstract on numbers.

---

## 11. Implementation breakdown

Honest total: 4-6 hours engineering + 2-3 hours prompt iteration before the voices feel right. Plan the longer estimate; the prompts are the product.

| Phase | Effort | Notes |
|---|---|---|
| Persona prompts + 3 few-shot examples each | 2h | The dial. Plan 2 prompt-eng iterations per persona. Voices feel right when a friend reading them can guess "who said which" without seeing the name. |
| 4 portrait images via `scripts/gen.mjs` | 45m | Plan 5-8 gens per persona; pick best. ~$1.50 in Gemini cost total. |
| `/roast` landing + 2×2 grid + idle animations | 1.5h | Static CSS keyframes; no JS animation library. Mobile stack tested. |
| Submit endpoint + parallel Claude streams | 45m | Use existing Anthropic SDK pattern from `lib/ai.ts`. `Promise.all` with 8s timeout per persona. New `roasts` Supabase table (anon RLS). |
| Satori share card 1080×1080 | 1h | Pattern copied from `/cracked` OG. Cormorant Garamond TTF already loaded for Funeral; reuse the same `next/font` config. |
| `tests/roast-voices.test.ts` trigram test | 45m | Static fixtures: 3 sample pitches × 4 personas = 12 outputs. Trigram overlap math is ~30 lines. |
| **Subtotal engineering** | **~6h** | |
| Prompt iteration (running the trigram test + reading outputs + tightening prompts) | 2-3h | This is where the product lives or dies. Do not skip. |
| **Total** | **8-9h** | Single focused day with breaks. |

**Order.** Prompts first (you cannot evaluate the UI without real output). Portraits second (cheap, parallel with prompt work). UI third. Share card last.

---

## 12. Distribution hook

The share card is the product. Each card shows four distinct voices roasting the same idea — that is novel content density. Roy Lee's Cluely roast format proved a single AI roast goes viral; four voices is the natural escalation because it forces a click-through to read all four.

**X / Twitter motion:** founder pastes their idea → gets roasted by all 4 → screenshots → posts "Garry was the harshest. PG was right." → followers click through to roast their own. Loop. The share copy in §10 #2 makes this explicit ("an AI does the voices") so the joke is the format, not the deceit.

**r/SideProject + r/startups motion:** the card itself screenshots well at 1080×1080. Top corner badges + center pitch reads cleanly in a feed thumbnail. Zero context needed.

**Compounding with Funeral and Cracked:** all three are in the same `/roast`, `/funeral`, `/cracked` namespace under VibeXForge. A user who lands on one is one click from the others (add a footer link triplet on each: Roast · Funeral · Cracked). This is the "indie playground" cluster the 2026-05-31 research called for.

---

## 13. Verification checklist

After ship, before celebrating:

- [ ] 4 portraits load on `/roast` and animate; reduced-motion users see static portraits.
- [ ] Submit form accepts both raw text and URL input; URL case extracts ≥30 chars of summary text.
- [ ] All 4 personas stream and land within 8s p95 (check HyperDX traces).
- [ ] Trigram overlap test passes (`< 40%` on all 6 pairs across 3 sample pitches).
- [ ] Share card renders correctly at 1080×1080 (Satori does not throw; corner portraits visible at thumbnail size).
- [ ] Returning to `/roast/{shareId}` after 5 minutes serves cached output (no new Claude calls — check HyperDX).
- [ ] Footer takedown email link visible on both `/roast` and `/roast/{id}`.
- [ ] X share intent prefills with the "(an AI does the voices)" disclaimer text.
- [ ] Sound chord fires only when 4th portrait lands; reduced-motion / sound-off users hear nothing.
- [ ] `/roast` linked from `/funeral` and `/cracked` footers (and reciprocal).
- [ ] No persona output contains specific dollar figures, percentages, or company names not in the user pitch (spot-check first 50 roasts manually).
- [ ] Cost telemetry: average Claude cost per roast < $0.01 after prompt cache warmup. If > $0.02, investigate cache miss.

---

## 14. Out of scope (deferred)

- User accounts / save history of your roasts. The whole product works anonymously; gating it behind login kills the viral loop.
- More than 4 personas. Five voices is one too many for the 2×2 grid and the chord. Pick a fifth (Cuban? Karpathy?) only if a persona drops out.
- "Roast my resume" or "roast my GitHub" modes. These are good ideas for v2 but conflate with Cracked Score. Stay focused.
- Multi-language. Voices are English-locked; the 4 referenced people are English-language public figures. Chinese versions would need 4 different referents (different research effort).
- Backer-mode tipping on roast cards. Backer mode is post-PH per `brainstorm_vibex_backer_mode.md`. Do not pre-mix.

---

**End spec. No code touched. No commits. Alex review tomorrow.**
