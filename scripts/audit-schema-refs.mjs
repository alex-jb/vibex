#!/usr/bin/env node
/**
 * Schema-reference audit: grep every `.from("X")` and `.rpc("Y")` call
 * in app + lib + components, and verify each referenced table / RPC
 * exists in the committed DB inventory (from `scripts/dump-inventory.
 * mjs`).
 *
 * Why this exists: The 2026-04-17 audit surfaced four migrations that
 * had been authored, committed, but never applied to production. The
 * failure mode was always "code references DB object X, DB doesn't
 * have X, but the Supabase client silently logs an error instead of
 * throwing." Users see a broken feature; Sentry gets noise; nobody
 * pages.
 *
 * This script catches that class of bug at PR time by proving every
 * .from() / .rpc() target is something the snapshot says actually
 * exists in prod. Doesn't guarantee a migration was applied — it
 * guarantees the committed inventory thinks it was.
 *
 * Usage:
 *   node scripts/audit-schema-refs.mjs scripts/migration-inventory.json
 *
 * Exits non-zero if any referenced table or function is missing.
 */

import fs from "node:fs";
import path from "node:path";

const [, , inventoryPath] = process.argv;
if (!inventoryPath) {
  console.error(
    "Usage: node scripts/audit-schema-refs.mjs <inventory.json>",
  );
  process.exit(1);
}

const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
// PostgREST treats views and tables the same way for .from("X") calls,
// so collapse both under `tables` when matching code references.
const tables = new Set(
  inventory
    .filter((x) => x.kind === "table" || x.kind === "view")
    .map((x) => x.name),
);
const functions = new Set(
  inventory.filter((x) => x.kind === "function").map((x) => x.name),
);

// Allowlist for references that legitimately shouldn't fail the
// audit. Currently empty after migration 044 shipped the five real
// schemas (push_subscriptions, trending_hashtags, project_daily_stats,
// algorithmic_feed) and the one RPC (add_creator_exp) that had been
// referenced in code but never applied.
//
// If CI flags a new entry, first instinct is to write the migration —
// not to allowlist. Allowlist only when:
//   - The target is a Supabase-managed schema we don't control
//     (auth, storage, realtime)
//   - The name is a dynamic value that happens to match the regex
//     but isn't a real .from() target
const ALLOWLIST_TABLES = new Set([]);
const ALLOWLIST_FUNCTIONS = new Set([]);

// Walk source tree, collecting .from("X") and .rpc("Y") call sites.
const ROOTS = ["app", "lib", "components"];
const EXTS = new Set([".ts", ".tsx", ".mjs", ".js"]);

function walk(dir, visit) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      walk(full, visit);
    } else if (EXTS.has(path.extname(entry.name))) {
      visit(full);
    }
  }
}

const tableRefs = new Map(); // name -> [files]
const rpcRefs = new Map();

for (const root of ROOTS) {
  if (!fs.existsSync(root)) continue;
  walk(root, (file) => {
    const src = fs.readFileSync(file, "utf8");
    // Skip `supabase.storage.from("bucket")` — those are Storage
    // buckets, not DB tables. Same `.from(X)` surface, different
    // backend. Bug: the naive regex picked up the `thumbnails`
    // storage bucket as a missing table (false positive).
    for (const m of src.matchAll(
      /(?<!storage\s*)\.from\(\s*["']([a-z_][a-z0-9_]*)["']/gi,
    )) {
      // Double-check: look backwards for `storage.` within 30 chars
      // since the lookbehind above only handles one-line cases.
      const before = src.slice(Math.max(0, m.index - 40), m.index);
      if (/\.storage\s*$/.test(before)) continue;
      const name = m[1].toLowerCase();
      if (!tableRefs.has(name)) tableRefs.set(name, []);
      tableRefs.get(name).push(file);
    }
    for (const m of src.matchAll(/\.rpc\(\s*["']([a-z_][a-z0-9_]*)["']/gi)) {
      const name = m[1].toLowerCase();
      if (!rpcRefs.has(name)) rpcRefs.set(name, []);
      rpcRefs.get(name).push(file);
    }
  });
}

const missingTables = [];
for (const [name, files] of tableRefs) {
  if (tables.has(name) || ALLOWLIST_TABLES.has(name)) continue;
  missingTables.push({ name, files });
}

const missingFunctions = [];
for (const [name, files] of rpcRefs) {
  if (functions.has(name) || ALLOWLIST_FUNCTIONS.has(name)) continue;
  missingFunctions.push({ name, files });
}

console.log("═".repeat(72));
console.log("Schema reference audit");
console.log("═".repeat(72));
console.log(
  `  tables referenced: ${tableRefs.size} (${missingTables.length} missing from inventory)`,
);
console.log(
  `  rpcs referenced:   ${rpcRefs.size} (${missingFunctions.length} missing from inventory)`,
);

if (missingTables.length) {
  console.log("\n✗ Tables referenced in code but missing from DB inventory:");
  for (const { name, files } of missingTables) {
    console.log(`   - ${name}`);
    for (const f of files.slice(0, 3)) console.log(`       ${f}`);
    if (files.length > 3) console.log(`       … +${files.length - 3} more`);
  }
}

if (missingFunctions.length) {
  console.log("\n✗ RPCs referenced in code but missing from DB inventory:");
  for (const { name, files } of missingFunctions) {
    console.log(`   - ${name}`);
    for (const f of files.slice(0, 3)) console.log(`       ${f}`);
    if (files.length > 3) console.log(`       … +${files.length - 3} more`);
  }
}

if (missingTables.length || missingFunctions.length) {
  console.log(
    "\nIf the missing object is new, apply its migration then run",
  );
  console.log(
    "`npm run audit:dump` and commit the updated inventory JSON.",
  );
  process.exit(1);
}

console.log("\n✓ every referenced table + RPC exists in the inventory.");
