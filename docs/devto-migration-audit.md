---
title: "I found 3 un-applied DB migrations in my own prod — here's the audit script I wish I had"
published: false
description: Supabase without a CLI means migrations live on the honour system. Three of mine sat un-applied for weeks and Sentry caught one by accident. The audit script below finds the rest in 10 seconds.
tags: postgres, supabase, database, javascript
cover_image:
series: Shipping a solo AI launch platform
---

## TL;DR

I run a solo Next.js 16 + Supabase side project. I have 40 migration files in `.private/migrations/`, numbered `001_` through `040_`. I apply them by hand in the Supabase Dashboard SQL Editor because Supabase CLI doesn't fit my deploy story.

Sentry pinged me yesterday about a rate-limit RPC failing in production. Twenty minutes later I'd found **three** migration files that I'd authored, committed, but never actually applied to the live database:

- `036_rate_limit.sql` — missing `check_rate_limit` RPC. Every call into my AI review pipeline Sentry-errored because fail-open kicked in and silently masked it.
- `033_evolution_stages.sql` — the trigger that advances projects from Seed → Active → Growing → Breakout → Legend → Myth. **No project in my platform had ever evolved past Seed** because the trigger was never installed. Six months of "why doesn't evolution feel dynamic?" answered in one query.
- `034_share_events.sql` — the share-tracking table. Every share was a no-op.

I wrote a Node script to diff my migration files against the live DB inventory. It's ~180 lines, no dependencies beyond `fs`. This post is the teardown + the script.

---

## The setup that leaks

My migration discipline looks like this:

1. New schema change → write `NNN_name.sql` under `.private/migrations/`.
2. Open Supabase Dashboard → SQL Editor.
3. Paste, run, eyeball the success dialog.
4. `git add . && git push`.

The gap is step 2. Nothing on my laptop and nothing in CI checks whether step 2 actually happened. The files exist; they look applied. I trust my memory. My memory is bad.

Sentry catches only the subset of missed migrations that cause runtime errors in code I've written a caller for. It won't catch:

- A trigger I added but never installed, because triggers fire silently when absent.
- An RLS policy I tightened but never deployed, because reads still work under the old policy.
- A new column I defined but never added, because the ORM-ish Supabase client tolerates missing columns in `select('*')`.

Every one of these is a "works locally, breaks in prod" bug. But worse — it's "works locally, works in prod *wrong*, and nobody complains because the UI still renders."

## What I actually noticed

Sentry emailed me about 500 errors from `/api/ai/launch-package`. The error was:

```
rate-limit-rpc: check_rate_limit RPC failed
```

My app's rate limiter is Postgres-backed. It calls an RPC. The RPC didn't exist. `lib/rate-limit.ts` fails open on DB errors (logs to Sentry, returns `{ allowed: true }`), so the app kept functioning. Sentry kept piling up alerts.

```ts
const { data, error } = await supabase.rpc("check_rate_limit", {
  p_key: key,
  p_max_requests: limit,
  p_window_seconds: windowSeconds,
});

if (error) {
  serverLog.error("rate-limit-rpc", "check_rate_limit RPC failed", error);
  return { allowed: true, remaining: limit };
}
```

Good engineering: fail open beats fail closed when the fault is infra. Bad engineering: not alarming on persistent fails. I had alerts in Sentry; I didn't have alerting on *rate* of alerts, so the signal drowned in other noise.

I applied 036 via the MCP tool. The error stopped. Then I thought: *how many other migrations are like this?*

## The audit

Two steps:

1. Dump the live DB's public-schema objects.
2. Parse each migration file for `CREATE TABLE / FUNCTION / POLICY / INDEX / TRIGGER` and diff.

### Step 1 — inventory

```sql
SELECT 'table' AS kind, tablename AS name FROM pg_tables WHERE schemaname = 'public'
UNION ALL
SELECT 'function', proname FROM pg_proc WHERE pronamespace = 'public'::regnamespace
UNION ALL
SELECT 'policy', policyname || '::' || tablename FROM pg_policies WHERE schemaname = 'public'
UNION ALL
SELECT 'index', indexname FROM pg_indexes WHERE schemaname = 'public'
UNION ALL
SELECT 'trigger', tgname FROM pg_trigger
  WHERE NOT tgisinternal
  AND tgrelid IN (SELECT oid FROM pg_class WHERE relnamespace = 'public'::regnamespace)
ORDER BY kind, name;
```

Save the result as `inventory.json`:

```json
[
  { "kind": "table",    "name": "projects" },
  { "kind": "function", "name": "check_rate_limit" },
  { "kind": "policy",   "name": "Public read::projects" },
  ...
]
```

The policy key is `policy_name::table_name` because policy names are only unique per-table.

### Step 2 — the diff

The script reads each `.sql` file, regex-extracts the objects it claims to create, and reports missing ones.

