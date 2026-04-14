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

### Color Restraint Rule (MUST FOLLOW) — "1 primary per screen"

The neon palette has 6 strong colors. Using all 6 on one screen makes it look
like a casino. **Every screen must pick ONE dominant neon + at most ONE
supporting accent.** All other elements stay in the dark neutrals.

**Per-screen primary assignments:**

| Route | Primary | Supporting | Why |
|-------|---------|------------|-----|
| `/` (landing) | **Purple** `#9D00FF` | Green `#39FF14` (terminal) | Brand wordmark + hero CTA |
| `/expedition` (discover) | **Yellow** `#FACC15` | Purple (explorer level) | Adventure / treasure / XP |
| `/launch` (the forge) | **Purple** `#9D00FF` | Cyan `#06B6D4` (success state) | Portal / forge fire |
| `/feed` | **Cyan** `#06B6D4` | Pink `#EC4899` (likes) | Live stream energy |
| `/vc` | **Green** `#39FF14` | Yellow (trending) | Data / money / growth |
| `/arena` | **Orange** `#FF4500` | Pink (crit hits) | Battle / damage |
| `/dojo` | **Green** `#39FF14` | Purple (evolution) | Training / buddy |
| `/codex` (new) | **Yellow** `#FACC15` | Rainbow for myth | Badge collection |

**Rarity colors are DATA, not chrome.** The 6 rarity tiers
(common/uncommon/rare/epic/legendary/myth) only color the Hero Card border +
rarity stamp + ✦ symbols. **Never** use rarity colors on page-level UI (nav,
buttons, containers). This rule is what keeps a grid of 12 heroes from looking
like a rainbow explosion.

---

## Product Voice — Adventure Vocabulary

VibeX is not a product directory. It is a **growth expedition** for AI creators.
Language matters. Adventure words beat product words everywhere in user-facing
copy. This table is the canonical rename map — apply it in i18n keys, nav
labels, page titles, button text, and eyebrow tags.

| Product word | Adventure word | Notes |
|--------------|----------------|-------|
| Discover | **EXPEDITION** / The Atlas | Top nav label. Route stays `/discover` but chrome + eyebrow say EXPEDITION |
| Launch | **THE FORGE** | Route stays `/launch`. Hero chrome says FORGE |
| Home | **HQ** | Route `/home`. Chrome shows HQ |
| Profile | **THE CODEX** (new route `/codex`) | Personal badge / hero collection page |
| Projects | **Heroes** / Cards | UI-layer rename only, DB schema stays `projects` |
| Users | Creators | (unchanged) |
| Browse | Scout / Hunt | |
| Search | Scout | "Scout the atlas..." |
| Latest | **Fresh sightings** | |
| Trending | **Hot drops** / On fire | |
| Featured | **Legendary sightings** | |
| Level up | **Evolve** | (unchanged — existing evolution system) |
| Sign up | **Enlist** | Register flow |
| Log in | Return to base | Can abbreviate to LOG IN on desktop if cramped |
| Category | Class / Realm | "Agent class", "Cyber City realm" |
| Stats | **Power level** | |
| Analytics | **Growth intel** | (already used on landing CTA) |
| Notification | **Beacon** | |
| Feed | **The Wire** / Dispatches | |
| My collection | **My Codex** | |

**Rule:** never mix dialects on one screen. If a page uses "Expedition" in the
nav, it should NOT use "Discover" in an internal button. Pick one language per
page and hold it.

---

## Typography

### Font Families
| Class | Font | Variable | Role | Usage |
|-------|------|----------|------|-------|
| `.font-pixel` | Press Start 2P | `--font-press-start` | **Heavy display** | h1/h2, hero CTAs, brand wordmark (≥ 16px only) |
| `.font-ui` | **Silkscreen** | `--font-silkscreen` | **Small pixel UI** | nav, buttons, labels, card stats, terminal text, eyebrows (8–14px) |
| `.font-retro` | VT323 | `--font-vt323` | **Retro body** | body text, dialogs, flavor narrative, descriptions |
| `.font-code` | **Hack** | `--font-hack` | **Programmer mono** | code blocks, terminal output inside cards, API responses |
| `.font-sans` | Geist | `--font-geist-sans` | **Modern fallback** | rare, forms that need maximum clarity |

