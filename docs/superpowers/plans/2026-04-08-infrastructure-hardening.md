# Infrastructure Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add RBAC roles, tighten DB schema, integrate Sentry error monitoring, add client-side analytics, and verify CI E2E pipeline.

**Architecture:** 4-tier role system (user/creator/moderator/admin) enforced at DB level via RLS and at API level via `requireRole()`. Sentry for error monitoring. First-party analytics via `project_events` table.

**Tech Stack:** Supabase (PostgreSQL + RLS), Zod, @sentry/nextjs, Playwright, Next.js 16

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `supabase/migrations/026_user_roles.sql` | Role enum + column |
| Create | `supabase/migrations/027_rbac_policies.sql` | Tightened RLS policies |
| Create | `lib/rbac.ts` | `requireRole()`, `getUserRole()`, role constants |
| Modify | `lib/auth.tsx` | Add `role` to context, fetch from DB |
| Create | `lib/zod-schemas.ts` | Shared Zod schemas for API validation |
| Modify | `lib/api-response.ts` | Add `apiUnauthorized()` helper |
| Create | `lib/analytics.ts` | Client-side `track()` function |
| Create | `app/api/events/route.ts` | Analytics event ingestion endpoint |
| Modify | `lib/logger.ts` | Sentry integration for prod |
| Modify | `app/error.tsx` | Report to Sentry |
| Create | `sentry.client.config.ts` | Sentry client init |
| Create | `sentry.server.config.ts` | Sentry server init |
| Modify | `next.config.ts` | Wrap with `withSentryConfig` |
| Modify | `playwright.config.ts` | Use `npm run build && npm run start` for CI |
| Create | `types/database.ts` | Role types, table types |
| Create | `__tests__/rbac.test.ts` | RBAC unit tests |
| Create | `__tests__/analytics.test.ts` | Analytics unit tests |
| Create | `__tests__/api-response.test.ts` | API response tests |

---

## Task 1: Role Types & Constants

**Files:**
- Create: `types/database.ts`

- [ ] **Step 1: Create role types**

```ts
// types/database.ts
export const USER_ROLES = ["user", "creator", "moderator", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Role hierarchy — higher index = more permissions */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  creator: 1,
  moderator: 2,
  admin: 3,
};
```

- [ ] **Step 2: Commit**

```bash
git add types/database.ts
git commit -m "feat: add UserRole types and hierarchy constants"
```

---

## Task 2: Database Migration — Role Column

**Files:**
- Create: `supabase/migrations/026_user_roles.sql`

- [ ] **Step 1: Write migration**

```sql
-- 026_user_roles.sql
-- Add role system to creators table

-- Create enum type
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'creator', 'moderator', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add role column with default
ALTER TABLE creators
  ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'user';

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_creators_role ON creators (role);

-- Grant first user admin (bootstrap)
-- UPDATE creators SET role = 'admin' WHERE id = (SELECT id FROM creators ORDER BY created_at ASC LIMIT 1);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/026_user_roles.sql
git commit -m "feat: migration 026 — add user_role enum and role column to creators"
```

---

## Task 3: Database Migration — RBAC Policies

**Files:**
- Create: `supabase/migrations/027_rbac_policies.sql`

- [ ] **Step 1: Write RBAC policies**

