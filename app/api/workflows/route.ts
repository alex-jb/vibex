import { supabase } from "@/lib/supabase";
import { workflows as mockWorkflows } from "@/lib/mock-data/workflows";
import { validateString, sanitize } from "@/lib/validate";
import { apiSuccess, apiError } from "@/lib/api-response";

const USE_SUPABASE = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  if (!USE_SUPABASE) {
    return apiSuccess(mockWorkflows);
  }

  const { data, error } = await supabase
    .from("workflows")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return apiSuccess(mockWorkflows);
  }

  return apiSuccess(data);
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
      return apiError(errors.join("; "), 400);
    }

    const workflow = {
      name: sanitize(body.name.trim()),
      description: sanitize((body.description || "").trim()),
      steps: body.steps,
      is_public: true,
    };

    if (!USE_SUPABASE) {
      return apiSuccess(
        { id: `wf-${Date.now()}`, ...workflow, created_at: new Date().toISOString() },
        201,
      );
    }

    const { data, error } = await supabase
      .from("workflows")
      .insert(workflow)
      .select()
      .single();

    if (error || !data) {
      return apiError(error?.message || "Failed to save workflow", 500);
    }

    return apiSuccess(data, 201);
  } catch {
    return apiError("Invalid request body", 400);
  }
}
