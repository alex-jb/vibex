<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 🔴 RED-LINE: Build cost discipline

**Every `git push` to master that touches non-ignored files triggers a Vercel build of ~50s ≈ $0.10** (measured 2026-05-08 across 4 commits via `vercel API /v6/deployments` `ready - buildingAt`). The 2026-04 cycle hit $131.92 in Build Minutes despite the per-build cost being modest — the bill came from raw push *count* (hundreds of pushes during the gamification + IH-pivot dev sprints), not per-build cost. So the rule is still about discipline, just the math is different from earlier estimates.

1. **Always `npm run build` locally before `git push`**. No exceptions. If build fails, fix locally — do NOT push and rely on CI. Failed remote builds still cost ~$0.10 each AND waste your wall-clock waiting for the red X.
2. **Batch small commits before pushing.** Each push = one ~$0.10 build. 10 pushes/day = $1/day = $30/mo just from your fingers, before any traffic cost. If you're going to make 5 related commits in the next 10 minutes, push once at the end.
3. **Docs-only and non-code commits can push freely** — `vercel.json` `ignoreCommand` skips builds for `*.md`, `docs/**`, `.github/**`, `remotion/**`, `out/**`, `scripts/screenshot-*.mjs`, `scripts/_probe*.mjs`. Anything else triggers a build.
4. **If the user explicitly says "just push" or "skip build"**, obey. Otherwise assume this rule is in effect.

Preview deploys are already disabled via `deploymentEnabled.master: true`. Only master triggers builds. Per-commit Vercel records show TWO entries (one ~50s "build" + one ~25s "alias-promote") — only the build is billed; the promote is free.

**To verify cost in real time** for any session: see `~/Library/Application Support/com.vercel.cli/auth.json` for token, then `curl -H "Authorization: Bearer $TOKEN" "https://api.vercel.com/v6/deployments?projectId=prj_hXAG9m1xJUctjdBSte2tOBy0WVCj&limit=20&teamId=team_QvJ1BiFCrafQsekDLGHHgeFx"` and sum `(ready - buildingAt)` for your commits. Don't trust dashboard estimates without checking.

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

### Design

Taste Skill available at `.claude/skills/taste-skill/` — invoke for visual design decisions (anti-AI-slop guidance for landing pages / hero surfaces / redesigns). See also `DESIGN.md` (root) and `app/predictions/DESIGN.md` (page-scoped).

### AI provider abstraction (scaffold 2026-06-14)

`lib/ai-provider.ts` lets us run AI calls on Claude (default) OR Kimi K2 / DeepSeek V3 / GLM-4 / Qwen via OpenAI-compatible endpoints. Local dev: `AI_PROVIDER=kimi KIMI_API_KEY=... npm run dev`. Currently only `generateProjectReview` is routed through it as a proof point — see `docs/provider-abstraction-2026-06-14.md` for the phase-2 port list.
