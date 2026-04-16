import { NextResponse } from "next/server";
import { generateStructuredReview } from "@/lib/ai";
import { projects as mockProjects } from "@/lib/mock-data";
import { USE_SUPABASE } from "@/lib/mock-adapter";
import { createServerSupabase } from "@/lib/supabase-server";
import { serverLog } from "@/lib/logger";
import type {
  FeedbackAction,
  FeedbackActionType,
  FeedbackSeverity,
  FeedbackSuccessMetric,
  FeedbackStatus,
  FeedbackOutcomeDelta,
  StructuredReview,
} from "@/lib/types";

interface ActionRow {
  project_id: string;
  review_id: string;
  action_id: string;
  type: FeedbackActionType;
  severity: FeedbackSeverity;
  rationale: string;
  current_value: string | null;
  suggested_values: string[];
  success_metric: FeedbackSuccessMetric;
  status: FeedbackStatus;
  applied_value: string | null;
  applied_at: string | null;
  reject_reason: string | null;
  outcome_delta: FeedbackOutcomeDelta | null;
  outcome_at: string | null;
}

/**
 * GET /api/launch-feedback/[projectId]
 *
 * Returns the current set of feedback actions for a project (latest
 * non-expired review run). If no rows exist yet OR the table doesn't
 * exist OR Supabase isn't configured, returns a fresh stub review so
 * the UI has something to render.
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

  if (!USE_SUPABASE) {
    return stubReview(projectId);
  }

  try {
    const supabase = await createServerSupabase();

    // Query non-expired, non-rejected actions for this project.
    // RLS enforces owner-only access; non-owners get an empty result
    // and fall through to the stub so the demo still shows something.
    const { data: rows, error } = await supabase
      .from("launch_feedback_actions")
      .select("*")
      .eq("project_id", projectId)
      .not("status", "in", "(expired,rejected)")
      .order("created_at", { ascending: false });

    if (error) {
      if (isMissingRelation(error)) {
        return stubReview(projectId);
      }
      serverLog.error("lfa-get-select", "select failed", error);
      return stubReview(projectId);
    }

    if (!rows || rows.length === 0) {
      return stubReview(projectId);
    }

    // Find the most recent review_id group and return only that run.
    const latestReviewId = (rows[0] as ActionRow).review_id;
    const latestRows = (rows as ActionRow[]).filter(
      (r) => r.review_id === latestReviewId,
    );

    const actions: FeedbackAction[] = latestRows.map((r) => ({
      action_id: r.action_id,
      review_id: r.review_id,
      type: r.type,
      severity: r.severity,
      rationale: r.rationale,
      current_value: r.current_value,
      suggested_values: r.suggested_values,
      success_metric: r.success_metric,
      status: r.status,
      applied_value: r.applied_value ?? undefined,
      applied_at: r.applied_at ?? undefined,
      reject_reason: r.reject_reason ?? undefined,
      outcome_delta: r.outcome_delta ?? undefined,
      outcome_at: r.outcome_at ?? undefined,
    }));

    const review: StructuredReview = {
      review_id: latestReviewId,
      actions,
      // Legacy aggregate scores — not persisted per review run yet.
      // Phase 3 can pull them from a separate ai_reviews row if needed.
      originality: 0,
      clarity: 0,
      ux_potential: 0,
      virality_potential: 0,
      investor_curiosity: 0,
    };

    return NextResponse.json(review);
  } catch (error) {
    const errorId = `err-${Date.now()}`;
    serverLog.error(errorId, "launch-feedback GET error", error);
    return stubReview(projectId);
  }
}

async function stubReview(projectId: string): Promise<Response> {
  // First try Supabase (the real source for user-submitted proj-xxx ids).
  // Fall through to mock-data only if Supabase isn't configured — this
  // keeps the /home + /project pages rendering in offline dev mode but
  // makes the review panel work correctly for real launched projects.
  if (USE_SUPABASE) {
    try {
      const supabase = await createServerSupabase();
      const { data: row } = await supabase
        .from("projects")
        .select("id, title, tagline, description, category, tags")
        .eq("id", projectId)
        .maybeSingle();
      if (row) {
        const review = await generateStructuredReview({
          id: row.id as string,
          title: row.title as string,
          tagline: row.tagline as string,
          description: row.description as string,
          category: row.category as string,
          tags: (row.tags as string[]) ?? [],
        });
        return NextResponse.json(review);
      }
    } catch {
      // fall through to mock lookup
    }
  }

  const project = mockProjects.find((p) => p.id === projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  const review = await generateStructuredReview({
    id: project.id,
    title: project.title,
    tagline: project.tagline,
    description: project.description,
    category: project.category,
    tags: project.tags,
  });
  return NextResponse.json(review);
}

function isMissingRelation(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  if (err.code === "42P01") return true;
  const msg = err.message ?? "";
  return msg.includes("does not exist") && msg.includes("launch_feedback_actions");
}
