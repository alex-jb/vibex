#!/usr/bin/env node
/**
 * Dump the public-schema inventory of the live Supabase DB to a JSON
 * file consumed by scripts/audit-migrations.mjs.
 *
 * Usage:
 *   node scripts/dump-inventory.mjs [outPath]
 *
 * Env (tried in order):
 *   SUPABASE_URL, NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * Requires the `get_migration_inventory` RPC (migration 043) which
 * wraps the same SELECT used in the initial audit. Exposed to anon so
 * CI can call it without a service-role secret — the return shape
 * names tables/functions/policies/indexes/triggers that are already
 * observable via PostgREST's OpenAPI schema anyway, so this doesn't
 * leak anything that isn't already public.
 *
 * Run this after applying a migration, commit the updated JSON. The
 * CI audit in .github/workflows/ci.yml re-runs audit-migrations.mjs
 * against the committed snapshot on every PR, so forgetting to
 * regen after a migration apply yields a failing build.
 */

import fs from "node:fs";

const OUT = process.argv[2] || "scripts/migration-inventory.json";

// Load .env.local manually if env vars not already set. `vercel env pull`
// sometimes writes values with literal trailing `\n` inside quotes, which
// breaks the URL by appending it to the host. Strip the trailing whitespace
// and any literal `\n` sequence at the end of the value.
function loadEnvLocal() {
  try {
    const text = fs.readFileSync(".env.local", "utf8");
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
      if (!m) continue;
      const k = m[1];
      let v = m[2];
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      v = v.replace(/\\n$/, "").replace(/\s+$/, "");
      if (!(k in process.env)) process.env[k] = v;
    }
  } catch {
    // .env.local optional — caller may have set env via shell
  }
}
loadEnvLocal();

const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const key = (
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  ""
).trim();

if (!url || !key) {
  console.error(
    "Missing env. Need: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)",
  );
  process.exit(1);
}

const endpoint = `${url.replace(/\/$/, "")}/rest/v1/rpc/get_migration_inventory`;

const res = await fetch(endpoint, {
  method: "POST",
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  },
  body: "{}",
});

if (!res.ok) {
  const text = await res.text();
  console.error(`RPC call failed: ${res.status} ${res.statusText}\n${text}`);
  process.exit(1);
}

const rows = await res.json();
if (!Array.isArray(rows)) {
  console.error("Unexpected response shape:", rows);
  process.exit(1);
}

// Sort for stable diffs in git
rows.sort((a, b) => (a.kind + a.name).localeCompare(b.kind + b.name));

fs.writeFileSync(OUT, JSON.stringify(rows, null, 0) + "\n");
console.log(`Wrote ${rows.length} objects to ${OUT}`);
