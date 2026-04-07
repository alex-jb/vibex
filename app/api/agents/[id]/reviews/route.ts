import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/supabase-server";
import { validateString } from "@/lib/validate";
import { USE_SUPABASE } from "@/lib/mock-adapter";

const MOCK_REVIEWS = [
  { id: "r1", agent_id: "agent-1", user_name: "PixelMaster", rating: 5, content: "Best code reviewer I've used!", created_at: new Date().toISOString() },
  { id: "r2", agent_id: "agent-1", user_name: "NeonHacker", rating: 4, content: "Great for Python, decent for Go.", created_at: new Date().toISOString() },
];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: agentId } = await params;

  if (!USE_SUPABASE) {
    const reviews = MOCK_REVIEWS.filter((r) => r.agent_id === agentId);
    const avg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    return NextResponse.json({ reviews, avgRating: avg, totalReviews: reviews.length });
  }

  const { data, error } = await supabase
    .from("agent_reviews")
    .select("*")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const reviews = data ?? [];
  const avg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return NextResponse.json({ reviews, avgRating: Math.round(avg * 10) / 10, totalReviews: reviews.length });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: agentId } = await params;

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { rating, content } = body as { rating?: number; content?: string };

  if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return NextResponse.json({ error: "Rating must be 1-5 integer" }, { status: 400 });
  }

  if (content) {
    const err = validateString(content, "content", { max: 1000 });
    if (err) return NextResponse.json({ error: err }, { status: 400 });
  }

  if (!USE_SUPABASE) {
    return NextResponse.json({ id: `review-${Date.now()}`, agent_id: agentId, rating }, { status: 201 });
  }

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const displayName = (user.user_metadata?.full_name as string) ?? user.email?.split("@")[0] ?? "User";

  const { data, error } = await supabase
    .from("agent_reviews")
    .insert({ agent_id: agentId, user_id: user.id, user_name: displayName, rating, content: content ?? null })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "You already reviewed this agent" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
