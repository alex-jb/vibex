<p align="center">
  <img src="docs/screenshots-v2/01-landing.png" width="820" alt="VibeX — enter the portal" />
</p>

<h1 align="center">VibeX</h1>

<p align="center">
  <strong>Your AI project's launch page, reviewed by Claude in 30 seconds.</strong>
</p>

<p align="center">
  Paste your URL → Claude reads the page like a first-time visitor →<br/>
  Get 5-7 concrete, clickable improvements you can apply with one tap.
</p>

<p align="center">
  <a href="https://www.vibexforge.com/launch"><img src="https://img.shields.io/badge/▶_Try_Live-Forge_a_Project-8b5cf6?style=for-the-badge" alt="Try Live" /></a>
  <a href="#-quick-start"><img src="https://img.shields.io/badge/⚡_Run_Locally-30_seconds-39FF14?style=for-the-badge" alt="Quick Start" /></a>
  <a href="https://github.com/alex-jb/vibex"><img src="https://img.shields.io/badge/⭐_Star-GitHub-FACC15?style=for-the-badge" alt="Star" /></a>
</p>

<p align="center">
  <a href="https://github.com/alex-jb/vibex"><img src="https://img.shields.io/github/stars/alex-jb/vibex?style=flat-square&logo=github&color=9D00FF" alt="Stars" /></a>
  <a href="https://github.com/alex-jb/vibex/commits"><img src="https://img.shields.io/github/commit-activity/m/alex-jb/vibex?style=flat-square&color=39FF14" alt="Commits" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-000?style=flat-square&logo=next.js" alt="Next.js" /></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-Realtime-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" /></a>
  <a href="https://anthropic.com"><img src="https://img.shields.io/badge/Claude-Sonnet_4.6-D97706?style=flat-square" alt="Claude" /></a>
</p>

---

## The Problem

You shipped an AI project. You posted the link. Nothing happened.

Getting traction isn't about the code. It's about the landing page, the headline, the first 5 seconds a stranger spends on your site. Most solo builders ship a README and hope. They don't have a design team, a copywriter, or a growth advisor.

## The Loop

VibeX is that advisor, powered by Claude.

**1. Forge** — Paste your project URL. We scrape the page, parse the pitch, index your README.

**2. Review** — Claude reads it like a first-time visitor and outputs 5-7 specific, actionable improvements — each with a clear headline, why it matters, and a copy-pasteable suggestion.

**3. Apply** — Click Apply on any suggestion. It goes into your project's "improvements" log. Come back next week, rerun. Watch the score climb.

That's the whole product.

The gamification (evolution stages, rarity, pixel art chrome) is there to make the feedback loop feel fun, not like homework.

---

## Demo

