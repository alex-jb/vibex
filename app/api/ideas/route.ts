import { NextResponse } from "next/server";
import { createIdea } from "@/lib/db";
import { validateString, validateEnum, sanitize } from "@/lib/validate";
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
    return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
  }

  const idea = await createIdea({
    ...body,
    title: sanitize(body.title.trim()),
    description: sanitize(body.description.trim()),
  });

  if (!idea) {
    return NextResponse.json(
      { error: "Failed to create idea" },
      { status: 500 }
    );
  }

  return NextResponse.json(idea, { status: 201 });
}