```sql
-- 027_rbac_policies.sql
-- Tighten RLS policies for moderator/admin actions

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role FROM creators WHERE auth_user_id = auth.uid()),
    'user'::user_role
  );
$$;

-- post_reports: only moderators+ can view/update
DROP POLICY IF EXISTS "Anyone can view reports" ON post_reports;
CREATE POLICY "Moderators can view reports"
  ON post_reports FOR SELECT
  USING (current_user_role() >= 'moderator'::user_role);

CREATE POLICY "Moderators can update reports"
  ON post_reports FOR UPDATE
  USING (current_user_role() >= 'moderator'::user_role);

-- Users can still INSERT reports
CREATE POLICY "Authenticated users can create reports"
  ON post_reports FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- user_bans: only moderators+ can insert/update
DROP POLICY IF EXISTS "Anyone can view bans" ON user_bans;
CREATE POLICY "Moderators can manage bans"
  ON user_bans FOR ALL
  USING (current_user_role() >= 'moderator'::user_role);

-- creators.role: only admins can update roles
CREATE POLICY "Only admins can update roles"
  ON creators FOR UPDATE
  USING (
    CASE
      WHEN current_user_role() = 'admin'::user_role THEN true
      WHEN auth.uid() = auth_user_id AND NEW.role IS NOT DISTINCT FROM OLD.role THEN true
      ELSE false
    END
  );

-- posts: only creators+ can insert
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON posts;
CREATE POLICY "Creators can insert posts"
  ON posts FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND current_user_role() >= 'creator'::user_role
  );
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/027_rbac_policies.sql
git commit -m "feat: migration 027 — RBAC policies for moderator/admin actions"
```

---

## Task 4: Server-Side RBAC Helper

**Files:**
- Create: `lib/rbac.ts`
- Create: `__tests__/rbac.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// __tests__/rbac.test.ts
import { describe, it, expect } from "vitest";
import { hasRole, ROLE_HIERARCHY } from "@/lib/rbac";

describe("hasRole", () => {
  it("admin has all roles", () => {
    expect(hasRole("admin", "user")).toBe(true);
    expect(hasRole("admin", "creator")).toBe(true);
    expect(hasRole("admin", "moderator")).toBe(true);
    expect(hasRole("admin", "admin")).toBe(true);
  });

  it("user cannot access creator actions", () => {
    expect(hasRole("user", "creator")).toBe(false);
  });

  it("moderator can access creator actions", () => {
    expect(hasRole("moderator", "creator")).toBe(true);
  });

  it("creator cannot access moderator actions", () => {
    expect(hasRole("creator", "moderator")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run __tests__/rbac.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/rbac'`

- [ ] **Step 3: Implement rbac.ts**

```ts
// lib/rbac.ts
import { supabase } from "./supabase";
import { type UserRole, ROLE_HIERARCHY } from "@/types/database";

export { ROLE_HIERARCHY };

/** Check if userRole meets or exceeds requiredRole */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/** Fetch the current user's role from the creators table */
export async function getUserRole(userId: string): Promise<UserRole> {
  const { data } = await supabase
    .from("creators")
    .select("role")
    .eq("auth_user_id", userId)
    .single();
  return (data?.role as UserRole) ?? "user";
}

/** Guard for API routes — throws Response if insufficient role */
export async function requireRole(userId: string | null, role: UserRole): Promise<void> {
  if (!userId) {
    throw new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const userRole = await getUserRole(userId);
  if (!hasRole(userRole, role)) {
    throw new Response(JSON.stringify({ ok: false, error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run __tests__/rbac.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/rbac.ts __tests__/rbac.test.ts
git commit -m "feat: add RBAC helper — hasRole, getUserRole, requireRole"
```

---

## Task 5: Extend Auth Context with Role

**Files:**
- Modify: `lib/auth.tsx`

- [ ] **Step 1: Add role to AuthContext**

In `lib/auth.tsx`, add `role` to the context type and state:

```ts
// Add import at top
import { type UserRole } from "@/types/database";
import { getUserRole } from "@/lib/rbac";

// Add to AuthContextType interface (after loading: boolean):
role: UserRole;

// Add to context default:
role: "user" as UserRole,

// Add state in AuthProvider:
const [role, setRole] = useState<UserRole>("user");

// After user is set (in useEffect, after setUser), fetch role:
// Inside the getSession .then callback, after setUser(session?.user ?? null):
if (session?.user) {
  getUserRole(session.user.id).then(setRole);
}

// For demo user, set role to admin:
// In the demo session check block:
setRole("admin");

// Add role to Provider value:
role,
```

