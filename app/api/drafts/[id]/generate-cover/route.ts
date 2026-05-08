/**
 * POST /api/drafts/[id]/generate-cover
 *
 * Generate a platform-native cover image for a single draft and store
 * it on the row. Currently Xiaohongshu only (D3 v1).
 *
 * Cost: gpt-image-2 ≈ \$0.04-0.08 per image. Charged 10 draft credits
 * via the D5 cost gate (consume_draft_credits RPC).
 *
 * Auth: project owner only — same join pattern as the reroll endpoint.
 *
 * Storage: Vercel Blob, public access. URL written to
 * project_drafts.cover_image_url + cover_image_prompt for review.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { generateCoverImage, type Platform } from "@/lib/visual-generator";

export const runtime = "nodejs";
export const maxDuration = 90;

const SUPPORTED: Set<string> = new Set(["xiaohongshu"]);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: draftId } = await params;
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "auth required" }, { status: 401 });
  }

  const { data: draftRow, error: dErr } = await supabase
    .from("project_drafts")
    .select("id, project_id, platform, language, body")
    .eq("id", draftId)
    .maybeSingle();
  if (dErr || !draftRow) {
    return NextResponse.json({ error: "draft not found" }, { status: 404 });
  }

  const draft = draftRow as {
    id: string;
    project_id: string;
    platform: string;
    language: "en" | "zh";
    body: string;
  };

  if (!SUPPORTED.has(draft.platform)) {
    return NextResponse.json(
      {
        error: "platform_not_supported",
        message: `Cover generation is currently Xiaohongshu only. Add support for ${draft.platform} in lib/visual-generator.`,
      },
      { status: 400 },
    );
  }

  const { data: project, error: pErr } = await supabase
    .from("projects")
    .select(
      "id, title, tagline, creator_id, creators!inner(auth_user_id)",
    )
    .eq("id", draft.project_id)
    .maybeSingle();
  if (pErr || !project) {
    return NextResponse.json({ error: "project not found" }, { status: 404 });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ownerAuthId = (project as any).creators?.auth_user_id;
  if (ownerAuthId !== user.id) {
    return NextResponse.json({ error: "not project owner" }, { status: 403 });
  }

  // Cost gate: 10 credits per cover (D5).
  const { data: gateData, error: gateErr } = await supabase.rpc(
    "consume_draft_credits",
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      p_creator_id: (project as any).creator_id,
      p_cost: 10,
      p_cap: 100,
    },
  );
  if (gateErr) {
    return NextResponse.json({ error: gateErr.message }, { status: 500 });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gate = gateData as any;
  if (!gate?.ok) {
    return NextResponse.json(
      {
        error: gate?.error || "quota_exceeded",
        used: gate?.used,
        cap: gate?.cap,
        reset_at: gate?.reset_at,
        message:
          gate?.error === "over_cap"
            ? `Daily quota exhausted (${gate.used}/${gate.cap}). Cover generation costs 10 credits.`
            : "Quota check failed",
      },
      { status: 429 },
    );
  }

  try {
    const { url, prompt } = await generateCoverImage(
      draft.platform as Platform,
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        projectTitle: (project as any).title,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        projectTagline: (project as any).tagline,
        draftBody: draft.body,
        language: draft.language,
      },
      `covers/${draft.project_id}/${draft.id}`,
    );

    const { error: uErr } = await supabase
      .from("project_drafts")
      .update({
        cover_image_url: url,
        cover_image_prompt: prompt,
        cover_image_generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", draftId);

    if (uErr) {
      return NextResponse.json({ error: uErr.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      draft_id: draftId,
      cover_image_url: url,
    });
  } catch (err) {
    console.error("[generate-cover] failed:", err);
    return NextResponse.json(
      {
        error: "generation_failed",
        message: err instanceof Error ? err.message : "unknown",
      },
      { status: 500 },
    );
  }
}
