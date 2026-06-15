# 2026-06-14 — Audit of 3 outstanding VibeX security issues

Triggered by the 6/11 Splunk + Fable 5 mega-session brain note:

> 🔥 OUTSTANDING 未修: vibex 还有 in-memory `Map` rate limit (Vercel 上虚的,15 个 route 受影响),/api/agents/stream 零 auth,admin moderation 走 anon client。分开 session

This doc is documentation only. No code changed, no commits. Alex reviews tomorrow (6/15) after Splunk submission lands.

## Verdicts at a glance

| # | Issue (as filed in brain) | Reality on disk (2026-06-14) | Verdict |
|---|---|---|---|
| 1 | In-memory `Map` rate limit, 15 routes affected | Already migrated to Postgres `check_rate_limit` RPC (mig 036, `lib/rate-limit.ts`). **One** stale Map remains: `app/api/demos/generate/route.ts`. | ⚠️ partially verified — Alex silently fixed 14 of 15 |
| 2 | `/api/agents/stream` zero auth | Already gated by `getAuthUser()` + per-user rate limit (Fable 5 fix landed 6/11). | ❌ couldn't reproduce — already shipped |
| 3 | Admin moderation routes use anon client | Confirmed. `app/api/admin/moderation/route.ts` and `app/api/admin/analytics/route.ts` import the browser-side `supabase` for writes & reads. Most writes silently fail under RLS (no cookies → `auth.uid()` is null). | ✅ verified — real, exploitable |

**One genuine fix needed (Issue 3), one small cleanup (Issue 1 — single route), one already shipped (Issue 2).** Total budget ~5–7 engineer hours.

---

## Issue 1 — In-memory `Map` rate limit

### What the brain claimed

"15 routes affected, virtual on Vercel serverless."

### What's actually there

`lib/rate-limit.ts` (lines 1–50) is **already Postgres-backed**. It calls the `check_rate_limit` SECURITY DEFINER RPC defined in `.private/migrations/036_rate_limit.sql`. The RPC uses a fixed-window `(key, bucket)` row with atomic UPSERT, so two concurrent serverless instances can't both pass the threshold. Fail-open on DB error.

19 API routes import this helper (grep `lib/rate-limit` under `app/api/`):

```
app/api/agents/stream/route.ts:23
app/api/ai/battle-narrative-stream/route.ts:8
app/api/ai/battle-narrative/route.ts:8
app/api/ai/evaluate-idea/route.ts:8
app/api/ai/growth-suggestions/route.ts:8
app/api/ai/launch-assist/route.ts:8
app/api/ai/launch-package/route.ts:9
app/api/ai/review/route.ts:8
app/api/comments/route.ts:105
app/api/feed/[id]/reply/route.ts:15
app/api/feed/route.ts:98
app/api/launch-feedback/apply/route.ts:26
app/api/launch-feedback/generate/route.ts:26
app/api/launch-feedback/reject/route.ts:17
app/api/launch-feedback/skip/route.ts:17
app/api/projects/[id]/play/route.ts:31
app/api/projects/[id]/view/route.ts:30
app/api/webhooks/[id]/route.ts:54
app/api/webhooks/route.ts:81
app/api/webhooks/test/route.ts:16
```

### The one route still on `new Map(...)`

`app/api/demos/generate/route.ts:7-19` still defines a module-level `rateLimitMap` and a local `checkRateLimit(ip)`:

```ts
// app/api/demos/generate/route.ts
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = 2;
const RATE_WINDOW = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW);
  rateLimitMap.set(ip, recent);
  if (recent.length >= RATE_LIMIT) return false;
  recent.push(now);
  return true;
}
```

### Why broken on Vercel

Each Vercel serverless lambda instance gets a fresh module scope on cold start, so the `Map` is per-instance only. A burst across N warm instances can each independently approve `RATE_LIMIT` requests, multiplying the real limit by N. There is no shared state across edge instances.

