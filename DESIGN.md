# VibeX Design System

> AI-readable design spec. When generating UI for VibeX, follow this document exactly.
> Format follows the [awesome-design-md](https://github.com/VoltAgent/awesome-design-md) standard.

## Brand Identity

- **Name:** VibeX
- **Tagline:** The launch and growth platform for AI-native creators
- **Aesthetic:** 16-bit RPG terminal / Cyber-industrial pixel art
- **Mood:** Dark, electric, game-native. Like a GBA game crossed with a hacker terminal.

## Color Palette

### Primary Neon Colors
| Name | Hex | CSS Variable | Usage |
|------|-----|-------------|-------|
| Neon Green | `#39FF14` | `--neon-green` | Success, HP bars, terminal prompt, active states |
| Neon Purple | `#9D00FF` | `--neon-purple` | Primary accent, links, creator identity |
| Neon Orange | `#FF4500` | `--neon-orange` | Errors, warnings, live badge, fire reactions |
| Neon Yellow | `#FACC15` | `--neon-yellow` | XP, gold, rankings, highlights, trending |
| Neon Cyan | `#06B6D4` | `--neon-cyan` | Info, secondary accent, analytics |
| Neon Pink | `#EC4899` | `--neon-pink` | Hearts, likes, special effects |

### Background Colors
| Name | Hex | CSS Variable | Usage |
|------|-----|-------------|-------|
| Deep Black | `#0D0D0D` | `--bg-deep` | Page background |
| Panel | `#111114` | `--bg-panel` | Card backgrounds |
| Card | `#161619` | `--bg-card` | Elevated surfaces |
| Dialog | `#1A1A1E` | `--bg-dialog` | Modals, dropdowns |

### Border Colors
| Name | Hex | CSS Variable | Usage |
|------|-----|-------------|-------|
| Metal | `#2A2A30` | `--border-metal` | Standard borders |
| Bolt | `#3A3A42` | `--border-bolt` | Emphasized borders |

### Text Colors
| Usage | Hex |
|-------|-----|
| Primary text | `#E8E8EC` |
| Secondary text | `#888` or `#8888A0` |
| Muted text | `#555` |
| Disabled text | `#444` |

## Typography

### Font Families
| Class | Font | CSS Variable | Usage |
|-------|------|-------------|-------|
| `font-pixel` | Press Start 2P | `--font-pixel` | Headings, badges, stats, labels |
| `font-retro` | VT323 | `--font-retro` | Body text, descriptions, content |

### Font Sizes (pixel font)
| Size | Usage |
|------|-------|
| `14px` | Page titles ("> 动态", "> Arena") |
| `10-12px` | Section headers |
| `8-9px` | Labels, button text |
| `7px` | Badges, tags, timestamps |
| `6px` | Micro labels, level badges |

### Font Sizes (retro font)
| Size | Usage |
|------|-------|
| `18px` | Terminal prompt text |
| `14px` | Body content, post text |
| `12-13px` | Secondary text, descriptions |
| `11px` | Muted descriptions |

## Components

### Terminal Header
Every page starts with a terminal header bar:
```
┌─────────────────────────────────────────────────────┐
│ 🔴 🟡 🟢                        VIBEX://PAGE-NAME │
└─────────────────────────────────────────────────────┘
```
- Background: `#0A0A0C`
- Three colored dots: `#FF4500`, `#FACC15`, `#39FF14` (10x10px)
- Title: `font-pixel`, 8px, `#555`, letter-spacing 2px
- Border-bottom: 2px solid `#2A2A30`

### RPGUI Container
Main content wrapper:
```html
<div class="rpgui-container framed" style="padding: 20px; position: relative; overflow: hidden;">
  <!-- Scanline overlay -->
  <div style="position: absolute; inset: 0; background: repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px); pointer-events: none; z-index: 1;" />
  <!-- Content at z-index: 2 -->
</div>
```

### NES Buttons
```html
<button class="nes-btn">Default</button>
<button class="nes-btn is-primary">Primary (purple)</button>
<button class="nes-btn is-success">Success (green)</button>
<button class="nes-btn is-warning">Warning (yellow)</button>
<button class="nes-btn is-error">Error (red)</button>
```
- Font size: 8-10px
- Padding: `4px 12px` (small) or `8px 20px` (large)

### Retro Card
```html
<div class="retro-card l-corner" style="padding: 16px; margin-bottom: 12px;">
  <div class="l-corner-inner absolute inset-0 pointer-events-none" />
  <!-- Content -->
</div>
```

### Terminal Cursor
```html
<span class="font-retro" style="color: #39FF14; font-size: 18px;">></span>
<span style="display: inline-block; width: 8px; height: 16px; background: #39FF14; animation: blink-cursor 0.8s step-end infinite;" />
```

### LIVE Badge
```html
<span style="width: 6px; height: 6px; border-radius: 50%; background: #FF4500; animation: pulse-live 1.5s ease-in-out infinite;" />
<span class="font-pixel" style="font-size: 7px; color: #FF4500;">LIVE</span>
```

## Layout Patterns

### Page Structure
```
max-w-2xl mx-auto px-4 sm:px-6 py-6  (narrow: feed, profile)
max-w-4xl mx-auto px-4 sm:px-6 py-6  (wide: arena, admin, with sidebar)
```

### Feed with Sidebar
```html
<div style="display: flex; gap: 16px;">
  <div style="flex: 1; min-width: 0;"><!-- Main content --></div>
  <div class="hidden lg:block" style="width: 200px; flex-shrink: 0;">
    <div style="position: sticky; top: 80px;"><!-- Sidebar --></div>
  </div>
</div>
```

## Animation

### Framer Motion Standard
```tsx
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.25 }}
/>
```

### Page Title Entrance
```tsx
<motion.div
  initial={{ opacity: 0, x: -8 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.2 }}
  className="font-pixel"
  style={{ fontSize: 14, color: "#39FF14", textShadow: "0 0 12px #39FF1440" }}
>
  {"> 页面标题"}
</motion.div>
```

### CSS Keyframes
```css
@keyframes blink-cursor { 50% { opacity: 0; } }
@keyframes pulse-live { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.3); } }
@keyframes skeleton-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
```

## Accessibility

- `role="feed"` on post list containers
- `role="article"` on individual posts
- `aria-label` on all interactive buttons with counts
- `aria-live="polite"` on realtime update areas
- Minimum touch target: 44px on mobile
- Focus ring: 2px neon-cyan outline

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|-----------|-------|-------|
| Mobile | < 640px | Single column, full-width buttons, icons only |
| Tablet | 640-1023px | Single column wider, text labels appear |
| Desktop | >= 1024px | Multi-column, sidebars visible, max-width centered |

## Do NOT Use

- Light backgrounds (always dark)
- Rounded corners > 4px (pixel art = sharp edges)
- Gradient text
- Sans-serif fonts for headings (always pixel font)
- Smooth animations > 0.3s (keep it snappy)
- Generic UI frameworks (shadcn is OK for form inputs only)
