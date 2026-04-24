<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 🔴 RED-LINE: Build cost discipline

**Every `git push` to master is a ~$0.60 Vercel build charge** (5-6 min × $0.12/min). This billing cycle already cost $131.92 in Build Minutes alone — 99% of the total bill. This rule is escalated from the global `~/.claude/CLAUDE.md` version:

1. **Always `npm run build` locally before `git push`**. No exceptions. If build fails, fix locally — do NOT push and rely on CI. Failed remote builds still cost $0.60 each.
2. **Batch small commits before pushing.** If you're going to make 5 related commits in the next 10 minutes, don't push after each one. Push once at the end.
3. **Docs-only and non-code commits can push freely** — `vercel.json` `ignoreCommand` already skips builds for `*.md`, `docs/**`, `.github/**`, `remotion/**`, `out/**`, `scripts/screenshot-*.mjs`, `scripts/_probe*.mjs`. Anything else triggers a $0.60 build.
4. **If the user explicitly says "just push" or "skip build"**, obey. Otherwise assume this rule is in effect.

Preview deploys are already disabled via `deploymentEnabled.master: true`. Only master triggers builds.

## Preferred skills for VibeX work

This repo is a solo indie project. When an obvious workflow match exists, **invoke the skill rather than re-deriving the steps from first principles.** These are known-good, known-usable in this repo.

### Use proactively (don't wait for the user to ask)

| Situation | Skill | Why |
|---|---|---|
| User describes a new feature idea | `office-hours` (builder mode) → `autoplan` | YC-style question framework before any code; autoplan runs CEO + design + eng + DX review with auto-decisions |
| User has a plan and wants to start coding | `plan-eng-review` then `superpowers:executing-plans` | Lock architecture, then do TDD-style execution |
| UI/visual work | `design-shotgun` → `design-html` → `design-review` (post-deploy) | Variants → code → visual QA |
| Debugging any reported bug | `investigate` — MANDATORY | Forces root-cause over surface patches. The DM nes.css cascade, the unapplied migrations, the submit-write-back miss were all root-cause wins this session |
| Before deploying to prod | `review` then `ship` then `land-and-deploy` → `canary` | PR review → merge → deploy verify → post-deploy monitor |
| Cross-session context / machine switch | `checkpoint` | Alex works on multiple machines; use this before switching |
| Weekly Friday | `retro` | Engineering retrospective; also updates memory |
| Monthly (1st) | `cso` daily mode, or comprehensive once a quarter | Security audit. April 2026 API key exposure incident proves this matters |

### Known landmines in this codebase

- `nes.css` imports must be wrapped in `@layer(base)` or Tailwind utilities break on every semantic HTML5 tag. See `memory/vibex_nes_css_layer.md`.
- Migrations in `.private/migrations/*.sql` are manually applied via Dashboard SQL Editor (no CLI). Run `node scripts/audit-migrations.mjs` against a fresh DB inventory before assuming any migration is live. See `memory/vibex_migration_audit.md`.
- `.private/ai.ts` is gitignored — the public `lib/ai.ts` uses the same implementation now (commit 474f110), calling Claude when `ANTHROPIC_API_KEY` is set in env. Don't re-stub it.
- Supabase client pattern: anon key + RLS. No service-role in app code. For `SECURITY DEFINER` use the RPC pattern (see `increment_play`, `increment_view`, `toggle_upvote`).
- `projects.views`, `projects.plays`, `projects.upvotes` are all traction columns used by `compute_evolution_stage`. Any code incrementing them should do so via the `increment_*` or `toggle_*` RPCs so `SECURITY DEFINER` handles RLS.

### Auto-available via MCP

- `mcp__supabase__*` — query live DB, apply migrations, generate types
- `mcp__chrome-devtools__*` — Lighthouse, perf traces, real-DOM QA
- Vercel MCP is installed but not yet useful without Vercel CLI login; use `vercel env pull` to sync `.env.local` before asking this agent to test anything Claude-related locally

### Do NOT use

- `pair-agent` — this is a solo project
- `freeze` / `careful` / `guard` — only for explicit prod-risk operations
- Hardcoded stubs in code when the real implementation can check `ANTHROPIC_API_KEY` and fall back (see `lib/ai.ts::generateProjectReview` pattern)
