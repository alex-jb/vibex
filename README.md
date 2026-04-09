<p align="center">
  <img src="docs/demo.gif" width="720" alt="VibeX Demo" />
</p>

<h1 align="center">VibeX</h1>

<p align="center">
  <strong>Turn your AI project into a viral, evolving collectible.</strong>
</p>

<p align="center">
  <a href="https://www.vibexforge.com">Website</a> &bull;
  <a href="#-how-it-works">How It Works</a> &bull;
  <a href="#-core-features">Features</a> &bull;
  <a href="#-tech-stack">Tech Stack</a> &bull;
  <a href="#-getting-started">Getting Started</a>
</p>

<p align="center">
  <a href="https://github.com/alex-jb/vibex"><img src="https://img.shields.io/github/stars/alex-jb/vibex?style=flat-square&logo=github&color=9D00FF" alt="Stars" /></a>
  <a href="https://github.com/alex-jb/vibex/commits"><img src="https://img.shields.io/github/commit-activity/m/alex-jb/vibex?style=flat-square&color=39FF14" alt="Commits" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-000?style=flat-square&logo=next.js" alt="Next.js" /></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-Realtime-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" /></a>
</p>

---

VibeX is a gamified growth platform for AI creators.  
We transform AI projects into shareable, collectible cards that evolve based on real-world traction.

---

## The Problem

Building AI products has never been easier.  
Getting attention has never been harder.

Creators struggle with:
- No distribution after launch
- Low visibility — projects disappear in 48 hours
- No ongoing growth loop
- Product Hunt is one-shot, not continuous

---

## The Solution

VibeX turns every AI project into a **living, evolving asset**.

### How it works:

**1. Create** — Upload your AI project

**2. Generate** — Instantly turn it into a collectible Hero Card

**3. Evolve** — Your project levels up based on real traction (views, likes, shares)

**4. Share** — Export a viral card with QR code to bring traffic back

---

## Growth Loop

```
Create → Card → Share → Traffic → Level Up → Share again
```

This creates a **built-in distribution engine** for every creator.

---

## Core Features

### AI Project Cards
Generate beautiful, pixel-style collectible cards with HP/MP/EXP bars, rarity badges, skill tags, and QR codes. Three sizes: 3:4 (Xiaohongshu), 1:1 (Instagram), 16:9 (Twitter/X).

### 6-Stage Evolution System
Projects evolve automatically based on real metrics:

| Stage | Rarity | Trigger |
|-------|--------|---------|
| Seed | Common | Just created |
| Active | Uncommon | 50+ plays or 40+ score |
| Growing | Rare | 500+ plays, 50+ upvotes, 1K+ views |
| Breakout | Epic | 1K+ plays, 100+ upvotes, 70+ originality |
| Legend | Legendary | 5K+ plays, 500+ upvotes, 85+ score |
| Myth | Mythic | 10K+ plays, 1K+ upvotes, VC interest |

### Share-to-Grow
Cards are designed for social platforms with built-in QR codes. Download → Post → Scan → Traffic → Level Up.

### Auto Demo Generator
One-click: input URL → Playwright captures frames → animated GIF cover for your project.

### Growth Signals
Track engagement, evolution progress, and unlock higher tiers. Creator Dashboard with trend charts.

### VC Dashboard
Investor intelligence: radar charts, talent graph, deal flow table ranked by AI score.

---

## Why VibeX

| Platform | Limitation |
|----------|-----------|
| Product Hunt | One-time launch |
| GitHub | No discovery |
| X (Twitter) | High noise |
| **VibeX** | **Continuous growth loop** |

---

## Screenshots

| Home | Discover | Project Detail |
|------|----------|----------------|
| ![Home](docs/screenshots/01-home.png) | ![Discover](docs/screenshots/03-discover.png) | ![Project](docs/screenshots/04-project.png) |

| Feed | Arena | VC Dashboard |
|------|-------|-------------|
| ![Feed](docs/screenshots/05-feed.png) | ![Arena](docs/screenshots/07-arena.png) | ![VC](docs/screenshots/08-vc.png) |

---

## Monetization (Planned)

- Card upgrades (Rare / Epic / Legendary visual skins)
- Featured placement on discover page
- Growth insights (AI-powered analytics)
- Premium Agent marketplace

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 (strict) |
| **UI** | React 19 + Tailwind CSS 4 + Framer Motion |
| **Design** | NES.css + RPGUI (16-bit pixel aesthetic) |
| **Database** | Supabase (PostgreSQL, RLS, Realtime) |
| **Auth** | Supabase Auth (GitHub + Google OAuth) |
| **AI** | Claude API (launch packages, reviews, growth) |
| **Monitoring** | Sentry + PostHog |
| **CI/CD** | GitHub Actions + Vercel |

---

## Getting Started

```bash
# Clone
git clone https://github.com/alex-jb/vibex.git
cd vibex

# Install
npm install

# Configure
cp .env.local.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ANTHROPIC_API_KEY

# Run
npm run dev
```

> **No Supabase?** The app works in mock mode without a database. All features use built-in demo data.

---

## Vision

To become the **growth layer for AI creators**,  
where every project is not just launched — but evolves.

---

## Status

Early-stage MVP. Actively building the core growth loop.

---

<p align="center">
  <strong>Create your first evolving project:</strong><br/><br/>
  <a href="https://www.vibexforge.com/">
    <img src="https://img.shields.io/badge/Launch_on_VibeX-vibexforge.com-8b5cf6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgcng9Ijk2IiBmaWxsPSIjOGI1Y2Y2Ii8+PHRleHQgeD0iMjU2IiB5PSIzMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjI4MCIgZmlsbD0id2hpdGUiPlY8L3RleHQ+PC9zdmc+" alt="Launch on VibeX" />
  </a>
</p>

<p align="center">
  Built with vibe coding energy by <a href="https://github.com/alex-jb">Orallexa</a>
</p>
