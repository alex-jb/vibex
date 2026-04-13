import { supabase } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";
import { WEBHOOK_EVENTS } from "@/lib/webhook-engine";
import { apiSuccess, apiError } from "@/lib/api-response";

const USE_SUPABASE = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/* ─── GET: Webhook details + recent logs ─── */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!USE_SUPABASE) {
    return apiSuccess({
      webhook: { id, url: "https://example.com/webhook", events: ["project.created"], is_active: true, failure_count: 0 },
      logs: [
        { id: 1, event: "project.created", success: true, response_status: 200, duration_ms: 142, created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: 2, event: "project.upvoted", success: true, response_status: 200, duration_ms: 98, created_at: new Date(Date.now() - 7200000).toISOString() },
        { id: 3, event: "battle.completed", success: false, response_status: 500, duration_ms: 3021, created_at: new Date(Date.now() - 86400000).toISOString() },
      ],
    });
  }

  const [webhookRes, logsRes] = await Promise.all([
    supabase.from("webhooks").select("*").eq("id", id).single(),
    supabase
      .from("webhook_logs")
      .select("id, event, success, response_status, duration_ms, created_at")
      .eq("webhook_id", id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  if (webhookRes.error) {
    return apiError("Webhook not found", 404);
  }

  return apiSuccess({ webhook: webhookRes.data, logs: logsRes.data ?? [] });
}

/* ─── PATCH: Update webhook ─── */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await checkRateLimit(`${ip}:webhooks-patch`, 10, 60_000);
  if (!allowed) {
    return apiError("Rate limit exceeded.", 429);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const updates: Record<string, unknown> = {};

  if (body.url !== undefined) {
    if (typeof body.url !== "string") return apiError("url must be a string", 400);
    try {
      const u = new URL(body.url);
      if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error();
    } catch {
      return apiError("url must be a valid HTTP(S) URL", 400);
    }
    updates.url = body.url;
  }

  if (body.events !== undefined) {
    if (!Array.isArray(body.events) || body.events.length === 0) {
      return apiError("events must be a non-empty array", 400);
    }
    const validEvents = WEBHOOK_EVENTS as readonly string[];
    const invalid = (body.events as string[]).filter((e) => !validEvents.includes(e));
    if (invalid.length > 0) {
      return apiError(`Invalid events: ${invalid.join(", ")}`, 400);
    }
    updates.events = body.events;
  }

  if (body.is_active !== undefined) {
    if (typeof body.is_active !== "boolean") return apiError("is_active must be boolean", 400);
    updates.is_active = body.is_active;
    if (body.is_active) updates.failure_count = 0;
  }

  if (Object.keys(updates).length === 0) {
    return apiError("No valid fields to update", 400);
  }

  if (!USE_SUPABASE) {
    return apiSuccess({ id, ...updates });
  }

  const { data, error } = await supabase
    .from("webhooks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return apiError(error.message, 500);
  }

  return apiSuccess(data);
}

/* ─── DELETE: Remove webhook ─── */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!USE_SUPABASE) {
    return apiSuccess({ deleted: true, id });
  }

  const { error } = await supabase.from("webhooks").delete().eq("id", id);

  if (error) {
    return apiError(error.message, 500);
  }

  return apiSuccess({ deleted: true, id });
}
