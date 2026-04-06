# VibeX — AI-Native Launch Platform

> The 16-bit RPG launch platform for AI-native creations. Discover, battle, and evolve AI projects.

## Features

**RPG Gamification System**
- Hero Classes: Architect, Artisan, Enchanter, Alchemist, Sentinel
- 6-attribute battle system with critical hits and EXP rewards
- 4-stage evolution: Spark -> Flame -> Inferno -> Phoenix
- Skill trees, HUD bars, and attribute radar charts

**6 AI-Powered Features** (Claude API)
- AI Project Review: 5-dimension scoring with strengths/weaknesses
- AI Idea Evaluation: viability, market fit, competition analysis
- AI Battle Narrative: dramatic RPG-style combat commentary
- AI Launch Assistant: streaming real-time submission feedback
- AI Share Summary: platform-optimized posts for Twitter/Xiaohongshu/Douyin
- AI Trend Analysis: category momentum and signal detection

**Full Platform**
- 16 pages: Home, Explore, Hunt, Arena, Ideas, Creators, Events, Insights, Launch, Profile, Login
- Bilingual UI: English + Simplified Chinese (680+ translation keys)
- SEO: OpenGraph + Twitter Cards for all pages
- Auth: GitHub OAuth, Google OAuth, Email/Password
- Social: Comments, Follows, Notifications
- Mobile-first responsive design

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19 + Tailwind CSS 4 + Framer Motion |
| Design | NES.css + RPGUI (16-bit pixel aesthetic) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (GitHub/Google/Email) |
| AI | Claude API (Haiku 4.5) |
| Components | shadcn/ui + 13 custom RPG components |

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local
# Fill in your Supabase URL, anon key, and Anthropic API key

# Run development server
npm run dev
```

## Open Source Policy

This project is **source-available** with a semi-open approach:

| Component | Status | Description |
|-----------|--------|-------------|
| Frontend UI | Open | All React components, pages, styles |
| RPG System | Open | Battle engine, stat computation, skill trees |
| i18n System | Open | Translation framework and keys |
| API Routes | Open | Route handlers and request/response shapes |
| AI Logic | Proprietary | Claude prompts, scoring algorithms |
| Data Models | Proprietary | Seed data, mock data content |
| DB Migrations | Partial | Schema open, seed data proprietary |

See `lib/ai.example.ts` for the AI interface you can implement with your own LLM provider.

## Architecture

```
app/
  |- page.tsx          # Homepage with boot sequence
  |- explore/          # Browse all projects
  |- hunt/             # Daily rankings
  |- arena/            # Battle simulator
  |- ideas/            # Idea incubator with AI eval
  |- creators/         # Creator Pokedex
  |- events/           # Community events
  |- insights/         # Trend intelligence
  |- launch/           # Project submission with AI assistant
  |- login/            # Auth (GitHub/Google/Email)
  |- profile/          # User dashboard
  |- project/[id]/     # Project detail
  +- api/
      |- ai/           # 6 AI endpoints
      |- comments/     # Comment CRUD
      |- follows/      # Follow/unfollow
      |- notifications/# Notification system
      |- battles/      # Battle persistence
      +- projects/     # Upvote API
components/
  |- rpg/              # 13 RPG components
  |- ui/               # shadcn/ui components
  +- ...               # Navbar, Footer, PlayableDemo, Comments, etc.
lib/
  |- ai.ts             # AI service layer (proprietary)
  |- auth.tsx           # Auth context + Supabase Auth
  |- db.ts             # Data access layer (Supabase + mock fallback)
  |- i18n.ts           # Bilingual translations (EN/ZH)
  |- battle-engine.ts  # RPG battle simulation
  |- rpg-utils.ts      # Hero stats, classes, evolution
  +- types.ts          # Full TypeScript type definitions
```

## License

Source Available License. See [LICENSE](./LICENSE) for details.
Free for personal and educational use. Commercial use requires permission.

---

Built by [Orallexa](https://github.com/alex-jb) with vibe coding energy.
