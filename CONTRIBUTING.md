# Contributing to VibeX

Thanks for your interest in VibeX! We welcome contributions from the community.

## Public vs. Private Split

VibeX uses a **source-available dual-layer model**:

### Public (this repo)
- All UI components (`components/`, `app/`)
- Page routes and layouts
- Public stubs of core business logic (`lib/ai.ts`, `lib/battle-engine.ts`, `lib/buddy-system.ts`, `lib/data-moat.ts`)
- Schema overview (`supabase/migrations/001_schema_overview.sql`)
- Tests, docs, CI/CD config

**You can contribute to all of the above.**

### Private (not in this repo)
- Full Claude AI prompt templates
- Growth intelligence algorithms
- Battle engine combat math
- Gacha/evolution probability systems
- Complete migration history (RLS, triggers, seed data)

These live outside git and are the proprietary core. The public stubs let the app compile and run with simplified/demo behavior.

## Where to Contribute

Great first issues:
- **UI polish** — components, animations, accessibility
- **i18n** — translations (currently EN/ZH, Japanese welcome)
- **Bug fixes** — check the issues tab
- **Documentation** — improve guides, add examples
- **Tests** — expand unit + E2E coverage

Not accepting PRs for:
- Core AI prompt engineering (proprietary)
- Battle/gacha probability tuning (proprietary)
- Database RLS policies (proprietary)

## Development Setup

```bash
git clone https://github.com/alex-jb/vibex.git
cd vibex
npm install
npm run dev
```

The app runs in **mock mode** without any environment variables. No Supabase or Claude API key required for local dev.

## Before You Submit

```bash
npm run lint      # Must pass with 0 errors
npm test          # Must pass (247 tests)
npx tsc --noEmit  # Must pass (0 type errors)
```

## Pull Request Process

1. Fork the repo
2. Create a feature branch (`feat/your-feature` or `fix/your-bug`)
3. Make your changes
4. Ensure all checks pass
5. Write a clear PR description
6. Submit the PR

## Code Style

- TypeScript strict mode
- No `any` types
- React hooks rules apply (no conditional hooks)
- Follow existing patterns in the codebase
- Pixel/RPG aesthetic for UI (see `DESIGN.md`)

## License

By contributing, you agree that your contributions will be licensed under the same Source Available License as the project.

## Questions?

Open a GitHub Discussion or reach out on Twitter/X.

---

Built with vibe coding energy.
