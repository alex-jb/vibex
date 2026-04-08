import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase-server";
import { supabase } from "@/lib/supabase";
import { USE_SUPABASE } from "@/lib/mock-adapter";

const VALID_ACTIONS = ["feed", "train", "play"] as const;

const AFFINITY_REWARDS: Record<string, number> = {
  feed: 5,
  train: 10,
  play: 3,
};

const COOLDOWN_MS: Record<string, number> = {
  feed: 4 * 60 * 60 * 1000,    // 4 hours
  train: 8 * 60 * 60 * 1000,   // 8 hours
  play: 1 * 60 * 60 * 1000,    // 1 hour
};

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { buddyId, action } = body as { buddyId?: string; action?: string };

  if (!buddyId || !action || !VALID_ACTIONS.includes(action as typeof VALID_ACTIONS[number])) {
    return NextResponse.json({ error: "buddyId and valid action required" }, { status: 400 });
  }

  if (!USE_SUPABASE) {
    return NextResponse.json({
      action,
      buddyId,
      affinityGained: AFFINITY_REWARDS[action],
      message: action === "feed" ? "Fed successfully!" : action === "train" ? "Training complete!" : "Had fun playing!",
    });
  }

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // Check cooldown
  const cooldown = COOLDOWN_MS[action] ?? 0;
  const { data: lastInteraction } = await supabase
    .from("buddy_interactions")
    .select("created_at")
    .eq("user_id", user.id)
    .eq("buddy_id", buddyId)
    .eq("action", action)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (lastInteraction) {
    const elapsed = Date.now() - new Date(lastInteraction.created_at).getTime();
    if (elapsed < cooldown) {
      const remaining = Math.ceil((cooldown - elapsed) / 60000);
      return NextResponse.json(
        { error: `On cooldown, ${remaining} minutes remaining` },
        { status: 429 },
      );
    }
  }

  const affinity = AFFINITY_REWARDS[action] ?? 0;

  const { error } = await supabase
    .from("buddy_interactions")
    .insert({ user_id: user.id, buddy_id: buddyId, action, affinity_gained: affinity });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const messages: Record<string, string> = {
    feed: "Fed successfully!",
    train: "Training complete!",
    play: "Had fun playing!",
  };

  return NextResponse.json({
    action,
    buddyId,
    affinityGained: affinity,
    message: messages[action],
  });
}
