import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ---------- GET: list notifications ----------
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "Missing required query param: userId" },
      { status: 400 },
    );
  }

  if (!SUPABASE_CONFIGURED) {
    return NextResponse.json({ notifications: [] });
  }

  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    return NextResponse.json({ notifications: data ?? [] });
  } catch (error) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}

// ---------- POST: mark read / mark all read ----------
export async function POST(request: Request) {
  const body = await request.json();
  const { action, userId, ids } = body;

  if (!userId) {
    return NextResponse.json(
      { error: "Missing required field: userId" },
      { status: 400 },
    );
  }

  if (!SUPABASE_CONFIGURED) {
    return NextResponse.json({ success: true });
  }

  try {
    if (action === "markRead") {
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json(
          { error: "markRead requires a non-empty ids array" },
          { status: 400 },
        );
      }

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .in("id", ids);

      if (error) throw error;
    } else if (action === "markAllRead") {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false);

      if (error) throw error;
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'markRead' or 'markAllRead'" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notification update error:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 },
    );
  }
}
