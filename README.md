# VibeX -- AI Agent Marketplace & Creator Platform

[English](#what-is-vibex) | [中文](#vibex-是什么)

> 16-bit RPG pixel-art platform for AI agents, projects, and creators.
> Discover, battle, evolve, and deploy AI-native creations.

## What is VibeX?

VibeX is an AI-native platform where creators publish AI projects, build and run AI agents, collect pixel buddy pets, and compete on leaderboards. Think ProductHunt meets Pokemon, powered by Claude API.

## Core Systems

### AI Agent Marketplace
- Browse, run, and fork AI agents
- Visual Agent Builder (select model, tools, prompts)
- Multi-agent Workflow orchestration (pipeline editor)
- 8 built-in tools (web search, code analysis, translation, etc.)
- Streaming execution logs with real-time step display

### RPG Gamification
- 5 Hero Classes: Architect, Artisan, Enchanter, Alchemist, Sentinel
- 6-attribute battle system with critical hits and EXP rewards
- 4-stage evolution: Spark -> Flame -> Inferno -> Phoenix
- Skill trees, HUD bars, attribute radar charts

### Buddy Pet System (PixPet-style)
- 5 pixel art buddies with 3 evolution stages each (15 total forms)
- Gacha summoning with upvote/level-weighted odds
- PixPet-style floating companion with stats panel
- 20 EXP-earning actions (publish +100, battle +25, comment +5, etc.)
- RPG leveling system with 9 rank titles

### Social Feed
- Twitter/Xiaohongshu-style timeline with real-time updates
- Post, like, reply, repost with optimistic UI
- 3 tabs: Following, Trending, Latest
- Content truncation, skeleton loading, per-tab empty states

### 7 AI-Powered Features (Claude API)
- AI Project Review (5-dimension scoring)
- AI Idea Evaluation (viability, market fit, competition)
- AI Battle Narrative (RPG-style combat commentary)
- AI Launch Assistant (streaming feedback)
- AI Share Summary (Twitter/Xiaohongshu/Douyin optimized)
- AI Trend Analysis (momentum + signal detection)
- AI Battle Narrative Streaming

### Developer Platform
- 23 API endpoints documented with request/response examples
- Webhook system with HMAC-SHA256 signatures + auto-retry
- API key management with usage tracking
- SDK examples (TypeScript, Python, cURL)
- Rate limit tiers (Free/Pro/Enterprise)

## Pages (29)

| Category | Pages |
|----------|-------|
| Core | Home, Explore, Hunt, Arena, Feed |
| AI | Agents, Agent Builder, Workflows, Analytics |
| Social | Ideas, Creators, Events, Insights |
| User | Login, Profile, Settings, Buddy Lab |
| Platform | Launch, Developers |
| Legal | About, Terms, Privacy |
| Detail | Project/[id], Agent/[id], Workflow/[id] |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict) |
| UI | React 19 + Tailwind CSS 4 + Framer Motion |
| Design | NES.css + RPGUI (16-bit pixel aesthetic) |
| Database | Supabase (PostgreSQL, 24 tables) |
| Auth | Supabase Auth (GitHub/Google/Email) |
| AI | Claude API (Haiku 4.5) |
| Realtime | Supabase Realtime (leaderboards, chat, feed) |
| Testing | Vitest (17 unit) + Playwright (37 E2E) |
| CI/CD | GitHub Actions + Vercel |
| PWA | manifest.json + theme color |

## Getting Started

```bash
npm install
cp .env.local.example .env.local
# Add: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ANTHROPIC_API_KEY
npm run dev
```

### Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm test             # Unit tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)
npm run test:e2e:ui  # E2E with visual UI
```

## Stats

| Metric | Count |
|--------|-------|
| Pages | 29 |
| API Endpoints | 23 |
| Database Tables | 24 |
| Unit Tests | 17 |
| E2E Tests | 37 |
| Components | 85+ |
| i18n Keys | 780+ (EN/ZH/JA) |
| Buddy Forms | 15 (5 x 3 evolutions) |
| Agent Tools | 8 built-in |
| Git Commits | 42 |

## Architecture

```
app/
  |- page.tsx            # Homepage (boot sequence + 8 sections)
  |- feed/               # Social timeline (realtime)
  |- explore/            # Project browser
  |- agents/             # Agent marketplace + builder
  |- workflows/          # Multi-agent pipelines
  |- arena/              # Battle simulator
  |- buddy/              # Pet collection + summon
  |- analytics/          # Usage dashboard
  |- developers/         # API docs + webhooks
  |- hunt/               # Live leaderboard
  +- api/
      |- feed/           # Post CRUD + likes
      |- ai/             # 7 AI endpoints
      |- agents/         # Run + stream
      |- workflows/      # Execute pipelines
      |- webhooks/       # CRUD + test + delivery
      |- comments/       # Threaded comments
      |- follows/        # Social graph
      +- notifications/  # Push system
lib/
  |- agent-engine.ts     # Agent execution runtime
  |- workflow-engine.ts  # Multi-agent pipeline
  |- buddy-system.ts     # Pet + EXP + gacha + evolution
  |- battle-engine.ts    # RPG combat simulation
  |- ai.ts               # Claude API integration
  |- feed.ts             # Realtime feed hook
  |- chat.ts             # Realtime chat hook
  |- realtime.ts         # Supabase subscription hooks
  |- leaderboard.ts      # Live rankings
  |- webhook-engine.ts   # HMAC delivery + retry
  +- db.ts               # Data access (Supabase + mock fallback)
```

## License

Source Available License. See [LICENSE](./LICENSE).
Free for personal and educational use. Commercial use requires permission.

---

Built by [Orallexa](https://github.com/alex-jb) with vibe coding energy.

---

# VibeX 是什么？

> 16-bit RPG 像素风 AI Agent 市场和创作者平台。发现、战斗、进化、部署 AI 原生创作。

VibeX 是一个 AI 原生平台，创作者可以发布 AI 项目、构建和运行 AI Agent、收集像素宠物伙伴、在排行榜上竞争。ProductHunt + Pokemon，由 Claude API 驱动。

## 核心系统

### AI Agent 市场
- 浏览、运行、复刻 AI Agent
- 可视化 Agent Builder（选择模型、工具、提示词）
- 多 Agent 工作流编排（管道编辑器）
- 8 个内置工具（网页搜索、代码分析、翻译等）
- 流式执行日志，实时显示步骤

### RPG 游戏化
- 5 种英雄职业：建筑师、工匠、附魔师、炼金师、哨兵
- 6 属性战斗系统（暴击 + 经验奖励）
- 4 阶段进化：火花 -> 火焰 -> 地狱火 -> 凤凰
- 技能树、HUD 条、属性雷达图

### Buddy 宠物系统（PixPet 风格）
- 5 种像素精灵宠物 x 3 阶进化 = 15 种形态
- 抽卡召唤（点赞/等级加权概率）
- PixPet 风格浮动伴侣（属性面板 + 功能按钮）
- 20 种经验获取行为（发布 +100、战斗 +25、评论 +5 等）

### 社交动态
- Twitter/小红书风格时间线（实时更新）
- 发布、点赞、回复、转发（乐观 UI）
- 3 个标签页：关注/热门/最新

### 7 个 AI 功能（Claude API）
- AI 项目评审、创意评估、战斗解说
- AI 发布助手（流式反馈）、分享文案生成
- AI 趋势分析、战斗叙事流式化

### 开发者平台
- 23 个 API 端点（完整文档）
- Webhook 系统（HMAC-SHA256 签名 + 自动重试）
- API Key 管理 + SDK 示例

## 数据统计

| 指标 | 数量 |
|------|------|
| 页面 | 29 |
| API 端点 | 23 |
| 数据库表 | 24 |
| 单元测试 | 17 |
| E2E 测试 | 37 |
| 组件 | 85+ |
| 翻译 Key | 780+ (英/中/日) |
| Buddy 形态 | 15 |
| Agent 工具 | 8 |

## 快速开始

```bash
npm install
cp .env.local.example .env.local
# 填入: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ANTHROPIC_API_KEY
npm run dev
```

## 许可证

Source Available 许可证。个人和教育用途免费。商业使用需获得许可。

---

由 [Orallexa](https://github.com/alex-jb) 以 vibe coding 能量打造。
