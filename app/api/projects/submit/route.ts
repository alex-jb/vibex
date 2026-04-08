import { NextRequest, NextResponse } from "next/server";

interface SubmitBody {
  title: string;
  tagline: string;
  description: string;
  category: string;
  tags: string[];
  creatorName: string;
  demoType?: string;
  demoUrl?: string;
}

const VALID_CATEGORIES = [
  "AI Agent",
  "AI Tool",
  "AI Game",
  "AI Workflow",
  "AI Utility",
  "Experimental",
  "Demo",
];

const VALID_DEMO_TYPES = ["chat", "sandbox", "preview", "embedded"];

function generateMockReview() {
  const rand = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const originality = rand(60, 95);
  const clarity = rand(65, 98);
  const uxPotential = rand(55, 90);
  const viralityPotential = rand(40, 85);
  const investorCuriosity = rand(45, 88);
  const compound = Math.round(
    (originality + clarity + uxPotential + viralityPotential + investorCuriosity) / 5
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
  try {
    const body: SubmitBody = await req.json();

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
    if (!body.category || !VALID_CATEGORIES.includes(body.category)) {
      errors.push(`Category must be one of: ${VALID_CATEGORIES.join(", ")}`);
    }
    if (!body.creatorName || body.creatorName.trim().length < 2) {
      errors.push("Creator name is required");
    }
    if (body.demoType && !VALID_DEMO_TYPES.includes(body.demoType)) {
      errors.push(`Demo type must be one of: ${VALID_DEMO_TYPES.join(", ")}`);
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
    }

    // Generate project ID
    const projectId = `proj-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

    // Generate AI review scores
    const aiReview = generateMockReview();

    // Build project response
    const project = {
      id: projectId,
      title: body.title.trim(),
      tagline: body.tagline.trim(),
      description: body.description.trim(),
      category: body.category,
      tags: body.tags ?? [],
      creatorName: body.creatorName.trim(),
      demoType: body.demoType ?? "preview",
      demoUrl: body.demoUrl ?? null,
      url: `https://vibexforge.com/project/${projectId}`,
      score: aiReview.compound,
      aiReview,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(project, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
