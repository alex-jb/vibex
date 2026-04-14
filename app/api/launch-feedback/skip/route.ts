import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/launch-feedback/skip
 *
 * Body: { projectId, reviewId, actionId }
 *
 * Phase 1: no-op. Phase 2 will set launch_feedback_actions.status='skipped'.
 * Skipped actions stay visible (unlike rejected) so the creator can still
 * come back to them later.
 */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await checkRateLimit(`${ip}:lfa-skip`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } },
    );
  }

  let body: { projectId?: string; reviewId?: string; actionId?: string };
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
    status: "skipped",
  });
}
