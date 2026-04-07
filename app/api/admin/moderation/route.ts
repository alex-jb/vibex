import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createServerSupabase, getAuthUser } from "@/lib/supabase-server";
import { USE_SUPABASE } from "@/lib/mock-adapter";

// Hardcoded admin IDs (replace with a proper admin table in production)
const ADMIN_IDS = new Set(process.env.ADMIN_USER_IDS?.split(",") ?? []);

async function requireAdmin() {
  if (!USE_SUPABASE) return { admin: true, userId: "admin" };
  const user = await getAuthUser();
  if (!user) return { admin: false, userId: null };
  if (!ADMIN_IDS.has(user.id)) return { admin: false, userId: user.id };
  return { admin: true, userId: user.id };
}

// GET: moderation queue (flagged posts + pending reports)
export async function GET() {
  if (!USE_SUPABASE) {
    return NextResponse.json({
      flaggedPosts: [
        { id: "post-flagged-1", content: "Spam content here...", user_name: "BadUser", moderation_status: "flagged", report_count: 3 },
      ],
      pendingReports: [
        { id: "report-1", post_id: "post-flagged-1", reason: "spam", reporter_id: "u1", status: "pending", created_at: new Date().toISOString() },
      ],
      stats: { totalFlagged: 1, totalPending: 1, totalActioned: 5, totalDismissed: 12 },
    });
  }

  const { admin } = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const [flaggedResult, reportsResult] = await Promise.all([
    supabase
      .from("posts")
      .select("*")
      .in("moderation_status", ["flagged"])
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("post_reports")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  return NextResponse.json({
    flaggedPosts: flaggedResult.data ?? [],
    pendingReports: reportsResult.data ?? [],
  });
}

// POST: moderation action (approve, hide, remove, ban user)
export async function POST(request: Request) {
  const { admin, userId } = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { action, postId, reportIds, targetUserId, banReason, banDuration } = body as {
    action?: string;
    postId?: string;
    reportIds?: string[];
    targetUserId?: string;
    banReason?: string;
    banDuration?: number; // hours, null = permanent
  };

  if (!USE_SUPABASE) {
    return NextResponse.json({ success: true, action });
  }

  const serverSupabase = await createServerSupabase();

  switch (action) {
    case "approve": {
      // Mark post as active, dismiss related reports
      if (postId) {
        await supabase.from("posts").update({ moderation_status: "active" }).eq("id", postId);
        await supabase.from("post_reports").update({ status: "dismissed", reviewed_at: new Date().toISOString() }).eq("post_id", postId);
      }
      return NextResponse.json({ success: true, action: "approved" });
    }

    case "hide": {
      if (postId) {
        await supabase.from("posts").update({ moderation_status: "hidden" }).eq("id", postId);
        await supabase.from("post_reports").update({ status: "actioned", reviewed_at: new Date().toISOString() }).eq("post_id", postId);
      }
      return NextResponse.json({ success: true, action: "hidden" });
    }

    case "remove": {
      if (postId) {
        await supabase.from("posts").update({ moderation_status: "removed" }).eq("id", postId);
        await supabase.from("post_reports").update({ status: "actioned", reviewed_at: new Date().toISOString() }).eq("post_id", postId);
      }
      return NextResponse.json({ success: true, action: "removed" });
    }

    case "dismiss": {
      if (reportIds && Array.isArray(reportIds)) {
        await supabase.from("post_reports").update({ status: "dismissed", reviewed_at: new Date().toISOString() }).in("id", reportIds);
      }
      return NextResponse.json({ success: true, action: "dismissed" });
    }

    case "ban": {
      if (targetUserId && banReason) {
        await serverSupabase.from("user_bans").insert({
          user_id: targetUserId,
          banned_by: userId,
          reason: banReason,
          expires_at: banDuration ? new Date(Date.now() + banDuration * 3600000).toISOString() : null,
        });
      }
      return NextResponse.json({ success: true, action: "banned" });
    }

    case "unban": {
      if (targetUserId) {
        await serverSupabase.from("user_bans")
          .update({ lifted_at: new Date().toISOString(), lifted_by: userId })
          .eq("user_id", targetUserId)
          .is("lifted_at", null);
      }
      return NextResponse.json({ success: true, action: "unbanned" });
    }

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}
