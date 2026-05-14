import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { generateProjectCover } from "@/lib/gen-cover";

export const maxDuration = 120; // gpt-image-2 can take 60-90s

/**
 * POST /api/admin/regen-cover/[id] — manually re-roll a project's cover.
 *
 * Same path/version as lib/gen-cover.ts, so the new image overwrites the
 * old at `covers/v1/<id>.png` and the Vercel Blob CDN URL stays stable.
 * Supabase Realtime publication 054 pushes the new thumbnail to subscribed
 * clients (iOS Companion + web Feed) without a refresh.
 *
 * Auth: must be signed in + email in ADMIN_EMAILS env (comma-separated).
 * Costs ~$0.04 per call, so the gate matters.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!user.email || !admins.includes(user.email.toLowerCase())) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured on this deployment" },
      { status: 500 },
    );
  }

  const { data: project, error: fetchErr } = await supabase
    .from("projects")
    .select("id, title, tagline, category, evolution_stage")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Fire-and-forget so the admin UI gets a snappy response. Cover takes
  // 30-90s; UI can poll the project row for the updated thumbnail.
  after(async () => {
    try {
      const url = await generateProjectCover({
        id: project.id,
        title: project.title,
        tagline: project.tagline,
        category: project.category,
        evolutionStage: project.evolution_stage,
      });
      const { error: updErr } = await supabase
        .from("projects")
        .update({ thumbnail: url })
        .eq("id", project.id);
      if (updErr) {
        console.error("[regen-cover] UPDATE failed", project.id, updErr);
      } else {
        console.log(`[regen-cover] ${project.id} → ${url} (by ${user.email})`);
      }
    } catch (err) {
      console.error("[regen-cover] path threw", err);
    }
  });

  return NextResponse.json(
    { ok: true, message: "regen queued — poll project.thumbnail in ~60s" },
    { status: 202 },
  );
}
