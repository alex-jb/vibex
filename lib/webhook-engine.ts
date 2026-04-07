import crypto from "crypto";
import { supabase } from "@/lib/supabase";

export const WEBHOOK_EVENTS = [
  "project.created", "project.upvoted", "battle.completed",
  "agent.run", "comment.created", "idea.submitted",
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export interface Webhook {
  id: string; user_id: string; url: string; secret: string;
  events: string[]; is_active: boolean; last_triggered_at: string | null;
  failure_count: number; created_at: string;
}

export interface WebhookLog {
  id: number; webhook_id: string; event: string; payload: Record<string, unknown>;
  response_status: number | null; response_body: string | null;
  duration_ms: number | null; success: boolean; created_at: string;
}

type DeliveryResult = { success: boolean; status: number | null; body: string | null; durationMs: number };

/* ─── HMAC Signature ─── */
function signPayload(secret: string, body: string): string {
  return `sha256=${crypto.createHmac("sha256", secret).update(body).digest("hex")}`;
}

const RETRY_DELAYS = [1000, 5000, 15000];
const MAX_CONSECUTIVE_FAILURES = 5;

/* ─── Deliver to a single webhook ─── */
async function deliverToWebhook(
  webhook: Webhook, event: WebhookEvent, payload: Record<string, unknown>,
): Promise<DeliveryResult> {
  const bodyStr = JSON.stringify(payload);
  const start = Date.now();
  try {
    const res = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VibeX-Signature": signPayload(webhook.secret, bodyStr),
        "X-VibeX-Event": event,
      },
      body: bodyStr,
      signal: AbortSignal.timeout(10000),
    });
    const resBody = await res.text().catch(() => "");
    return { success: res.ok, status: res.status, body: resBody.slice(0, 2000), durationMs: Date.now() - start };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, status: null, body: message, durationMs: Date.now() - start };
  }
}

/* ─── Log a delivery attempt ─── */
async function logDelivery(
  webhookId: string, event: string, payload: Record<string, unknown>, result: DeliveryResult,
): Promise<void> {
  await supabase.from("webhook_logs").insert({
    webhook_id: webhookId, event, payload,
    response_status: result.status, response_body: result.body,
    duration_ms: result.durationMs, success: result.success,
  });
}

/* ─── Update webhook failure state ─── */
async function updateWebhookState(webhook: Webhook, success: boolean): Promise<void> {
  if (success) {
    await supabase.from("webhooks")
      .update({ last_triggered_at: new Date().toISOString(), failure_count: 0 })
      .eq("id", webhook.id);
  } else {
    const newCount = webhook.failure_count + 1;
    const updates: Record<string, unknown> = { failure_count: newCount };
    if (newCount >= MAX_CONSECUTIVE_FAILURES) updates.is_active = false;
    await supabase.from("webhooks").update(updates).eq("id", webhook.id);
  }
}

/* ─── Deliver with retries ─── */
async function deliverWithRetry(
  webhook: Webhook, event: WebhookEvent, payload: Record<string, unknown>,
): Promise<void> {
  let result = await deliverToWebhook(webhook, event, payload);
  await logDelivery(webhook.id, event, payload, result);

  if (result.success) { await updateWebhookState(webhook, true); return; }

  for (const delay of RETRY_DELAYS) {
    await new Promise((r) => setTimeout(r, delay));
    result = await deliverToWebhook(webhook, event, payload);
    await logDelivery(webhook.id, event, payload, result);
    if (result.success) { await updateWebhookState(webhook, true); return; }
  }
  await updateWebhookState(webhook, false);
}

/* ─── Main: trigger all webhooks for an event ─── */
export async function triggerWebhook(
  event: WebhookEvent, payload: Record<string, unknown>,
): Promise<void> {
  const { data: webhooks } = await supabase
    .from("webhooks").select("*").eq("is_active", true).contains("events", [event]);

  if (!webhooks || webhooks.length === 0) return;

  const enrichedPayload = { event, timestamp: new Date().toISOString(), data: payload };
  await Promise.allSettled(
    webhooks.map((wh: Webhook) => deliverWithRetry(wh, event, enrichedPayload)),
  );
}

/* ─── Test ping for a specific webhook ─── */
export async function sendTestPing(webhook: Webhook): Promise<DeliveryResult> {
  const payload = {
    event: "ping", timestamp: new Date().toISOString(),
    data: { message: "Test ping from VibeX webhook system" },
  };
  const result = await deliverToWebhook(webhook, "project.created", payload);
  await logDelivery(webhook.id, "ping", payload, result);
  return result;
}
