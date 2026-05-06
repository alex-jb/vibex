/**
 * /api/ph-state — read-only PH GraphQL proxy for the on-page countdown widget.
 *
 * Why a server route: we hold PH_DEV_TOKEN, never expose it to the browser.
 * The route returns ONLY the public-safe fields (votes / comments / rank)
 * so leaking this endpoint at most leaks our own launch's public stats.
 *
 * Cache for 30s — PH GraphQL rate-limits at 1k req/15min and the widget
 * polls every 30-60s per visitor, so caching turns a viral launch into
 * a constant-cost call regardless of concurrent visitors.
 */
import { NextResponse } from "next/server";

export const runtime = "edge";
export const revalidate = 30;

const PH_GRAPHQL = "https://api.producthunt.com/v2/api/graphql";

type PhEdge = { node?: { slug?: string; votesCount?: number } };
type PhResponse = {
  data?: {
    post?: {
      votesCount?: number;
      commentsCount?: number;
      featuredAt?: string | null;
      url?: string;
    };
    posts?: { edges?: PhEdge[] };
  };
};

const QUERY = `
  query Launch($slug: String!) {
    post(slug: $slug) {
      votesCount
      commentsCount
      featuredAt
      url
    }
    posts(order: VOTES, first: 30) {
      edges { node { slug votesCount } }
    }
  }
`;

export async function GET(): Promise<NextResponse> {
  const slug = process.env.PH_LAUNCH_SLUG;
  const token = process.env.PH_DEV_TOKEN;
  if (!slug || !token) {
    // Not configured — return a quiet "off" state so the widget hides itself.
    return NextResponse.json(
      { configured: false },
      { status: 200, headers: { "Cache-Control": "public, s-maxage=300" } },
    );
  }

  let data: PhResponse;
  try {
    const r = await fetch(PH_GRAPHQL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: QUERY, variables: { slug } }),
      // Edge runtime supports `next.revalidate` here
      next: { revalidate: 30 },
    });
    if (!r.ok) throw new Error(`PH ${r.status}`);
    data = await r.json();
  } catch {
    return NextResponse.json(
      { configured: true, error: "ph_unreachable" },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }

  const post = data?.data?.post;
  if (!post) {
    return NextResponse.json(
      { configured: true, error: "post_not_found" },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }

  const edges = data?.data?.posts?.edges ?? [];
  const rankIdx = edges.findIndex((e: PhEdge) => e?.node?.slug === slug);
  const rank = rankIdx >= 0 ? rankIdx + 1 : null;

  return NextResponse.json(
    {
      configured: true,
      slug,
      url: post.url ?? `https://www.producthunt.com/posts/${slug}`,
      votes: post.votesCount ?? 0,
      comments: post.commentsCount ?? 0,
      rank,
      featuredAt: post.featuredAt ?? null,
    },
    {
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" },
    },
  );
}
