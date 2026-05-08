import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  scrapeReddit,
  scrapeHackerNews,
  scrapeDevTo,
  scrapeBluesky,
  scrapeX,
  scrapeForPlatform,
  SUPPORTED_SCRAPER_PLATFORMS,
} from "../engagement-scrapers";

describe("engagement-scrapers", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function mockJson(body: unknown, ok = true) {
    fetchSpy.mockResolvedValueOnce({
      ok,
      json: async () => body,
    });
  }

  describe("scrapeReddit", () => {
    it("returns null for non-Reddit URL", async () => {
      expect(await scrapeReddit("https://example.com")).toBeNull();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("parses Reddit JSON response", async () => {
      mockJson([
        {
          data: {
            children: [
              { data: { score: 42, num_comments: 7 } },
            ],
          },
        },
      ]);
      const got = await scrapeReddit(
        "https://www.reddit.com/r/SideProject/comments/abc123/my_post/",
      );
      expect(got).toEqual({ views: 0, likes: 42, comments: 7 });
    });

    it("appends .json to clean URL", async () => {
      mockJson([{ data: { children: [{ data: { score: 1, num_comments: 0 } }] } }]);
      await scrapeReddit("https://www.reddit.com/r/AI/comments/xyz/title/");
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining(".json"),
        expect.any(Object),
      );
    });
  });

  describe("scrapeHackerNews", () => {
    it("returns null when id missing", async () => {
      expect(await scrapeHackerNews("https://news.ycombinator.com/")).toBeNull();
    });

    it("counts nested children", async () => {
      mockJson({
        points: 12,
        children: [
          { children: [] },
          { children: [{ children: [] }] },
        ],
      });
      const got = await scrapeHackerNews(
        "https://news.ycombinator.com/item?id=12345",
      );
      // 2 top-level + 1 nested = 3 comments
      expect(got).toEqual({ views: 0, likes: 12, comments: 3 });
    });
  });

  describe("scrapeDevTo", () => {
    it("returns null on URL without slug", async () => {
      expect(await scrapeDevTo("https://dev.to/")).toBeNull();
    });

    it("extracts page_views_count and reactions", async () => {
      mockJson({
        page_views_count: 5000,
        positive_reactions_count: 33,
        comments_count: 4,
      });
      const got = await scrapeDevTo(
        "https://dev.to/alexji/my-article-slug-abc",
      );
      expect(got).toEqual({ views: 5000, likes: 33, comments: 4 });
    });
  });

  describe("scrapeBluesky", () => {
    it("returns null for non-Bluesky URL", async () => {
      expect(await scrapeBluesky("https://twitter.com/foo/status/1")).toBeNull();
    });

    it("resolves handle and reads thread counts", async () => {
      mockJson({ did: "did:plc:abc123" }); // resolveHandle
      mockJson({
        thread: {
          post: { likeCount: 11, replyCount: 3 },
        },
      });
      const got = await scrapeBluesky(
        "https://bsky.app/profile/alex.bsky.social/post/3kqwerty",
      );
      expect(got).toEqual({ views: 0, likes: 11, comments: 3 });
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it("skips handle resolve when already a DID", async () => {
      mockJson({
        thread: { post: { likeCount: 5, replyCount: 1 } },
      });
      await scrapeBluesky(
        "https://bsky.app/profile/did:plc:already/post/abc",
      );
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("scrapeX", () => {
    it("returns null for non-X URL", async () => {
      expect(await scrapeX("https://example.com")).toBeNull();
    });

    it("parses syndication response with views", async () => {
      mockJson({
        favorite_count: 88,
        conversation_count: 9,
        views: { count: 12345 },
      });
      const got = await scrapeX("https://twitter.com/alex/status/9876");
      expect(got).toEqual({ views: 12345, likes: 88, comments: 9 });
    });

    it("accepts x.com host", async () => {
      mockJson({ favorite_count: 1, conversation_count: 0 });
      const got = await scrapeX("https://x.com/alex/status/9876");
      expect(got).toEqual({ views: 0, likes: 1, comments: 0 });
    });
  });

  describe("scrapeForPlatform", () => {
    it("returns null for unsupported platform", async () => {
      expect(
        await scrapeForPlatform("xiaohongshu", "https://example.com"),
      ).toBeNull();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("dispatches to correct scraper", async () => {
      mockJson([{ data: { children: [{ data: { score: 99, num_comments: 0 } }] } }]);
      const got = await scrapeForPlatform(
        "reddit",
        "https://reddit.com/r/test/comments/abc/",
      );
      expect(got?.likes).toBe(99);
    });
  });

  describe("network failure handling", () => {
    it("returns null when fetch rejects", async () => {
      fetchSpy.mockRejectedValueOnce(new Error("network down"));
      const got = await scrapeDevTo("https://dev.to/foo/bar");
      expect(got).toBeNull();
    });

    it("returns null on non-2xx response", async () => {
      fetchSpy.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
      const got = await scrapeDevTo("https://dev.to/foo/bar");
      expect(got).toBeNull();
    });
  });

  it("SUPPORTED_SCRAPER_PLATFORMS lists the 5 platforms", () => {
    expect(SUPPORTED_SCRAPER_PLATFORMS.sort()).toEqual([
      "bluesky",
      "dev_to",
      "hacker_news",
      "reddit",
      "x",
    ]);
  });
});
