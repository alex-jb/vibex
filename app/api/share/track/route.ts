import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { USE_SUPABASE } from "@/lib/mock-adapter";

/**
 * POST /api/share/track
 *
 * Tracks share events: card_download, card_copy, link_copy, qr_scan, referral_visit.
 * Used for analytics — how many shares convert to visits.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { projectId, event, platform, referrer } = body;

  if (!projectId || !event) {
    return NextResponse.json({ error: "Missing projectId or event" }, { status: 400 });
  }

  const validEvents = ["card_download", "card_copy", "link_copy", "social_click", "referral_visit"];
  if (!validEvents.includes(event)) {
    return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
  }

  if (USE_SUPABASE) {
    await supabase.from("share_events").insert({
      project_id: projectId,
      event_type: event,
      platform: platform || null,
      referrer: referrer || null,
      ip_hash: hashIP(request.headers.get("x-forwarded-for") || "unknown"),
    });
  }

  return NextResponse.json({ ok: true });
}

/**
 * GET /api/share/track?projectId=xxx
 *
 * Returns share analytics for a project.
 */
export async function GET(request: NextRequest) {
  const projectId = new URL(request.url).searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  if (!USE_SUPABASE) {
    // Mock analytics
    return NextResponse.json({
      total: 42,
      breakdown: {
        card_download: 18,
        card_copy: 8,
        link_copy: 10,
        social_click: 4,
        referral_visit: 2,
      },
    });
  }

  const { data, error } = await supabase
    .from("share_events")
    .select("event_type")
    .eq("project_id", projectId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const breakdown: Record<string, number> = {};
  for (const row of data ?? []) {
    const type = row.event_type as string;
    breakdown[type] = (breakdown[type] || 0) + 1;
  }

  return NextResponse.json({
    total: (data ?? []).length,
    breakdown,
  });
}

/** Simple hash to anonymize IP for analytics without storing PII */
function hashIP(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    hash = ((hash << 5) - hash + ip.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}