### Other `new Map(` matches in `app/api`

Confirmed via grep: the only other matches are in two cron handlers (`app/api/cron/daily-owner-summary/route.ts:121,137` and `app/api/cron/weekly-engagement-digest/route.ts:163,181`) — those are read-side lookup tables (`projectsById`, `creatorById`) built fresh per invocation. **Not rate-limit Maps. Ignore.**

### Fix recommendation

Use the same `checkRateLimit(key, limit, windowMs)` helper already in place. Patch:

```ts
// app/api/demos/generate/route.ts (top of file)
import { NextRequest, NextResponse } from "next/server";
import { generateDemoGif, isValidDemoUrl } from "@/lib/demo-generator";
import { supabase } from "@/lib/supabase";
import { USE_SUPABASE } from "@/lib/mock-adapter";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await checkRateLimit(`${ip}:demos-generate`, 2, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in 60 seconds." },
      { status: 429 },
    );
  }
  // ...rest unchanged
}
```

Then delete lines 7–19 (the in-memory map + local helper).

### Effort

**15 minutes.** Single route, single function, drop-in replacement. No new migration required (mig 036 already in prod).

---

## Issue 2 — `/api/agents/stream` zero auth

### What the brain claimed

"`/api/agents/stream` 零 auth."

### What's actually there

`app/api/agents/stream/route.ts:16-29` has **both** auth and rate limit already. The Fable 5 audit (6/11) closed this. From the file header comment:

> Wallet protection. This endpoint streams the output of executeAgent, which makes paid LLM calls. Fable 5 audit 2026-06-11 flagged this route as having zero auth AND zero rate limit — anyone hitting it burns Anthropic credits. Auth + per-user rate limit close the hole.

Current shape:

```ts
const user = await getAuthUser();
if (!user) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, ... });
}
const { allowed } = await checkRateLimit(`${user.id}:agents-stream`, 5, 60_000);
if (!allowed) {
  return new Response(..., { status: 429, ... });
}
```

### Data exposed

Each event is a `step` from `executeAgent(agent, input)` — agent log lines, tool calls, partial completions. No PII leak: caller supplies the `input`, the agent runs against their own input, output is streamed back to the same caller. The risk was wallet drain (paid LLM calls), not data exfiltration.

### Remaining hardening (optional, not the original issue)

Two soft gaps that the brain may have been pointing at separately:

1. **Not owner-scoped.** Any signed-in user can call `executeAgent(agent, input)` against **any** agent ID, including agents created by other users. This is fine for a public-template gallery model but leaks "agent X exists" if rows are supposed to be private. Check `agents.user_id` against the caller if the product intent is private agents.
2. **Per-instance counter softness.** The header comment notes the Map issue from #1 but the helper has since become Postgres-backed (036), so this concern is moot — the comment is stale and can be deleted in passing.

Recommended optional owner-scope patch (only if Alex wants agents private):

```ts
const agent = await getAgentById(agentId);
if (!agent) {
  return new Response(JSON.stringify({ error: `Agent not found: ${agentId}` }), { status: 404, ... });
}
// Owner-scope: only the creator can run their own agent.
if (agent.user_id && agent.user_id !== user.id) {
  return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, ... });
}
```

### Effort

**0 hours for the filed issue (already shipped).** **~30 minutes** if Alex also wants the owner-scope check and stale comment cleanup.

---

## Issue 3 — Admin moderation routes use anon client

### What the brain claimed

"admin moderation 走 anon client" → should be service-role or RPC SECURITY DEFINER.

### What's actually there

Confirmed two routes that mix clients incorrectly:

**`app/api/admin/moderation/route.ts`**

- Line 2: `import { supabase } from "@/lib/supabase";` (browser client — `createBrowserClient`, no cookie context when run on the server)
- Line 3: `import { createServerSupabase } from "@/lib/supabase-server";` (correct server client)
- GET reads (lines 26–38): use `supabase` (anon, no cookies) on `posts` and `post_reports`
- POST writes for `approve` / `hide` / `remove` / `dismiss` (lines 74–104): use `supabase` (anon, no cookies)
- POST writes for `ban` / `unban` (lines 106–132): use `serverSupabase` (correct)

