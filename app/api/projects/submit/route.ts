import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import {
  createProject,
  getOrCreateCreator,
  upsertAIReview,
  type NewProjectInput,
} from "@/lib/db";
import { generateProjectReview } from "@/lib/ai";
import {
  sendEmail,
  composeWelcomeEmail,
  ensureUnsubscribeUrl,
  withUnsubscribeFooter,
} from "@/lib/email";
import type { ProjectCategory } from "@/lib/types";

interface SubmitBody {
  title: string;
  tagline: string;
  description: string;
  category: string;
  tags?: string[];
  creatorName?: string;
  demoType?: string;
  demoUrl?: string;
  demoVideoUrl?: string;
}

const VALID_CATEGORIES: ProjectCategory[] = [
  "AI Agent",
  "AI Tool",
  "AI Game",
  "AI Workflow",
  "AI Utility",
  "Experimental",
  "Demo",
];

const VALID_DEMO_TYPES = ["chat", "sandbox", "preview", "embedded"] as const;
type DemoType = (typeof VALID_DEMO_TYPES)[number];

function generateMockReview() {
  const rand = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const originality = rand(60, 95);
  const clarity = rand(65, 98);
  const uxPotential = rand(55, 90);
  const viralityPotential = rand(40, 85);
  const investorCuriosity = rand(45, 88);
  const compound = Math.round(
    (originality + clarity + uxPotential + viralityPotential + investorCuriosity) / 5,
  );

  return {
    originality,
    clarity,
    uxPotential,
    viralityPotential,
    investorCuriosity,
    compound,
    strengths: [
      "Addresses a real user need with a clear value proposition",
      "Clean tech stack with modern best practices",
      "Strong potential for community adoption",
    ],
    weaknesses: [
      "Could benefit from more visual polish",
      "Consider adding more interactive demo elements",
    ],
    suggestions: [
      "Add a 30-second demo video for higher engagement",
      "Include before/after comparisons to showcase impact",
      "Consider integrating with popular dev tools for distribution",
    ],
  };
}

/**
 * The GitHub web flow auto-generates this description on OG tags when
 * a repo has no README. If we see it, the user pasted a GH URL with
 * no manual description — fetch the real README to give Claude something
 * to review against. Matches "Contribute to X/Y development..." exactly.
 */
function isGithubBoilerplate(description: string): boolean {
  return /^Contribute to [\w.-]+\/[\w.-]+ development by creating an account on GitHub\.?$/i.test(
    description.trim(),
  );
}

const INDEXNOW_KEY = "3f14d4d3278b4cbf882b9f94de88147e";

/**
 * Ping IndexNow so Bing + Yandex + Seznam pick up newly-submitted
 * project URLs in minutes. Single-URL form is the cheapest — the
 * batch endpoint is worth it only if we later do bulk re-index.
 * No account needed; the key file at
 * public/3f14d4d3278b4cbf882b9f94de88147e.txt is the ownership proof.
 */
