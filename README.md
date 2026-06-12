<p align="right">
  <strong>English</strong> · <a href="./README.zh-CN.md">中文</a>
</p>

<p align="center">
  <a href="https://www.vibexforge.com">
    <img src="docs/screenshots-v3/01-landing.png" width="820" alt="VibeXForge — distribution amplifier for solo AI creators" />
  </a>
</p>

<h1 align="center">VibeXForge</h1>

<p align="center">
  <strong>Distribution amplifier for solo AI creators.</strong><br/>
  <sub>Submit your AI project once. Our agents auto-write 10+ platform-native posts in ~10 seconds — X, Reddit, Hacker News, Dev.to, LinkedIn, Bluesky, Threads, Xiaohongshu (小红书), Jike (即刻), and more. Edit inline, one-click publish, track engagement across all channels from one dashboard.</sub>
</p>

<p align="center">
  <a href="https://www.vibexforge.com/launch"><img src="https://img.shields.io/badge/▶_SUBMIT_PROJECT-Free_during_beta-FF4500?style=for-the-badge" alt="Submit project" /></a>
  <a href="#-quick-start"><img src="https://img.shields.io/badge/⚡_Run_Locally-30_seconds-39FF14?style=for-the-badge" alt="Quick Start" /></a>
  <a href="https://github.com/alex-jb/vibex"><img src="https://img.shields.io/badge/⭐_Star-GitHub-FACC15?style=for-the-badge" alt="Star" /></a>
</p>

<p align="center">
  <a href="https://github.com/alex-jb/vibex"><img src="https://img.shields.io/github/stars/alex-jb/vibex?style=flat-square&logo=github&color=9D00FF" alt="Stars" /></a>
  <a href="https://github.com/alex-jb/vibex/commits"><img src="https://img.shields.io/github/commit-activity/m/alex-jb/vibex?style=flat-square&color=39FF14" alt="Commits" /></a>
  <a href="https://github.com/alex-jb/vibex/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/alex-jb/vibex/ci.yml?branch=master&style=flat-square&logo=githubactions&logoColor=white&label=CI" alt="CI" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/alex-jb/vibex?style=flat-square&color=FACC15" alt="License" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-000?style=flat-square&logo=next.js" alt="Next.js" /></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-Realtime-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" /></a>
  <a href="https://anthropic.com"><img src="https://img.shields.io/badge/Claude-Sonnet_4.6-D97706?style=flat-square" alt="Claude" /></a>
  <a href="./CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-FF4500?style=flat-square" alt="PRs Welcome" /></a>
</p>

---

## The Problem

You vibe-coded an AI app. Building was the easy part.

Then comes distribution. Same product, 10 different platform conventions: X wants ≤ 270 chars, Reddit wants self-aware tone, Hacker News wants technical depth, Xiaohongshu wants emoji-led aesthetic notes, LinkedIn wants narrative, Dev.to wants long-form. Writing all 10 properly is 3-4 hours of context-switching that happens right when you're exhausted from shipping.

Solo founders skip platforms. The best one becomes the only one. Reach collapses.

## The Loop

```
Submit URL  →  Claude writes 10+ platform-native drafts (~10s)
            →  Review inline, edit, approve
            →  1-click open platform with text pre-filled
            →  Mark posted, paste the URL
            →  Cron scrapes engagement every 6h
            →  Dashboard shows which channel converts best
```

**Bilingual by default.** EN and ZH drafts generate from one submit — Western indie hackers + Chinese AI creators (小红书 / 即刻 / 知乎 / B站) reached without rewriting.

**Platform-aware prompts.** Each draft is generated with platform-specific system prompts: hook rules, length constraints, anti-marketing-fluff voice, no repeated numbers, language-output directive. Tuned via dogfood eval on real launches.

**Real engagement tracking.** Public-API scrapers for Reddit / HN / Dev.to / Bluesky / X. Cron writes append-only snapshots so you see the 30-day curve, not just current totals.

---

## Demo