- [ ] **Step 2: Update DEMO_USER metadata**

Add to `DEMO_USER.user_metadata`:

```ts
role: "admin" as const,
```

- [ ] **Step 3: Commit**

```bash
git add lib/auth.tsx
git commit -m "feat: expose user role in AuthContext"
```

---

## Task 6: API Response — Add Unauthorized Helper

**Files:**
- Modify: `lib/api-response.ts`
- Create: `__tests__/api-response.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// __tests__/api-response.test.ts
import { describe, it, expect } from "vitest";

// We test the response shape, not NextResponse internals
describe("api-response helpers", () => {
  it("apiSuccess returns ok: true shape", async () => {
    const { apiSuccess } = await import("@/lib/api-response");
    const res = apiSuccess({ id: 1 });
    const body = await res.json();
    expect(body).toEqual({ success: true, data: { id: 1 } });
    expect(res.status).toBe(200);
  });

  it("apiUnauthorized returns 401", async () => {
    const { apiUnauthorized } = await import("@/lib/api-response");
    const res = apiUnauthorized();
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(res.status).toBe(401);
  });

  it("apiForbidden returns 403", async () => {
    const { apiForbidden } = await import("@/lib/api-response");
    const res = apiForbidden();
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(res.status).toBe(403);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run __tests__/api-response.test.ts
```

Expected: FAIL — `apiUnauthorized` is not exported

- [ ] **Step 3: Add helpers to api-response.ts**

Append to `lib/api-response.ts`:

```ts
export function apiUnauthorized(message = "Unauthorized") {
  return apiError(message, 401);
}

export function apiForbidden(message = "Forbidden") {
  return apiError(message, 403);
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run __tests__/api-response.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/api-response.ts __tests__/api-response.test.ts
git commit -m "feat: add apiUnauthorized and apiForbidden helpers"
```

---

## Task 7: Zod Validation Schemas

**Files:**
- Create: `lib/zod-schemas.ts`

- [ ] **Step 1: Install zod**

```bash
npm install zod
```

- [ ] **Step 2: Create shared schemas**

```ts
// lib/zod-schemas.ts
import { z } from "zod";
import { USER_ROLES } from "@/types/database";

export const roleSchema = z.enum(USER_ROLES);

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const trackEventSchema = z.object({
  event: z.string().min(1).max(100),
  properties: z.record(z.unknown()).optional(),
  project_id: z.string().uuid().optional(),
});

export const updateRoleSchema = z.object({
  user_id: z.string().uuid(),
  role: roleSchema,
});
```

- [ ] **Step 3: Commit**

```bash
git add lib/zod-schemas.ts package.json package-lock.json
git commit -m "feat: add Zod validation schemas for API routes"
```

---

## Task 8: Analytics — Track Function & API Route

**Files:**
- Create: `lib/analytics.ts`
- Create: `app/api/events/route.ts`
- Create: `__tests__/analytics.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// __tests__/analytics.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("track()", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  });

  it("sends event to /api/events", async () => {
    const { track } = await import("@/lib/analytics");
    await track("page_view", { path: "/feed" });

    expect(fetch).toHaveBeenCalledWith("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "page_view", properties: { path: "/feed" } }),
    });
  });

  it("does not throw on fetch failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const { track } = await import("@/lib/analytics");
    await expect(track("page_view")).resolves.toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run __tests__/analytics.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/analytics'`

- [ ] **Step 3: Implement analytics.ts**

```ts
// lib/analytics.ts

/** Fire-and-forget client-side event tracking */
export async function track(
  event: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, properties }),
    });
  } catch {
    // Silent fail — analytics should never break the app
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run __tests__/analytics.test.ts
```

Expected: PASS

- [ ] **Step 5: Create API route**

