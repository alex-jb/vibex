/**
 * lib/changelog.ts — read git log at build time and parse Conventional
 * Commits into a structured changelog the /changelog page renders.
 *
 * Runs in Node (server component import only). Uses spawnSync to avoid
 * pulling in a git lib. Cache via React's `cache()` helper so multiple
 * server components hitting it share one read.
 */

import { spawnSync } from "node:child_process";
import { cache } from "react";

export type ChangelogEntry = {
  hash: string;
  shortHash: string;
  type: string; // feat | fix | docs | refactor | chore | test | style | perf
  scope: string | null;
  subject: string;
  iso: string; // ISO 8601 datetime
  date: string; // YYYY-MM-DD
};

const CONVENTIONAL_RE =
  /^(feat|fix|docs|refactor|chore|test|style|perf|build|ci|revert)(?:\(([^)]+)\))?(!?):\s+(.+)$/i;

// Types we treat as user-facing for /changelog. chore / test / build /
// ci skipped — they're noise to readers.
const USER_FACING_TYPES = new Set(["feat", "fix", "docs", "refactor", "perf"]);

export const getChangelog = cache(function getChangelog(
  limit = 60,
): ChangelogEntry[] {
  const res = spawnSync(
    "git",
    [
      "log",
      `--max-count=${limit}`,
      "--pretty=format:%H|%h|%s|%aI",
      "master",
    ],
    { encoding: "utf-8", maxBuffer: 1024 * 1024 },
  );
  if (res.status !== 0 || !res.stdout) return [];

  const entries: ChangelogEntry[] = [];
  for (const line of res.stdout.split("\n")) {
    if (!line.trim()) continue;
    const [hash, shortHash, subject, iso] = line.split("|");
    if (!hash || !subject) continue;
    const m = subject.match(CONVENTIONAL_RE);
    if (!m) continue; // Skip non-conventional commits silently
    const type = m[1].toLowerCase();
    if (!USER_FACING_TYPES.has(type)) continue;
    entries.push({
      hash,
      shortHash,
      type,
      scope: m[2] || null,
      subject: m[4],
      iso,
      date: iso.slice(0, 10),
    });
  }
  return entries;
});

export function groupByDate(
  entries: ChangelogEntry[],
): Array<{ date: string; entries: ChangelogEntry[] }> {
  const map = new Map<string, ChangelogEntry[]>();
  for (const e of entries) {
    const arr = map.get(e.date) || [];
    arr.push(e);
    map.set(e.date, arr);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, entries]) => ({ date, entries }));
}
