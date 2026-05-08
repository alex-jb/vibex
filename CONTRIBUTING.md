# Contributing to VibeXForge

Thanks for your interest. PRs welcome from the community — particularly
on UX polish, i18n coverage, platform-specific draft prompts, and
engagement scrapers.

## Public vs. Private Split

VibeXForge uses a **source-available dual-layer model**:

### Public (this repo)
- All UI components (`components/`, `app/`)
- Page routes and layouts (Next.js 16 App Router)
- The marketing-agent draft generator (`lib/draft-generator.ts`)
- Engagement scrapers for public platform APIs
  (`lib/engagement-scrapers.ts`)
- Visual cover generator (`lib/visual-generator.ts`)
- Bilingual translator (`lib/translate-zh.ts`)
- The 4 Vercel cron routes
- Tests, docs, CI/CD

**You can contribute to all of the above.**

### Private (not in this repo)
- Full SQL migration history including RLS policies, triggers,
  seed data (lives in `.private/migrations/`, gitignored)
- Production-tuned Claude prompts for high-stakes flows beyond the
  draft generator
- Internal scoring + ranking algorithms

The public stubs let the app compile and run end-to-end in mock mode
with simplified/demo behavior.

## Where to Contribute

Great first issues:
- **Draft prompt tuning** — open a PR with a system-prompt diff and
  side-by-side eval output (run `npx tsx scripts/dogfood-vibex-launch.ts`
  to generate a baseline before/after).
- **New platform scraper** — add a scraper for LinkedIn / Threads /
  Product Hunt / Xiaohongshu / Jike / Zhihu / Bilibili in
  `lib/engagement-scrapers.ts` if you can find a public-API path.
- **New platform cover** — extend `lib/visual-generator.ts` beyond
  Xiaohongshu (X OG card, Bilibili thumbnail, Reddit header).
- **i18n** — current EN + 中文. Japanese welcome.
- **Bug fixes** — check the Issues tab.
- **Tests** — expand unit + E2E coverage.

Not accepting PRs for:
- Production-tuned proprietary prompts
- Database RLS / migration policies (must coordinate)
- Anything that breaks the cost-gate or auth model

## Development Setup

```bash
git clone https://github.com/alex-jb/vibex.git
cd vibex
npm install
npm run dev
```

The app runs in **mock mode** without any environment variables.
Supabase and Claude API keys are only needed if you want real data.
See README's optional "Wire up Supabase + Claude" section.

### Run the dogfood eval

```bash
# Requires ANTHROPIC_API_KEY in .env.local
npx tsx scripts/dogfood-vibex-launch.ts
# Writes 21 drafts to out/dogfood-vibex-launch/INDEX.md
```

Useful when tuning prompts — generate before/after comparisons.

## Before You Submit

```bash
npm run lint      # Must pass with 0 errors
npm test          # Must pass (~990 tests)
npx tsc --noEmit  # Must pass (0 type errors)
npm run build     # Must build clean (Vercel red-line: build cost discipline)
```

The local build check is non-negotiable. Failed remote builds cost
~$0.60 each in Vercel build minutes.

## Pull Request Process

1. Fork the repo
2. Create a feature branch (`feat/your-feature` or `fix/your-bug`)
3. Make your changes
4. Ensure all checks pass
5. Write a clear PR description with the **why**, not just the what
6. Link to any related issue
7. Submit the PR

## Commit Style

Follow Conventional Commits:
- `feat(scope): subject`
- `fix(scope): subject`
- `docs(scope): subject`
- `refactor(scope): subject`

Body should explain motivation and tradeoffs. The repo's existing
commit history is the style reference — match it.

## Code Style

- TypeScript strict mode, no `any` types in new code
- React hooks rules apply (no conditional hooks)
- Follow existing patterns in the codebase
- For UI: clean dashboard style on conversion surfaces, RPG/forge
  aesthetic preserved on `/arcade`

## License

By contributing, you agree that your contributions will be licensed
under the project's [Source Available License](./LICENSE).

## Security

Found a security issue? See [SECURITY.md](./SECURITY.md). Please don't
file a public issue.

## Questions?

Open a GitHub Discussion or DM [@alex-jb](https://github.com/alex-jb).
