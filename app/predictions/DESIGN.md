# DESIGN.md — /predictions

> Page-scoped design spec for `/predictions` only. Inherits from `/DESIGN.md` (VibeXForge root).
> Override the root only where the page's data-honesty contract requires it.
> Format: nexu-io/open-design 9-section schema.

---

## 1. Palette

Inherits VibeXForge root. Per-page emphasis:

| Token | Use here |
|---|---|
| `#0a0a0a` (page bg) | Near-black, matches root `--bg-deep` |
| `text-zinc-200` | Default text |
| `text-zinc-100` | Headings |
| `text-zinc-400` | Lead paragraphs, meta |
| `text-orange-400` | Eyebrow labels (`▸ PREDICTIONS · BRIER-AUDITED`), section accent |
| `text-orange-300` | Inline links |
| Brier tier colors | Green < 0.15 / Yellow 0.15–0.25 / Red > 0.25 |

**Hard rule:** orange is the SINGLE accent on this page. No purple, no green outside Brier-tier signaling, no cyan. The page is a data-honesty surface — every extra color implies "look how complex this is", which contradicts the calibration message.

---

## 2. Typography

Inherits VibeXForge root (Geist sans + Geist Mono).

| Role | Style here |
|---|---|
| Eyebrow | `text-xs uppercase tracking-widest text-orange-400` |
| H1 | `text-3xl sm:text-5xl font-bold leading-tight` |
| Section H2 | `text-2xl font-semibold` |
| Lead | `text-base leading-7 text-zinc-400` |
| Body | `text-sm leading-6 text-zinc-300` |
| Numerical (Brier) | `font-mono tabular-nums` |

Bilingual EN/ZH side-by-side via `<Bilingual>` component — root rule, do not break.

---

## 3. Spacing

- Page container: `max-w-5xl mx-auto px-4 py-12 sm:px-6`.
- Section heading rhythm: `SECTION_HEADING = "mt-12 mb-4 ... first:mt-6"`.
- Card grid: `gap-4` between PredictionCards.
- 6-section vertical stack on desktop:
  1. Hero + methodology blurb
  2. Today's sports picks (NBA, FIFA)
  3. SpaceX daily call
  4. Polymarket contrarian flags
  5. BrierAuditTable (running calibration)
  6. SeriesTracker (multi-day series)

---

## 4. Motion

**Effectively zero.** ISR auto-refresh badge is the only "live" signal. No scroll animations, no card hover lifts, no parallax. The page revalidates every 1800s (30 min) via `export const revalidate = 1800` — the data IS the motion.

Allowed:
- Subtle opacity transition on link hover.
- Focus-visible ring (root inherited).

Forbidden:
- Counter tick-up animations on Brier scores (implies confidence drama — calibration should be sober).
- Pulse on "live" badge.
- Skeleton loaders that imply more dynamism than 30-min ISR delivers.

---

## 5. Voice

**Calibration > confidence.** Honesty in tone, sparse adjectives. Bilingual EN/ZH first-class.

**Do:**
- "Brier 0.18. Top quintile."
- "If I'm worse than coin flip, the table will say so."
- "Polymarket picks flagged only when the ensemble disagrees with the market by 5+ percentage points."
- "Built by a solo founder, no bullshit."

**Don't:**
- "Industry-leading prediction accuracy."
- "Cutting-edge AI ensemble."
- Trending-up arrows next to numbers without verification.
- Em dashes (use period or colon).
- Sales CTAs ("Subscribe for premium picks!").

---

## 6. Anti-patterns

- SaaS dashboard cliches: filter dropdowns, date pickers, "export to CSV", "share insights".
- Fake trending arrows / sparklines that don't correspond to real series data.
- Glow effects on prediction cards (implies certainty the data doesn't support).
- Confetti / celebration animations when a pick hits — Brier doesn't reward gloating.
- Confidence intervals shown as gradients (use mono text + tier color only).
- Premium tier teasers / paywalls.
- "Last updated 3 seconds ago" pseudo-realtime — 30-min ISR is honest, don't fake it.

---

## 7. Aesthetics

**Data-first, methodology-citable.** Bloomberg terminal honesty crossed with academic statistics paper. Big numerical scores. Orange eyebrow labels. Black-grey card surfaces. Brier-tier color is the only saturation on screen.

The page should feel like reading a published forecast verification log, not browsing a betting site.

---

## 8. Components

| Component | Path | Visual contract |
|---|---|---|
| `PredictionCard` | `components/predictions/PredictionCard.tsx` | 3 variants (sports / spacex / polymarket). Mono ticker + market price + our price + delta. Brier-tier color band. |
| `BrierAuditTable` | `components/predictions/BrierAuditTable.tsx` | Tabular calibration log. n, hits, Brier, closing-line delta. Mono numbers. |
| `ContrarianBadge` | `components/predictions/ContrarianBadge.tsx` | Inline pill for "ensemble vs market" disagreement. Threshold: ≥5pp. |
| `SeriesTracker` | `components/predictions/SeriesTracker.tsx` | Multi-day running tally for NBA Finals series, FIFA group stage. |

All numbers are `tabular-nums` mono. All headers use `<Bilingual>` for EN/ZH parity. No card uses drop shadow — use 1px `--border-soft` instead.

---

## 9. References

**Internal:**
- `/DESIGN.md` (VibeXForge root) — parent design system.
- `lib/predictions/sources.ts` — `getPredictionsBundle()` data shape.
- `app/predictions/page.tsx` — section assembly + revalidate cadence.
- `.claude/skills/taste-skill/SKILL.md` — anti-AI-slop guidance.

**External:**
- Predictions feed schema: github.com/alex-jb/predictions-feed
- SpaceX daily brief source: github.com/alex-jb/spacex-ipo-tracker
- Brier scoring origin: Brier 1950, *Monthly Weather Review*.
- Strictly proper scoring rules: Gneiting & Raftery 2007, *JASA*.

---

*Last reviewed: 2026-06-06. Page-scoped — root `/DESIGN.md` wins on conflict.*