> **Why Silkscreen joined the stack (2026-04-14):** Press Start 2P is a perfect
> pixel font at ≥ 16px but gets blurry and hard to read below 12px because every
> glyph is a single pixel tile. Silkscreen (Google Fonts, free) is a dedicated
> UI pixel font with per-pixel hinting designed for 8–14px, which is exactly
> where PS2P fails. **Use Silkscreen everywhere you would have used PS2P at 8–14px.**
> Reserve PS2P for display sizes where its chunky arcade look is the whole point.

### Pixel Font Sizes (by font)

| Size | Font | Usage |
|------|------|-------|
| 20–32px | **Press Start 2P** | Page titles, hero headlines, brand wordmark |
| 14–16px | **Press Start 2P** | Section headings, modal titles, hero CTAs |
| 10–13px | **Silkscreen** | Nav links, button text, card names, stat labels, terminal body |
| 8–9px | **Silkscreen** | Eyebrow tags, terminal prompts, footer copy, pill labels |
| 6–7px | **Silkscreen** | Corner brackets, chrome labels (decorative only, `aria-hidden`) |

### Retro Font Sizes
| Size | Usage |
|------|-------|
| 16–18px | Body text, descriptions |
| 14px | Stats, info labels |
| 12px | Secondary text |

### Rules
**Readability floor**: any text the user must **read to act** (quest labels,
button copy, form inputs, empty state messages, error copy) is **minimum 10px
Silkscreen or 12px VT323**. Never use Press Start 2P below 12px.

**Decorative exception**: cosmetic chrome text (eyebrow tags, terminal prompts
like `VIBEX://AUTH_V1`, viewport corner labels, card rarity stamps) may use
**6-9px Silkscreen** when repeated throughout the layout as arcade atmosphere.
These are NOT required for task completion and must have `aria-hidden="true"` on
the wrapper when the same information exists elsewhere.

**Hard floor**: never below 6px Silkscreen. Never below 12px VT323.
**Press Start 2P floor**: never below 12px. Below that, use Silkscreen.

**Box-drawing characters (╔╗╚╝═║┼┌┐)**: Press Start 2P and Silkscreen do NOT
have these glyphs and will fall back to system monospace, rendering ~2× wider
than expected and breaking tight layouts. Use **Menlo, Monaco, "Courier New",
monospace** explicitly on any element that renders ASCII box art, or use
Hack (`var(--font-hack)`) which supports them natively.

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

### 16. Interactive Terminal Demo
Component: `<InteractiveDemo onIdeaSubmit={setUserIdea} />`
Lives inside the Game Boy screen on landing. Two modes driven by a
state machine (`idle` → `typing` → `generating` → `reveal`):

- **AUTO mode** (default): cycles through 5 example prompts. Each cycle
  is typewriter (55ms/char) → "GENERATING [▓▓▓░░░░░]" (1.4s) → card
  slides in (0.55s) → hold (3.2s) → fade → next.
- **USER mode**: click screen → visually-hidden textarea focuses (uses
  clipPath inset(50%) for iOS compat). User types ≤80 chars, Enter to
  generate, Escape to reset. Empty submit flashes `⚠ NEED AT LEAST ONE
  WORD` for 1.6s.
- **Contextual hints** during reveal: auto mode shows `▸ CLICK TO ENTER
  YOUR OWN IDEA ◂`, user mode shows `▼ LAUNCH BELOW ▼` pointing at CTA.
- Deep green-black terminal (`#0a1a0e`), neon green prompt (`#39FF14`),
  blinking cursor block, pixel font labels at 6-9px (decorative tier).
- Generated card is a real `ProjectDemoCard` with a minimal mock Project
  built from the user's input, so visual is consistent with rest of app.
- Notifies parent via `onIdeaSubmit(idea)` so the LAUNCH button can
  become context-aware and deep-link to `/launch?seed=<idea>`.

**Use for:** landing page Game Boy showcase ONLY. Do not use the demo
component anywhere else; it's the star of the show.

### 17. Vibe Mood Tabs
Seen in: `components/discover/projects-tab.tsx`
- Primary filter row labeled `▸ PICK A VIBE` above Category pills
- 7 moods: 🔥 HOT / ✨ LATEST / 💊 DOPAMINE / 🧠 BRAIN HACK / 😵 UNHINGED /
  ⛏️ GRIND / 📤 SEND THIS
- HOT sorts by score, LATEST sorts by createdAt, the 5 personality moods
  derive deterministically from a hash on `project.id` (no schema change)
