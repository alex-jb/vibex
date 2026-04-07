import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { workflows as mockWorkflows } from "@/lib/mock-data/workflows";
import { validateString, sanitize } from "@/lib/validate";

const USE_SUPABASE = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  if (!USE_SUPABASE) {
    return NextResponse.json(mockWorkflows);
  }

  const { data, error } = await supabase
    .from("workflows")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return NextResponse.json(mockWorkflows);
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const errors: string[] = [];

    const nameErr = validateString(body.name, "name", { min: 2, max: 200 });
    if (nameErr) errors.push(nameErr);

    const descErr = validateString(body.description, "description", {
      max: 5000,
      required: false,
    });
    if (descErr) errors.push(descErr);

    if (!Array.isArray(body.steps) || body.steps.length === 0) {
      errors.push("steps must be a non-empty array");
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
    }

    const workflow = {
      name: sanitize(body.name.trim()),
      description: sanitize((body.description || "").trim()),
      steps: body.steps,
      is_public: true,
    };

    if (!USE_SUPABASE) {
      return NextResponse.json(
        { id: `wf-${Date.now()}`, ...workflow, created_at: new Date().toISOString() },
        { status: 201 },
      );
    }

    const { data, error } = await supabase
      .from("workflows")
      .insert(workflow)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Failed to save workflow" },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
