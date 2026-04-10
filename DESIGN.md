# VibeX Design System

> AI-readable design spec. When generating UI for VibeX, follow this document exactly.
> Format follows the [awesome-design-md](https://github.com/VoltAgent/awesome-design-md) standard.

## Brand Identity

- **Name:** VibeX
- **Tagline:** The launch and growth platform for AI-native creators
- **Aesthetic:** 16-bit RPG pixel meets glassmorphic dark UI
- **Mood:** Dark, electric, game-native. Pokemon meets a hacker terminal.

---

## Color Palette

### Neon Accents
| Name | Hex | Variable | Usage |
|------|-----|----------|-------|
| Green | `#39FF14` | `--neon-green` | HP bars, success, terminal text, active states |
| Purple | `#9D00FF` | `--neon-purple` | Primary accent, EXP, evolution, links |
| Orange | `#FF4500` | `--neon-orange` | Errors, warnings, fire, critical, L-corners |
| Yellow | `#FACC15` | `--neon-yellow` | Gold, rewards, rankings, wisdom, trending |
| Cyan | `#06B6D4` | `--neon-cyan` | MP bars, info, agility, secondary accent |
| Pink | `#EC4899` | `--neon-pink` | Hearts, likes, charisma |

### Backgrounds (dark theme only)
| Hex | Variable | Usage |
|-----|----------|-------|
| `#0D0D0D` | `--bg-deep` | Page background, deepest |
| `#111114` | `--bg-panel` | Panel/card backgrounds |
| `#161619` | `--bg-card` | Elevated surfaces |
| `#1A1A1E` | `--bg-dialog` | Modals, dropdowns |
| `#0A0A0C` | — | Bar/input backgrounds |

### Borders
| Hex | Variable | Usage |
|-----|----------|-------|
| `#2A2A30` | `--border-metal` | Standard borders (2px) |
| `#3A3A42` | `--border-bolt` | Emphasized borders (3px) |
| `rgba(255,255,255,0.06)` | — | Glass card subtle |
| `rgba(255,255,255,0.10)` | — | Glass card strong |

### Text
| Hex | Usage |
|-----|-------|
| `#E8E8EC` | Primary text |
| `#8888A0` | Muted/secondary |
| `#555555` | Disabled/dim |

### Status Bars
```
HP:  linear-gradient(180deg, #4AFF2A, #1E9C00)
MP:  linear-gradient(180deg, #22D3EE, #0891B2)
EXP: linear-gradient(180deg, #C77DFF, #7B2FBE)
```

### Attribute Colors
```
Power: #9D00FF    Resilience: #39FF14    Charisma: #EC4899
Wisdom: #FACC15   Agility: #06B6D4      Stability: #6366f1
```

---

## Typography

### Font Families
| Class | Font | Variable | Usage |
|-------|------|----------|-------|
| `.font-pixel` | Press Start 2P | `--font-press-start` | Headings, badges, labels, pixel UI |
| `.font-retro` | VT323 | `--font-vt323` | Body text, dialogs, stats, narrative |
| `.font-sans` | Geist | `--font-geist-sans` | Modern fallback |

### Pixel Font Sizes
| Size | Usage |
|------|-------|
| 20–32px | Page titles, hero headlines |
| 14–16px | Section headings, modal titles |
| 10–12px | Card names, button text, stat labels |
| 8–9px | Eyebrow tags, terminal prompts (decorative, short) |
| 6–7px | Corner brackets, viewport decorations, chrome labels (decorative only) |

### Retro Font Sizes
| Size | Usage |
|------|-------|
| 16–18px | Body text, descriptions |
| 14px | Stats, info labels |
| 12px | Secondary text |

### Rules
**Readability floor**: any text the user must **read to act** (quest labels,
button copy, form inputs, empty state messages, error copy) is **minimum 10px
pixel / 12px retro**.

**Decorative exception**: cosmetic chrome text (eyebrow tags, terminal prompts
like `VIBEX://AUTH_V1`, viewport corner labels, card rarity stamps) may use
**6-9px pixel** when repeated throughout the layout as arcade atmosphere. These
are NOT required for task completion and must have `aria-hidden="true"` on the
wrapper when the same information exists elsewhere.

**Hard floor**: never below 6px pixel. Never below 12px retro.

---

## Components

### 1. Glass Card (primary container)
```css
.glass-card {
  background: oklch(0.13 0.005 270 / 60%);
  backdrop-filter: blur(20px) saturate(1.2);
  border: 1px solid oklch(1 0 0 / 6%);
}
```
Use with `rounded-2xl overflow-hidden`. Add a **4px accent bar** at top for colored emphasis.

**Use for:** buddy hero, summon area, stat panels, collapsible details, profile cards.

### 2. Glass Card Strong (emphasized)
```css
.glass-card-strong {
  background: oklch(0.15 0.008 270 / 70%);
  backdrop-filter: blur(24px) saturate(1.3);
  border: 1px solid oklch(1 0 0 / 10%);
}
```
**Use for:** dropdowns, notification panel, modals, search results.

### 3. Retro Card (terminal-style)
```css
.retro-card {
  background: #111114;
  border: 2px solid #2A2A30;
}
```
Has bolt accent dots. Add `.l-corner` for orange corner brackets.

**Use for:** feed posts, project cards, battle HUDs.

### 4. RPGUI Framed (heavy RPG border)
```html
<div class="rpgui-container framed">
```
Uses border-image PNGs. Heavy visual weight.

**Use for:** terminal bodies, battle arenas, full-page game sections.
**Do NOT use for:** modern card layouts, buddy hero, clean panels.

### 5. NES Buttons
```html
<button class="nes-btn">Default</button>
<button class="nes-btn is-primary">Purple</button>
<button class="nes-btn is-success">Green</button>
<button class="nes-btn is-warning">Yellow</button>
<button class="nes-btn is-error">Red</button>
```
Font: Press Start 2P, 10–14px, uppercase. **Use for secondary/tertiary actions**
inside dialog bodies, tables, and settings. Hero CTAs use Pixel Chromatic Buttons
(§6) instead — they have stronger identity for conversion-critical surfaces.

### 6. Pixel Chromatic Button (hero CTA)
```jsx
<button
  style={{
    background: "linear-gradient(135deg, var(--neon-purple), #C026D3)",
    border: "3px solid #FFF",
    boxShadow: "4px 4px 0 #000, 0 0 20px rgba(157,0,255,0.5)",
    color: "#FFF",
    minHeight: 48,
    fontSize: 12,
    letterSpacing: 2,
  }}
/>
```
Variants by accent: `neon-purple` (primary/launch), `neon-green` (confirm/retry),
`neon-orange` (destructive), `amber-gold` (rewarded action, demo mode).
Always pairs: 3px white border + 4px black offset shadow + neon glow.
Animated glow via Framer Motion `animate.boxShadow` for top CTAs.

**Use for:** landing LAUNCH, /login sign-in, /register create-account, 404 actions,
error boundary retry, reward claim, hero upgrade.

### 7. Retro Input (form field)
```jsx
<input
  style={{
    background: "rgba(0,0,0,0.6)",
    border: "2px solid rgba(157,0,255,0.4)",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.6)",
    color: "#E8E8EC",
    fontSize: 15,
    minHeight: 44,
    paddingLeft: 40, // room for leading icon
  }}
/>
```
Use with a neon-tinted leading icon absolutely positioned at `left: 12px`.
Focus ring: `focus:ring-2 focus:ring-violet-500/50`.
Color the border/icon per form context: purple for login, green for register.

**Use for:** auth forms, /launch submission, comment composer, settings inputs.

### 8. Retro Loader
Component: `<RetroLoader label="LOADING" fullScreen />`
- 8-dot pixel spinner rotating with staggered 0.12s delays
- Blinking label below in `var(--neon-green)`
- Scanline bg overlay when `fullScreen`

**Use for:** every `loading.tsx` route fallback, Suspense boundaries on heavy
sections, inline buttons during async ops (`fullScreen={false}`).

### 9. Retro Game Boy Frame (showcase)
Component: `<GameBoyFrame cta={<LaunchButton />}>{children}</GameBoyFrame>`
- 4-stop gray gradient shell with 3px pixel borders and 4px black offset shadow
- Horizontal DMG layout: D-pad (left), screen (center), A/B (right)
- Mobile: 2-col grid (screen row 1, controls row 2)
- Decorative parts (D-pad, A/B, branding strips, speaker grille) are
  `aria-hidden="true"`; only children + CTA are accessible
- `cta` slot below A/B buttons

**Use for:** landing showcase ONLY. Don't use Game Boy anywhere else — it's the
hero anchor, overexposure kills the identity.

### 10. Flip Card
Component: `<FlipCard front={...} back={...} autoFlipInterval={4000} />`
- 3D CSS transform with `preserve-3d` + `backface-visibility: hidden`
- Auto-flips every 4s, pauses on hover, click/Enter/Space to flip manually
- Both faces must be the **same dimensions** or card jitters

**Use for:** hero card showcase (project stats front / pet card back).

### 11. Holographic Project Card (front face)
Component: `<ProjectDemoCard project={...} />`
- Gold `#FFD700` 3px border + double pinstripe frame
- Animated holographic foil sweep (linear-gradient, mix-blend-mode: screen)
- SVG sun-ray burst behind sprite, 5 pulsing sparkles
- Top strip: `★ CATEGORY ★` + FEATURED crown
- Pixel scoreboard stats (4 col) with gold dividers
- Footer: `◆ BY CREATOR ◆` gold engraving

**Use for:** the "after VibeX" side of the hero showcase. Premium collectible feel.

### 12. Tribal Totem Pet Card (back face)
Component: `<PetCard project={...} />`
- Class-based palette (Architect=blue dragon, Artisan=orange fox, etc.)
- Tribal SVG patterns (zigzags + triangles) on 4 edges
- Creature silhouette with sun-ray halo, floating emoji
- Parchment scroll title, HP/MP/EXP stat bars

**Use for:** the "pet form" side of the hero showcase. Pokemon x Monster Hunter energy.

### 13. Retro Error Panel
Seen in: `app/error.tsx`, `app/not-found.tsx`
- Hazard-stripe top banner (`repeating-linear-gradient` orange/red)
- Flicker glow animation, stronger scanlines
- Terminal error message in monospace with `>` prompt
- 3-button grid: retry (green) / home (purple) / report (orange)

**Use for:** global error boundary, 404, crash screens, unreachable states.
**Do NOT use for:** form validation errors (use inline red alert box instead).

### 14. Daily Quest Bar
Component: `<DailyQuestBar />`
- 3 quests in a row, localStorage UTC-midnight reset
- First-visit welcome state (dashed green border + WELCOME ADVENTURER)
- Progress bar per quest, claim triggers `+XP` gold drop animation
- Compact: purple outer border + corner bracket feel

**Use for:** `/home` retention hook, below QuickActions.

### 15. Mobile Bottom Tab Bar
Component: `<MobileBottomNav />`
- Fixed to viewport bottom on <md screens only
- 5 items max (Material Design cap): HOME / DISCOVER / LAUNCH / FEED / PROFILE
- LAUNCH is visually lifted (gradient + 3px white border + raised 10px)
- Active state: top 3px neon bar + filled icon + pixel dot
- `safe-area-inset-bottom` for notched devices
- Hidden on chromeless routes (`/`, `/login`, `/register`)

**Use for:** all app routes on mobile. Complements the desktop navbar.

---

## Layout

### Page Structure
```jsx
<div className="max-w-{size} mx-auto px-4 sm:px-6 py-{8|12|16}">
```

| Page Type | Max Width | Examples |
|-----------|-----------|---------|
| Narrow | max-w-3xl | About, Trade |
| Medium | max-w-4xl | Buddy, Analytics, Settings |
| Wide | max-w-5xl | Arena, Agents |
| Full | max-w-7xl | Discover, Home, Creators |

### Section Pattern
```jsx
<motion.section
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 * index }}
  className="mb-10"
>
  <h2 className="font-pixel" style={{ fontSize: 14, color: "#E8E8EC", marginBottom: 16 }}>
    SECTION TITLE
  </h2>
  {/* content */}
</motion.section>
```

### Grid Patterns
```
Cards:     grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4
Projects:  grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
Pokedex:   grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4
```

### Collapsible Sections
```jsx
<details className="group glass-card rounded-2xl overflow-hidden">
  <summary className="font-pixel cursor-pointer flex items-center gap-3 px-6 py-4"
    style={{ fontSize: 14, listStyle: "none" }}>
    <span>TITLE</span>
    <span className="ml-auto group-open:rotate-180 transition-transform">▼</span>
  </summary>
  <div style={{ padding: "0 24px 24px" }}>{/* content */}</div>
</details>
```

---

## Buddy Pet System

### Sprite Grid
- **Resolution:** 16x16 pixels (256 cells per sprite)
- **Rendering:** CSS Grid, `image-rendering: pixelated`
- **Cell size:** `totalPx / 16` per cell

### Size Variants
| Key | Pixels | Cell Size | Usage |
|-----|--------|-----------|-------|
| sm | 48px | 3px | Pokedex thumbnails |
| md | 80px | 5px | Collection cards |
| lg | 128px | 8px | Battle HUD |
| xl | 192px | 12px | Detail view |
| xxl | 256px | 16px | Dojo hero display |

### Sprite Design Rules
1. **5–8 colors** per buddy: dark, primary, light, white, black + accents
2. **Eyes:** white `#FFFFFF` + black `#222222` pupil, rows 5–6
3. **Body:** center 10×10 area; head ~6 rows, body ~6 rows, feet ~2 rows
4. **Transparent border:** 1–3px edges for clear silhouette
5. **Signature detail:** every buddy needs one (tail, horns, wings, crown, glow)
6. **Color palette object:** named shorthand vars for consistency
```typescript
const BUDDY = { d: "#dark", o: "#primary", l: "#light", w: "#FFFFFF", k: "#222222" };
```

### Idle Animation
```jsx
animate={{ y: [0, -6, 0] }}
transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
```

### Buddy Card
```
Width: 150/200/260px (sm/md/lg)
Structure: accent bar (4px, rarity color) → sprite → name → rarity badge → element → passive
Active: border 2px #FFD700, box-shadow glow
Unowned: filter: grayscale(1) brightness(0.4), "???" text
```

### Dojo (Hero Display)
```
Background: linear-gradient(180deg, #0C0C14 → #252540)
Floor: perspective(400px) rotateX(45deg) grid with rarity-colored lines
Glow: radial-gradient of rarity color, blur(40px)
Shadow: ellipse rgba(0,0,0,0.5), blur(8px) under sprite
Particles: 6 floating dots, rarity color, staggered y animation
Name plate: frosted glass (rgba(0,0,0,0.6), backdrop-blur 8px)
Stats panel: below dojo — EXP/energy bars, age, passive, action buttons
```

---

## Animation Library

### Timing Functions
```
Elastic:  cubic-bezier(0.22, 1, 0.36, 1)  — Bar fills, reveals
Spring:   type: "spring", stiffness: 400, damping: 30  — Bouncy
```

### Framer Motion Patterns
| Pattern | Config | Use |
|---------|--------|-----|
| Fade up | `opacity: 0, y: 12` → `1, 0` | Section entrance |
| Menu open | `opacity: 0, y: -8, scale: 0.95` → `1, 0, 1` | Dropdowns |
| Card hover | `whileHover={{ scale: 1.03, y: -3 }}` | Interactive cards |
| Sprite float | `y: [0, -6, 0]` 2s infinite | Buddy idle |
| Battle flash | `opacity: [0,1,0,1,0,0.8,0]` 1s | Summon/transition |
| Stagger | `delay: index * 0.05–0.12` | List items |

### CSS Keyframes
| Name | Duration | Use |
|------|----------|-----|
| `float` | 6s | Vertical bobbing (12px) |
| `pulse-slow` | 4s | Opacity breathing |
| `crit-pop` | 0.6s | Damage number bounce |
| `shake` | 0.3s | Screen shake on impact |
| `battle-flash` | 1.2s | White strobe transition |
| `fire-dance` | 2s | Gradient rotation |
| `evo-pulse` | 2s | Evolution expanding glow |
| `sprite-bob` | 2s | Gentle bounce (6px) |
| `typewriter` | 2s | Text reveal with cursor |
| `holo-rotate` | 4s | Rainbow border rotation |

---

## Decorative Effects

### Scanline Overlay
```css
background: repeating-linear-gradient(0deg,
  transparent 0, transparent 2px,
  rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px);
```
**Use on:** terminal bodies, battle scenes. **Not on:** glass-card sections.

### Noise Background
`.noise-bg` — SVG fractal noise at 3% opacity.

### L-Corner Accents
Orange `#FF4500` corner brackets on `.retro-card.l-corner`. 14px, 3px border.

### Text Glow
```css
text-shadow: 0 0 10px {color}40, 0 0 30px {color}40;
```

### Glass Glow
```css
.glow-violet  — 40px + 80px violet box-shadow
.glow-fuchsia — 40px + 80px fuchsia box-shadow
.glow-soft    — 60px subtle violet
```

---

## i18n

- **Languages:** English (en), Chinese (zh)
- **Hook:** `const { t, lang } = useLang()`
- **Rule:** ALL visible text must use `t("section.key")`. No hardcoded strings.
- **Fallback:** `translations[lang][key] ?? translations.en[key] ?? key`
- **Date locale:** `lang === "zh" ? "zh-CN" : "en-US"`

---

## Accessibility

- `role="feed"` on post lists, `role="article"` on posts
- `aria-label` on all icon-only buttons
- `aria-live="polite"` on realtime areas
- `aria-expanded` on toggles/dropdowns
- Minimum touch target: 44px mobile
- External `<img>`: must justify `@next/next/no-img-element` disable

---

## Do / Don't

### DO
- Use `glass-card rounded-2xl` for modern sections
- Use `font-pixel` for headings, `font-retro` for body
- Use `nes-btn` for all action buttons
- Use neon colors for emphasis, never as full backgrounds
- Keep fonts readable (min 10px pixel, 12px retro)
- Use Framer Motion for all animations
- Add 4px accent bars on colored containers
- Test in both EN and ZH modes
- Use `t()` for every visible string

### DON'T
- Use `rpgui-container framed` for clean card layouts
- Use font-size below 8px
- Mix pixel and sans-serif fonts in one label
- Add scanlines on glass-card sections
- Hardcode Chinese or English strings
- Use light backgrounds (always dark)
- Use shadows heavier than `0 0 40px` with >30% opacity
- Create new CSS files — use existing utilities