**`app/api/admin/analytics/route.ts`**

- Line 2: `import { supabase } from "@/lib/supabase";`
- All five count queries (lines 53–71) use `supabase` (anon, no cookies)

The third route in `app/api/admin/`, `regen-cover/[id]/route.ts`, is **fine** — it uses `createServerSupabase()` plus an `ADMIN_EMAILS` env-list gate (lines 24–38). Pattern is good, just different from `rbac.requireRole`.

### Why this is broken (and what fails silently)

`lib/supabase.ts` exports a `createBrowserClient` instance. Imported and used in a server route, it carries **no cookie session**. So inside Postgres, `auth.uid()` is NULL.

Specific consequences:

- **`posts` UPDATE** (mig 030): policy `Mod update posts` requires `is_moderator_or_above(auth.uid())`. With null → denied. So `approve / hide / remove` writes are **silently no-ops**. The route returns `{ success: true }` regardless because Supabase's UPDATE returns 0 rows affected, no error.
- **`post_reports` UPDATE**: no UPDATE policy exists at all (mig 016 only has INSERT+SELECT, mig 059 only re-wraps INSERT+SELECT). RLS denies by default → all `dismiss` and `actioned` status writes **silently no-op**.
- **`posts` SELECT** for flagged (`moderation_status IN ('flagged')`): may succeed if RLS allows public reads of non-active posts; needs verification. Even so, reading is the less dangerous side.
- **`post_reports` SELECT** for pending: policy is `auth.uid() = reporter_id`. With null → empty array. Moderation queue **shows empty in production** even when reports exist.

In short: the GET moderation queue is probably stuck at zero in prod, and every approve/hide/remove/dismiss click does nothing. This is a stealth functionality break as much as a security issue — moderators see "success" but DB stays unchanged.

The `ban` / `unban` path is the only one that works correctly, because Alex already wired `serverSupabase` there (line 71, 111, 126).

### Per AGENTS.md rule

> "No service-role in app code. For `SECURITY DEFINER` use the RPC pattern (see `increment_play`, `increment_view`, `toggle_upvote`)."

The right fix is **both**:

1. Switch all reads & writes in these two routes from the browser `supabase` import to `createServerSupabase()` so the moderator's cookie session reaches Postgres and the existing `is_moderator_or_above` policy fires. This alone is enough for the writes that already have RLS policies (`posts` UPDATE via mig 030).
2. For `post_reports` UPDATE — which has no policy at all — add a new SECURITY DEFINER RPC `admin_update_report_status(report_id, new_status)` that internally checks `is_moderator_or_above(auth.uid())` and writes the row. This avoids inventing a moderator-scoped UPDATE policy on `post_reports` (which would also need a column-level guard so they can't rewrite other people's reports).

### Fix diff — route handler

```ts
// app/api/admin/moderation/route.ts (delete line 2, swap callsites)
// REMOVE: import { supabase } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET() {
  // ...USE_SUPABASE mock branch unchanged...

  const auth = await requireRole("moderator");
  if (auth instanceof Response) return auth;

  const supabase = await createServerSupabase();
  // ...rest of GET uses `supabase` (now the server-cookie client)...
}

export async function POST(request: Request) {
  const auth = await requireRole("moderator");
  if (auth instanceof Response) return auth;
  const { user: authUser, role } = auth;
  // ...body parse...

  const supabase = await createServerSupabase();

  switch (action) {
    case "approve": {
      if (postId) {
        await supabase.from("posts").update({ moderation_status: "active" }).eq("id", postId);
        await supabase.rpc("admin_update_report_status", {
          p_post_id: postId,
          p_new_status: "dismissed",
        });
      }
      return NextResponse.json({ success: true, action: "approved" });
    }
    // hide / remove follow the same pattern, calling
    // admin_update_report_status with 'actioned'
    case "dismiss": {
      if (reportIds && Array.isArray(reportIds)) {
        await supabase.rpc("admin_dismiss_reports", { p_report_ids: reportIds });
      }
      return NextResponse.json({ success: true, action: "dismissed" });
    }
    // ban / unban already correct
  }
}
```

