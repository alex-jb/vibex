/**
 * Local decode history for /tools/video-decode.
 *
 * Stores the last 20 successful decodes in localStorage so users can:
 *   - re-open a past analysis without burning another credit
 *   - share an old hook breakdown
 *   - build personal "hook archetype library" over time (the v1 of the
 *     hook taxonomy the SKILL.md alludes to)
 *
 * Why localStorage and not DB: same reasoning as video-quota.ts — v1 is
 * anonymous, no auth, no friction. When auth ships, swap for a server-
 * side `users.video_decode_history` join table.
 *
 * Size guard: each entry is ~1-2KB serialized; 20 × 2KB = 40KB ceiling.
 * localStorage 5MB quota leaves plenty of headroom.
 */

const STORAGE_KEY = "vibex:video-decode-history:v1";
const MAX_ENTRIES = 20;

export interface DecodeHistoryEntry {
  id: string; // local-only, generated client-side
  source: {
    mode: "url" | "upload";
    url?: string;
    filename?: string;
    platform?: string;
    title?: string;
  };
  analysis: {
    virality_score: number;
    hook_formula: string;
    emotional_hook: string;
    cta_type: string;
    duration_sec: number;
  };
  decoded_at: string; // ISO timestamp
}

function read(): DecodeHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(entries: DecodeHistoryEntry[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function saveDecode(entry: Omit<DecodeHistoryEntry, "id" | "decoded_at">): DecodeHistoryEntry[] {
  const full: DecodeHistoryEntry = {
    ...entry,
    id: genId(),
    decoded_at: new Date().toISOString(),
  };
  // Newest first, cap at MAX_ENTRIES
  const all = [full, ...read()].slice(0, MAX_ENTRIES);
  write(all);
  return all;
}

export function getHistory(): DecodeHistoryEntry[] {
  return read();
}

export function deleteEntry(id: string): DecodeHistoryEntry[] {
  const filtered = read().filter((e) => e.id !== id);
  write(filtered);
  return filtered;
}

export function clearHistory(): void {
  write([]);
}
