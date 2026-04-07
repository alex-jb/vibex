import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createServerSupabase, getAuthUser } from "@/lib/supabase-server";
import { USE_SUPABASE } from "@/lib/mock-adapter";

// GET: list messages in a conversation
export async function GET(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { conversationId } = await params;
  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (!USE_SUPABASE) {
    return NextResponse.json({
      messages: [
        { id: "msg-1", sender_name: "CodeWizard", sender_id: "u2", content: "Hey, loved your latest project!", read: true, created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
        { id: "msg-2", sender_name: "You", sender_id: "u1", content: "Thanks! Working on something new.", read: true, created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
        { id: "msg-3", sender_name: "CodeWizard", sender_id: "u2", content: "Can't wait to see it!", read: false, created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
      ],
    });
  }

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("dm_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .range(offset, offset + 49);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mark unread messages as read
  const unreadIds = (data ?? [])
    .filter((m) => !m.read && m.sender_id !== user.id)
    .map((m) => m.id);

  if (unreadIds.length > 0) {
    const serverSupabase = await createServerSupabase();
    await serverSupabase
      .from("dm_messages")
      .update({ read: true })
      .in("id", unreadIds);
  }

  return NextResponse.json({ messages: data ?? [] });
}