> **Live:** [vibexforge.com](https://www.vibexforge.com) — sign in with GitHub or Google, paste any URL, get 10+ platform-native drafts in ~10 seconds.

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
#   ANTHROPIC_API_KEY        # Claude Sonnet 4.6 for drafts
#   OPENAI_API_KEY           # gpt-image-2 for Xiaohongshu covers
#   BLOB_READ_WRITE_TOKEN    # Vercel Blob for cover storage
#   CRON_SECRET              # Bearer token for cron routes
#   SUPABASE_SERVICE_ROLE_KEY # Cron writes
npm run dev
```

Run the SQL migrations in `.private/migrations/*.sql` through the Supabase Dashboard SQL editor. Full setup in [CONTRIBUTING.md](./CONTRIBUTING.md).

</details>

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 16 (App Router, Turbopack) | RSC + streaming + edge runtime where it helps |
| Language | TypeScript 5 (strict) | Refactor fearlessly |
| UI | React 19 + Tailwind v4 + Framer Motion | Zero-config, fast, smooth |
| DB | Supabase (Postgres + RLS + Realtime) | One stack, one auth, realtime drafts |
| Auth | Supabase Auth (GitHub + Google OAuth + PKCE) | Cookies, not localStorage |
| Drafts | Claude Sonnet 4.6 + prompt caching | Parallel generation, ~10s for 10+ drafts |
| Translation | Claude Sonnet 4.6 (daily batch) | EN ↔ ZH for creator-submitted content |
| Visual | OpenAI gpt-image-2 | On-demand Xiaohongshu cover generation |
| Storage | Vercel Blob | Cover images + demo videos |
| Email | Resend + Vercel Cron | Welcome / drafts-ready / weekly digest / daily summary |
| Engagement | Public scrapers (Reddit, HN, Dev.to, Bluesky, X) | Cron every 6h, append-only history |
| Monitoring | Sentry + HyperDX | Server errors + browser session replay |
| Analytics | OpenPanel | Cookieless product analytics |
| Deploy | Vercel + GitHub Actions | `git push` = prod |

---

## Architecture

```
vibex/
├── app/                                  # Next.js 16 App Router
│   ├── page.tsx                          # Landing — IH-style, 10+ drafts pitch
│   ├── arcade/                           # Original RPG splash (preserved)
│   ├── how-it-works/                     # Marketing landing for inbound traffic
│   ├── dashboard/                        # Creator's projects + drafts pipeline
│   ├── launch/                           # Submit a project → 10+ drafts in ~10s
│   ├── project/[id]/
│   │   ├── drafts/                       # HITL review UI: edit / re-roll / publish
│   │   └── analytics/                    # Per-platform engagement + 30D sparklines
│   ├── ideas/                            # Idea Lab (Claude-scored pre-build)
│   ├── admin/metrics/                    # Launch-day monitoring (drafts + funnel)
│   └── api/
│       ├── projects/[id]/generate-drafts # Triggers parallel Claude calls
│       ├── drafts/[id]/reroll            # Single-draft regen (cost-gated)
│       ├── drafts/[id]/generate-cover    # Xiaohongshu cover via gpt-image-2
│       └── cron/
│           ├── scrape-engagement         # Every 6h: refresh views/likes/comments
│           ├── translate-zh              # Daily: EN → ZH for ideas + projects
│           ├── daily-owner-summary       # Daily: traction email per creator
│           └── weekly-digest             # Weekly: rollup email
├── lib/
│   ├── draft-generator.ts                # Platform prompts + Anthropic client
│   ├── engagement-scrapers.ts            # Reddit/HN/Dev.to/Bluesky/X public APIs
│   ├── visual-generator.ts               # gpt-image-2 + Vercel Blob upload
│   ├── translate-zh.ts                   # Claude bilingual translator
│   ├── i18n.ts                           # ~925 strings + Lang context
│   └── i18n-categories.ts                # Render-time category localization
├── proxy.ts                              # Supabase SSR auth middleware
├── public/llms.txt                       # AI search engine discoverability
└── scripts/dogfood-vibex-launch.ts       # Eval harness for prompt quality
```

---

## Companion Claude Code skills

VibeXForge is the hosted product. These are the open-source Claude Code skills that came out of the same agent stack — they install as `/<command>` in any Claude Code session and work on any machine.

| Skill | Install | What it does |
|---|---|---|
| **[council-diff](https://github.com/alex-jb/council-diff)** | `npm install council-diff` | 5 voices (Garry / Naval / PG / Suster / Cuban) answer a decision in parallel; Fable 5 Oracle adjudicates; Brier-score per voice over 30 days. The disagree-and-resolve shape for product decisions. |
| **[polymarket-brier](https://github.com/alex-jb/polymarket-brier-skill)** | `clawhub install polymarket-brier` | Forecast a Polymarket question with Haiku, persist the prediction, Brier-score after resolution. Per-source calibration table tells you whether the loudest forecaster was actually right. |
| **[solo-founder-os / splunk_obs](https://github.com/alex-jb/solo-founder-os/tree/master/solo_founder_os/splunk_obs)** | `pip install solo-founder-os` | Splunk HEC adapter for cron-scheduled AI agents. Three sourcetypes (reflection / eval drift / bandit regret), 6-panel dashboard.xml ready to import. |

All three are MIT, all three have GitHub Releases, all three Brier-audit their own quality over time. The pattern is the same: build the thing, persist the predictions, score against reality, publish the calibration table.

---

## Roadmap

**Shipped**
- [x] Submit project → Claude writes 10+ platform-native drafts in ~10s
- [x] HITL review UI: inline edit, single-draft re-roll, status filter
- [x] 1-click publish — text auto-copied + intent URL opened per platform
- [x] Engagement tracking — 6h cron scrapes Reddit / HN / Dev.to / Bluesky / X
- [x] Cross-platform analytics with 30-day sparklines + winning-channel call-out
- [x] Bilingual EN ↔ ZH (UI + auto-translated creator content via daily cron)
- [x] Daily Claude cost gate (per-creator quota, atomic Postgres RPC)
- [x] Xiaohongshu cover image generation (gpt-image-2 + Vercel Blob)
- [x] PWA installable (manifest + minimal SW, no HTML cache)
- [x] Email retention loop (welcome + drafts-ready + daily summary + weekly digest)
- [x] /admin/metrics launch-day dashboard

**Roadmap**
- [ ] Stripe Connect payouts (85/15 take rate)
- [ ] Per-platform visual generation v2 (X OG cards, Bilibili thumbnails)
- [ ] Real OAuth auto-publish (X / Reddit / Bluesky API)
- [ ] Multi-account support (creator's personal X + brand X)
- [ ] Push notifications for new engagement milestones

---

## Contributing

PRs welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, branch / commit conventions, and the dev loop.

Found a security issue? See [SECURITY.md](./SECURITY.md) — please don't file a public issue.

## License

Source Available — see [LICENSE](./LICENSE). Free to read, fork, and
self-host. Commercial redistribution requires permission — DM
[@alex-jb](https://github.com/alex-jb).

## Built solo by

[Alex (@alex-jb)](https://github.com/alex-jb) — solo indie AI creator. VibeXForge exists because I shipped my own AI gallery for 6 months and got 5 users; distribution killed me. So I built the tool I wished existed.

If it works for you, [tell me](https://www.vibexforge.com) (DMs open). If it doesn't, tell me louder.