### Fix diff — new migration

Next migration number: `079`. (Highest existing is `078_purge_mock_seed_data.sql`; the `_dogfood-cracked-2026-06-03.sql` file is a one-shot, not numbered.)

```sql
-- .private/migrations/079_admin_moderation_rpcs.sql
-- Adds SECURITY DEFINER RPCs so admin moderation route handlers
-- never need a service-role key. Each function gates on
-- is_moderator_or_above(auth.uid()), matching the existing posts
-- policy in 030_rls_posts_update.sql.

-- ─── Update a single post_report status (called by approve/hide/remove)
CREATE OR REPLACE FUNCTION admin_update_report_status(
  p_post_id    TEXT,
  p_new_status TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_moderator_or_above(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  IF p_new_status NOT IN ('dismissed', 'actioned', 'reviewed') THEN
    RAISE EXCEPTION 'invalid status' USING ERRCODE = '22023';
  END IF;
  UPDATE post_reports
     SET status = p_new_status,
         reviewed_at = NOW()
   WHERE post_id = p_post_id;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_update_report_status(TEXT, TEXT)
  TO authenticated;

-- ─── Bulk dismiss reports by id (called by 'dismiss' action)
CREATE OR REPLACE FUNCTION admin_dismiss_reports(
  p_report_ids TEXT[]
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_moderator_or_above(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  UPDATE post_reports
     SET status = 'dismissed',
         reviewed_at = NOW()
   WHERE id = ANY(p_report_ids);
END;
$$;

GRANT EXECUTE ON FUNCTION admin_dismiss_reports(TEXT[])
  TO authenticated;
```

After applying, update `.private/migrations/APPLIED.md` with a 6/15 entry.

### `app/api/admin/analytics/route.ts`

Same pattern: delete the browser-client import, swap to `createServerSupabase()` inside the handler. The reads in question are counts and `trending_hashtags` (which the public site already exposes) — no new RPC required, just the cookie-bearing client so RLS sees the moderator. ~10 minutes.

### Effort

- Migration 079 + apply via MCP/Dashboard: **45 minutes**
- `moderation/route.ts` rewrite: **45 minutes**
- `analytics/route.ts` rewrite: **15 minutes**
- Manual smoke test (real moderator account, log into staging, run each action, watch DB): **45 minutes**

**Total Issue 3: ~2.5 hours.**

---

## Cross-issue priority ranking

Ranked by (exploitability × blast radius). Higher score = fix first.

| Rank | Issue | Why |
|---|---|---|
| **1** | **Issue 3 — Admin moderation anon client** | This is the only one with a real exploit path AND silent functional break. Moderators believe they removed a flagged post; nothing happened in DB. Bad actors who get flagged stay live indefinitely. Brand and trust risk. Also a quiet wedge — Alex will assume the moderation tool is fine because the UI says "success." |
| 2 | Issue 1 — last in-memory Map in `demos/generate` | Real exploit (burst past 2/min trivially), but `generateDemoGif` is cheap CPU work, not paid API. Blast radius is "DOS by burst." 15-min fix. |
| 3 | Issue 2 — `/api/agents/stream` auth | Already shipped 6/11. No action. Optional 30-min polish: owner-scope agent execution + delete the stale comment. |

**Top fix: Issue 3.** Justification (1 line): silent moderation no-ops are both a security gap and a trust-graph poison — every "hidden" post is actually still live.

---

## Test strategy (per issue)

### Issue 1 — `demos/generate`

