import { NextResponse } from "next/server";
import { generateStructuredReview } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";
import { projects as mockProjects } from "@/lib/mock-data";
import { serverLog } from "@/lib/logger";

/**
 * POST /api/launch-feedback/generate
 *
 * Body: { projectId: string }
 *
 * Returns a fresh StructuredReview for the given project. In Phase 1 this
 * is in-memory only — no DB rows are inserted. Phase 2 will:
 *   - mark prior 'suggested' rows on this project as 'expired'
 *   - insert the new review's actions into launch_feedback_actions
 *
 * See ceo-plans/launch-feedback-loop-20260413.md
 */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await checkRateLimit(`${ip}:lfa-generate`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } },
    );
  }

  let body: { projectId?: string };
  try {
    body = (await request.json()) as { projectId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.projectId || typeof body.projectId !== "string") {
    return NextResponse.json(
      { error: "Missing required field: projectId" },
      { status: 400 },
    );
  }

  // Phase 1: look up via mock data. Phase 2 will query Supabase via the
  // per-request authed server client so RLS enforces owner access.
  const project = mockProjects.find((p) => p.id === body.projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  try {
    const review = await generateStructuredReview({
      id: project.id,
      title: project.title,
      tagline: project.tagline,
      description: project.description,
      category: project.category,
      tags: project.tags,
    });
    return NextResponse.json(review);
  } catch (error) {
    const errorId = `err-${Date.now()}`;
    serverLog.error(errorId, "launch-feedback generate error", error);
    return NextResponse.json(
      { error: "Structured review generation failed", errorId },
      { status: 500 },
    );
  }
}
