<p align="center">
  <img src="public/og-default.png" width="480" />
</p>

<h1 align="center">⚔️ VibeX</h1>

<p align="center">
  <strong>The launch & growth platform for AI-native creators.</strong><br/>
  <sub>AI 原生创作者的发布与增长平台。</sub>
</p>

<p align="center">
  <a href="https://vibex.app">🌐 Website</a> •
  <a href="#-getting-started">🚀 Getting Started</a> •
  <a href="#-features">✨ Features</a> •
  <a href="#-tech-stack">🛠 Tech Stack</a> •
  <a href="#-contributing">🤝 Contributing</a>
</p>

<p align="center">
  <a href="https://github.com/alex-jb/vibex"><img src="https://img.shields.io/github/stars/alex-jb/vibex?style=flat-square&logo=github&color=9D00FF" alt="Stars" /></a>
  <a href="https://github.com/alex-jb/vibex/commits"><img src="https://img.shields.io/github/commit-activity/m/alex-jb/vibex?style=flat-square&color=39FF14" alt="Commits" /></a>
  <a href="https://github.com/alex-jb/vibex/issues"><img src="https://img.shields.io/github/issues/alex-jb/vibex?style=flat-square&color=FF4500" alt="Issues" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-Source_Available-FACC15?style=flat-square" alt="License" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-000?style=flat-square&logo=next.js" alt="Next.js" /></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-Realtime-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" /></a>
</p>

<p align="center">
  <a href="#what-is-vibex">English</a> | <a href="#vibex-是什么">中文</a> | <a href="#vibex-とは">日本語</a>
</p>

---

## What is VibeX?

> **Launch your AI product. Get feedback, distribution, and growth — in one platform.**

VibeX is where AI creators publish projects, get AI-powered launch packages, track growth metrics, and compete on leaderboards. It's ProductHunt meets Pokemon, wrapped in a 16-bit RPG pixel art aesthetic and powered by Claude API.

**Not just another AI directory.** VibeX is a growth engine. Upload your project → get a complete launch package (positioning, copy, social threads, investor pitch) → distribute → track → optimize → grow.

<p align="right"><a href="#️-vibex">⬆ Back to top</a></p>

---

## ✨ Features

### 🚀 AI Launch Copilot
One-click launch package generation. Upload your project, get everything you need to ship:
- **Positioning** — one-liner, target audience, problem/solution, unique value
- **Copy** — Product Hunt description, elevator pitch, tagline
- **Social** — Twitter/X thread (4-5 tweets), LinkedIn post, Reddit post
- **Distribution** — channel strategy with priority ranking + timing
- **Investor Pitch** — problem, solution, market, traction, ask
- **Competitor Analysis** — differentiation from 2-3 competitors
- **Demo Script** — 30-second video script

### 📊 Project Analytics & Growth
Track your project's performance and get AI-powered growth suggestions:
- Views, clicks, shares, upvotes trend charts (pixel-style)
- Conversion rate tracking
- AI growth advisor — actionable recommendations with effort estimates
- Category benchmarks — how you compare to similar projects

### 🎮 RPG Gamification
Everything is a game. Every action earns XP.
- **50-level Creator System** — Lv.1 见习 → Lv.50 传说 (10 named ranks)
- **Post Reactions** — 🔥 Fire, 🎮 Game, 🎨 Art, 🤯 Mind-blown
- **Arena Battles** — Projects fight with 6-attribute combat, Elo rankings
- **Buddy Pets** — 5 pixel creatures × 3 evolution stages, gacha summoning
- **Season Leaderboards** — compete for top rankings each season

### 🤖 AI Agent Marketplace
Build, share, and run AI agents:
- Visual Agent Builder (model, tools, prompts)
- Multi-agent Workflow orchestration
- 8 built-in tools (web search, code analysis, translation...)
- Star ratings & reviews from the community
- Install tracking + version history

### 📱 Social Feed
Twitter-style engagement loops:
- Post with 🔥🎮🎨🤯 reactions + media attachments (image/GIF)
- @Mentions with autocomplete + notifications
- #Hashtags auto-extraction + trending sidebar
- Algorithmic feed (HN-style engagement scoring)
- Real-time "↑ N条新动态" toast notifications
- Content moderation (report, auto-flag, admin queue)

### 🧠 Growth Intelligence (Data Moat)
Data that gets more valuable over time:
- **Creator Graph** — skills, connections, success rate, growth velocity
- **Product Graph** — success/failure signals across projects
- **Growth Patterns** — 8 verified patterns (timing, copy, channel, strategy)
- **Category Benchmarks** — average D1/D7 views, upvotes, conversion rates

### 💬 Platform Infrastructure
- **DM System** — conversations, messages, read tracking
- **Admin Panel** — moderation queue + analytics dashboard
- **User Bans** — ban/unban with reason + expiry
- **50-level XP** — earn from reactions, posts, battles
- **Onboarding** — 3-step tutorial + 5 starter quests
- **HUD Modes** — simple (新手) / full (专家) view toggle

<p align="right"><a href="#️-vibex">⬆ Back to top</a></p>

---

## 📊 Stats

| Metric | Count |
|--------|-------|
| 📄 Pages | 34 |
| 🔌 API Routes | 40+ |
| 🗄 DB Migrations | 25 |
| ✅ Tests | 75 (unit + E2E) |
| 🧩 Components | 95+ |
| 🌐 i18n Keys | 780+ (EN/ZH/JA) |
| 🤖 AI Functions | 9 (Claude API) |
| 🎮 Buddy Forms | 15 (5 × 3 evolutions) |
| 📝 Commits | 68+ |

