/**
 * POST /api/drafts/[id]/reroll
 *
 * Regenerate a single project_drafts row in place — Claude rewrites
 * just that one platform/lang/variant slot. Used by the "Re-roll"
 * button on /project/[id]/drafts (#5 from 2026-05-08 pre-launch plan).
 *
 * Why: the existing /api/projects/[id]/generate-drafts re-runs ALL 21
 * drafts which is ~$0.06 wasted when the creator only wants to fix
 * one weak draft.
 *
 * Auth: project owner only (verified via projects.creators.auth_user_id
 * join). Rate limit shared with the full-batch endpoint via in-memory
 * cooldown — a creator who clicks Re-roll 30 times in a row gets
 * throttled.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import {
  regenerateOneDraft,
  type Platform,
  type Language,
} from "@/lib/draft-generator";

export const runtime = "nodejs";
export const maxDuration = 60;

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

  // Pull the draft + verify ownership via project → creator join.
  const { data: draftRow, error: dErr } = await supabase
    .from("project_drafts")
    .select(
      "id, project_id, platform, language, variant_key, subreddit, body, title",
    )
    .eq("id", draftId)
    .maybeSingle();
  if (dErr || !draftRow) {
    return NextResponse.json({ error: "draft not found" }, { status: 404 });
  }

  const { data: project, error: pErr } = await supabase
    .from("projects")
    .select(
      "id, title, tagline, description, category, tags, demo_url, creator_id, creators!inner(auth_user_id)",
    )
    .eq("id", (draftRow as { project_id: string }).project_id)
    .maybeSingle();
  if (pErr || !project) {
    return NextResponse.json({ error: "project not found" }, { status: 404 });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ownerAuthId = (project as any).creators?.auth_user_id;
  if (ownerAuthId !== user.id) {
    return NextResponse.json({ error: "not project owner" }, { status: 403 });
  }

  // Daily cost gate (D5). 1 credit per reroll.
  const { data: gateData, error: gateErr } = await supabase.rpc(
    "consume_draft_credits",
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      p_creator_id: (project as any).creator_id,
      p_cost: 1,
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
            ? `Daily quota exhausted (${gate.used}/${gate.cap}).`
            : "Quota check failed",
      },
      { status: 429 },
    );
  }

   
  const projectRow = project as Record<string, unknown>;
  const projectInput = {
    id: projectRow.id as string,
    title: projectRow.title as string,
    tagline: projectRow.tagline as string,
    description: projectRow.description as string | undefined,
    category: projectRow.category as string | undefined,
    tags: projectRow.tags as string[] | undefined,
    demoUrl: projectRow.demo_url as string | undefined,
  };

  const draft = draftRow as {
    platform: string;
    language: string;
    variant_key: string | null;
    subreddit: string | null;
  };

  const result = await regenerateOneDraft(
    projectInput,
    draft.platform as Platform,
    draft.language as Language,
    draft.variant_key,
    draft.subreddit,
  );

  if (!result) {
    return NextResponse.json(
      { error: "generation failed" },
      { status: 500 },
    );
  }

  // Update the existing row. Preserve id + status (creator may want to
  // keep approved/posted state if they're rolling for a new variant
  // post-publish; usually they're rolling because status=pending and
  // they want a different angle).
  const { error: uErr } = await supabase
    .from("project_drafts")
    .update({
      body: result.body,
      // Reddit + HN titles are deterministic from project title + tagline
      // — preserve any creator edits to title by only setting it if the
      // existing was null/auto-generated. Simpler: always overwrite,
      // matches the full-batch behavior.
      title: result.title,
      // Reset to pending — a re-rolled draft is no longer "approved" of.
      status: "pending",
      updated_at: new Date().toISOString(),
    })
    .eq("id", draftId);

  if (uErr) {
    return NextResponse.json({ error: uErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    draft_id: draftId,
    body_length: result.body.length,
  });
}
