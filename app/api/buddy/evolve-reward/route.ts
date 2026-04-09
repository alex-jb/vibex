import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { USE_SUPABASE } from "@/lib/mock-adapter";
import { createNotification } from "@/lib/db";

/**
 * POST /api/buddy/evolve-reward
 *
 * Called when a project evolves to a new stage.
 * Awards EXP to the creator and creates a notification.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { projectId, creatorId, newStage, expReward } = body;

  if (!projectId || !creatorId || !newStage || !expReward) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (USE_SUPABASE) {
    // Award EXP to the creator's user profile
    await supabase.rpc("add_creator_exp", {
      p_creator_id: creatorId,
      p_exp: expReward,
    });

    // Create notification for the creator
    await createNotification({
      userId: creatorId,
      type: "system",
      title: `Your project evolved to ${newStage}! +${expReward} EXP`,
      body: `Your project has reached the ${newStage} stage. Keep growing!`,
      link: `/project/${projectId}`,
      projectId,
    });
  }

  return NextResponse.json({
    ok: true,
    stage: newStage,
    expAwarded: expReward,
  });
}
