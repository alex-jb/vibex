# DESIGN.md — VibeXForge

> Single source of truth for the VibeXForge visual identity.
> LLM agents read this before any UI change. Format: nexu-io/open-design 9-section schema.
> North-star (locked 2026-05-07): **AI 独立创作者的多渠道曝光放大器** — the indie AI creator amplifier.
> For deeper component reference + history, see `git log DESIGN.md` (this file replaces a 743-line predecessor preserved in history).

---

## 1. Palette

Dark neon, restrained. **One dominant + one supporting accent per surface.** Never six rarity glows at once.

| Token | Hex | Role |
|---|---|---|
| `--brand-forge` | `#F97316` | Primary brand orange — forge anvil, CTAs |
| `--brand-cream` | `#FFE27D` | Secondary brand accent — wisdom, gold |
| `--brand-emerald` | `#10B981` | Status: success / posted / amplified |
| `--brand-violet` | `#8B5CF6` | Secondary surface accent |
| `--brand-amber` | `#F59E0B` | Status: pending / warning |
| `--brand-rose` | `#F43F5E` | Status: error / rejected |
| `--bg-deep` | `#0A0A0C` | Full-page near-black surface |
| `--bg-elev` | `#14141A` | Elevated card tone |
| `--neon-green` | `#39FF14` | HP bars, terminal text, active states |
| `--neon-purple` | `#9D00FF` | EXP, evolution, links (use sparingly) |
| `--neon-cyan` | `#06B6D4` | MP bars, info, secondary accent |
| `--neon-pink` | `#EC4899` | Hearts, likes, charisma |
| `--neon-orange` | `#FF4500` | Critical, fire, L-corners |
| `--neon-yellow` | `#FACC15` | Gold, rewards, trending |
| `--border-soft` | `rgba(255,255,255,0.06)` | Default border |
| `--border-strong` | `rgba(255,255,255,0.12)` | Emphasized border |

**Hard rules:**
- 5-color brand ceiling. Do not add a 6th.
- 2 border tiers only (`--border-soft`, `--border-strong`). Do not introduce `/[0.04]` through `/[0.40]` opacity tiers.
- Single dominant neon + single supporting per screen.

---

## 2. Typography

| Role | Font | Size token | Notes |
|---|---|---|---|
| Display (hero) | Geist 900 | `--text-display` (88px) | Mobile fallback to `--text-h1` |
| H1 | Geist 800 | `--text-h1` (48px) | Page titles |
| H2 | Geist 700 | `--text-h2` (32px) | Section heads |
| H3 | Geist 700 | `--text-h3` (22px) | Card titles |
| Lead | Geist 500 | `--text-lead` (16px) | Lead paragraphs |
| Body | Geist 400 | `--text-body` (14px) | Default |
| Caption | Geist 400 | `--text-caption` (12px) | Metadata |
| Pixel accent | Press Start 2P | hero kicker only | NEVER as body — `nes.css` body font bleed landmine |
| Mono | Geist Mono | `--font-mono` | Code, tickers, level numbers |

**Rules:**
- 6-size type scale. Avoid arbitrary `text-[Npx]`.
- `nes.css` MUST stay in `@layer(base)` (see `memory/vibex_nes_css_layer.md`).
- `globals.css` MUST explicitly set `body { font-sans }` to override `nes-core` Press Start 2P bleed.

---

## 3. Spacing

Tight pixel grid: 8 / 16 / 24 / 32 / 48 / 64 / 96.

- Page container: `max-w-7xl mx-auto` for marketing, `max-w-6xl` for content.
- Card padding: `p-6` (24px).
- Section vertical rhythm: `py-16` to `py-24` between major bands.
- Form field gap: `gap-4` (16px).
- Grid gutter (project cards): `gap-6` (24px).
- Mobile breakpoint: `md:` (768px).

---

## 4. Motion

Subtle, NOT cinematic. The vibe is "RPG menu", not "Awwwards experimental."

**Allowed:**
- Forge-unveil burst on `/project/[id]?forged=1`.
- Evolution-stage ladder pulse (low amplitude).
- Mascot pixel-art glitches (sparingly).
- `tw-animate-css` fade/slide on mount (200–300ms).
- Hover: `opacity` + 1px translate max.

