import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createServerSupabase, getAuthUser } from "@/lib/supabase-server";
import { validateString, sanitize } from "@/lib/validate";
import { checkRateLimit } from "@/lib/rate-limit";
import { USE_SUPABASE } from "@/lib/mock-adapter";
import { MOCK_POSTS, type MockPostRow } from "@/lib/mock-data/feed";

/** Extract #hashtags from content (lowercase, unique) */
function extractHashtags(text: string): string[] {
  const matches = text.match(/#(\w{2,30})/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.slice(1).toLowerCase()))];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab") || "latest";
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const tag = searchParams.get("tag");

  if (!USE_SUPABASE) {
    let sorted: MockPostRow[];
    if (tab === "trending") {
      sorted = [...MOCK_POSTS].sort((a, b) => b.likes - a.likes);
    } else {
      sorted = [...MOCK_POSTS].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }
    return NextResponse.json(sorted.slice(offset, offset + 20));
  }

  let query = supabase
    .from("posts")
    .select("*")
    .is("parent_id", null)
    .in("moderation_status", ["active", "flagged"])
    .range(offset, offset + 19);

  // Filter by hashtag if specified
  if (tag) {
    query = query.contains("hashtags", [tag]);
  }

  if (tab === "trending") {
    // Use algorithmic feed view for trending tab
    const { data: algoData, error: algoError } = await supabase
      .from("algorithmic_feed")
      .select("*")
      .range(offset, offset + 19);

    if (algoError) {
      // Fallback to simple likes sort if view doesn't exist
      query = query
        .order("likes", { ascending: false })
        .order("created_at", { ascending: false });
    } else {
      return NextResponse.json(algoData ?? []);
    }
  } else if (tab === "following") {
    // Server-side auth: extract userId from session, not query param
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json([]);
    }

    const { data: followedIds } = await supabase
      .from("follows")
      .select("creator_id")
      .eq("follower_id", user.id);

    if (followedIds && followedIds.length > 0) {
      const ids = followedIds.map(
        (f: { creator_id: string }) => f.creator_id,
      );
      query = query.in("user_id", ids);
    } else {
      return NextResponse.json([]);
    }
    query = query.order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit(`${ip}:feed-post`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { content, projectId, mediaUrl, mediaType } = body as {
    content?: string;
    projectId?: string;
    mediaUrl?: string;
    mediaType?: "image" | "gif";
  };

  // Validate content
  const contentErr = validateString(content, "content", { min: 1, max: 500 });
  if (contentErr) {
    return NextResponse.json({ error: contentErr }, { status: 400 });
  }

  if (!USE_SUPABASE) {
    // Mock: return a fake created post using provided identity
    const { userId, userName, userAvatar } = body as {
      userId?: string;
      userName?: string;
      userAvatar?: string;
    };
    const mockPost: MockPostRow = {
      id: `post-${Date.now()}`,
      user_id: userId ?? "mock-user",
      user_name: userName ?? "MockUser",
      user_avatar: userAvatar ?? null,
      content: sanitize(content!.trim()),
      project_id: projectId ?? null,
      parent_id: null,
      likes: 0,
      replies_count: 0,
      reposts: 0,
      created_at: new Date().toISOString(),
      media_url: mediaUrl ?? null,
      media_type: mediaType ?? null,
      hashtags: extractHashtags(content!),
    };
    return NextResponse.json(mockPost, { status: 201 });
  }

  // Server-side auth: extract user from session
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  const displayName =
    (user.user_metadata?.full_name as string) ??
    (user.user_metadata?.name as string) ??
    user.email?.split("@")[0] ??
    "User";

  const serverSupabase = await createServerSupabase();
  const { data, error } = await serverSupabase
    .from("posts")
    .insert({
      user_id: user.id,
      user_name: displayName,
      user_avatar: user.user_metadata?.avatar_url ?? null,
      content: sanitize(content!.trim()),
      project_id: projectId ?? null,
      media_url: mediaUrl ?? null,
      media_type: mediaType ?? null,
      hashtags: extractHashtags(content!),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