```ts
// app/api/events/route.ts
import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { apiSuccess, apiError } from "@/lib/api-response";
import { trackEventSchema } from "@/lib/zod-schemas";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = trackEventSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("Invalid event data", 400);
  }

  const { event, properties, project_id } = parsed.data;

  await supabase.from("project_events").insert({
    event_type: event,
    project_id: project_id ?? null,
    metadata: properties ?? {},
  });

  return apiSuccess({ tracked: true });
}
```

- [ ] **Step 6: Commit**

```bash
git add lib/analytics.ts app/api/events/route.ts __tests__/analytics.test.ts
git commit -m "feat: add client-side analytics track() + /api/events endpoint"
```

---

## Task 9: Sentry Error Monitoring

**Files:**
- Create: `sentry.client.config.ts`
- Create: `sentry.server.config.ts`
- Modify: `next.config.ts`
- Modify: `lib/logger.ts`
- Modify: `app/error.tsx`

- [ ] **Step 1: Install Sentry**

```bash
npx @sentry/wizard@latest -i nextjs --org your-org --project vibex
```

If the wizard doesn't work (no interactive terminal), install manually:

```bash
npm install @sentry/nextjs
```

- [ ] **Step 2: Create sentry.client.config.ts**

```ts
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
  enabled: process.env.NODE_ENV === "production",
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
});
```

- [ ] **Step 3: Create sentry.server.config.ts**

```ts
// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
  enabled: process.env.NODE_ENV === "production",
  tracesSampleRate: 0.1,
});
```

- [ ] **Step 4: Wrap next.config.ts with Sentry**

Read existing `next.config.ts` and wrap the export:

```ts
// At top of next.config.ts:
import { withSentryConfig } from "@sentry/nextjs";

// At bottom, change:
// export default nextConfig;
// To:
export default withSentryConfig(nextConfig, {
  silent: true,
  hideSourceMaps: true,
});
```

- [ ] **Step 5: Update lib/logger.ts**

```ts
// lib/logger.ts
import * as Sentry from "@sentry/nextjs";

const isDev = process.env.NODE_ENV !== "production";

export const serverLog = {
  error(errorId: string, message: string, error: unknown): void {
    if (isDev) {
      console.error(`[${errorId}] ${message}:`, error);
    } else {
      console.error(`[${errorId}] ${message}`);
      Sentry.captureException(error, {
        tags: { errorId },
        extra: { message },
      });
    }
  },
} as const;
```

- [ ] **Step 6: Update app/error.tsx**

Add Sentry reporting at the top of the component:

```ts
"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    // ... existing JSX unchanged
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add sentry.client.config.ts sentry.server.config.ts next.config.ts lib/logger.ts app/error.tsx package.json package-lock.json
git commit -m "feat: integrate Sentry error monitoring"
```

---

## Task 10: Update Playwright Config for CI

**Files:**
- Modify: `playwright.config.ts`

- [ ] **Step 1: Update webServer for CI**

```ts
// playwright.config.ts
import { defineConfig } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: isCI ? 2 : 1,
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    screenshot: "only-on-failure",
    trace: isCI ? "on-first-retry" : "off",
  },
  webServer: {
    command: isCI ? "npm run build && npm run start" : "npm run dev",
    port: 3000,
    reuseExistingServer: !isCI,
    timeout: isCI ? 120000 : 60000,
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
  ],
});
```

- [ ] **Step 2: Commit**

```bash
git add playwright.config.ts
git commit -m "fix: playwright uses build+start in CI for faster, prod-like E2E"
```

---

## Task 11: Verify Full Pipeline

- [ ] **Step 1: Run all unit tests**

```bash
npm test
```

Expected: All tests pass (including new rbac, analytics, api-response tests)

- [ ] **Step 2: Run lint + typecheck**

```bash
npm run lint && npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: Build succeeds with Sentry config

- [ ] **Step 4: Run E2E locally**

```bash
npx playwright test
```

Expected: All existing E2E tests still pass

- [ ] **Step 5: Final commit + push**

```bash
git add -A
git commit -m "chore: verify full pipeline — tests, lint, build, E2E"
git push origin master
```