```js
#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const [, , inventoryPath] = process.argv;
const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
const present = {
  table: new Set(), function: new Set(), policy: new Set(),
  index: new Set(), trigger: new Set(),
};
for (const obj of inventory) present[obj.kind]?.add(obj.name);

const DIR = path.join(process.cwd(), ".private/migrations");
const files = fs.readdirSync(DIR).filter(f => f.endsWith(".sql")).sort();

function parse(sql) {
  const clean = sql.replace(/--[^\n]*/g, ""); // strip line comments
  const out = { tables: [], functions: [], policies: [], indexes: [], triggers: [] };

  for (const m of clean.matchAll(
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?"?([a-z_][a-z0-9_]*)"?/gi
  )) out.tables.push(m[1].toLowerCase());

  for (const m of clean.matchAll(
    /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:public\.)?"?([a-z_][a-z0-9_]*)"?\s*\(/gi
  )) out.functions.push(m[1].toLowerCase());

  for (const m of clean.matchAll(
    /CREATE\s+POLICY\s+"([^"]+)"\s+ON\s+(?:public\.)?"?([a-z_][a-z0-9_]*)"?/gi
  )) out.policies.push(`${m[1]}::${m[2].toLowerCase()}`);

  for (const m of clean.matchAll(
    /CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?"?([a-z_][a-z0-9_]*)"?/gi
  )) out.indexes.push(m[1].toLowerCase());

  for (const m of clean.matchAll(
    /CREATE\s+TRIGGER\s+"?([a-z_][a-z0-9_]*)"?/gi
  )) out.triggers.push(m[1].toLowerCase());

  return out;
}

let fullyApplied = 0, partial = 0, notApplied = 0, dataOnly = 0;

for (const file of files) {
  const sql = fs.readFileSync(path.join(DIR, file), "utf8");
  const p = parse(sql);

  const missing = {
    tables:    p.tables   .filter(x => !present.table.has(x)),
    functions: p.functions.filter(x => !present.function.has(x)),
    policies:  p.policies .filter(x => !present.policy.has(x)),
    indexes:   p.indexes  .filter(x => !present.index.has(x)),
    triggers:  p.triggers .filter(x => !present.trigger.has(x)),
  };

  const total   = Object.values(p).reduce((n, arr) => n + arr.length, 0);
  const missed  = Object.values(missing).reduce((n, arr) => n + arr.length, 0);

  if (total === 0) { dataOnly++; console.log(`  ○  ${file}  (data only)`); continue; }
  if (missed === 0) { fullyApplied++; console.log(`  ✓  ${file}`); continue; }
  if (missed === total) { notApplied++; console.log(`  ✗  ${file}  NOT APPLIED`); }
  else { partial++; console.log(`  ⚠  ${file}  PARTIAL (${missed}/${total} missing)`); }

  for (const [kind, arr] of Object.entries(missing)) {
    if (arr.length) console.log(`       missing ${kind}: ${arr.join(", ")}`);
  }
}

console.log(`\n✓ ${fullyApplied} · ⚠ ${partial} · ✗ ${notApplied} · ○ ${dataOnly}`);
if (partial + notApplied > 0) process.exit(1);
```

### What I found

```
  ✓  001–032          (all applied)
  ✗  033_evolution_stages.sql          NOT APPLIED
       missing functions: compute_evolution_stage, update_project_evolution
       missing indexes:   idx_projects_evolution_stage
       missing triggers:  trg_update_evolution
  ✗  034_share_events.sql              NOT APPLIED
       missing tables:    share_events
       missing indexes:   idx_share_events_project, idx_share_events_type, idx_share_events_created
  ⚠  035_rls_fix_dm_messages.sql       PARTIAL (4/5 missing)
       missing functions: enforce_dm_message_update
       missing policies:  "Conversation members update::dm_messages", "Sender deletes own message::dm_messages"
       missing triggers:  trg_enforce_dm_message_update
  ✗  036_rate_limit.sql                (this is what Sentry caught)
  ✓  037–040          (all applied)

✓ 29 · ⚠ 5 · ✗ 2 · ○ 3
```

The four "partial" entries that weren't 033/034/035/036 were false positives — renamed policies superseded by later `rls_tighten_*` migrations. The real miss was four migrations. I ran each in the SQL Editor, re-ran the script, clean pass.

## The silent-bug pattern

Every un-applied migration produced a subtly broken feature in prod that nobody complained about:

- Rate limit missing → Sentry noise, no user-visible issue. Alert fatigue ate the signal.
- Evolution trigger missing → every project stuck on `Seed`. Users probably didn't know it was supposed to progress. UI even showed progress bars that never moved.
- Share events table missing → UI "Share" button worked, nothing persisted. No analytics to compare what's shared.
- DM UPDATE trigger missing → the recipient of a message could, in theory, edit the sender's text (the RLS policy allowed UPDATE for either conversation member, but the column-level guard that was supposed to stop non-senders from modifying content wasn't installed). Nobody had tried.

None of these throw a 500 the user sees. None fail a build. None show up in Playwright. They show up in months of "huh, my feature doesn't feel as alive as I designed it."

## What I changed

**1. An `APPLIED.md` tracker file in `.private/migrations/`.** Every new migration now requires a line in a table that says "applied YYYY-MM-DD." Forces me to actively tick the box, which I won't do unless I actually ran the SQL.

**2. The audit script as `npm run audit:migrations`.** Pre-ship habit: dump inventory, run script, only push if clean.

**3. (Next)** A GitHub Actions workflow that hits a tiny read-only `/api/admin/migration-audit` endpoint on a schedule and posts to Slack if anything goes missing. Haven't written this yet; will be the follow-up article.

## What you can steal

If you're in the "Supabase without CLI" camp (a larger club than you'd think), the full script is [here in my repo][1]. It's MIT-licensed, no dependencies, runs anywhere Node 20+ does. Drop it next to your migrations folder, dump the inventory query into a JSON file, and you get a pass/fail at the price of one psql query.

The broader lesson — the one I'd tell myself six weeks ago — is that **silent features are worse than loud crashes.** A rate limit that 500s is fine; I'd have fixed it day one. A rate limit that silently allows unlimited traffic because it fails open on an uninstalled RPC is the kind of bug that costs you an API bill and a Sunday afternoon. Audit the silent surface.

---

*[VibeX][2] is an AI-native launch platform I'm building where every project is a collectible RPG hero. Claude reviews every submission. Projects evolve on real traction. The evolution system is the thing that was completely broken in prod before yesterday. Now it works.*

[1]: https://github.com/alex-jb/vibex/blob/master/scripts/audit-migrations.mjs
[2]: https://www.vibexforge.com