async function pingIndexNow(url: string): Promise<void> {
  const endpoint = `https://api.indexnow.org/indexnow?url=${encodeURIComponent(
    url,
  )}&key=${INDEXNOW_KEY}&keyLocation=https://www.vibexforge.com/${INDEXNOW_KEY}.txt`;
  try {
    await fetch(endpoint, {
      method: "GET",
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    // Any failure is swallowed — caller uses .catch(() => {}) and
    // submit flow shouldn't block on a third-party ping
  }
}

/**
 * Send a welcome email if and only if this is the creator's very
 * first project. We detect "first" by counting projects belonging
 * to creatorId after the insert: count == 1 means the row we just
 * wrote is alone, so the previous count was zero, so this is the
 * first ship. Fire-and-forget — must never throw to caller.
 *
 * Why count instead of a column flag: keeps the schema unchanged
 * and the dedup logic visible inline. With 5 users we don't need
 * a real outbox table; a count query is plenty.
 */
async function sendWelcomeEmailIfFirstProject(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  args: {
    creatorId: string;
    userEmail: string | undefined;
    userName: string;
    projectId: string;
    projectTitle: string;
    compoundScore: number;
  },
): Promise<void> {
  if (!args.userEmail) return;
  const { count, error } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("creator_id", args.creatorId);
  if (error) {
    console.error("[welcome-email] count query failed", error);
    return;
  }
  if (count !== 1) return;

  // Respect opt-out — even though this is the user's first email,
  // they could have opted out via an earlier dry-run flow or via the
  // creator import path. Cheap to check.
  const { data: creatorRow } = await supabase
    .from("creators")
    .select("email_opt_out")
    .eq("id", args.creatorId)
    .maybeSingle();
  if (creatorRow?.email_opt_out) {
    console.log(`[welcome-email] skipped (opt-out) for ${args.userEmail}`);
    return;
  }

  const composed = composeWelcomeEmail({
    creatorName: args.userName,
    projectId: args.projectId,
    projectTitle: args.projectTitle,
    compoundScore: args.compoundScore,
  });
  const unsubscribeUrl = await ensureUnsubscribeUrl(supabase, args.creatorId);
  const { text, html } = withUnsubscribeFooter(composed.text, unsubscribeUrl);
  const result = await sendEmail({
    to: args.userEmail,
    subject: composed.subject,
    text,
    html,
    unsubscribeUrl: unsubscribeUrl || undefined,
  });
  if (!result.ok) {
    console.error(`[welcome-email] send failed: ${result.error}`);
  } else if (result.dryRun) {
    console.log(`[welcome-email] dry-run for ${args.userEmail}`);
  } else {
    console.log(`[welcome-email] sent to ${args.userEmail} (${result.resendId})`);
  }
}

async function fetchGithubReadme(demoUrl: string): Promise<string | null> {
  const m = demoUrl.match(/github\.com\/([^\/]+)\/([^\/?#]+)/);
  if (!m) return null;
  const [, owner, repoRaw] = m;
  const repo = repoRaw.replace(/\.git$/, "");
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
          Accept: "application/vnd.github.raw",
          "User-Agent": "VibeX-submit-pipeline",
        },
        // 10s cap — don't let a slow GitHub response block the submit flow.
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!res.ok) return null;
    const text = await res.text();
    // Cap at 4KB — Claude context + token budget. READMEs beyond this point
    // are usually install/config detail that doesn't help scoring.
    return text.slice(0, 4000);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  let body: SubmitBody;
  try {
    body = (await req.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Validate required fields
  const errors: string[] = [];
  if (!body.title || body.title.trim().length < 3) {
    errors.push("Title must be at least 3 characters");
  }
  if (!body.tagline || body.tagline.trim().length < 10) {
    errors.push("Tagline must be at least 10 characters");
  }
  if (!body.description || body.description.trim().length < 50) {
    errors.push("Description must be at least 50 characters");
  }
  if (!body.category || !VALID_CATEGORIES.includes(body.category as ProjectCategory)) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(", ")}`);
  }
  if (body.demoType && !VALID_DEMO_TYPES.includes(body.demoType as DemoType)) {
    errors.push(`Demo type must be one of: ${VALID_DEMO_TYPES.join(", ")}`);
  }
  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
  }

  const input: NewProjectInput = {
    title: body.title.trim(),
    tagline: body.tagline.trim(),
    description: body.description.trim(),
    category: body.category as ProjectCategory,
    tags: Array.isArray(body.tags) ? body.tags : [],
    demoType: (body.demoType as DemoType | undefined) ?? "preview",
    demoUrl: body.demoUrl,
    demoVideoUrl: body.demoVideoUrl?.trim() || undefined,
  };

  // Try to persist to Supabase as the authenticated user. If the env isn't
  // configured or the user isn't signed in, we fall back to a mock response
  // so the landing-page demo still works.
  const envConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (envConfigured) {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Read the ?ref= cookie that components/ref-capture.tsx wrote
      // when this user first landed on any vibex page. First-write-
      // wins, so even if signup happened days later, we credit the
      // original distribution channel.
      const refCookie = req.cookies.get("vibex_ref")?.value || null;

      const creatorId = await getOrCreateCreator(
        supabase,
        {
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata,
        },
        refCookie,
      );
      if (!creatorId) {
        return NextResponse.json(
          { error: "Could not establish creator profile" },
          { status: 500 },
        );
      }

      const project = await createProject(supabase, creatorId, input);
      if (!project) {
        return NextResponse.json(
          { error: "Could not save project" },
          { status: 500 },
        );
      }

      // If the user pasted a GitHub URL with no real description (the
      // classic "Contribute to X/Y development..." boilerplate that GitHub
      // auto-generates when a repo has no README), fetch the README and
      // pass it to Claude as supplemental context so we're not reviewing
      // a blank slate. This rescues the exact flow that produced the
      // 0/0/0 project pages before 2026-04-17.
      let reviewDescription = project.description;
      if (
        project.demoUrl &&
        (isGithubBoilerplate(project.description) ||
          project.description.length < 80)
      ) {
        const readme = await fetchGithubReadme(project.demoUrl);
        if (readme) {
          reviewDescription = `${project.description}\n\n--- README (excerpt) ---\n${readme}`;
        }
      }

      // Synchronous Claude review. Takes ~3-5s but means the user lands
      // on a populated project page instead of zeros. If the Claude call
      // fails (rate limit, network), generateProjectReview returns a stub
      // so we still write something reasonable rather than leaving the
      // row blank.
      let aiReview;
      try {
        aiReview = await generateProjectReview({
          title: project.title,
          tagline: project.tagline,
          description: reviewDescription,
          category: project.category,
          tags: project.tags,
        });
        await upsertAIReview(supabase, project.id, aiReview);
      } catch (err) {
        console.error("[submit] AI review pipeline failed", err);
        aiReview = generateMockReview();
      }

      const compound = Math.round(
        (aiReview.originality +
          aiReview.clarity +
          aiReview.uxPotential +
          aiReview.viralityPotential +
          aiReview.investorCuriosity) /
          5,
      );

      // Ping IndexNow so Bing + Yandex + Seznam reindex the new
      // project page within minutes instead of days. The key file
      // at public/3f14d4d3278b4cbf882b9f94de88147e.txt is what
      // IndexNow checks to verify we control the host. Fire-and-
      // forget — failing this must not block the submit response.
      pingIndexNow(`https://www.vibexforge.com/project/${project.id}`).catch(
        () => {},
      );

      // First-submit welcome email. Fired once per creator, the moment
      // their first project lands. 2026-05-06 funnel diagnostic showed
      // 100% of real outside users posted then never came back — the
      // platform had zero retention triggers. This catches them at
      // peak engagement (just shipped) with a link they can share +
      // a promise of the weekly digest. RESEND_API_KEY unset → dry-run
      // (logs only, never sends), so this is safe pre-config.
      sendWelcomeEmailIfFirstProject(supabase, {
        creatorId,
        userEmail: user.email,
        userName:
          (user.user_metadata?.full_name as string | undefined) ||
          (user.user_metadata?.user_name as string | undefined) ||
          user.email?.split("@")[0] ||
          "creator",
        projectId: project.id,
        projectTitle: project.title,
        compoundScore: compound,
      }).catch((err) => {
        console.error("[submit] welcome-email path threw", err);
      });

      // 2026-05-13: Auto-generate an RPG pixel-art cover via gpt-image-2
      // when the submitter didn't provide a thumbnail. Fires in after()
      // so the API response returns immediately; Supabase Realtime push
      // (migration 054) updates Feed cards on web + iOS once thumbnail
      // is written. Cost ~$0.04. Failure is swallowed — project stays
      // thumbnail-less and is harmless.
      if (process.env.OPENAI_API_KEY && !project.thumbnail) {
        after(async () => {
          try {
            const { generateProjectCover } = await import("@/lib/gen-cover");
            const coverUrl = await generateProjectCover({
              id: project.id,
              title: project.title,
              tagline: project.tagline,
              category: project.category,
              evolutionStage: project.hero?.evolutionStage,
            });
            const { error: updErr } = await supabase
              .from("projects")
              .update({ thumbnail: coverUrl })
              .eq("id", project.id);
            if (updErr) {
              console.error("[submit] cover UPDATE failed", project.id, updErr);
            } else {
              console.log(`[submit] cover ${project.id} → ${coverUrl}`);
            }
          } catch (err) {
            console.error("[submit] cover-gen path threw", err);
          }
        });
      }

      // 2026-05-08: Auto-generate 17 platform-specific drafts in the
      // background so creator lands on /project/[id]/drafts with
      // drafts already populated.
      //
      // Critical: use `after()` not bare fire-and-forget. Vercel
      // Functions terminate the runtime when the response is sent;
      // a detached Promise gets cut off mid-Claude-call. `after()`
      // tells Vercel to keep the function alive up to maxDuration
      // for background work.
      //
      // Also consume the cost-gate credits (21 per generation) so the
      // creator's quota stays accurate vs manual /api/projects/[id]/
      // generate-drafts calls. If consume fails (over cap), skip
      // generation — creator can manually trigger from /drafts page
      // tomorrow when their quota resets.
      if (process.env.ANTHROPIC_API_KEY) {
        const { data: gateData } = await supabase.rpc(
          "consume_draft_credits",
          {
            p_creator_id: project.creatorId,
            p_cost: 21,
            p_cap: 100,
          },
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gate = gateData as any;
        if (gate?.ok) {
          after(async () => {
            try {
              const { generateDraftsForProject } = await import(
                "@/lib/draft-generator"
              );
              const result = await generateDraftsForProject(supabase, {
                id: project.id,
                title: project.title,
                tagline: project.tagline,
                description: project.description,
                category: project.category,
                tags: project.tags,
                demoUrl: project.demoUrl,
              });
              console.log(
                `[submit] drafts ${project.id} → ${result.created} created, ${result.failed} failed`,
              );
            } catch (err) {
              console.error("[submit] draft-generator path threw", err);
            }
          });
        } else {
          console.warn(
            `[submit] skipping auto-drafts: ${gate?.error || "quota check failed"}`,
          );
        }
      }

      return NextResponse.json(
        {
          id: project.id,
          title: project.title,
          tagline: project.tagline,
          description: project.description,
          category: project.category,
          tags: project.tags,
          creatorName: project.creatorName,
          demoType: project.demoType,
          demoUrl: project.demoUrl ?? null,
          url: `/project/${project.id}`,
          score: compound,
          aiReview: { ...aiReview, compound },
          createdAt: project.createdAt,
          persisted: true,
        },
        { status: 201 },
      );
    }
    // Fall through to mock response for logged-out visitors.
  }

  // Mock / demo fallback: not persisted, but the form flow still works.
  const projectId = `proj-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
  const aiReview = generateMockReview();

  return NextResponse.json(
    {
      id: projectId,
      title: input.title,
      tagline: input.tagline,
      description: input.description,
      category: input.category,
      tags: input.tags,
      creatorName: body.creatorName?.trim() ?? "",
      demoType: input.demoType,
      demoUrl: input.demoUrl ?? null,
      url: `/project/${projectId}`,
      score: aiReview.compound,
      aiReview,
      createdAt: new Date().toISOString(),
      persisted: false,
    },
    { status: 201 },
  );
}
