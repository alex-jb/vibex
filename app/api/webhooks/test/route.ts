import { supabase } from "@/lib/supabase";
import { sendTestPing } from "@/lib/webhook-engine";
import { validateString } from "@/lib/validate";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiSuccess, apiError } from "@/lib/api-response";
import type { Webhook } from "@/lib/webhook-engine";

const USE_SUPABASE = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/* ─── POST: Send test ping to a webhook ─── */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit(`${ip}:webhooks-test`, 3, 60_000);
  if (!allowed) {
    return apiError("Rate limit exceeded. Try again later.", 429);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const { webhookId } = body as { webhookId?: string };
  const err = validateString(webhookId, "webhookId");
  if (err) {
    return apiError(err, 400);
  }

  if (!USE_SUPABASE) {
    /* Mock: simulate a successful ping */
    return apiSuccess({
      success: true,
      status: 200,
      body: '{"ok":true}',
      durationMs: 142,
    });
  }

  const { data: webhook, error } = await supabase
    .from("webhooks")
    .select("*")
    .eq("id", webhookId)
    .single();

  if (error || !webhook) {
    return apiError("Webhook not found", 404);
  }

  const result = await sendTestPing(webhook as Webhook);

  return apiSuccess({
    success: result.success,
    status: result.status,
    body: result.body,
    durationMs: result.durationMs,
  });
}
