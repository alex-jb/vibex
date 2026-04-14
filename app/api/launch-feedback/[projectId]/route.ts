import { NextResponse } from "next/server";
import { generateStructuredReview } from "@/lib/ai";
import { projects as mockProjects } from "@/lib/mock-data";
import { serverLog } from "@/lib/logger";

/**
 * GET /api/launch-feedback/[projectId]
 *
 * Returns the current set of feedback actions for a project, grouped by
 * severity, plus any recently-applied actions with outcome deltas.
 *
 * Phase 1: always returns a fresh stub review (no persistence). Phase 2 will
 * query launch_feedback_actions WHERE project_id = :id AND status != 'expired'
 * via authed server client so RLS enforces owner access.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;

  if (!projectId) {
    return NextResponse.json(
      { error: "Missing projectId path param" },
      { status: 400 },
    );
  }

  const project = mockProjects.find((p) => p.id === projectId);
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
    serverLog.error(errorId, "launch-feedback GET error", error);
    return NextResponse.json(
      { error: "Failed to load feedback", errorId },
      { status: 500 },
    );
  }
}
