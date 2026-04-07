import { describe, it, expect } from "vitest";
import { MOCK_POSTS, type MockPostRow } from "../mock-data/feed";
import { USE_SUPABASE } from "../mock-adapter";
import { validateString, sanitize } from "../validate";

// ─── Mock Data Tests ───

describe("MOCK_POSTS", () => {
  it("has 6 posts", () => {
    expect(MOCK_POSTS).toHaveLength(6);
  });

  it("all posts have required fields", () => {
    for (const post of MOCK_POSTS) {
      expect(post.id).toBeTruthy();
      expect(post.user_id).toBeTruthy();
      expect(post.user_name).toBeTruthy();
      expect(post.content).toBeTruthy();
      expect(post.created_at).toBeTruthy();
      expect(typeof post.likes).toBe("number");
      expect(typeof post.replies_count).toBe("number");
      expect(typeof post.reposts).toBe("number");
    }
  });

  it("all posts have null parent_id (top-level)", () => {
    for (const post of MOCK_POSTS) {
      expect(post.parent_id).toBeNull();
    }
  });

  it("posts have unique IDs", () => {
    const ids = MOCK_POSTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("some posts have project_id, some don't", () => {
    const withProject = MOCK_POSTS.filter((p) => p.project_id !== null);
    const withoutProject = MOCK_POSTS.filter((p) => p.project_id === null);
    expect(withProject.length).toBeGreaterThan(0);
    expect(withoutProject.length).toBeGreaterThan(0);
  });
});

// ─── Mock Adapter Tests ───

describe("USE_SUPABASE", () => {
  it("is false when env vars are not set", () => {
    // In test environment, NEXT_PUBLIC_SUPABASE_URL is not set
    expect(USE_SUPABASE).toBe(false);
  });
});

// ─── Feed Content Validation Tests ───

describe("Feed content validation", () => {
  it("rejects empty content", () => {
    expect(validateString("", "content", { min: 1, max: 500 })).not.toBeNull();
  });

  it("rejects content over 500 chars", () => {
    const long = "a".repeat(501);
    expect(validateString(long, "content", { min: 1, max: 500 })).not.toBeNull();
  });

  it("accepts valid content", () => {
    expect(validateString("Hello world", "content", { min: 1, max: 500 })).toBeNull();
  });

  it("accepts content at exactly 500 chars", () => {
    const exact = "a".repeat(500);
    expect(validateString(exact, "content", { min: 1, max: 500 })).toBeNull();
  });

  it("rejects whitespace-only content", () => {
    expect(validateString("   ", "content", { min: 1, max: 500 })).not.toBeNull();
  });

  it("rejects null content", () => {
    expect(validateString(null, "content", { min: 1, max: 500 })).not.toBeNull();
  });

  it("rejects undefined content", () => {
    expect(validateString(undefined, "content", { min: 1, max: 500 })).not.toBeNull();
  });

  it("rejects number content", () => {
    expect(validateString(123 as unknown, "content", { min: 1, max: 500 })).not.toBeNull();
  });
});

// ─── Sanitization Tests ───

describe("Feed content sanitization", () => {
  it("escapes HTML tags", () => {
    expect(sanitize("<script>alert('xss')</script>")).not.toContain("<script>");
  });

  it("escapes ampersands", () => {
    expect(sanitize("A & B")).toBe("A &amp; B");
  });

  it("escapes quotes", () => {
    expect(sanitize('"hello"')).toBe("&quot;hello&quot;");
  });

  it("preserves normal text", () => {
    expect(sanitize("Hello world 123")).toBe("Hello world 123");
  });

  it("handles emoji content", () => {
    const input = "Great post! 🔥🎮🎨";
    expect(sanitize(input)).toBe(input);
  });
});

// ─── Mock Post Sorting Tests ───

describe("Mock post sorting", () => {
  it("trending sort orders by likes descending", () => {
    const sorted = [...MOCK_POSTS].sort((a, b) => b.likes - a.likes);
    expect(sorted[0].likes).toBeGreaterThanOrEqual(sorted[1].likes);
    expect(sorted[1].likes).toBeGreaterThanOrEqual(sorted[2].likes);
  });

  it("latest sort orders by created_at descending", () => {
    const sorted = [...MOCK_POSTS].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    for (let i = 1; i < sorted.length; i++) {
      expect(new Date(sorted[i - 1].created_at).getTime()).toBeGreaterThanOrEqual(
        new Date(sorted[i].created_at).getTime(),
      );
    }
  });

  it("pagination slices correctly", () => {
    const page1 = MOCK_POSTS.slice(0, 3);
    const page2 = MOCK_POSTS.slice(3, 6);
    expect(page1).toHaveLength(3);
    expect(page2).toHaveLength(3);
    expect(page1[0].id).not.toBe(page2[0].id);
  });

  it("offset beyond length returns empty", () => {
    const beyond = MOCK_POSTS.slice(100, 120);
    expect(beyond).toHaveLength(0);
  });
});

// ─── Post Deduplication Logic Tests ───

describe("Post deduplication", () => {
  it("filters duplicate by ID", () => {
    const existing: MockPostRow[] = [MOCK_POSTS[0], MOCK_POSTS[1]];
    const incoming = MOCK_POSTS[0]; // duplicate

    const deduped = existing.some((p) => p.id === incoming.id);
    expect(deduped).toBe(true);
  });

  it("allows new post with unique ID", () => {
    const existing: MockPostRow[] = [MOCK_POSTS[0], MOCK_POSTS[1]];
    const incoming: MockPostRow = { ...MOCK_POSTS[2], id: "post-new-unique" };

    const isDuplicate = existing.some((p) => p.id === incoming.id);
    expect(isDuplicate).toBe(false);
  });
});

// ─── Rate Limiting Tests ───

describe("Feed rate limiting", () => {
  // Import inline to avoid module-level side effects
  it("allows first request", async () => {
    const { checkRateLimit } = await import("../rate-limit");
    const key = `test-${Date.now()}`;
    const result = checkRateLimit(key, 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks after limit exceeded", async () => {
    const { checkRateLimit } = await import("../rate-limit");
    const key = `test-block-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key, 5, 60_000);
    }
    const result = checkRateLimit(key, 5, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });
});
