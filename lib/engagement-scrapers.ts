/**
 * lib/engagement-scrapers.ts — read engagement metrics from public
 * platform endpoints by URL.
 *
 * Used by /api/cron/scrape-engagement to refresh project_drafts.views /
 * likes / comments after a creator marks a draft posted and pastes
 * the published URL.
 *
 * Strategy: prefer official public-read APIs that don't require auth.
 * Per-platform notes:
 *   - reddit: https://www.reddit.com/r/X/comments/Y/.json (UA required)
 *   - hacker_news: HN Algolia API
 *   - dev_to: dev.to public articles API
 *   - bluesky: AT Protocol public xrpc endpoints
 *   - x: Twitter syndication CDN (the embed system, no auth)
 *
 * Other platforms (linkedin, threads, producthunt, xiaohongshu, jike,
 * zhihu, bilibili) need auth or unstable scrapers — return null. Creator
 * can enter views/likes manually later or we'll add per-platform scrapers
 * as we have signal that creators care.
 *
 * Failure mode: every fn returns null on parse/network errors. Cron
 * route logs but doesn't crash on a single bad URL.
 */

export type EngagementMetrics = {
  views: number;
  likes: number;
  comments: number;
};

const UA =
  "Mozilla/5.0 (compatible; VibeXForge/1.0; +https://vibexforge.com)";

async function fetchJson(
  url: string,
  headers: Record<string, string> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any | null> {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, accept: "application/json", ...headers },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function scrapeReddit(
  url: string,
): Promise<EngagementMetrics | null> {
  // Forms accepted:
  //   https://www.reddit.com/r/X/comments/abc123/slug/
  //   https://reddit.com/r/X/comments/abc123/
  //   https://old.reddit.com/r/X/comments/abc123/
  if (!/reddit\.com\/r\/[^/]+\/comments\/[a-z0-9]+/i.test(url)) return null;
  const cleaned = url.replace(/\/?$/, "").replace(/\.json$/, "") + ".json";
  const data = await fetchJson(cleaned);
  if (!Array.isArray(data) || !data[0]) return null;
  const post = data[0]?.data?.children?.[0]?.data;
  if (!post) return null;
  return {
    views: 0, // Reddit doesn't expose view count publicly
    likes: post.score ?? 0,
    comments: post.num_comments ?? 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function countHnComments(item: any): number {
  if (!item) return 0;
  let n = 0;
  for (const c of item.children || []) n += 1 + countHnComments(c);
  return n;
}

export async function scrapeHackerNews(
  url: string,
): Promise<EngagementMetrics | null> {
  const m = url.match(/[?&]id=(\d+)/);
  if (!m) return null;
  const id = m[1];
  const data = await fetchJson(`https://hn.algolia.com/api/v1/items/${id}`);
  if (!data) return null;
  return {
    views: 0,
    likes: data.points ?? 0,
    comments: countHnComments(data),
  };
}

export async function scrapeDevTo(
  url: string,
): Promise<EngagementMetrics | null> {
  // https://dev.to/{username}/{slug-with-hash}
  const m = url.match(/dev\.to\/([^/]+)\/([^/?#]+)/i);
  if (!m) return null;
  const data = await fetchJson(
    `https://dev.to/api/articles/${m[1]}/${m[2]}`,
  );
  if (!data) return null;
  return {
    views: data.page_views_count ?? 0,
    likes: data.positive_reactions_count ?? 0,
    comments: data.comments_count ?? 0,
  };
}

export async function scrapeBluesky(
  url: string,
): Promise<EngagementMetrics | null> {
  // https://bsky.app/profile/{handle-or-did}/post/{rkey}
  const m = url.match(/bsky\.app\/profile\/([^/]+)\/post\/([^/?#]+)/i);
  if (!m) return null;
  let did = m[1];
  if (!did.startsWith("did:")) {
    const resolved = await fetchJson(
      `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(did)}`,
    );
    did = resolved?.did;
    if (!did) return null;
  }
  const uri = `at://${did}/app.bsky.feed.post/${m[2]}`;
  const data = await fetchJson(
    `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(uri)}&depth=0`,
  );
  const post = data?.thread?.post;
  if (!post) return null;
  return {
    views: 0,
    likes: post.likeCount ?? 0,
    comments: post.replyCount ?? 0,
  };
}

export async function scrapeX(
  url: string,
): Promise<EngagementMetrics | null> {
  // https://twitter.com/{user}/status/{id} or x.com/...
  const m = url.match(/(?:twitter|x)\.com\/[^/]+\/status\/(\d+)/i);
  if (!m) return null;
  const id = m[1];
  // Twitter syndication CDN — what oEmbed embeds use, no auth.
  // The token "4" works for any tweet id in this endpoint.
  const data = await fetchJson(
    `https://cdn.syndication.twimg.com/tweet-result?id=${id}&lang=en&token=4`,
  );
  if (!data) return null;
  return {
    views: data.views?.count ?? 0,
    likes: data.favorite_count ?? 0,
    comments: data.conversation_count ?? 0,
  };
}

const SCRAPERS: Record<
  string,
  (url: string) => Promise<EngagementMetrics | null>
> = {
  reddit: scrapeReddit,
  hacker_news: scrapeHackerNews,
  dev_to: scrapeDevTo,
  bluesky: scrapeBluesky,
  x: scrapeX,
};

export async function scrapeForPlatform(
  platform: string,
  url: string,
): Promise<EngagementMetrics | null> {
  const fn = SCRAPERS[platform];
  if (!fn) return null;
  return fn(url);
}

export const SUPPORTED_SCRAPER_PLATFORMS = Object.keys(SCRAPERS);