- Active state: neon-purple gradient + 3px white border + 0 0 16px glow
- Inactive state: dark (`rgba(0,0,0,0.5)`) with muted violet border
- Horizontal scroll on mobile, with `mask-image` linear-gradient fading
  the edges so users can see the row is truncated
- `role="tablist"` + `role="tab"` + `aria-selected`, 40px min touch target

**Use for:** /discover primary content filter. Mood replaces traditional
functional category as the first-layer taxonomy.

### 18. Vibe Template Chips
Seen in: `app/launch/page.tsx` above URL Quick Start
- 5 templates: 🎮 GAME IDEA / 🤖 AI TOOL / 🎨 VISUAL TOY / 📊 DASHBOARD /
  📤 SHARE MEME
- Only visible when form is empty and unsubmitted (`filledFieldCount === 0`)
- Click prefills title + 2-3 sentence description scaffolding + category +
  tags, all in one setState wave (autosave picks it up for free)
- Grid: 2 col mobile, 3 col tablet, 5 col desktop, 80px min height
- Dark card with violet border, 22px emoji + 10px pixel label
- Neon-yellow eyebrow: `START FROM A VIBE`

**Use for:** /launch page onboarding. Replaces the "blank form" problem
with one-click starting points so users never stare at an empty textarea.

### 19. PWA Install Prompt
Component: `<PwaInstallPrompt />` (lazy-loaded in `app/layout.tsx`)
- Listens for `beforeinstallprompt`, defers event, fires 2.5s after 3rd
  visit (visit count in localStorage)
- Skips entirely if `display-mode: standalone` (already installed)
- 7-day cooldown after dismissal (timestamp in localStorage)
- Listens for `appinstalled` to auto-hide
- Bottom-right fixed card, purple cartridge style, above mobile bottom nav
  via `safe-area-inset-bottom + 80px`
- 36×36 smartphone icon on gradient square, INSTALL (filled) / NOT NOW
  (outline) buttons
- Copy: "LOAD VIBEX ONTO DEVICE" + "One tap to launch. No browser. Pure
  arcade." (product voice, not generic Chrome copy)
- `role="dialog"` + `aria-labelledby/describedby` + focus-visible ring
- Spring entrance animation (stiffness 320, damping 26)

**Use for:** layout.tsx only — lazy-loaded, runs once per eligible visitor.

### 20. GBA Handheld Shell
Component: `<GameBoyFrame cta={<LaunchButton />}>{children}</GameBoyFrame>`
Upgraded from horizontal DMG to GBA-style layout:

- 4-stop gray gradient shell (`#CDCED8 → #B0B1BB → #8E8F9A → #70717C`)
  with 3px pixel borders and 4px black offset shadow
- **L/R shoulder buttons** stick out the top edges — dark gradient
  rectangles with inset highlights, labeled L and R
- **D-pad** (left), screen (center), A/B buttons (right) in horizontal row
- **A/B are on the same baseline now** (no tilt, no marginTop offset)
- **SELECT/START pills** live directly below the screen, centered —
  GBA convention, not under the D-pad
- **LAUNCH CTA** is passed via `cta` prop and renders centered below
  SELECT/START, PSP HOME button style — the primary action anchor
- Screen aspect `16 / 10`, 16px scanline overlay, vignette, purple halo
- Branding: `VIBEX-BOY ADVANCE · TFT LCD · POWER` (updated from DMG era)
- 4 decorative rivet screws at corners (hidden on <sm)
- All decorative elements (D-pad, A/B, speaker, branding strips, L/R)
  marked `aria-hidden="true"`; only children + CTA are accessible

**Use for:** landing page showcase ONLY. Overuse kills the identity.

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

### Anti-Rules (MUST FOLLOW)

**Never combine `blur(>20px)` + continuous rotation/transform on the same
element.** GPU re-blurs every frame, causing frame drops on mid-range laptops.
Symptom observed on landing hero v2 (2026-04-13): conic-gradient backdrop with
`blur(50px)` + `animate: rotate(360deg)` infinite. Fix: make the blurred element
static, animate a different element, or use a lower blur value.

**Budget: ≤ 8 continuous animations per viewport at any time.** Entrance
animations (one-shot) don't count toward the budget. Scanline overlays and
static decorative layers don't count. But any `repeat: Infinity` does.
Observed: landing v2 had 14 concurrent animations and felt laggy. v3 dropped
to ~7 and felt smooth.

**Never animate `box-shadow` continuously.** Box-shadow animation triggers a
repaint of the element and its container. Use opacity on a separate glow
element instead.

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
