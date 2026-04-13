import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { validateString, sanitize } from "@/lib/validate";
import { checkRateLimit } from "@/lib/rate-limit";
import { USE_SUPABASE } from "@/lib/mock-adapter";
import { createNotification } from "@/lib/db";

interface CommentRow {
  id: string;
  project_id: string;
  user_id: string;
  user_name: string;
  content: string;
  parent_id: string | null;
  likes: number;
  created_at: string;
}

const MOCK_COMMENTS: CommentRow[] = [
  {
    id: "c1",
    project_id: "1",
    user_id: "u1",
    user_name: "PixelMaster",
    content: "This project is amazing! The AI integration is seamless.",
    parent_id: null,
    likes: 12,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c2",
    project_id: "1",
    user_id: "u2",
    user_name: "CodeWizard",
    content: "Love the vibe coding approach. How did you handle the prompt engineering?",
    parent_id: null,
    likes: 8,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c3",
    project_id: "1",
    user_id: "u3",
    user_name: "AITrainer",
    content: "Great question! I used chain-of-thought prompting with few-shot examples.",
    parent_id: "c2",
    likes: 3,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c4",
    project_id: "1",
    user_id: "u4",
    user_name: "NeonHacker",
    content: "Shipped this to my team, everyone loved it. Keep building!",
    parent_id: null,
    likes: 5,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json(
      { error: "Missing required query parameter: projectId" },
      { status: 400 },
    );
  }

  if (!USE_SUPABASE) {
    const filtered = MOCK_COMMENTS.filter((c) => c.project_id === projectId);
    return NextResponse.json(filtered);
  }

  const { data, error } = await supabase
    .from("comments")
    .select("id, project_id, user_id, user_name, content, parent_id, likes, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await checkRateLimit(`${ip}:comments-post`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
    );
  }

  if (!USE_SUPABASE) {
    return NextResponse.json(
      { error: "Comments are not available: Supabase is not configured" },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { userId, userName, content, projectId, parentId } = body as {
    userId?: string;
    userName?: string;
    content?: string;
    projectId?: string;
    parentId?: string;
  };

  const errors: string[] = [];
  const userIdErr = validateString(userId, "userId");
  if (userIdErr) errors.push(userIdErr);
  const userNameErr = validateString(userName, "userName");
  if (userNameErr) errors.push(userNameErr);
  const contentErr = validateString(content, "content", { min: 1, max: 2000 });
  if (contentErr) errors.push(contentErr);
  const projectIdErr = validateString(projectId, "projectId");
  if (projectIdErr) errors.push(projectIdErr);

  if (errors.length > 0) {
    return NextResponse.json(
      { error: errors.join("; ") },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      project_id: projectId,
      user_id: userId,
      user_name: userName,
      content: sanitize(content!.trim()),
      parent_id: parentId ?? null,
      likes: 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }

  // Notify the project owner about the new comment (best-effort, non-blocking)
  try {
    const { data: project } = await supabase
      .from("projects")
      .select("creator_id")
      .eq("id", projectId)
      .single();

    if (project?.creator_id && project.creator_id !== userId) {
      await createNotification({
        userId: project.creator_id as string,
        type: parentId ? "reply" : "comment",
        title: `${userName} commented on your project`,
        body: sanitize(content!.trim()).slice(0, 100),
        link: `/project/${projectId}`,
        actorName: userName as string,
        projectId: projectId as string,
      });
    }
  } catch {
    // Notification failure should not block the comment response
  }

  return NextResponse.json(data, { status: 201 });
}