<p align="right"><a href="#️-vibex">⬆ Back to top</a></p>

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 (strict) |
| **UI** | React 19 + Tailwind CSS 4 + Framer Motion |
| **Design** | NES.css + RPGUI (16-bit pixel aesthetic) |
| **Database** | Supabase (PostgreSQL, 25 tables, RLS) |
| **Auth** | Supabase Auth + `@supabase/ssr` (cookie sessions) |
| **AI** | Claude API (Sonnet for launch packages, Haiku for analysis) |
| **Realtime** | Supabase Realtime (feed, chat, leaderboards, notifications) |
| **Testing** | Vitest (75 unit) + Playwright (11 E2E) |
| **CI/CD** | GitHub Actions (daily devlog, tests) |

<p align="right"><a href="#️-vibex">⬆ Back to top</a></p>

---

## 🚀 Getting Started

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

> **💡 No Supabase?** The app works in mock mode without a database. All features use built-in demo data.

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm test` | Unit tests (Vitest) |
| `npx playwright test` | E2E tests |

<p align="right"><a href="#️-vibex">⬆ Back to top</a></p>

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────┐
│                  BROWSER                     │
│  Next.js App Router + React 19              │
│  NES.css + RPGUI + Framer Motion            │
├─────────────────────────────────────────────┤
│              API ROUTES                      │
│  /api/feed    /api/ai    /api/agents        │
│  /api/arena   /api/messages  /api/admin     │
├─────────────────────────────────────────────┤
│         SUPABASE (PostgreSQL)                │
│  25 tables + RLS + Realtime + Auth          │
│  RPC functions (toggle_like, toggle_react)  │
├─────────────────────────────────────────────┤
│           CLAUDE API                         │
│  Launch Copilot + Growth Advisor            │
│  Project Review + Idea Eval + Trends        │
└─────────────────────────────────────────────┘
```

<details>
<summary>📁 <strong>Directory Structure</strong></summary>

```
app/
  ├── feed/              # Social timeline (realtime)
  ├── discover/          # Project browser + search
  ├── dojo/              # Learning hub + agent marketplace
  ├── arena/             # Battle simulator + leaderboard
  ├── buddy/             # Pet collection + trade
  ├── launch/            # Launch Copilot (AI package gen)
  ├── insights/          # Trend analysis + growth intel
  ├── messages/          # DM inbox
  ├── admin/             # Moderation + analytics
  ├── creators/          # Creator graph
  ├── developers/        # API docs + developer portal
  ├── about/             # About page
  └── api/
      ├── ai/            # 9 AI endpoints (Claude)
      ├── feed/          # CRUD + reactions + reports
      ├── agents/        # Run + stream + reviews
      ├── arena/         # Leaderboard
      ├── growth/        # Patterns + benchmarks
      └── messages/      # DM system
lib/
  ├── ai.ts              # Claude API (9 functions)
  ├── feed.ts            # Realtime feed hook
  ├── buddy-system.ts    # Pet + EXP + gacha
  ├── battle-engine.ts   # RPG combat
  ├── data-moat.ts       # Creator/Product/Growth graphs
  ├── pricing.ts         # Free/Pro tier definitions
  └── onboarding.ts      # Tutorial + quest system
```
</details>

<p align="right"><a href="#️-vibex">⬆ Back to top</a></p>

---

## 🤝 Contributing

Contributions welcome! Please read the [DESIGN.md](./DESIGN.md) for the design system spec before building UI.

```bash
# Run lint
npx eslint .

# Run tests
npm test

# Build check
npm run build
```

---

## 📄 License

Source Available License. Free for personal and educational use. Commercial use requires permission.

---

<p align="center">
  Built with ⚡ vibe coding energy by <a href="https://github.com/alex-jb">Orallexa</a>
</p>

---

# VibeX 是什么？

> **发布你的 AI 产品。获得反馈、分发策略和增长 — 一站式平台。**

VibeX 是 AI 创作者发布项目、获取 AI 驱动的发布包、追踪增长数据、在排行榜竞争的平台。ProductHunt + Pokemon，16-bit RPG 像素风，由 Claude API 驱动。

**不只是 AI 产品目录。** VibeX 是增长引擎。上传项目 → 一键生成完整发布包（定位、文案、推文、投资人 Pitch）→ 分发 → 追踪 → 优化 → 增长。

### 核心功能

- 🚀 **AI Launch Copilot** — 一键生成发布包（定位/文案/推文/Pitch/竞品分析）
- 📊 **项目数据追踪** — 浏览量/点赞/分享趋势 + AI 增长建议
- 🎮 **RPG 游戏化** — 50 级等级系统、Arena 战斗、Buddy 宠物、赛季排行
- 🤖 **AI Agent 市场** — 构建、分享、运行 Agent + 评分系统
- 📱 **社交动态** — 反应(🔥🎮🎨🤯)/媒体/Mentions/Hashtags/算法推荐
- 🧠 **增长情报** — Creator Graph + Product Graph + 已验证增长模式
- 💬 **私信/管理/封禁** — 完整平台基础设施

### 快速开始

```bash
git clone https://github.com/alex-jb/vibex.git && cd vibex
npm install && cp .env.local.example .env.local && npm run dev
```

> 无需 Supabase，应用自带 mock 数据可直接运行。

---

<p align="center">
  由 <a href="https://github.com/alex-jb">Orallexa</a> 以 ⚡ vibe coding 能量打造
</p>
