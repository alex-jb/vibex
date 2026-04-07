import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { validateString } from "@/lib/validate";
import { checkRateLimit } from "@/lib/rate-limit";
import { WEBHOOK_EVENTS } from "@/lib/webhook-engine";
import { apiSuccess, apiError } from "@/lib/api-response";

const USE_SUPABASE = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/* ─── Mock Data ─── */
const MOCK_WEBHOOKS = [
  {
    id: "wh-mock-001",
    user_id: "u1",
    url: "https://example.com/webhook/vibex",
    secret: "whsec_mock_secret_001",
    events: ["project.created", "project.upvoted"],
    is_active: true,
    last_triggered_at: new Date(Date.now() - 3600000).toISOString(),
    failure_count: 0,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: "wh-mock-002",
    user_id: "u1",
    url: "https://myapp.dev/hooks/battles",
    secret: "whsec_mock_secret_002",
    events: ["battle.completed", "agent.run"],
    is_active: false,
    last_triggered_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    failure_count: 5,
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
];

/* ─── URL Validation ─── */
function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/* ─── GET: List user's webhooks ─── */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return apiError("Missing required query parameter: userId", 400);
  }

  if (!USE_SUPABASE) {
    const filtered = MOCK_WEBHOOKS.filter((w) => w.user_id === userId);
    return apiSuccess(filtered);
  }

  const { data, error } = await supabase
    .from("webhooks")
    .select("id, url, events, is_active, last_triggered_at, failure_count, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return apiError(error.message, 500);
  }

  return apiSuccess(data ?? []);
}

/* ─── POST: Create a webhook ─── */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit(`${ip}:webhooks-post`, 5, 60_000);
  if (!allowed) {
    return apiError("Rate limit exceeded. Try again later.", 429);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const { url, events, userId } = body as {
    url?: string;
    events?: string[];
    userId?: string;
  };

  /* Validate fields */
  const errors: string[] = [];

  const userIdErr = validateString(userId, "userId");
  if (userIdErr) errors.push(userIdErr);

  const urlErr = validateString(url, "url", { max: 2048 });
  if (urlErr) {
    errors.push(urlErr);
  } else if (!isValidUrl(url as string)) {
    errors.push("url must be a valid HTTP(S) URL");
  }

  if (!Array.isArray(events) || events.length === 0) {
    errors.push("events must be a non-empty array");
  } else {
    const validEvents = WEBHOOK_EVENTS as readonly string[];
    const invalid = events.filter((e) => !validEvents.includes(e));
    if (invalid.length > 0) {
      errors.push(`Invalid events: ${invalid.join(", ")}. Valid: ${WEBHOOK_EVENTS.join(", ")}`);
    }
  }

  if (errors.length > 0) {
    return apiError(errors.join("; "), 400);
  }

  if (!USE_SUPABASE) {
    const mock = {
      id: `wh-mock-${Date.now()}`,
      user_id: userId,
      url,
      secret: "whsec_mock_generated",
      events,
      is_active: true,
      last_triggered_at: null,
      failure_count: 0,
      created_at: new Date().toISOString(),
    };
    return apiSuccess(mock, 201);
  }

  const { data, error } = await supabase
    .from("webhooks")
    .insert({ user_id: userId, url, events })
    .select()
    .single();

  if (error) {
    return apiError(error.message, 500);
  }

  return apiSuccess(data, 201);
}
