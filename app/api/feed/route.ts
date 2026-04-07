import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { validateString, sanitize } from "@/lib/validate";
import { checkRateLimit } from "@/lib/rate-limit";

const USE_SUPABASE = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

interface PostRow {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  content: string;
  project_id: string | null;
  parent_id: string | null;
  likes: number;
  replies_count: number;
  reposts: number;
  created_at: string;
}

const MOCK_POSTS: PostRow[] = [
  {
    id: "post-1",
    user_id: "u1",
    user_name: "PixelMaster",
    user_avatar: null,
    content: "Just shipped my first vibe-coded RPG battle system! The AI generated balanced stats on the first try.",
    project_id: "1",
    parent_id: null,
    likes: 24,
    replies_count: 5,
    reposts: 3,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "post-2",
    user_id: "u2",
    user_name: "CodeWizard",
    user_avatar: null,
    content: "Hot take: vibe coding is the future of game dev. Fight me.",
    project_id: null,
    parent_id: null,
    likes: 42,
    replies_count: 12,
    reposts: 8,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-3",
    user_id: "u3",
    user_name: "NeonHacker",
    user_avatar: null,
    content: "My AI agent just evolved to level 5! The evolution mechanic in VibeCode Hunt is addictive.",
    project_id: "2",
    parent_id: null,
    likes: 18,
    replies_count: 3,
    reposts: 1,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-4",
    user_id: "u4",
    user_name: "RetroQueen",
    user_avatar: null,
    content: "Anyone else notice the 16-bit aesthetic pairs perfectly with procedural generation? Sharing my tileset generator soon.",
    project_id: null,
    parent_id: null,
    likes: 31,
    replies_count: 7,
    reposts: 5,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-5",
    user_id: "u5",
    user_name: "AITrainer",
    user_avatar: null,
    content: "Tip: use chain-of-thought prompting when generating NPC dialogue. The results are way more natural.",
    project_id: "3",
    parent_id: null,
    likes: 15,
    replies_count: 2,
    reposts: 4,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-6",
    user_id: "u6",
    user_name: "SpriteKing",
    user_avatar: null,
    content: "Just launched a marketplace listing for my pixel art pack. 200+ sprites, all AI-assisted. Link in my profile!",
    project_id: null,
    parent_id: null,
    likes: 9,
    replies_count: 1,
    reposts: 2,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab") || "latest";
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (!USE_SUPABASE) {
    let sorted: PostRow[];
    if (tab === "trending") {
      sorted = [...MOCK_POSTS].sort((a, b) => b.likes - a.likes);
    } else {
      sorted = [...MOCK_POSTS].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }
    return NextResponse.json(sorted.slice(offset, offset + 20));
  }

  let query = supabase
    .from("posts")
    .select("*")
    .is("parent_id", null)
    .range(offset, offset + 19);

  if (tab === "trending") {
    query = query
      .order("likes", { ascending: false })
      .order("created_at", { ascending: false });
  } else if (tab === "following") {
    // For "following" tab we need the user's followed creators.
    // Extract userId from query params (client passes it).
    const userId = searchParams.get("userId");
    if (userId) {
      const { data: followedIds } = await supabase
        .from("follows")
        .select("creator_id")
        .eq("follower_id", userId);

      if (followedIds && followedIds.length > 0) {
        const ids = followedIds.map((f: { creator_id: string }) => f.creator_id);
        query = query.in("user_id", ids);
      } else {
        // No follows yet — return empty
        return NextResponse.json([]);
      }
    }
    query = query.order("created_at", { ascending: false });
  } else {
    // latest
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

  const { userId, userName, userAvatar, content, projectId } = body as {
    userId?: string;
    userName?: string;
    userAvatar?: string;
    content?: string;
    projectId?: string;
  };

  // Validate required fields
  const errors: string[] = [];
  const contentErr = validateString(content, "content", { min: 1, max: 500 });
  if (contentErr) errors.push(contentErr);
  const userIdErr = validateString(userId, "userId");
  if (userIdErr) errors.push(userIdErr);
  const userNameErr = validateString(userName, "userName");
  if (userNameErr) errors.push(userNameErr);

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
  }

  if (!USE_SUPABASE) {
    // Mock: return a fake created post
    const mockPost: PostRow = {
      id: `post-${Date.now()}`,
      user_id: userId!,
      user_name: userName!,
      user_avatar: userAvatar ?? null,
      content: sanitize(content!.trim()),
      project_id: projectId ?? null,
      parent_id: null,
      likes: 0,
      replies_count: 0,
      reposts: 0,
      created_at: new Date().toISOString(),
    };
    return NextResponse.json(mockPost, { status: 201 });
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      user_id: userId,
      user_name: userName,
      user_avatar: userAvatar ?? null,
      content: sanitize(content!.trim()),
      project_id: projectId ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
