# Impeccable + Taste Skill cross-audit — 2026-07-13

Ran `npx impeccable detect` on the `/launch` page + reviewed against
the Taste Skill (already installed at
`.claude/skills/taste-skill/SKILL.md`) design read guidance.

Both tools recommended by 抖音 creators today (Peter Bakaus /
Impeccable v3.2.1 · Leon / Taste Skill). Same category ("anti-slop
frontend for AI-generated UIs") — Impeccable is the deterministic
detector, Taste Skill is the LLM-side design brief. They compose.

## Findings on `app/launch/page.tsx`

### 🔴 real — worth 20 min post-Wed
**`layout-transition` line 1669** — `transition: width` animates
width, which triggers layout thrash on every frame. Migrate to
`transform: scaleX(...)` or use `grid-template-columns` transition
(no layout invalidation). Real perf win on low-end devices — the
target audience for the launch page is exactly the phone-scrolling
Chinese vibe-coder segment, so this matters.

### ⚪ intentional / false positive
**`side-tab` line 2282** — the `border-l-2` is the selected-state
indicator for a submitted-project card. Same functional pattern as
Shadow's M5 replay tampered-row highlight. Add to
`.impeccable/config.json` ignore list post-adoption:
`npx impeccable ignores add-file "app/launch/**"`

## Taste Skill state

`.claude/skills/taste-skill/SKILL.md` (1206 lines) is already
installed but has never been actively invoked. It's not a linter —
it's a design brief that Claude Code reads BEFORE generating new
frontend code. The skill's value materializes on the NEXT hero /
component regeneration, not on the existing page.

Suggested first invocation post-Wed:
```
/design-taste-frontend redo the /launch hero
"Design read: distribution amplifier for Chinese solo AI vibe-coders,
Xiaohongshu-native audience, RPG > IH-minimal density (Alex 2026-05-08
locked rule), preserve forge anvil + 6-item navbar, no purple gradient,
no Inter, no em-dashes in body copy, motion intensity 6/10."
```

## Not applying tonight

Wed 2026-07-16 XREAL demo (Shadow) is the priority. VibeX changes now
add risk without adding to Wed's story. Two changes above deferred
to post-Wed batch. Estimated total effort: 25 min.
