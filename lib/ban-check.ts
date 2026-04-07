/**
 * Ban check utility for API routes.
 * Call checkBan(userId) before any mutation to prevent banned users from acting.
 */

import { supabase } from "./supabase";

const USE_SUPABASE = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function checkBan(userId: string): Promise<{ banned: boolean; reason?: string }> {
  if (!USE_SUPABASE) return { banned: false };

  const { data } = await supabase.rpc("is_user_banned", { p_user_id: userId });

  if (data === true) {
    // Get ban reason
    const { data: ban } = await supabase
      .from("user_bans")
      .select("reason, expires_at")
      .eq("user_id", userId)
      .is("lifted_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    return {
      banned: true,
      reason: ban?.reason ?? "You have been banned",
    };
  }

  return { banned: false };
}
