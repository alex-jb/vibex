/**
 * POST /api/projects/[id]/generate-drafts
 *
 * Triggers marketing-agent draft generation for a project. Called
 * automatically by the submit flow (fire-and-forget) and manually
 * by the creator from /project/[id]/drafts page when they want to
 * regenerate.
 *
 * Auth: project owner only. Verified by joining projects → creators
 * → auth.uid().
 *
 * Behavior:
 *   - Returns 202 immediately with { generation_id }
 *   - Generation runs in background via waitUntil
 *   - Drafts land in project_drafts with status='pending'
 *   - Creator UI polls / subscribes to project_drafts via Supabase
 *     Realtime to render new drafts as they arrive
 *
 * Cost: ~24 Claude Sonnet calls × $0.003-0.015 each ≈ $0.10 per
 * generation. At 1000 creators/month × 1 generation each = $100.
 * Will introduce per-creator rate limit + paid-tier-only larger
 * batch sizes after MVP.
 */
import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { generateDraftsForProject, type Platform, type Language } from "@/lib/draft-generator";

export const runtime = "nodejs";
export const maxDuration = 300;

interface BodyOpts {
  platforms?: Platform[];
  languages?: Language[];
  subreddit?: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "auth required" }, { status: 401 });
  }

  // Verify ownership
  const { data: project, error: pErr } = await supabase
    .from("projects")
    .select("id, title, tagline, description, category, tags, demo_url, creator_id, creators!inner(auth_user_id)")
    .eq("id", id)
    .maybeSingle();
  if (pErr || !project) {
    return NextResponse.json({ error: "project not found" }, { status: 404 });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ownerAuthId = (project as any).creators?.auth_user_id;
  if (ownerAuthId !== user.id) {
    return NextResponse.json({ error: "not project owner" }, { status: 403 });
  }

  let body: BodyOpts = {};
  try {
    body = (await req.json()) as BodyOpts;
  } catch {
    // Empty body OK — use defaults.
  }

  // Run generation in background. Vercel Functions: `after` waits up
  // to maxDuration after response is sent.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projectInput = {
    id: project.id as string,
    title: (project as any).title as string,
    tagline: (project as any).tagline as string,
    description: (project as any).description as string | undefined,
    category: (project as any).category as string | undefined,
    tags: (project as any).tags as string[] | undefined,
    demoUrl: (project as any).demo_url as string | undefined,
  };

  after(async () => {
    try {
      const result = await generateDraftsForProject(supabase, projectInput, {
        platforms: body.platforms,
        languages: body.languages,
        subreddit: body.subreddit,
      });
      console.log(`[generate-drafts] ${id} → ${result.created} created, ${result.failed} failed`);
    } catch (err) {
      console.error(`[generate-drafts] ${id} background failure:`, err);
    }
  });

  return NextResponse.json(
    {
      status: "generating",
      project_id: id,
      message: "Draft generation started in background. Drafts will appear in project_drafts shortly.",
    },
    { status: 202 },
  );
}
