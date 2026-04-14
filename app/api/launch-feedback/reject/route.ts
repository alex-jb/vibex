import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { USE_SUPABASE } from "@/lib/mock-adapter";
import { createServerSupabase } from "@/lib/supabase-server";
import { serverLog } from "@/lib/logger";

/**
 * POST /api/launch-feedback/reject
 *
 * Body: { projectId, reviewId, actionId, reason? }
 *
 * Marks a suggested action as 'rejected' (hidden from the list, unlike
 * skipped). RLS gates ownership.
 */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await checkRateLimit(`${ip}:lfa-reject`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } },
    );
  }

  let body: {
    projectId?: string;
    reviewId?: string;
    actionId?: string;
    reason?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const missing = ["projectId", "reviewId", "actionId"].filter(
    (k) => !body[k as keyof typeof body],
  );
  if (missing.length) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 },
    );
  }

  const stubResponse = NextResponse.json({
    ok: true,
    projectId: body.projectId,
    reviewId: body.reviewId,
    actionId: body.actionId,
    status: "rejected",
    reject_reason: body.reason ?? null,
  });

  if (!USE_SUPABASE) return stubResponse;

  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase
      .from("launch_feedback_actions")
      .update({
        status: "rejected",
        reject_reason: body.reason ?? null,
      })
      .eq("project_id", body.projectId!)
      .eq("review_id", body.reviewId!)
      .eq("action_id", body.actionId!)
      .eq("status", "suggested");

    if (error) {
      if (isMissingRelation(error)) return stubResponse;
      serverLog.error("lfa-reject", "status update failed", error);
      return stubResponse;
    }

    return NextResponse.json({
      ok: true,
      projectId: body.projectId,
      reviewId: body.reviewId,
      actionId: body.actionId,
      status: "rejected",
      reject_reason: body.reason ?? null,
    });
  } catch (error) {
    serverLog.error("lfa-reject-catch", "reject threw", error);
    return stubResponse;
  }
}

function isMissingRelation(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  if (err.code === "42P01") return true;
  const msg = err.message ?? "";
  return msg.includes("does not exist") && msg.includes("launch_feedback_actions");
}
