# Infrastructure Hardening Design Spec

**Date:** 2026-04-08
**Status:** Approved

## 1. Auth / RBAC

### Role Hierarchy

| Role | Permissions |
|------|-------------|
| `user` | Browse, upvote, react, comment, DM, buddy |
| `creator` | All above + publish projects, post to feed, build agents |
| `moderator` | All above + flag/hide/remove content, ban users, review reports |
| `admin` | All above + manage roles, view analytics, system settings |

### Implementation

- Add `user_role` enum type and `role` column to `creators` table (default `'user'`)
- Supabase RLS policies check role via joined `creators.role`
- Server-side `requireRole()` helper for API routes — reads role from DB, not JWT
- `useAuth()` hook extended with `role` field for client-side UI gating (display only, not security)
- Demo user gets `admin` role for full UI showcase

## 2. Data Schema & Boundaries

- **Migration 026:** `user_role` enum + `role` column on `creators`
- **Migration 027:** Tighten RLS — moderator/admin policies for `post_reports`, `user_bans`, admin routes
- API routes validate input with Zod, return `{ ok, data, error }` envelope via `lib/api-response.ts`
- Shared `types/database.ts` with role types and table types

## 3. CI + E2E

- CI already has E2E job (depends on build). Verify `npm run test:e2e` script works in CI.
- Use `npm run build && npm run start` in CI instead of `npm run dev` for E2E (faster, closer to prod)
- Upload playwright-report artifact on failure (already configured)

## 4. Error Monitoring

- Integrate `@sentry/nextjs` for automatic error capture
- `app/error.tsx` reports to Sentry before showing UI
- `lib/logger.ts` upgraded: prod sends to Sentry, dev logs to console
- Source maps uploaded during build via `withSentryConfig`

## 5. Analytics Instrumentation

- `lib/analytics.ts` — thin `track(event, properties)` function
- Posts to `/api/events` which inserts into existing `project_events` table
- Key events: page_view, project_click, launch_generated, agent_installed, battle_started, buddy_summoned
- No third-party SDK — first-party only, extensible later
