#!/usr/bin/env node
/**
 * Migration audit — parses every .private/migrations/*.sql file, extracts
 * the public-schema objects each claims to create, and diffs against
 * a live-DB inventory file to find migrations that were authored but
 * never applied.
 *
 * Why this exists: VibeX has no Supabase CLI. Migrations are manually
 * run in the Dashboard SQL Editor. Migration 036_rate_limit.sql sat
 * un-applied for weeks, throwing Sentry errors on every request to
 * /api/ai/* endpoints. This script makes it a 5-second check.
 *
 * Usage:
 *   node scripts/audit-migrations.mjs inventory.json
 *
 * inventory.json shape:
 *   [ { kind: "table" | "function" | "policy" | "index" | "trigger",
 *       name: "tablename" | "fnname" | "PolicyName::tablename" | etc }, ... ]
 *
 * Run this from the vibex root. The inventory is produced by the
 * `migration-audit-inventory` SQL in the /geo skill workflow or via
 * Supabase MCP `execute_sql`.
 */

import fs from "node:fs";
import path from "node:path";

const [, , inventoryPath] = process.argv;
if (!inventoryPath) {
  console.error("Usage: node scripts/audit-migrations.mjs inventory.json");
  process.exit(1);
}

const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
const present = {
  table: new Set(),
  function: new Set(),
  policy: new Set(),
  index: new Set(),
  trigger: new Set(),
};
for (const obj of inventory) {
  if (present[obj.kind]) present[obj.kind].add(obj.name);
}

const MIGRATIONS_DIR = path.join(process.cwd(), ".private/migrations");
const files = fs
  .readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith(".sql"))
  .sort();

// Parse a single migration for objects it claims to create.
// Returns { tables, functions, policies, indexes, triggers }.
function parseMigration(sql) {
  const out = {
    tables: [],
    functions: [],
    policies: [],
    indexes: [],
    triggers: [],
  };

  // Strip line comments but keep block structure
  const clean = sql.replace(/--[^\n]*/g, "");

  // CREATE TABLE [IF NOT EXISTS] name (
  for (const m of clean.matchAll(
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?"?([a-z_][a-z0-9_]*)"?/gi,
  )) {
    out.tables.push(m[1].toLowerCase());
  }

  // CREATE [OR REPLACE] FUNCTION name(
  for (const m of clean.matchAll(
    /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:public\.)?"?([a-z_][a-z0-9_]*)"?\s*\(/gi,
  )) {
    out.functions.push(m[1].toLowerCase());
  }

  // CREATE POLICY "name" ON tablename  — we key as "name::tablename"
  for (const m of clean.matchAll(
    /CREATE\s+POLICY\s+"([^"]+)"\s+ON\s+(?:public\.)?"?([a-z_][a-z0-9_]*)"?/gi,
  )) {
    out.policies.push(`${m[1]}::${m[2].toLowerCase()}`);
  }

  // CREATE [UNIQUE] INDEX [IF NOT EXISTS] name ON ...
  for (const m of clean.matchAll(
    /CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?"?([a-z_][a-z0-9_]*)"?/gi,
  )) {
    out.indexes.push(m[1].toLowerCase());
  }

  // CREATE TRIGGER name ON ...
  for (const m of clean.matchAll(
    /CREATE\s+TRIGGER\s+"?([a-z_][a-z0-9_]*)"?/gi,
  )) {
    out.triggers.push(m[1].toLowerCase());
  }

  return out;
}

const results = [];
for (const file of files) {
  const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
  const parsed = parseMigration(sql);

  const missing = {
    tables: parsed.tables.filter((t) => !present.table.has(t)),
    functions: parsed.functions.filter((f) => !present.function.has(f)),
    policies: parsed.policies.filter((p) => !present.policy.has(p)),
    indexes: parsed.indexes.filter((i) => !present.index.has(i)),
    triggers: parsed.triggers.filter((t) => !present.trigger.has(t)),
  };

  const totalAuthored =
    parsed.tables.length +
    parsed.functions.length +
    parsed.policies.length +
    parsed.indexes.length +
    parsed.triggers.length;
  const totalMissing =
    missing.tables.length +
    missing.functions.length +
    missing.policies.length +
    missing.indexes.length +
    missing.triggers.length;

  results.push({ file, parsed, missing, totalAuthored, totalMissing });
}

// Report
console.log("═".repeat(72));
console.log("Migration audit — vibexforge.com (.private/migrations)");
console.log("═".repeat(72));
console.log("");

let fullyApplied = 0;
let partiallyApplied = 0;
let notApplied = 0;
let dataOnly = 0;

for (const r of results) {
  if (r.totalAuthored === 0) {
    dataOnly++;
    console.log(`  ○  ${r.file}  (data migration — can't verify from schema)`);
    continue;
  }

  if (r.totalMissing === 0) {
    fullyApplied++;
    console.log(`  ✓  ${r.file}  (${r.totalAuthored} objects present)`);
    continue;
  }

  if (r.totalMissing === r.totalAuthored) {
    notApplied++;
    console.log(`  ✗  ${r.file}  NOT APPLIED (${r.totalMissing}/${r.totalAuthored} missing)`);
  } else {
    partiallyApplied++;
    console.log(
      `  ⚠  ${r.file}  PARTIAL (${r.totalMissing}/${r.totalAuthored} missing)`,
    );
  }

  const list = (label, arr) =>
    arr.length ? console.log(`       missing ${label}: ${arr.join(", ")}`) : null;
  list("tables", r.missing.tables);
  list("functions", r.missing.functions);
  list("policies", r.missing.policies);
  list("indexes", r.missing.indexes);
  list("triggers", r.missing.triggers);
}

console.log("");
console.log("─".repeat(72));
console.log(
  `Summary: ${fullyApplied} fully applied · ${partiallyApplied} partial · ${notApplied} not applied · ${dataOnly} data-only`,
);
console.log("─".repeat(72));

if (partiallyApplied + notApplied > 0) {
  console.log("");
  console.log("Run the missing migrations via Supabase Dashboard → SQL Editor.");
  process.exit(1);
}
