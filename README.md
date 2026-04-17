<p align="right">
  <strong>English</strong> · <a href="./README.zh-CN.md">中文</a>
</p>

<p align="center">
  <a href="https://www.vibexforge.com">
    <img src="docs/screenshots-v2/01-landing.png" width="820" alt="VibeX — enter the portal" />
  </a>
</p>

<h1 align="center">VibeX</h1>

<p align="center">
  <strong>The launch platform for vibe coding projects.</strong><br/>
  <sub>Product Hunt for the AI-native wave, with Claude-powered launch reviews.</sub>
</p>

<p align="center">
  <a href="https://www.vibexforge.com/launch"><img src="https://img.shields.io/badge/▶_Try_It-Forge_a_Project-8b5cf6?style=for-the-badge" alt="Try It" /></a>
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

## Demo

https://github.com/alex-jb/vibex/releases/download/v0.1.0-demo/vibex-demo.mp4

> **Live:** [vibexforge.com/launch](https://www.vibexforge.com/launch) — sign in with GitHub, paste any URL, get a real Claude review in ~30 seconds.

---

## The Problem

Everyone's vibe coding now. Building is easy. **Getting seen is the bottleneck.**

You ship an AI project, post the link, and hear nothing. The code is fine. The landing page is killing the click-through. Weak headline, too many buzzwords, no clear value in the first 5 seconds.

Solo builders don't have a design team, a copywriter, or a growth advisor. They ship a README and hope.

## The Loop

VibeX is that advisor, powered by Claude.

```
Paste URL → Claude reviews like a stranger → 5-7 concrete fixes → Apply → Score climbs
```

**1. Forge** — Paste your project URL. We scrape the page, parse the pitch, index your README.

**2. Review** — Claude reads it like a first-time visitor and returns 5-7 structured actions. Each has a clear headline, why it matters, and a copy-pasteable suggestion.

**3. Apply** — Click Apply on any action. Come back next week, rerun. Watch the score climb.

The gamification (pixel art cards, evolution stages, realtime leaderboard) makes shipping feel like leveling up instead of shouting into the void.

---

## Screenshots

|  |  |
|---|---|
| ![Landing](docs/screenshots-v2/01-landing.png) | ![HQ](docs/screenshots-v2/02-home.png) |
| **Portal** — every session starts here | **HQ** — your projects + 3D globe + leaderboard |
| ![Project](docs/screenshots-v2/04-project.png) | ![Hunt](docs/screenshots-v2/03-hunt.png) |
| **Project detail** — Claude review + stats | **Hunt** — daily/weekly live rankings |
| ![Ideas](docs/screenshots-v2/05-ideas.png) | ![Creators](docs/screenshots-v2/06-creators.png) |
| **Idea Lab** — AI scores your concept before you build | **Creators** — ranked by what they shipped |

---

## Quick Start

**Runs in 30 seconds. Zero config.** No API keys, no database, no sign-up.

```bash
git clone https://github.com/alex-jb/vibex.git
cd vibex
npm install
npm run dev
```

Open http://localhost:3000. The app runs in **mock mode** with built-in demo data.

<details>
<summary><strong>Want real data? Wire up Supabase + Claude (optional)</strong></summary>

```bash
cp .env.local.example .env.local
# Fill in:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   ANTHROPIC_API_KEY
npm run dev
```

Run the SQL migrations in `supabase/migrations/*.sql` through the Supabase Dashboard SQL editor. Full setup in [CONTRIBUTING.md](./CONTRIBUTING.md).

</details>

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 16 (App Router, Turbopack) | Server Components + streaming |
| Language | TypeScript 5 (strict) | Refactor fearlessly |
| UI | React 19 + Tailwind v4 + Framer Motion | Zero-config, fast, smooth |
| Design | nes-core.css + custom pixel tokens | 16-bit aesthetic, ~50KB CSS |
| DB | Supabase (Postgres + RLS + Realtime) | One stack, one auth, realtime out of the box |
| Auth | Supabase Auth (GitHub + Google OAuth + PKCE) | Cookies, not localStorage |
| AI | Claude Sonnet 4.6 with tool_use | Structured JSON reviews, not prose |
| Visual | [cobe](https://github.com/shuding/cobe) 3D globe | 5KB, zero deps, global community feel |
| Monitoring | Sentry + PostHog | Errors + product analytics |
| Deploy | Vercel + GitHub Actions | `git push` = prod |

---

## Architecture

```
vibex/
├── app/                      # Next.js 16 App Router
│   ├── page.tsx              # Landing (the portal)
│   ├── home/                 # HQ dashboard
│   ├── hunt/                 # Realtime leaderboard
│   ├── launch/               # Forge a project → AI review
│   ├── project/[id]/         # Project detail + review history
│   ├── ideas/                # Idea Lab (pre-build scoring)
│   ├── creators/             # Builder profiles + rankings
│   └── api/                  # 43 REST + streaming endpoints
├── components/
│   ├── rpg/                  # Pixel chrome (cards, evolution badges)
│   ├── cobe-globe.tsx        # Spinning 3D globe
│   └── ideas/                # Idea Lab components
├── lib/
│   ├── ai.ts                 # Claude tool_use wrapper
│   ├── realtime.ts           # Supabase realtime hooks
│   └── i18n.ts               # 708 strings (EN / zh)
├── proxy.ts                  # Supabase SSR auth middleware
├── public/llms.txt           # AI search engine discoverability
└── scripts/                  # QA, perf audit, demo recorder tools
```

---

## Roadmap

**Shipped**
- [x] GitHub + Google OAuth (PKCE, cookie-based)
- [x] Project submission + URL scrape + auto title cleaning
- [x] Claude structured review (5-7 actions per review)
- [x] Apply / Skip / Reject action persistence
- [x] Realtime leaderboard (Supabase `postgres_changes`)
- [x] Pixel-art UI with nes-core + custom retro tokens
- [x] Interactive 3D globe (cobe)
- [x] GEO optimization (llms.txt, AI crawler rules)
- [x] Bilingual UI (EN / zh, 708 strings)
- [x] Automated demo video recorder with TTS narration

**Next**
- [ ] First 10 real users through the feedback loop
- [ ] Weekly re-review reminders
- [ ] Public review feed on creator profiles

**Later**
- [ ] Multi-reviewer (Claude + GPT + Gemini cross-check)
- [ ] Auto-apply low-risk copy changes (with diff preview)
- [ ] Creator-to-creator peer review marketplace

---

## License

Source-available. All UI, pages, API routes, and components are public. Claude prompt templates, scoring tuning, and full migration history are private.

**You can:** fork, study, run locally, contribute to the public parts.
**You can't:** use it commercially without permission. See [LICENSE](./LICENSE).

---

<p align="center">
  <strong>If you're shipping an AI project this week:</strong><br/>
  <a href="https://www.vibexforge.com/launch">Try the live loop on your own URL</a> and tell me which suggestions landed.<br/><br/>
  <a href="https://www.vibexforge.com"><img src="https://img.shields.io/badge/⭐_Star_this_repo-It_takes_1_second-FACC15?style=for-the-badge" alt="Star" /></a>
  <br/><br/>
  Built with vibe coding energy by <a href="https://github.com/alex-jb">Orallexa</a>
</p>
