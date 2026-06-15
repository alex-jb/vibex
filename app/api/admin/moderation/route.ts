import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { requireRole } from "@/lib/rbac";
import { USE_SUPABASE } from "@/lib/mock-adapter";

// GET: moderation queue (flagged posts + pending reports)
// Access: moderator+ (enforced by proxy.ts, double-checked here)
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

  const auth = await requireRole("moderator");
  if (auth instanceof Response) return auth;

  const supabase = await createServerSupabase();

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
// Access: admin only for ban/unban, moderator+ for approve/hide/remove/dismiss
export async function POST(request: Request) {
  const auth = await requireRole("moderator");
  if (auth instanceof Response) return auth;
  const { user: authUser, role } = auth;

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

  const supabase = await createServerSupabase();

  switch (action) {
    case "approve": {
      // Mark post as active, dismiss related reports
      if (postId) {
        await supabase.from("posts").update({ moderation_status: "active" }).eq("id", postId);
        await supabase.rpc("admin_update_report_status", {
          p_post_id: postId,
          p_new_status: "dismissed",
        });
      }
      return NextResponse.json({ success: true, action: "approved" });
    }

    case "hide": {
      if (postId) {
        await supabase.from("posts").update({ moderation_status: "hidden" }).eq("id", postId);
        await supabase.rpc("admin_update_report_status", {
          p_post_id: postId,
          p_new_status: "actioned",
        });
      }
      return NextResponse.json({ success: true, action: "hidden" });
    }

    case "remove": {
      if (postId) {
        await supabase.from("posts").update({ moderation_status: "removed" }).eq("id", postId);
        await supabase.rpc("admin_update_report_status", {
          p_post_id: postId,
          p_new_status: "actioned",
        });
      }
      return NextResponse.json({ success: true, action: "removed" });
    }

    case "dismiss": {
      if (reportIds && Array.isArray(reportIds)) {
        await supabase.rpc("admin_dismiss_reports", { p_report_ids: reportIds });
      }
      return NextResponse.json({ success: true, action: "dismissed" });
    }

    case "ban": {
      if (role !== "admin") {
        return NextResponse.json({ error: "Only admins can ban users" }, { status: 403 });
      }
      if (targetUserId && banReason) {
        await supabase.from("user_bans").insert({
          user_id: targetUserId,
          banned_by: authUser.id,
          reason: banReason,
          expires_at: banDuration ? new Date(Date.now() + banDuration * 3600000).toISOString() : null,
        });
      }
      return NextResponse.json({ success: true, action: "banned" });
    }

    case "unban": {
      if (role !== "admin") {
        return NextResponse.json({ error: "Only admins can unban users" }, { status: 403 });
      }
      if (targetUserId) {
        await supabase.from("user_bans")
          .update({ lifted_at: new Date().toISOString(), lifted_by: authUser.id })
          .eq("user_id", targetUserId)
          .is("lifted_at", null);
      }
      return NextResponse.json({ success: true, action: "unbanned" });
    }

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}
