import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createServerSupabase, getAuthUser } from "@/lib/supabase-server";
import { USE_SUPABASE } from "@/lib/mock-adapter";

// ---------- GET: list notifications ----------
export async function GET() {
  if (!USE_SUPABASE) {
    return NextResponse.json({
      notifications: [
        {
          id: "notif-1",
          user_id: "u1",
          type: "mention",
          actor_id: "u2",
          actor_name: "CodeWizard",
          post_id: "post-1",
          read: false,
          created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        },
        {
          id: "notif-2",
          user_id: "u1",
          type: "reaction",
          actor_id: "u3",
          actor_name: "NeonHacker",
          post_id: "post-2",
          read: true,
          created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        },
      ],
    });
  }

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ notifications: data ?? [] });
}

// ---------- POST: mark read / mark all read ----------
export async function POST(request: Request) {
  if (!USE_SUPABASE) {
    return NextResponse.json({ success: true });
  }

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { action, ids } = body as { action?: string; ids?: string[] };

  const serverSupabase = await createServerSupabase();

  if (action === "markRead") {
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "markRead requires a non-empty ids array" },
        { status: 400 },
      );
    }

    const { error } = await serverSupabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .in("id", ids);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else if (action === "markAllRead") {
    const { error } = await serverSupabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    return NextResponse.json(
      { error: "Invalid action. Use 'markRead' or 'markAllRead'" },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true });
}
