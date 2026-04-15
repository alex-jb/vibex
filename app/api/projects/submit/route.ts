import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createProject, getOrCreateCreator, type NewProjectInput } from "@/lib/db";
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
      const creatorId = await getOrCreateCreator(supabase, {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
      });
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
          score: project.score,
          aiReview: generateMockReview(),
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