- **Manual smoke:** hit `POST /api/demos/generate` 3× in a row from same IP. 3rd should return 429.
- **New test:** Vitest under `lib/__tests__/` mocking `checkRateLimit` to return `{ allowed: false, remaining: 0 }` and asserting the route returns 429 with the expected error body. (Mirror the pattern in `lib/__tests__/feed.test.ts`.)

### Issue 2 — `/api/agents/stream` (optional polish)

- **Manual smoke:** create agent A as user U1, log in as U2, attempt to POST `agentId: A.id, input: "x"`. Expect 403.
- **New test:** integration test stubbing `getAuthUser` → U2 and `getAgentById` → `{ user_id: U1 }`, expect 403.

### Issue 3 — admin moderation

- **Manual smoke (the critical one):**
  1. Log in as a moderator account, open `/admin/moderation`.
  2. Verify the flagged-posts list now shows entries (it currently shows zero in prod even when reports exist).
  3. Click "hide" on one post. Re-query `SELECT moderation_status FROM posts WHERE id = ?` via Supabase Dashboard — expect `hidden`.
  4. Click "dismiss" on a report. Re-query `SELECT status FROM post_reports WHERE id = ?` — expect `dismissed`.
  5. Log in as a non-moderator. Verify `GET /api/admin/moderation` returns 403.
  6. Call the RPC directly as anon (curl + anon key): expect `forbidden` error code 42501.
- **New test:** Vitest stubbing `requireRole` → `{ user, role: "moderator" }` and `createServerSupabase` → a stub `rpc` that asserts the function name + args. Mirror this in a second test that stubs `requireRole` → `Response.json({error}, 403)` and asserts the route short-circuits before any RPC call.

---

## Migration sequencing

- **Issue 3 needs migration 079** (per `.private/migrations/` numbering — confirmed by listing the directory, highest numbered file is `078_purge_mock_seed_data.sql`).
- File path: `.private/migrations/079_admin_moderation_rpcs.sql` (gitignored per `vibex_schema_ground_truth.md`).
- After authoring, apply via Supabase MCP or Dashboard SQL Editor (no CLI per memory `vibex_no_supabase_cli.md`), then update `.private/migrations/APPLIED.md` with a 2026-06-15 entry noting which RPCs were created.
- Issues 1 and 2 require no new migration.

---

## Honest gap signal — what the brain note got wrong

The 6/11 note overstates Issue 1 and Issue 2:

- **Issue 1 said 15 routes.** Reality: 1 route (`demos/generate`). The other 14+ were already migrated to the Postgres `check_rate_limit` RPC (`lib/rate-limit.ts` calls migration 036). Alex likely fixed the rate-limit infra during the Fable 5 sweep on 6/11 but didn't update the brain note. The remaining `demos/generate` was missed because it has its own *local* `checkRateLimit` symbol that shadows the import, so a naive grep for the import wouldn't find it.
- **Issue 2 said zero auth.** Reality: auth + rate limit added 6/11. The route's own header comment documents the Fable 5 fix. The only nuance left is the owner-scope question (intent-dependent, not a security bug).
- **Issue 3 is real and worse than the note suggests** — it's not just a privilege issue, it's a silent functional break. Moderation actions return `{ success: true }` while the database stays untouched.

If Alex did do those Issue-1/Issue-2 fixes during Fable 5, the brain note `~/Desktop/Interview-Prep/Projects/alex-brain/index.md` should be amended after this audit to keep only Issue 3 and the one-line Issue 1 cleanup outstanding.

---

## Total estimated effort

| Issue | Hours |
|---|---|
| Issue 1 (demos/generate) | 0.25 |
| Issue 2 (already shipped; optional owner-scope) | 0–0.5 |
| Issue 3 (migration 079 + 2 route rewrites + smoke) | 2.5 |
| **Total** | **~3–3.25 hours** |

Comfortable single-afternoon slot after Splunk submission lands tomorrow.
