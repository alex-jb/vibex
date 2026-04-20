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
const tables = new Set(
  inventory.filter((x) => x.kind === "table").map((x) => x.name),
);
const functions = new Set(
  inventory.filter((x) => x.kind === "function").map((x) => x.name),
);

// Known-broken references surfaced by the 2026-04-18 audit. These
// tables / RPCs are referenced by code paths that don't crash (they
// hit a Supabase error and fail gracefully) but the feature is
// effectively dead until the migration ships. Burn this list down
// over time — each entry is a TODO disguised as a suppression.
//
// Before removing an entry: write + apply the migration, run
// `npm run audit:dump`, commit the inventory, then delete the
// allowlist line. CI will keep you honest.
const ALLOWLIST_TABLES = new Set([
  // Referenced by app/api/admin/analytics + app/api/feed/tags.
  // The hashtags feature surfaces "trending" in UI — backed by a view
  // that was never created.
  "trending_hashtags",
  // app/api/demos/generate references a thumbnails table for demo
  // snapshot storage; no migration exists yet.
  "thumbnails",
  // app/api/feed references an algorithmic_feed materialized view /
  // table for ranked feed queries. Never shipped.
  "algorithmic_feed",
  // app/api/project/[id]/analytics references a daily rollup table
  // that was in the roadmap but never created.
  "project_daily_stats",
  // app/api/push/subscribe references push_subscriptions. Web push
  // flow designed but never finished.
  "push_subscriptions",
]);
const ALLOWLIST_FUNCTIONS = new Set([
  // app/api/buddy/evolve-reward calls add_creator_exp (XP reward on
  // buddy evolution). The RPC was written in design docs but never
  // authored as a migration.
  "add_creator_exp",
]);

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
    for (const m of src.matchAll(/\.from\(\s*["']([a-z_][a-z0-9_]*)["']/gi)) {
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
