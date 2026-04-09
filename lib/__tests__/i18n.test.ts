/**
 * i18n tests — verifies translation key parity and structural integrity.
 *
 * Strategy: We parse the i18n source file at test time to extract raw key sets
 * for `en` and `zh` blocks. This avoids importing the "use client" React module
 * (which would fail in a Node test environment) while still testing real data.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ─── Parse translation keys from source ───────────────────────────────────────

function parseKeys(source: string, langKey: "en" | "zh"): Set<string> {
  // Find the language block: `  en: {` or `  zh: {`
  const startPattern = new RegExp(`^  ${langKey}: \\{`, "m");
  const startMatch = startPattern.exec(source);
  if (!startMatch) return new Set();

  const blockStart = startMatch.index + startMatch[0].length;

  // Walk forward to find the matching closing `},` (depth tracking)
  let depth = 1;
  let i = blockStart;
  while (i < source.length && depth > 0) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}") depth--;
    i++;
  }
  const block = source.slice(blockStart, i - 1);

  // Extract keys: `"key.name": ...`
  const keyPattern = /"([a-zA-Z0-9_.]+)":/g;
  const keys = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = keyPattern.exec(block)) !== null) {
    keys.add(m[1]);
  }
  return keys;
}

const i18nPath = path.resolve(__dirname, "../i18n.ts");
const source = fs.readFileSync(i18nPath, "utf-8");
const enKeys = parseKeys(source, "en");
const zhKeys = parseKeys(source, "zh");

// ─── Key count sanity ─────────────────────────────────────────────────────────

describe("i18n source parsing", () => {
  it("finds a substantial number of en keys", () => {
    expect(enKeys.size).toBeGreaterThan(50);
  });

  it("finds a substantial number of zh keys", () => {
    expect(zhKeys.size).toBeGreaterThan(50);
  });

  it("en block is not empty", () => {
    expect(enKeys.size).toBeGreaterThan(0);
  });

  it("zh block is not empty", () => {
    expect(zhKeys.size).toBeGreaterThan(0);
  });
});

// ─── Key parity: zh must cover all en keys ────────────────────────────────────

describe("zh translations cover all en keys", () => {
  it("zh has no keys missing from en", () => {
    const missingInZh = [...enKeys].filter((k) => !zhKeys.has(k));
    expect(missingInZh).toEqual([]);
  });

  it("zh does not have extra keys absent from en", () => {
    const extraInZh = [...zhKeys].filter((k) => !enKeys.has(k));
    expect(extraInZh).toEqual([]);
  });
});

// ─── Key naming convention ────────────────────────────────────────────────────

describe("translation key naming conventions", () => {
  it("all en keys follow namespace.name pattern", () => {
    const invalid = [...enKeys].filter((k) => !k.includes("."));
    expect(invalid).toEqual([]);
  });

  it("all en key namespaces are known categories", () => {
    const knownPrefixes = new Set([
      "nav", "discover", "dojo", "chat", "boot", "hero", "quick", "stats",
      "boss", "quest", "arena", "intel", "events", "guild", "cta", "footer",
      "explore", "hunt", "ideas", "creators", "insights", "launch",
      "analytics", "profile", "viewMode", "common",
      // Additional namespaces found in the actual translation file
      "project", "demo", "dev", "agentPage", "builder", "feed", "buddy",
      "settings", "agents", "login", "search", "comment", "notif", "user",
      "notFound", "about", "privacy", "terms", "workflows", "cat", "valuehero",
    ]);
    const unknownPrefixes = new Set<string>();
    for (const key of enKeys) {
      const prefix = key.split(".")[0];
      if (!knownPrefixes.has(prefix)) {
        unknownPrefixes.add(prefix);
      }
    }
    // Report unknown prefixes clearly on failure
    expect([...unknownPrefixes]).toEqual([]);
  });

  it("no key contains whitespace", () => {
    const withSpace = [...enKeys].filter((k) => /\s/.test(k));
    expect(withSpace).toEqual([]);
  });

  it("no duplicate keys within en block", () => {
    // Re-parse with duplicates tracked
    const startPattern = /^  en: \{/m;
    const startMatch = startPattern.exec(source)!;
    const blockStart = startMatch.index + startMatch[0].length;
    let depth = 1;
    let i = blockStart;
    while (i < source.length && depth > 0) {
      if (source[i] === "{") depth++;
      else if (source[i] === "}") depth--;
      i++;
    }
    const block = source.slice(blockStart, i - 1);

    const keyPattern = /"([a-zA-Z0-9_.]+)":/g;
    const seen = new Map<string, number>();
    let m: RegExpExecArray | null;
    while ((m = keyPattern.exec(block)) !== null) {
      seen.set(m[1], (seen.get(m[1]) ?? 0) + 1);
    }
    const duplicates = [...seen.entries()].filter(([, count]) => count > 1).map(([k]) => k);
    expect(duplicates).toEqual([]);
  });
});

// ─── Spot-check specific key values ───────────────────────────────────────────

describe("en key values spot-check", () => {
  // We parse key → value pairs from the en block for value assertions
  function parseKeyValues(lang: "en" | "zh"): Map<string, string> {
    const startPattern = new RegExp(`^  ${lang}: \\{`, "m");
    const startMatch = startPattern.exec(source)!;
    const blockStart = startMatch.index + startMatch[0].length;
    let depth = 1;
    let i = blockStart;
    while (i < source.length && depth > 0) {
      if (source[i] === "{") depth++;
      else if (source[i] === "}") depth--;
      i++;
    }
    const block = source.slice(blockStart, i - 1);

    const pairPattern = /"([a-zA-Z0-9_.]+)":\s*"((?:[^"\\]|\\.)*)"/g;
    const map = new Map<string, string>();
    let m: RegExpExecArray | null;
    while ((m = pairPattern.exec(block)) !== null) {
      map.set(m[1], m[2]);
    }
    return map;
  }

  const enValues = parseKeyValues("en");
  const zhValues = parseKeyValues("zh");

  it("nav.home in en is 'Home'", () => {
    expect(enValues.get("nav.home")).toBe("Home");
  });

  it("nav.arena in en is 'Arena'", () => {
    expect(enValues.get("nav.arena")).toBe("Arena");
  });

  it("nav.home in zh is not empty", () => {
    const val = zhValues.get("nav.home");
    expect(val).toBeTruthy();
    expect(val!.length).toBeGreaterThan(0);
  });

  it("zh nav.home differs from en nav.home", () => {
    // A translated string should differ from the English source
    expect(zhValues.get("nav.home")).not.toBe(enValues.get("nav.home"));
  });

  it("common.comingSoon exists in en", () => {
    expect(enValues.has("common.comingSoon")).toBe(true);
  });

  it("common.comingSoon exists in zh", () => {
    expect(zhValues.has("common.comingSoon")).toBe(true);
  });
});

// ─── Translation count relationship ───────────────────────────────────────────

describe("translation key count relationship between locales", () => {
  it("zh has the same number of keys as en (full parity)", () => {
    expect(zhKeys.size).toBe(enKeys.size);
  });
});
