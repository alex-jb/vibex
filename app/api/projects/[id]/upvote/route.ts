import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

/**
 * POST /api/projects/:id/upvote
 *
 * Toggles the caller's upvote on a project via the `toggle_upvote`
 * RPC (migration 042). Atomic — inserts/deletes the user_upvotes
 * row AND updates projects.upvotes in a single function call.
 *
 * Before 2026-04-17 this endpoint did a SELECT + UPDATE on
 * projects.upvotes without touching user_upvotes, so a user could
 * spam-upvote the same project by clicking N times. The dedup
 * table existed but was dead. Fixed by delegating to toggle_upvote.
 *
 * Returns `{ upvoted: boolean, upvotes: number }` — upvoted flips
 * to tell the client which state the button should now render.
 * 401 if not authenticated (the RPC raises via ERRCODE 42501).
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Must be signed in to upvote" },
      { status: 401 },
    );
  }

  const { data, error } = await supabase.rpc("toggle_upvote", {
    p_project_id: id,
  });

  if (error) {
    // Supabase surfaces ERRCODE 42501 on the client as a PostgresError
    // with code '42501'; other errors (e.g. project not found) come
    // through with different codes.
    if (error.code === "42501") {
      return NextResponse.json(
        { error: "Must be signed in to upvote" },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { error: "Failed to toggle upvote" },
      { status: 500 },
    );
  }

  const row = data as { upvoted: boolean; upvotes: number } | null;
  if (!row) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(row);
}
