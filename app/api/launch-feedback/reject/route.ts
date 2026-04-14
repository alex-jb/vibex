import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/launch-feedback/reject
 *
 * Body: { projectId, reviewId, actionId, reason? }
 *
 * Phase 1: no-op, returns the new status so the UI can update optimistically.
 * Phase 2 will set launch_feedback_actions.status='rejected' +
 * reject_reason, via authed server client.
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

  return NextResponse.json({
    ok: true,
    projectId: body.projectId,
    reviewId: body.reviewId,
    actionId: body.actionId,
    status: "rejected",
    reject_reason: body.reason ?? null,
  });
}