**Live:** [vibexforge.com/launch](https://www.vibexforge.com/launch) — sign in with GitHub, paste any URL, get a real Claude review in ~30 seconds.

|  |  |
|---|---|
| ![Landing](docs/screenshots-v2/01-landing.png) | ![HQ](docs/screenshots-v2/02-home.png) |
| **Portal** — every session starts here | **HQ** — your projects + today's leaderboard |
| ![Project](docs/screenshots-v2/04-project.png) | ![Hunt](docs/screenshots-v2/03-hunt.png) |
| **Project detail** — review history + stats | **Hunt** — daily/weekly rankings |
| ![Ideas](docs/screenshots-v2/05-ideas.png) | ![Creators](docs/screenshots-v2/06-creators.png) |
| **Idea Lab** — score your concept before you build | **Creators** — the builders behind the projects |

---

## Quick Start

**Runs in 30 seconds with zero config.** No API keys, no database, no sign-up.

```bash
git clone https://github.com/alex-jb/vibex.git
cd vibex
npm install
npm run dev
```

Open http://localhost:3000. The app runs in **mock mode** with built-in demo data, so you can explore every page without wiring up Supabase or Claude.

<details>
<summary><strong>Want the real thing? Wire up Supabase + Claude (optional)</strong></summary>

```bash
cp .env.local.example .env.local
# Fill in:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   ANTHROPIC_API_KEY
npm run dev
```

Then run the SQL migrations in `supabase/migrations/*.sql` through the Supabase Dashboard SQL editor. Full setup guide in [CONTRIBUTING.md](./CONTRIBUTING.md).

</details>

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 16 (App Router, Turbopack) | Server Components + streaming |
| Language | TypeScript 5 (strict) | Refactor fearlessly |
| UI | React 19 + Tailwind v4 + Framer Motion | Zero-config, fast, smooth |
| Design | nes-core.css + local rpgui + custom pixel tokens | 16-bit aesthetic, ~50KB CSS |
| DB | Supabase (Postgres + RLS + Realtime) | One stack, one auth, realtime out of the box |
| Auth | Supabase Auth (GitHub + Google OAuth + PKCE) | Cookies, not localStorage — SSR-friendly |
| AI | Anthropic Claude Sonnet 4.6 with tool_use | Structured JSON reviews, not prose |
| Monitoring | Sentry + PostHog | Errors + product analytics |
| Deploy | Vercel + GitHub Actions | `git push` = prod |

---

## Architecture

```
vibex/
├── app/                      # Next.js 16 App Router
│   ├── page.tsx              # Landing (the portal)
│   ├── home/                 # HQ dashboard (authed)
│   ├── hunt/                 # Realtime leaderboard
│   ├── launch/               # Forge a project → AI review
│   ├── project/[id]/         # Project detail + review history
│   ├── ideas/                # Idea Lab (pre-build scoring)
│   ├── creators/             # Builder profiles + rankings
│   └── api/                  # REST + streaming endpoints
├── components/
│   ├── ui/                   # shadcn-derived primitives
│   ├── rpg/                  # Pixel chrome (cards, evolution badges)
│   ├── demo/                 # Embed/preview helpers
│   └── ideas/                # Idea Lab components
├── lib/
│   ├── ai.ts                 # Claude tool_use wrapper
│   ├── realtime.ts           # Supabase realtime hooks (per-mount useId)
│   ├── use-data.ts           # Data fetchers (mock + real)
│   └── i18n.ts               # Bilingual UI (EN / zh)
├── proxy.ts                  # Next 16 middleware (Supabase SSR auth)
├── supabase/migrations/      # Public schema stubs
└── .private/migrations/      # Real schema + RLS policies (not in repo)
```

**Data flow:** Browser → Next.js proxy (auth) → API route → Supabase + Claude → stream response back.

---

## Roadmap

**Shipped**
- [x] GitHub + Google OAuth (PKCE, cookie-based)
- [x] Project submission + URL scrape + cleanTitle
- [x] Claude-powered structured review (5-7 actions per review)
- [x] Apply / Skip / Reject action persistence
- [x] Real-time leaderboard with `postgres_changes` subscriptions
- [x] Pixel-art UI with nes-core + custom retro tokens
- [x] Bilingual (EN / zh) with 708 strings

**In progress**
- [ ] Drive first 10 real users through the loop
- [ ] Weekly re-review cadence (reminder to come back)
- [ ] Public review feed on creator profiles

**Later**
- [ ] Multi-reviewer (Claude + GPT + Gemini cross-check)
- [ ] Auto-apply for low-risk copy changes (with diff preview)
- [ ] Creator → creator peer review marketplace

---

## License & Source Model

VibeX is **source-available**, not fully open source.

### Public (this repo)
All UI, pages, API routes, components. Public stubs of core logic that compile and run with demo data. Schema overview.

### Private (not in this repo)
- Claude prompt templates and tool schemas
- Scoring + evolution tuning
- Growth intelligence algorithms
- Full migration history with RLS policies

**You can:** fork, study, learn from, run locally, contribute to the public parts.
**You can't:** use it commercially without permission. See [LICENSE](./LICENSE).

---

## Status

Shipped the Launch Feedback Loop on 2026-04-16. First real user submission (an AI trading agent repo) ran through end-to-end: URL scraped → title cleaned → Claude returned 7 actions → actions persisted to Supabase with RLS enforcement.

Now looking for the next 9 users to validate that the feedback is actually useful, not just available.

**If you're shipping an AI project this week:** [try the live loop on your own URL](https://www.vibexforge.com/launch) and send me the actions Claude gave you. I want to know which ones landed and which missed.

---

<p align="center">
  Built with vibe coding energy by <a href="https://github.com/alex-jb">Orallexa</a><br/>
  <a href="https://www.vibexforge.com"><img src="https://img.shields.io/badge/⭐_Star_this_repo-It_takes_1_second-FACC15?style=for-the-badge" alt="Star" /></a>
</p>
