import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/launch-feedback/apply
 *
 * Body: { projectId, reviewId, actionId, appliedValue }
 *
 * Phase 1: no-op acknowledging receipt so the UI can update optimistic state.
 * Phase 2 will:
 *   - verify ownership via Supabase server client (RLS does the check)
 *   - write applied_value to the appropriate projects column based on action type
 *   - update launch_feedback_actions row: status='applied', applied_at=now,
 *     snapshot baseline metric into outcome_delta.baseline
 */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await checkRateLimit(`${ip}:lfa-apply`, 20, 60_000);
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
    appliedValue?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const missing = ["projectId", "reviewId", "actionId", "appliedValue"].filter(
    (k) => !body[k as keyof typeof body],
  );
  if (missing.length) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    projectId: body.projectId,
    reviewId: body.reviewId,
    actionId: body.actionId,
    status: "applied",
    applied_at: new Date().toISOString(),
    applied_value: body.appliedValue,
  });
}
