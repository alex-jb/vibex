import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createServerSupabase, getAuthUser } from "@/lib/supabase-server";
import { validateString, sanitize } from "@/lib/validate";
import { USE_SUPABASE } from "@/lib/mock-adapter";

// GET: list conversations for current user
export async function GET() {
  if (!USE_SUPABASE) {
    return NextResponse.json({
      conversations: [
        {
          id: "conv-1",
          other_user_name: "CodeWizard",
          other_user_id: "u2",
          last_message: "Hey, loved your latest project!",
          last_message_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          unread: 2,
        },
        {
          id: "conv-2",
          other_user_name: "RetroQueen",
          other_user_id: "u4",
          last_message: "Want to collab on a pixel art pack?",
          last_message_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          unread: 0,
        },
      ],
    });
  }

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // Get conversations where user is a participant
  const { data, error } = await supabase
    .from("dm_conversations")
    .select("*")
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ conversations: data ?? [] });
}

// POST: send a message to another user
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { recipientId, content } = body as { recipientId?: string; content?: string };

  if (!recipientId) {
    return NextResponse.json({ error: "recipientId required" }, { status: 400 });
  }

  const contentErr = validateString(content, "content", { min: 1, max: 2000 });
  if (contentErr) {
    return NextResponse.json({ error: contentErr }, { status: 400 });
  }

  if (!USE_SUPABASE) {
    return NextResponse.json({
      id: `msg-${Date.now()}`,
      conversation_id: "conv-new",
      content: sanitize(content!.trim()),
      created_at: new Date().toISOString(),
    }, { status: 201 });
  }

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (user.id === recipientId) {
    return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
  }

  // Get or create conversation
  const { data: convId, error: convError } = await supabase.rpc("get_or_create_conversation", {
    p_user_a: user.id,
    p_user_b: recipientId,
  });

  if (convError || !convId) {
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }

  const displayName = (user.user_metadata?.full_name as string) ?? user.email?.split("@")[0] ?? "User";

  const serverSupabase = await createServerSupabase();
  const { data: msg, error: msgError } = await serverSupabase
    .from("dm_messages")
    .insert({
      conversation_id: convId,
      sender_id: user.id,
      sender_name: displayName,
      content: sanitize(content!.trim()),
    })
    .select()
    .single();

  if (msgError) {
    return NextResponse.json({ error: msgError.message }, { status: 500 });
  }

  // Update conversation last_message_at
  await supabase
    .from("dm_conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", convId);

  return NextResponse.json(msg, { status: 201 });
}
