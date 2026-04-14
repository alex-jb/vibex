import { NextResponse } from "next/server";
import { generateStructuredReview } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";
import { projects as mockProjects } from "@/lib/mock-data";
import { USE_SUPABASE } from "@/lib/mock-adapter";
import { createServerSupabase } from "@/lib/supabase-server";
import { serverLog } from "@/lib/logger";

/**
 * POST /api/launch-feedback/generate
 *
 * Body: { projectId: string }
 *
 * Returns a fresh StructuredReview. When a real Supabase connection is
 * available AND the launch_feedback_actions table exists AND the caller
 * is the project owner, the new actions are persisted and any still-
 * suggested actions from prior review passes are marked expired.
 *
 * In dev or when migration 037 hasn't been run, falls back to the
 * in-memory stub so the UI keeps working.
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

  const projectId = body.projectId;

  // ── Stub path: no Supabase configured at all ────────────────────
  if (!USE_SUPABASE) {
    return stubReview(projectId);
  }

  try {
    const supabase = await createServerSupabase();

    // Load the real project row so review prompts get real content.
    const { data: projectRow, error: projectErr } = await supabase
      .from("projects")
      .select("id, title, tagline, description, category, tags")
      .eq("id", projectId)
      .maybeSingle();

    if (projectErr || !projectRow) {
      // If the project isn't in Supabase, fall back to mock data so
      // local/dev flows keep rendering.
      return stubReview(projectId);
    }

    const review = await generateStructuredReview({
      id: projectRow.id,
      title: projectRow.title,
      tagline: projectRow.tagline,
      description: projectRow.description,
      category: projectRow.category,
      tags: projectRow.tags ?? [],
    });

    // Expire any still-suggested actions from prior review passes.
    const expireResult = await supabase.rpc(
      "expire_prior_suggested_actions",
      { p_project_id: projectId },
    );
    if (expireResult.error && !isMissingRelation(expireResult.error)) {
      serverLog.error(
        "lfa-generate-expire",
        "expire_prior_suggested_actions failed",
        expireResult.error,
      );
      // Not fatal — continue to insert attempt; RLS on insert will still gate.
    }

    // Insert new actions. If the table doesn't exist yet (migration 037
    // not run), return the in-memory stub so the UI still works.
    const rows = review.actions.map((a) => ({
      project_id: projectId,
      review_id: review.review_id,
      action_id: a.action_id,
      type: a.type,
      severity: a.severity,
      rationale: a.rationale,
      current_value: a.current_value,
      suggested_values: a.suggested_values,
      success_metric: a.success_metric,
      status: "suggested" as const,
    }));

    const { error: insertErr } = await supabase
      .from("launch_feedback_actions")
      .insert(rows);

    if (insertErr) {
      if (isMissingRelation(insertErr)) {
        return NextResponse.json(review);
      }
      serverLog.error(
        "lfa-generate-insert",
        "launch_feedback_actions insert failed",
        insertErr,
      );
      // RLS refusal = caller isn't the owner. Return stub so non-owners
      // still see a demo review in Phase 2 (owner-only persistence,
      // everyone else sees ephemeral stub).
      return NextResponse.json(review);
    }

    return NextResponse.json(review);
  } catch (error) {
    const errorId = `err-${Date.now()}`;
    serverLog.error(errorId, "launch-feedback generate error", error);
    return stubReview(projectId);
  }
}

async function stubReview(projectId: string): Promise<Response> {
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

/**
 * Detect PostgREST "relation does not exist" errors. Returned when
 * migration 037 hasn't been applied yet. `42P01` is the SQL state
 * for "undefined_table"; PostgREST surfaces it in `code`.
 */
function isMissingRelation(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  if (err.code === "42P01") return true;
  const msg = err.message ?? "";
  return msg.includes("does not exist") && msg.includes("launch_feedback_actions");
}

