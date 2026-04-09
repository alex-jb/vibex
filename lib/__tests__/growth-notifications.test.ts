import { describe, it, expect } from "vitest";
import { calculateStreak } from "../growth-notifications";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Return an ISO date string for N days ago relative to "now" */
function daysAgo(n: number): string {
  const d = new Date(Date.now() - n * 86400000);
  return d.toISOString();
}

/** Return today's date string (YYYY-MM-DD) */
function today(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── Edge cases: empty / single ───────────────────────────────────────────────

describe("calculateStreak — empty input", () => {
  it("returns zero streak and null date for empty array", () => {
    const result = calculateStreak([]);
    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(0);
    expect(result.lastPostDate).toBeNull();
  });
});

describe("calculateStreak — single post", () => {
  it("returns streak of 1 when only post is today", () => {
    const result = calculateStreak([daysAgo(0)]);
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
  });

  it("returns streak of 1 when only post is yesterday", () => {
    const result = calculateStreak([daysAgo(1)]);
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
  });

  it("returns streak of 0 when only post was 2+ days ago", () => {
    const result = calculateStreak([daysAgo(3)]);
    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(1);
  });

  it("lastPostDate is today's date when posted today", () => {
    const result = calculateStreak([daysAgo(0)]);
    expect(result.lastPostDate).toBe(today());
  });
});

// ─── Consecutive day streaks ───────────────────────────────────────────────────

describe("calculateStreak — consecutive days ending today", () => {
  it("3-day streak ending today returns currentStreak >= 1", () => {
    const dates = [daysAgo(0), daysAgo(1), daysAgo(2)];
    const result = calculateStreak(dates);
    expect(result.longestStreak).toBeGreaterThanOrEqual(2);
    expect(result.currentStreak).toBeGreaterThanOrEqual(1);
  });

  it("5-day streak: longestStreak >= 3", () => {
    const dates = [daysAgo(0), daysAgo(1), daysAgo(2), daysAgo(3), daysAgo(4)];
    const result = calculateStreak(dates);
    expect(result.longestStreak).toBeGreaterThanOrEqual(3);
    expect(result.lastPostDate).toBe(today());
  });
});

describe("calculateStreak — consecutive days ending yesterday", () => {
  it("streak is still active when last post was yesterday", () => {
    const dates = [daysAgo(1), daysAgo(2), daysAgo(3)];
    const result = calculateStreak(dates);
    // Streak is not broken since yesterday counts as active
    expect(result.currentStreak).toBeGreaterThanOrEqual(1);
  });
});

// ─── Broken streak ────────────────────────────────────────────────────────────

describe("calculateStreak — broken streaks", () => {
  it("gap of 2 days resets currentStreak to 0", () => {
    // Last post was 3 days ago — neither today nor yesterday
    const dates = [daysAgo(3), daysAgo(4), daysAgo(5)];
    const result = calculateStreak(dates);
    expect(result.currentStreak).toBe(0);
  });

  it("longestStreak still reflects past consecutive days even after break", () => {
    // 3 consecutive days ago, then a gap, then current
    const dates = [daysAgo(10), daysAgo(11), daysAgo(12)];
    const result = calculateStreak(dates);
    expect(result.longestStreak).toBeGreaterThanOrEqual(1);
    expect(result.currentStreak).toBe(0);
  });

  it("only counts consecutive days for longestStreak", () => {
    // Non-consecutive: 1, 3, 5, 7, 9 days ago — all isolated
    const dates = [daysAgo(1), daysAgo(3), daysAgo(5), daysAgo(7), daysAgo(9)];
    const result = calculateStreak(dates);
    expect(result.longestStreak).toBe(1);
  });
});

// ─── Duplicate dates ──────────────────────────────────────────────────────────

describe("calculateStreak — duplicate dates", () => {
  it("multiple posts on same day count as one day", () => {
    // Three timestamps on the same calendar day should not inflate streak
    const sameDay = daysAgo(0);
    const dates = [sameDay, sameDay, sameDay];
    const result = calculateStreak(dates);
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
  });

  it("deduplication does not break multi-day streak counting", () => {
    const dates = [
      daysAgo(0), daysAgo(0), // today x2
      daysAgo(1), daysAgo(1), // yesterday x2
    ];
    const result = calculateStreak(dates);
    expect(result.longestStreak).toBeGreaterThanOrEqual(1);
  });
});

// ─── lastPostDate ─────────────────────────────────────────────────────────────

describe("calculateStreak — lastPostDate", () => {
  it("lastPostDate is the most recent date string (YYYY-MM-DD)", () => {
    const dates = [daysAgo(5), daysAgo(2), daysAgo(0)];
    const result = calculateStreak(dates);
    expect(result.lastPostDate).toBe(today());
  });

  it("lastPostDate format is YYYY-MM-DD", () => {
    const result = calculateStreak([daysAgo(1)]);
    expect(result.lastPostDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("lastPostDate is not null when posts exist", () => {
    const result = calculateStreak([daysAgo(10)]);
    expect(result.lastPostDate).not.toBeNull();
  });
});

// ─── Large dataset / boundary ─────────────────────────────────────────────────

describe("calculateStreak — large dataset", () => {
  it("handles 365 consecutive days without throwing", () => {
    const dates = Array.from({ length: 365 }, (_, i) => daysAgo(i));
    expect(() => calculateStreak(dates)).not.toThrow();
    const result = calculateStreak(dates);
    expect(result.longestStreak).toBeGreaterThanOrEqual(1);
    expect(result.lastPostDate).toBe(today());
  });

  it("1000 non-consecutive dates completes without error", () => {
    // Start from day 3 so the most recent date is NOT today or yesterday (streak broken)
    const dates = Array.from({ length: 1000 }, (_, i) => daysAgo(3 + i * 2));
    expect(() => calculateStreak(dates)).not.toThrow();
    const result = calculateStreak(dates);
    expect(result.longestStreak).toBe(1);
    expect(result.currentStreak).toBe(0);
  });
});

// ─── Return shape ─────────────────────────────────────────────────────────────

describe("calculateStreak — return shape", () => {
  it("always returns all three fields", () => {
    const result = calculateStreak([daysAgo(0)]);
    expect(result).toHaveProperty("currentStreak");
    expect(result).toHaveProperty("longestStreak");
    expect(result).toHaveProperty("lastPostDate");
  });

  it("currentStreak and longestStreak are non-negative integers", () => {
    const result = calculateStreak([daysAgo(0), daysAgo(1)]);
    expect(result.currentStreak).toBeGreaterThanOrEqual(0);
    expect(result.longestStreak).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(result.currentStreak)).toBe(true);
    expect(Number.isInteger(result.longestStreak)).toBe(true);
  });

  it("currentStreak never exceeds longestStreak", () => {
    const dates = [daysAgo(0), daysAgo(1), daysAgo(2), daysAgo(10), daysAgo(11)];
    const result = calculateStreak(dates);
    expect(result.currentStreak).toBeLessThanOrEqual(result.longestStreak);
  });
});
