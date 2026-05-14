/**
 * POST /api/projects/[id]/queue-directory-submissions
 *
 * Creator-initiated opt-in to enqueue this project for cross-posting to
 * the Tier-1 directories. Body shape:
 *   { keys?: DirectoryKey[] }   // defaults to ALL Tier-1 keys
 *
 * Auth: must be signed in + project must belong to the calling creator.
 * RLS on directory_submissions enforces ownership at the row level too,
 * so the server check is defense-in-depth.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import {
  enqueueSubmissions,
  loadAdapters,
  type DirectoryKey,
} from "@/lib/directory-submitter";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // Project ownership check — even though RLS will enforce it on the INSERT,
  // a clear 403 beats an opaque RLS rejection.
  const { data: project, error: projErr } = await supabase
    .from("projects")
    .select("id, creator_id, creators(auth_user_id)")
    .eq("id", projectId)
    .maybeSingle();
  if (projErr || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  const owner = Array.isArray(project.creators)
    ? project.creators[0]
    : project.creators;
  if ((owner as { auth_user_id?: string } | null)?.auth_user_id !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  let body: { keys?: string[] } = {};
  try {
    body = (await req.json()) as { keys?: string[] };
  } catch {
    // empty body → default to all
  }

  const adapters = await loadAdapters();
  const validKeys = new Set(adapters.map((a) => a.key));
  const requested = (body.keys ?? adapters.map((a) => a.key)).filter((k): k is DirectoryKey =>
    validKeys.has(k as DirectoryKey),
  );
  if (requested.length === 0) {
    return NextResponse.json(
      { error: "No valid directory keys requested" },
      { status: 400 },
    );
  }

  const result = await enqueueSubmissions(supabase, projectId, requested);
  return NextResponse.json(
    {
      ok: true,
      ...result,
      directories: requested,
      adapters_status: adapters.map((a) => ({
        key: a.key,
        label: a.label,
        available: a.isAvailable(),
      })),
    },
    { status: 202 },
  );
}
