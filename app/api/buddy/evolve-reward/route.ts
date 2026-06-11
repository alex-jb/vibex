import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { USE_SUPABASE } from "@/lib/mock-adapter";
import { createNotification } from "@/lib/db";
import { getAuthUser } from "@/lib/supabase-server";

/**
 * POST /api/buddy/evolve-reward
 *
 * Called when a project evolves to a new stage. Awards EXP to the
 * project's creator and creates a notification.
 *
 * Security: caller MUST be authenticated AND must own the project (or be
 * a server-side service). The EXP amount is NOT taken from the client —
 * it's a fixed, server-side table keyed by stage so the caller cannot
 * mint arbitrary EXP.
 */
const STAGE_REWARDS: Record<string, number> = {
  seedling: 50,
  sprout: 100,
  sapling: 200,
  tree: 400,
  ancient: 800,
};

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { projectId, newStage } = body as { projectId?: string; newStage?: string };

  if (!projectId || !newStage) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const expReward = STAGE_REWARDS[newStage];
  if (!expReward) {
    return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
  }

  if (!USE_SUPABASE) {
    return NextResponse.json({ ok: true, stage: newStage, expAwarded: expReward });
  }

  const { data: project, error: projErr } = await supabase
    .from("projects")
    .select("id, creator_id")
    .eq("id", projectId)
    .single();
  if (projErr || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  if (project.creator_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await supabase.rpc("add_creator_exp", {
    p_creator_id: project.creator_id,
    p_exp: expReward,
  });

  await createNotification({
    userId: project.creator_id,
    type: "system",
    title: `Your project evolved to ${newStage}! +${expReward} EXP`,
    body: `Your project has reached the ${newStage} stage. Keep growing!`,
    link: `/project/${projectId}`,
    projectId,
  });

  return NextResponse.json({ ok: true, stage: newStage, expAwarded: expReward });
}
