import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { USE_SUPABASE } from "@/lib/mock-adapter";
import { createServerSupabase } from "@/lib/supabase-server";
import { serverLog } from "@/lib/logger";
import type { FeedbackActionType, FeedbackSuccessMetric } from "@/lib/types";

/**
 * POST /api/launch-feedback/apply
 *
 * Body: { projectId, reviewId, actionId, appliedValue }
 *
 * When Supabase is available, this:
 *  1. Verifies ownership via RLS (authed server client)
 *  2. Writes applied_value to the appropriate projects column
 *     (depending on action.type)
 *  3. Snapshots the current success_metric value as baseline, stored in
 *     outcome_delta.baseline so the 72h cron can compute a clean delta
 *  4. Marks the action row status='applied'
 *
 * In dev or when migration 037 hasn't been run, returns a no-op ack so
 * the UI can update optimistic state without breaking.
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

  const payload = {
    projectId: body.projectId!,
    reviewId: body.reviewId!,
    actionId: body.actionId!,
    appliedValue: body.appliedValue!,
  };

  const stubResponse = NextResponse.json({
    ok: true,
    projectId: payload.projectId,
    reviewId: payload.reviewId,
    actionId: payload.actionId,
    status: "applied",
    applied_at: new Date().toISOString(),
    applied_value: payload.appliedValue,
  });

  if (!USE_SUPABASE) return stubResponse;

  try {
    const supabase = await createServerSupabase();

    // Look up the action row to know its type (so we can target the right
    // projects column) and success_metric (so we can snapshot baseline).
    const { data: actionRow, error: actionErr } = await supabase
      .from("launch_feedback_actions")
      .select("id, type, success_metric, status")
      .eq("project_id", payload.projectId)
      .eq("review_id", payload.reviewId)
      .eq("action_id", payload.actionId)
      .maybeSingle();

    if (actionErr) {
      if (isMissingRelation(actionErr)) return stubResponse;
      serverLog.error("lfa-apply-lookup", "action lookup failed", actionErr);
      return stubResponse;
    }
    if (!actionRow) return stubResponse;
    if (actionRow.status !== "suggested") {
      return NextResponse.json(
        { error: `Action is already ${actionRow.status}` },
        { status: 409 },
      );
    }

    // Snapshot baseline metric from the project row before we mutate it.
    const metricColumn = metricToColumn(
      actionRow.success_metric as FeedbackSuccessMetric,
    );
    let baseline = 0;
    if (metricColumn) {
      const { data: projectRow } = await supabase
        .from("projects")
        .select(metricColumn)
        .eq("id", payload.projectId)
        .maybeSingle();
      if (projectRow && typeof projectRow === "object") {
        const value = (projectRow as Record<string, unknown>)[metricColumn];
        if (typeof value === "number") baseline = value;
      }
    }

    // Apply the action's value to the appropriate projects column.
    const projectUpdate = buildProjectUpdate(
      actionRow.type as FeedbackActionType,
      payload.appliedValue,
    );
    if (projectUpdate) {
      const { error: projectUpdateErr } = await supabase
        .from("projects")
        .update(projectUpdate)
        .eq("id", payload.projectId);
      if (projectUpdateErr) {
        serverLog.error(
          "lfa-apply-project-update",
          "projects update failed",
          projectUpdateErr,
        );
        // If the projects update fails (RLS), bail without marking applied.
        return NextResponse.json(
          { error: "Not authorized to update this project" },
          { status: 403 },
        );
      }
    }

    // Mark the action applied + snapshot baseline.
    const { error: updateErr } = await supabase
      .from("launch_feedback_actions")
      .update({
        status: "applied",
        applied_value: payload.appliedValue,
        applied_at: new Date().toISOString(),
        outcome_delta: {
          metric: actionRow.success_metric,
          baseline,
          after: null,
          delta_pct: null,
          window_hours: 72,
        },
      })
      .eq("id", actionRow.id);

    if (updateErr) {
      serverLog.error("lfa-apply-status", "status update failed", updateErr);
      return NextResponse.json(
        { error: "Failed to record apply" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      projectId: payload.projectId,
      reviewId: payload.reviewId,
      actionId: payload.actionId,
      status: "applied",
      applied_at: new Date().toISOString(),
      applied_value: payload.appliedValue,
      baseline,
    });
  } catch (error) {
    serverLog.error("lfa-apply-catch", "apply threw", error);
    return stubResponse;
  }
}

/**
 * Map an action type to the projects column we should update with the
 * chosen value. Returns null for action types that don't map to a simple
 * single-column edit (demo_add creates a new asset, category_retarget
 * changes the category but we don't let AI auto-retarget without extra
 * validation, etc).
 */
function buildProjectUpdate(
  type: FeedbackActionType,
  value: string,
): Record<string, string | string[]> | null {
  switch (type) {
    case "tagline_rewrite":
      return { tagline: value };
    case "description_rewrite":
      return { description: value };
    case "tag_fix":
      // value is a comma-separated list of new tags
      return {
        tags: value
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
    case "cta_revamp":
    case "audience_narrow":
    case "category_retarget":
    case "demo_add":
    case "demo_quality":
    case "thumbnail_upgrade":
    case "pricing_clarify":
      // These don't map to a trivial column edit — creator has to do
      // follow-up work offline (record demo, upload thumbnail, etc.).
      // We still mark the action applied so the outcome tracking runs.
      return null;
  }
}

function metricToColumn(metric: FeedbackSuccessMetric): string | null {
  switch (metric) {
    case "upvotes": return "upvotes";
    case "plays": return "plays";
    case "shares": return "shares";
    case "remix_count": return "remix_count";
    case "ctr": return null; // derived, not on projects table
    case "retention": return null; // derived, not on projects table
  }
}

function isMissingRelation(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  if (err.code === "42P01") return true;
  const msg = err.message ?? "";
  return msg.includes("does not exist") && msg.includes("launch_feedback_actions");
}