**Forbidden:**
- Heavy `@keyframes` loops.
- Scroll-driven parallax.
- Hover lift + rotate combos (cliché).
- Spring physics on cards.

---

## 5. Voice

Terse builder voice. Game-native. No marketing fluff.

**Do:**
- "Forge your AI project."
- "Stage 3 → Stage 4. +120 EXP."
- "Posted to 12 platforms."

**Don't:**
- "Comprehensive AI creator solution." (delve / comprehensive / robust = banned)
- Em dashes (use period or comma — both AGENTS.md and user-rule).
- AI slop adjectives: leverage, robust, seamless, cutting-edge.
- Exclamation marks outside game-state notifications.

---

## 6. Anti-patterns (NEVER ship)

- 6+ rarity glows on a single grid.
- All 6 neons on the same screen (rainbow grid landmine).
- AI-purple-gradient hero on dark mesh.
- "Three equal feature cards" SaaS layout.
- Em dashes anywhere.
- Glassmorphism on cards (`backdrop-blur` + `bg-white/[0.05]` everywhere).
- `Inter + slate-900` LLM default.
- `text-[Npx]` arbitrary values (use the 6-size scale).
- 8 border-opacity tiers (use 2).
- New hex literals in components (use brand tokens).
- Hover lift + rotate on cards.

---

## 7. Aesthetics

**16-bit RPG pixel meets dark-mode developer terminal.** Pokemon battle UI energy crossed with Linear's surface discipline. Forge / anvil / level-up vocabulary throughout user-facing copy. Mascot illustrations are pixel-art chibis.

References (visual mood):
- Pokemon Gen 3 battle interface.
- Codex / Linear dark UI surface hierarchy.
- nes.css for accent borders / corners.
- Cluely / Roy Lee "cracked engineer" energy for hero copy.

---

## 8. Components

Source of truth for components is `/components/`. Key visual contracts:

| Component | Path | Visual contract |
|---|---|---|
| ForgeAnvil hero | `components/landing/ForgeAnvil.tsx` | Pixel-art anvil, forge sparks, Press Start 2P kicker |
| Evolution ladder | `components/rpg/EvolutionLadder.tsx` | 5-stage pixel ladder, glow on current stage only |
| EvolutionBurst | `components/rpg/evolution-burst.tsx` | `?forged=1` only, single-fire, no loop |
| TypewriterText | `components/rpg/typewriter-text.tsx` | Game-text reveal, mono font |
| ProjectCard | `components/feed/ProjectCard.tsx` | Trailer thumbnail + traction counters + level badge |
| MentionAutocomplete | `components/feed/mention-autocomplete.tsx` | RPG menu treatment, no SaaS dropdown chrome |
| Navbar | `components/chrome/Navbar.tsx` | 6 items max, single accent active state |
| AIReviewPanel | `components/forge/AIReviewPanel.tsx` | Claude review verdict, brand-cream highlight |

Increments to `projects.views / plays / upvotes` MUST go through `increment_*` / `toggle_*` Supabase RPCs (SECURITY DEFINER). See `memory/vibex_schema_ground_truth.md`.

---

## 9. References

**Internal:**
- `AGENTS.md` — project-wide rules + build-cost red line.
- `CLAUDE.md` — imports AGENTS.md.
- `app/globals.css` — token source of truth.
- `app/predictions/DESIGN.md` — page-scoped predictions design.
- `.claude/skills/taste-skill/SKILL.md` — anti-AI-slop design guide. Invoke before any new visual surface.

**External:**
- North star vision: `~/Desktop/Interview-Prep/Projects/alex-brain/projects/vibex.md`.
- Color restraint rule: `memory/feedback_vibex_color_restraint.md`.
- Visual density rule: `memory/feedback_vibex_visual_density.md`.
- nes.css landmine: `memory/vibex_nes_css_layer.md`, `memory/vibex_nes_css_body_font_landmine.md`.
- Rebrand history: `memory/vibex_brand_rebrand_2026_04_21.md` (VibeX → VibeXForge, 2026-04-21).

---

*Last reviewed: 2026-06-06. Predecessor: 743-line DESIGN.md preserved in git history (commit before this one).*
