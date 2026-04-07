import { createIdea } from "@/lib/db";
import { validateString, validateEnum, sanitize } from "@/lib/validate";
import { apiSuccess, apiError } from "@/lib/api-response";
import type { ProjectCategory } from "@/lib/types";

const VALID_CATEGORIES: ProjectCategory[] = [
  "AI Agent",
  "AI Tool",
  "AI Game",
  "AI Workflow",
  "AI Utility",
  "Experimental",
  "Demo",
];

export async function POST(request: Request) {
  const body = await request.json();

  const errors: string[] = [];
  const titleErr = validateString(body.title, "title", { min: 3, max: 200 });
  if (titleErr) errors.push(titleErr);
  const descErr = validateString(body.description, "description", { min: 10, max: 5000 });
  if (descErr) errors.push(descErr);
  const catErr = validateEnum(body.category, "category", VALID_CATEGORIES);
  if (catErr) errors.push(catErr);

  if (errors.length > 0) {
    return apiError(errors.join("; "), 400);
  }

  const idea = await createIdea({
    ...body,
    title: sanitize(body.title.trim()),
    description: sanitize(body.description.trim()),
  });

  if (!idea) {
    return apiError("Failed to create idea", 500);
  }

  return apiSuccess(idea, 201);
}
